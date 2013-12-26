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
    if(!err) {
      accessDB(socket, data);
      socket.gRepo = socket.gClient.repo(data.login + '/' + config.repo);
      socket.gRepo.info(function (err, data, header) {
        if(err) createRepo(socket);
      })
    } else {
      if(err.statusCode == 401){
        socket.token = null;
        delete socket.handshake.cookie['gitLogin'];
      }
    }
  });
}

function accessDB (socket, data) {
  db.users.findOne({"github.id":data.id}, function (err, res) {
    if(err)
      console.log("Could not find: ", data.id, err);
    else if (!res)
      addToDB(socket,data);
    else {
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
      logSocketIn(socket, doc[0]);
    }
  });
}

function createRepo(socket) {
  socket.github.fork(config.user + '/' + config.repo, function(err, data, headers){
    if(err || !data) {
      console.log(err);
    } else {
      socket.emit('notif', "You have forked " + config.questionRepo);
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
  res.setHeader('Content-Type', 'text/html');
  if (!state || state[1] != values.state) {
    res.statusCode = 403;
    var ck = cookie.serialize('gitLogin', "goodtry", { 
      expires: new Date(Date.now() + 900000)
      ,maxAge: 900000
      ,httpOnly: true 
      ,signed: true
      // ,secure: true
      ,path:'/'
      ,domain: '.mealmaniac.com'
    });
    res.setHeader('Set-Cookie', ck);
    res.end("<body onLoad=\"window.open('', '_self', '');setTimeout(function() {window.close();}, 100);\"></body>");
  } else {
    github.auth.login(values.code, function (err, token) {
      var ck = cookie.serialize('gitLogin', token, { 
        expires: new Date(Date.now() + 900000)
        ,maxAge: 900000
        ,httpOnly: true 
        // ,secure: true
        ,signed: true
        ,path:'/'
        ,domain: '.mealmaniac.com'
      });
      res.statusCode = 200;
      res.setHeader('Set-Cookie', ck);
      // res.cookie('gitLogin', token, {secure: true, httpOnly: true, signed: true, expires: new Date(Date.now() + 900000)});
      res.end("<body onLoad=\"window.open('', '_self', '');setTimeout(function() {window.close();}, 100);\">Logged In!</body>");
    });
  }
}

function getClient (token) {
  return github.client(token);
}

module.exports.login = login;
module.exports.auth_url = auth_url;
module.exports.getClient = getClient;
module.exports.accessAccount = accessAccount;