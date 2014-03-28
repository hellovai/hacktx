var github = require("octonode")
	, qs = require("querystring")
  , cookie = require("cookie")
	, cfg = require("./config")
  , globals = require("./globals")
  , db = require("./db")
  , config = cfg.github;

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ;

var auth_url = github.auth.config({
  id: config.id,
  secret: config.secret
}).login(["user", "repo"]);

function login (socket) {
  var token = socket.token;
  if(token) {
    socket.user.ghClient = getClient(token);
    socket.user.ghMe = socket.user.ghClient.me();
    touchAccount(socket);
  }
};

function logout (socket, clbk) {
  socket.token = null;
  socket.user = {};
  socket.publicUser = cfg.defaultUser;
  socket.loggedIn = false;
  if(!clbk) {
    socket.emit("logout");
    var p = getPartner(socket);
    if(p) p.emit("rLogin", socket.publicUser);
  } else {
    clbk();
  }
}

function save (socket, code) {
  socket.isSaving = true;
  var q = socket.question;
  var rep = socket.user.ghRepo;
  rep.contents(q + "/code.py", function (err, data, headers) {
    if(err) {
      console.log("ERRR: ", err);
      return rep.createContents(q + "/README.md", "Creating " + q, new Buffer(code).toString("base64"), function (e, d, h) {
        if(e) {
          socket.isSaving = false;
          return console.log("ERR: ", e);
        }
        rep.createContents(q + "/code.py", "Creating " + q, code, function (e2, d2, h2) {
          socket.isSaving = false;
          if(e2) return console.log("ERR: ", e2);
          socket.emit("notif", "Created " + q + " directory!");
        });
      });
    }
    rep.updateContents(q + "/code.py", "Updating " + q, code, data["sha"], function(e, d, h) {
      socket.isSaving = false;
      if(e) return console.log(e);
      socket.emit("notif", "Updated " + q + " directory!");
    });
  });
}

function load (socket) {
  socket.isSaving = true;
  var q = socket.question;
  var rep = socket.user.ghRepo;
  rep.contents(q + "/code.py", function (err, data, headers) {
    socket.isSaving = false;
    if(err) { return; }
    socket.emit("setCode", new Buffer(data["content"], 'base64').toString());
  });
}

// private functions
function createRepo(socket) {
  socket.user.ghMe.fork(config.user + "/" + config.repo, function(err, data, headers){
    if(err || !data) {
      return logout(socket, function() { socket.emit("notif", "Try logging in again again!"); });
    socket.emit("notif", "You have forked " + config.questionRepo);
    };
  });
}

function touchRepo (socket, data) {
  logSocketIn(socket, data);
  socket.user.ghRepo = socket.user.ghClient.repo(data.github.username + "/" + config.repo);
  socket.user.ghRepo.info(function(err, res) {
    if(err) return createRepo(socket);
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
    if(err || !doc)
      return logout(socket, function() { socket.emit("notif", "Try logging in again again!"); });
    socket.user.db = doc;
    touchRepo(socket, newUser);
  });
}

function touchDB(socket, data) {
  db.users.findOne({"github.username":data.login}, function (err, res) {
    if(err || !res) return addToDB(socket, data);
    socket.user.db = res;
    touchRepo(socket, res);
  });
}

function touchAccount(socket) {
  socket.user.ghMe.info(function (err, d, h) {
    if(err)
      return logout(socket, function() { socket.emit('notif', "Your credentials were not valid!") });
    touchDB(socket, d);
  })
}

function getClient (token) {
  return github.client(token);
}

function logSocketIn (socket, data) {
  socket.publicUser = {
    "nick":data.github.username
    ,"avatar_url":data.github.avatar
    ,"points":data.points
  };
  socket.loggedIn = true;
  socket.user.db = data;
  socket.emit("login", socket.publicUser);
  var p = getPartner(socket)
  if(p) p.emit("rLogin", socket.publicUser);
}


module.exports.api = github;
module.exports.login = login;
module.exports.logout = logout;
module.exports.save = save;
module.exports.load = load;
module.exports.auth_url = auth_url;
// module.exports.getClient = getClient;
// module.exports.accessAccount = accessAccount;