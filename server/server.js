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


var server = http.createServer(app).listen(config.port);
var io = socketio.listen(server);
var isConnected = globals.isConnected;

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
	console.log(git.auth_url);
	res.writeHead(301, {'Content-Type': 'text/plain', 'Location': git.auth_url})
    res.end('Redirecting to ' + git.auth_url);
});

app.get('/verify', function(req, res) {
	uri = url.parse(req.url);
	git.login(uri.query, res)
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
    socket.resources = {
        screen: false,
        video: true,
        audio: false
    };

	users[socket.id] = socket;
	console.log('Connected ' + socket.id);
	
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
			console.log(socket.room);
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

	// git events
	socket.on('login', function (username, password) {
		
	});
	socket.on('logout', function (argument) {
		// body...
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