var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express.io')
  , qs = require('querystring')
  , url = require('url')
  , app = express();

var config = require('./config')
  , globals = require('./globals')
  , chat = require('./chat')
  , question = require('./question')
  , sandbox = require('./sandbox')
  , github = require('./git');

var cookieParser = express.cookieParser(config.secret)
  , sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore,
    key: config.keyname
   }));
  app.use(function(req, res, next) {
    res.on('header', function() {
      console.trace('HEADERS GOING TO BE WRITTEN');
    });
    next();
  });
});

// attempting with express.io
app.http().io()

// for github authentication
var state = github.auth_url.match(/&state=([0-9a-z]{32})/i);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
  res.statusCode = 301;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Location', github.auth_url);
  res.end('Redirecting to ' + github.auth_url);
});

app.get('/logout', function (req, res) {
  delete req.session.token;
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.sendfile(__dirname + '/autoClose.html');
  res.end();
});

app.get('/verify', function (req, res) {
  uri = url.parse(req.url);
  var values = qs.parse(uri.query);
  if (!state || state[1] != values.state) {
    res.status(403);
    res.setHeader('Content-Type', 'text/html');
    res.sendfile(__dirname + '/autoClose.html');
    res.end();
  } else {
    github.api.auth.login(values.code, function (err, token) {
      req.session.token = token
      res.status(200)
      res.setHeader('Content-Type', 'text/html');
      res.sendfile(__dirname + '/autoClose.html');
      res.end();
    });
  }
});

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ;

var connectionCtr = 0;

app.io.on('connection', function (req) {
  if(err) {
    console.log(err);
    return;
  }
  console.log(session);
  initialize();
  connectionCtr += 1;

  socket.on('disconnect', function() {
    chat.leave(socket, getPartner(socket.paired, socket.pid));
    removeQ(socket.id)
    delete users[socket.id];
    connectionCtr -= 1;
  });

  // room events
  socket.on('toggleRoom', function () {
    var p = getPartner(socket.paired, socket.pid);
    if(typeof p != "undefined")
      chat.leave(socket, p);
    else if(socket.searching) {
      socket.searching = false;
      removeQ(socket.id);
    } else {
      chat.join(socket)
    }
  })
  .on('chat', function (msg) {
    chat.sendMessage(socket, msg);
  });

  // question events
  socket.on('getQuestion', function () {
    var p = getPartner(socket.paired, socket.pid);
    if(typeof p != "undefined") {
      if(socket.alertflags.cq) {
        socket.alertflags.cq = false;
        question.setQ(socket, p, true);
      } else {
        p.emit('changeQuestion');
        p.alertflags.cq = true;
      }
    } else 
      question.getNew(socket);
  });

  //code events
  socket.on('change', function (diff) {
    var p = getPartner(socket.paired, socket.pid);
    if(typeof p != "undefined")
      p.emit('updateCode', diff);
  })
  .on('run', function (code) {
    sandbox.run(socket, code);
  });

  //git events
  socket.on('login', function () {
    github.login(socket, session);
  })
  .on('logout', function () {
    github.logout(socket, session);
  })
  .on('save', function (code) {
    if(socket.loggedIn)
      socket.emit('notif', 'This feature is currently in progress!');
    else
      socket.emit('notif', 'Please log in to save your work!');
  });

  //webRTC
   socket.on('message', function (details) {
        var p = getPartner(socket.paired, socket.pid);
        if (typeof p == "undefined") return;
        details.from = socket.id;
        p.emit('message', details);
    })
    .on('join', join)
    .on('leave', removeFeed)
    .on('create', function (name, cb) {
      name = uuid();
      if (io.sockets.clients(name).length) {
        safeCb(cb)('taken');
      } else {
        join(name);
        safeCb(cb)(null, name);
      }
    });

    function removeFeed(type) {
      var p = getPartner(socket.paired, socket.pid);
      if(p) 
        p.emit('remove', {
          id: socket.id,
          type: type
        });
      // socket.emit('remove'm {
      //   id: socket.id,
      //   type: type
      // });
    };
    function join(name, cb) {
      var p = getPartner(socket.paired, socket.pid);
      if(p) {  
        var pid = p.id
          , sid = socket.id;
        var results = {
          clients:{
            pid : p.resources,
            sid : socket.resources
          }
        }
        safeCb(cb)(null, results);
      }
    };

  // local functions sockets
  function initialize() {
    socket.publicUser = config.defaultUser;
    socket.question = undefined;
    socket.alertflags = {'cq':false};
    socket.searching = false;
    socket.paired = false;
    socket.connection = {
      room: '',
      pid: undefined
    };
    socket.loggedIn = false;
    socket.user = {};
    socket.resources = {
        screen: false,
        video: true,
        audio: false
    };
    users[socket.id] = socket;
    if(session.token)
      github.login(socket, session)
    socket.emit('fireReady', connectionCtr);
  }
});

app.listen(config.port);