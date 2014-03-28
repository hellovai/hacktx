var http = require("http")
  , path = require("path")
  , connect = require("connect")
  , express = require("express")
  , qs = require("querystring")
  , url = require("url")
  , fs = require("fs")
  , app = express();

var config = require("./config")
  , globals = require("./globals")
  , chat = require("./chat")
  , question = require("./question")
  , sandbox = require("./sandbox")
  , github = require("./git");

var cookieParser = express.cookieParser(config.secret)
  , sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function () {
  app.use(express.static(__dirname + "/public"));
  app.use(cookieParser);
  app.use(express.session({ 
    store: sessionStore,
    key: config.keyname,
    secret: config.secret
   }));
});

var server = http.createServer(app)
  , io = require("socket.io").listen(server);

// for github authentication
var state = github.auth_url.match(/&state=([0-9a-z]{32})/i);

app.get("/", function(req, res) {
  req.session.token = null;
  res.sendfile(__dirname + "/index.html");
});

app.get("/login", function (req, res) {
    res.statusCode = 301;
    res.setHeader("Content-Type", "text/plain");
    res.redirect(github.auth_url);
});

app.get("/logout", function (req, res) {
  setToken(null, req.sessionID);
  res.status(200);
  res.setHeader("Content-Type", "text/html");
  res.clearCookie(config.tokenname);
  res.sendfile(__dirname + "/autoClose.html");
});

var cookie = require("cookie");

app.get("/verify", function (req, res) {
  uri = url.parse(req.url);
  var values = qs.parse(uri.query);
  if (!state || state[1] != values.state) {
    res.status(403);
    res.setHeader("Content-Type", "text/html");
    fs.readFile("./autoClose.html", "utf8", function (err,data) {
      if (err) {
        return res.end(err);
      }
      res.end(data);
    });
  } else {
    github.api.auth.login(values.code, function (err, token) {
      setToken(token, req.sessionID);
      res.cookie(config.tokenname, token, {
        signed:true
        ,httpOnly:true
      });
      res.status(200).setHeader("Content-Type","text/html");
      fs.readFile("./autoClose.html", "utf8", function (err,data) {
        if (err) {
          return res.end(err);
        }
        res.end(data);
      });
    });
  }
});

function setToken(token, id) {
  var items = sessionSocket[id];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    users[item].token = token;
  };
}

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ
  , sessionSocket = globals.session;

var connectionCtr = 0;

io.configure(function () {
  io.set("authorization", function (handshakeData, callback) {
    var data = handshakeData;
  if (data.headers.cookie) {
    //note that this is done differently if using signed cookies
    data.cookie = require("cookie").parse(data.headers.cookie);
    data.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie[config.keyname], config.secret);
    if(config.tokenname in handshakeData.cookie)
      data.token = connect.utils.parseSignedCookie(handshakeData.cookie[config.tokenname], config.secret);
    else
      data.token = null;
  }
    callback(null, true);
  });
});

function describe(name) {
    var clients = io.sockets.clients(name);
    var result = {
        clients: {}
    };
    clients.forEach(function (client) {
        result.clients[client.id] = client.resources;
    });
    return result;
}


io.on("connection", function (socket) {
  console.log("Connection est");
  var session = socket.handshake;
  initialize();
  connectionCtr += 1;

  socket.on("disconnect", function() {
    chat.leave(socket, getPartner(socket.paired, socket.pid));
    removeQ(socket.id)
    var i = sessionSocket[socket.handshake.sessionID].indexOf(socket.id);
    sessionSocket[socket.handshake.sessionID].splice(i, 1);
    delete users[socket.id];
    connectionCtr -= 1;
  });

  // room events
  socket.on("toggleRoom", function () {
    var p = getPartner(socket.paired, socket.pid);
    if(typeof p != "undefined")
      chat.leave(socket, p);
    else if(socket.searching) {
      socket.searching = false;
      removeQ(socket.id);
      socket.emit("notif", "Leaving the queue...");
    } else {
      chat.join(socket)
    }
  });
  socket.on("chat", function (msg) {
    chat.sendMessage(socket, msg);
  });
  socket.on("reconnect", function () {
    var p = getPartner(socket.paired, socket.pid);
    if(p)
      p.emit("findRoom");
  });

  // question events
  socket.on("getQuestion", function () {
    var p = getPartner(socket.paired, socket.pid);
    if(typeof p != "undefined") {
      if(socket.alertflags.cq) {
        socket.alertflags.cq = false;
        question.setQ(socket, p, true);
      } else {
        p.emit("changeQuestion");
        p.alertflags.cq = true;
      }
    } else 
      question.getNew(socket);
  });

  //code events
  socket.on("change", function (diff) {
    var p = getPartner(socket.paired, socket.pid);
    if(typeof p != "undefined")
      p.emit("updateCode", diff);
  });
  socket.on("run", function (code) {
    sandbox.run(socket, code);
  });

  //git events
  socket.on("login", function () {
    github.login(socket);
  });
  socket.on("logout", function () {
    github.logout(socket);
  });
  socket.on("save", function (code) {
    if(socket.loggedIn)
      if(socket.isSaving)
        socket.emit("notif", "Currently in the middle of saving!");
      else
        github.save(socket, code);
    else
      socket.emit("notif", "Please log in to save your work!");
  });

  //webRTC
   socket.on("message", function (details) {
        var reciever = socket.id == details.to ? socket : (socket.pid == details.to ? getPartner(socket.paired, socket.pid) : undefined);
        if (!reciever) return;
        details.from = socket.id;
        reciever.emit("message", details);
    });
    socket.on("join", join);
    socket.on("leave", function () {
      console.log("leaving");
    });
    socket.on("create", function (name, cb) {
      name = uuid();
      if (io.sockets.clients(name).length) {
        safeCb(cb)("taken");
      } else {
        join(name);
        safeCb(cb)(null, name);
      }
    });

    function join(cb) {
      var p = getPartner(socket.paired, socket.pid);
      if(p) {
        var results = {clients:{}}
        results.clients[p.id] = p.resources;
        safeCb(cb)(null, results);
      }
    };

  // local functions sockets
  function initialize() {
    socket.publicUser = config.defaultUser;
    socket.question = undefined;
    socket.alertflags = {"cq":false};
    socket.searching = false;
    socket.paired = false;
    socket.room = "";
    socket.pid = undefined;
    socket.loggedIn = false;
    socket.user = {};
    socket.isSaving = false;
    socket.resources = {
        screen: false,
        video: true,
        audio: false
    };
    socket.token = session.token;
    users[socket.id] = socket;
    
    if(!sessionSocket[session.sessionID])
      sessionSocket[session.sessionID] = [];
    sessionSocket[session.sessionID].push(socket.id);
    socket.emit("fireReady", connectionCtr);
    if(socket.token) {
      console.log("AUTO LOG: ", socket.token);
      github.login(socket);
    }
  }
});

server.listen(config.port);