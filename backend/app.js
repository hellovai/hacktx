var express = require('express')
	, app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, chat = require('./chat')
	, globals = require('./globals')
	, question = require('./question')
	, webrtc = require('socket.io').listen(8001);

app.use(express.static(__dirname + '/public'));
server.listen(8080);
// routing
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var queue = globals.queue;
var users = globals.users;

io.sockets.on('connection', function (socket) {
	socket.github = "ANON";
	users[socket.id] = socket;
	socket.on('joinRoom', function () {
		chat.joiner(socket);
	});
	socket.on('leaveRoom', function () {
		chat.leaver(socket);
	});
	socket.on('chat', function (data) {
		chat.sendMessage(socket, data);
	});
	socket.on('question', function () {
		io.sockets.in(sockets.room).emit('updateQ', question.get());
	});
	socket.on('updatePartner', function (data) {
		if(socket.pid) {
			users[socket.pid].emit('partnerCode', data);
		}
	});
	socket.on('reqQuestion', function () {
		var flag = true;
		if(socket.pid != -1) {
			var partner = users[socket.pid];
			if(partner.changeQ !== true)
				flag = false;
		}
		if(flag) {
			socket.changeQ = false;
			if(socket.pid != -1)
				users[socket.pid].changeQ = false;
			io.sockets.in(socket.room).emit('newq', question.get());
		} else {
			socket.changeQ = true;
			socket.emit('qwait');
		}
	});
	socket.on('runCode', function () {

	});
	// githut specific
	socket.on('login', function () {

	});
	socket.on('commit', function () {

	});

	socket.on('disconnect', function () {
		chat.leaver(socket);
		delete users[socket.id];
	});
});