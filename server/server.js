// main server file
var config = require('./config')
	, express = require('express')
	, app = express()
	, http = require('http')
	, socketio = require('socket.io')
	, chat = require('./chat')
	, globals = require('./globals')
	, question = require('./question');


var server = http.createServer(app).listen(config.port);
var io = socketio.listen(server);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var queue = globals.queue;
var users = globals.users;

io.sockets.on('connection', function (socket) {
	// objects
	socket.github = undefined;
	socket.flags = [];
	socket.pid = undefined;
	socket.room = undefined;
	
	// room events
	socket.on('joinRoom', function () {
		if(chat.join(socket))
			question.set(socket);
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
			if ( "cq" in socket.flags ) {
				question.getNew(socket);
			} else {
				var partner = users[socket.pid];
				partner.flag.append("cq");
				partner.emit('changeQuestion');
			}
		} else {
			question.getNew(socket);
		}
	});

	// code box events
	socket.on('change', function (argument) {
		// body...
	});
	socket.on('run', function (argument) {
		// body...
	});

	// git events
	socket.on('login', function (argument) {
		// body...
	});
	socket.on('logout', function (argument) {
		// body...
	});
	socket.on('commit', function (argument) {
		// body...
	});
});