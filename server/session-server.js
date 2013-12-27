var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express')
  , qs = require('querystring')
  , url = require('url')
  , app = express();

var config = require('./config')
  , globals = require('./global')
  , chat = require('./chat')
  , question = require('./question')
  , sandbox = require('./sandbox')
  , github = require('./github');

var cookieParser = express.cookieParser(config.secret)
  , sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore }));
});

var server = http.createServer(app)
  , io = require('socket.io').listen(server);

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser, config.secret);

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
});

app.get('/verify', function (req, res) {
  uri = url.parse(req.url);
  var values = qs.parse(uri.query);
  if (!state || state[1] != values.state) {
    res.status(403);
    res.setHeader('Content-Type', 'text/html');
    res.sendfile(__dirname + '/autoClose.html');
  } else {
    github.api.auth.login(values.code, function (err, token) {
      req.session.token = token
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.sendfile(__dirname + '/autoClose.html');
    });
  }
});

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ;

sessionSockets.on('connection', function (err, socket, session) {
  initialize();

  socket.on('disconnect', function() {
    chat.leave(socket);
    removeQ(socket.id)
    delete users[socket.id];
  });

  // room events
  socket.on('toggleRoom', function () {
    var p = getPartner(socket);
    if(typeof p !== "undefined")
      chat.leave(socket, p);
    else if(socket.searching) {
      removeQ(socket.id);
    } else if(chat.join(socket)) {
      question.setQ(socket);
    }
  }).on('chat', function (msg) {
    chat.sendMessage(socket, msg);
  });

  // question events
  socket.on('getQuestion', function () {
    var p = getPartner(socket);
    if(typeof p !== "undefined") {
      if(socket.alertflags.cq) {
        socket.alertflags.cq = false;
        question.setQ(socket);
      } else {
        p.emit('changeQuestion');
        p.alertflags.cq = true;
      }
    } else 
      question.getNew(socket);
  });

  //code events
  socket.on('change', function (diff) {
    var p = getPartner(socket);
    if(typeof p != "undefined")
      p.emit('updateCode', diff);
  }).on('run', function (code) {
    sandbox.run(socket, code);
  });

  //git events
  socket.on('login', function () {
    github.login();
  }).on('logout', function () {
    github.logout();
  }).on('save', function (code) {
    if(socket.loggedIn)
      socket.emit('notif', 'This feature is currently in progress!');
    else
      socket.emit('notif', 'Please log in to save your work!');
  });

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
    socket.github = {};
    socket.resources = {
        screen: false,
        video: true,
        audio: false
    };
    users[socket.id] = socket;
    if(session.touch().token)
      github.login(socket, session)
  }
});

server.listen(config.port);