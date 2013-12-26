// main server file
var config = require('./config')
	, express = require('express')
	, app = express()
	, http = require('http')
	, socketio = require('socket.io')
	, uuid = require('node-uuid')
	, url = require('url')
	, chat = require('./chat')
	, globals = require('./globals')
	, question = require('./question')
	, sandbox = require('./sandbox')
	, git = require('./git');

app.configure(function () {
	app.use(express.static(__dirname + '/public'));
	app.use(express.cookieParser(config.secret));
    app.use(express.session({
    	secret: config.secret
    	,key: 'express.sid'
    	,cookie: {
    		path: '/'
    		// ,secure: true
    		,signed: true
    		,httpOnly: true
    		,maxAge: 9000000
    	}
    }));
});

var server = http.createServer(app).listen(config.port);
var io = socketio.listen(server);
var isConnected = globals.isConnected;

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
	res.statusCode = 301;
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Location', git.auth_url);
    res.end('Redirecting to ' + git.auth_url);
});

app.get('/logout', function (req, res) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');
	res.cookie('gitLogin', 'Not In', {
		maxAge: 1
		,httpOnly: true
		,signed: true
		,path:'/'
		,domain: '.mealmaniac.com'
	});
	res.end("<body onLoad=\"window.open('', '_self', '');setTimeout(function() {window.close();}, 100);\">Logged In!</body>");
});

app.get('/verify', function(req, res) {
	uri = url.parse(req.url);
	git.login(uri.query, req, res);
});

var queue = globals.queue;
var users = globals.users;


function describeRoom(name) {
    var clients = io.sockets.clients(name);
    var result = {
        clients: {}
    };
    clients.forEach(function (client) {
        result.clients[client.id] = client.resources;
    });
    return result;
}

function safeCb(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}

var cookie = require('cookie');
var connect = require('connect');

io.set('authorization', function (handshakeData, accept) {
	console.log(handshakeData.headers)
  if (handshakeData.headers.cookie) {

    handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

    handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], config.secret);
    if('gitLogin' in handshakeData.cookie)
    	handshakeData.login = connect.utils.parseSignedCookie(handshakeData.cookie['gitLogin'], config.secret);
    else handshakeData.login = undefined;
    if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
      return accept('Cookie is invalid.', false);
    }

  } else {
    return accept('No cookie transmitted.', false);
  } 

  accept(null, true);
});

var defaultUser = {
		"username":"Anon"
		,"avatar_ur":"http://placekitten.com/250/250"
		,"points":9001
	};

io.sockets.on('connection', function (socket) {
	// objects
	socket.github = undefined;
	socket.alertflags = [];
	socket.pid = undefined;
	socket.room = undefined;
	socket.searching = false;
	socket.question = undefined;
	socket.loggedIn = false;
	socket.paired = false;
	socket.token = socket.handshake.login;
	socket.user = defaultUser;
    socket.resources = {
        screen: false,
        video: true,
        audio: false
    };
	users[socket.id] = socket;
	if(socket.token !== undefined)
		loginBase();

	socket.on('disconnect', function () {
		chat.leave(socket);
		var i = queue.indexOf(socket.id);
		if(i != -1) {
			queue.splice(i, 1);
		}
		delete users[socket.id];
	});

	// room events
	socket.on('toggleRoom', function () {
		if(isConnected(socket))
			chat.leave(socket);
		else if(socket.searching) {
			socket.searching = false;
			queue.splice( queue.indexOf(socket.id) , 1);
			socket.emit('notif', 'Leaving Queue!');
		} else if(chat.join(socket)) {
			question.setQ(socket);
		}
	});
	socket.on('leaveRoom', function () {
		chat.leave(socket);
	});
	socket.on('messages', function (message) {
		chat.sendMessage(socket, message);
	});

	// question events
	socket.on('getQuestion', function () {
		if (isConnected(socket)) {
			if ( socket.alertflags.indexOf("cq") >= 0 ) {
				var index = socket.alertflags.indexOf("cq");
				socket.alertflags.splice(index, 1);
				question.getNew(socket);
			} else {
				var partner = users[socket.pid];
				partner.alertflags.push("cq");
				partner.emit('changeQuestion');
			}
		} else {
			question.getNew(socket);
		}
	});

	// code box events
	socket.on('change', function (diff) {
		if(isConnected(socket))
			users[socket.pid].emit('updateCode', diff);
	});
	socket.on('run', function (code) {
		sandbox.run(socket, code);
	});

	function loginBase(cookie) {
		// console.log("Attempting: ", socket.handshake.headers);
		if(!socket.loggedIn) {
			console.log('in');
			// socket.handshake.cookie.touch().save();
			var token = socket.token;
			if (token === undefined)
				token = cookie.parse(socket.handshake.headers.cookie).gitLogin;
			if (token == 'goodtry') {
				socket.emit('notif', 'Try logging in again');
			} else if(token != 'Not In') {
				console.log('trying', token);
				socket.loggedIn = true;
				socket.token = token;
				socket.gClient = git.getClient(token);
				socket.github = socket.gClient.me();
				git.accessAccount(socket);
			} else
				socket.emit('notif', 'Not yet logged in');
		}
		console.log('caught login');
	}

	function logout() {
		if(socket.loggedIn) {
			// socket.handshake.cookie.touch().save()
			socket.github = undefined;
			socket.token = undefined;
			socket.gClient = undefined;
			socket.gRepo  = undefined;
			socket.loggedIn = false;
			socket.user = defaultUser;
			console.log(socket.handshake.headers.cookie);
			socket.emit('login', socket.user);
  			if(isConnected(socket))
    			users[socket.pid].emit('rLogin', socket.user);
			}
	}

	// git events
	socket.on('login', function () {
		loginBase();
	});
	socket.on('logout', function (argument) {
		logout();
	});
	socket.on('save', function (updatedFile) {
		if(socket.loggedIn) {
			socket.emit('notif', 'We are working hard to get this feature!');
		} else {
			socket.emit('notif', 'Save Failed! Please log in!');
		}
	});

	//webrtc crap
	// pass a message to another id
    socket.on('message', function (details) {
        var otherClient = io.sockets.sockets[details.to];
        if (!otherClient) return;
        details.from = socket.id;
        otherClient.emit('message', details);
    });

    socket.on('join', join);

    function removeFeed(type) {
        io.sockets.in(socket.room).emit('remove', {
            id: socket.id,
            type: type
        });
    }

    function join(name, cb) {
        safeCb(cb)(null, describeRoom(name));
        socket.join(name);
        socket.room = name;
    }
	socket.on('leave', removeFeed);

    socket.on('create', function (name, cb) {
        cb = name;
        name = uuid();
        // check if exists
        if (io.sockets.clients(name).length) {
            safeCb(cb)('taken');
        } else {
            join(name);
            safeCb(cb)(null, name);
        }
    });
});