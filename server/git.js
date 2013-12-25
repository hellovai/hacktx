var github = require('octonode')
	, qs = require('querystring')
  , cookie = require('cookie')
	, config = require('./config').github
  , globals = require('./globals')
  , db = require('./db');

var isConnected = globals.isConnected;
var queue = globals.queue;
var users = globals.users;

var auth_url = github.auth.config({
  id: config.id,
  secret: config.secret
}).login(['user', 'repo']);

var state = auth_url.match(/&state=([0-9a-z]{32})/i);

function accessAccount (socket) {
  socket.github.info(function (err, data, headers) {
    accessDB(socket, data);
  });
}

function accessDB (socket, data) {
  db.users.findOne({"github.id":data.id}, function (err, res) {
    if(err)
      console.log("Could not find: ", data.id, err);
    else if (!res)
      addToDB(socket,data);
    else {
      console.log('already in db: ', res);
      logSocketIn(socket, res);
    }
  });
}

function addToDB (socket, data) {
  newUser = {
    "github": {
      "username":data.login
      ,"avatar":data.avatar_url
      ,"id":data.id
    }
    ,"points":0
    ,"questions": {
      "viewed":[]
      ,"finished":[]
    }
    ,"flairs":[]
  };
  db.users.insert(newUser, {safe:true}, function (err, doc) {
    if(err || !doc) {
      socket.emit('notif', 'Try logging in again again!');
    } else {
      console.log('added!', doc);
      logSocketIn(socket, doc[0]);
    }
  });
}

function logSocketIn (socket, data) {
  socket.user = {
    "username":data.github.username
    ,"avatar_url":data.github.avatar
    ,"points":data.points
  };
  socket.dbItem = data;
  socket.emit('login', socket.user);
  if(isConnected(socket))
    users[socket.pid].emit('rLogin', socket.user);
}

function login (data, req, res) {
	var values = qs.parse(data);
    // Check against CSRF attacks
    if (!state || state[1] != values.state) {
      res.writeHead(403, {'Content-Type': 'text/plain'});
      res.end('Not Allowed ' + state + ' ' + state[1] + ' ' + values.state );
    } else {
      github.auth.login(values.code, function (err, token) {
        var ck = cookie.serialize('gitLogin', token, { 
            expires: new Date(Date.now() + 900000)
            ,maxAge: 900000
            ,httpOnly: true 
            ,secure: true
            ,path:'/'
            ,domain: 'mealmaniac.com'
          });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        if(req.cookies.gitLogin)
          res.cookie('gitLogin', token);
        // res.writeHead(200, {'Set-Cookie': ck, 'Content-Type':'text/plain'});
        res.end("<body onLoad=\"window.open('', '_self', '');window.close();\">"+ token +"</body>");
    	});
	}
}

function getClient (token) {
  return github.client(token).me();
}

module.exports.login = login;
module.exports.auth_url = auth_url;
module.exports.getClient = getClient;
module.exports.accessAccount = accessAccount;