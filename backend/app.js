var express = require('express')
, app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server)
, chat = require('chat.js')
, rand = require("generate-key")
, webrtc = require('socket.io').listen(8001);

app.use(express.static(__dirname + '/public'));
server.listen(8080);
// routing
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var queue = [];
var users = {};
io.sockets.on('connection', function (socket) {
	socket.github = "ANON";
	users[socket.id] = socket;
	socket.on('joinRoom', function () {
		if(queue.length == 0) {
			queue.push(socket.id);
			socket.emit('notif', "Finding you a partner...");
		} else {
			var part_id = queue.pop();
			var partner = users[part_id];
			var room = rand.generateKey(10);
			socket.room = room;
			partner.room = room;
			partner.join(room);
			socket.join(room);
			partner.emit('match', socket.github);
			socket.emit('match', partner.github);
		}
	});
	socket.on('leaveRoom', function () {
		chat.leaver(socket);
	});
	socket.on('chat', function (data) {
		if(socket.room) {
			socket.broadcast.to(socket.room).emit('updatechat', false, data);
		}
		socket.emit('updatechat', true, data);
	});
	socket.on('question', function () {

	});
	socket.on('updatePartner', function () {

	});
	// githut specific
	socket.on('login', function () {

	});
	socket.on('runCode', function () {

	});
	socket.on('commit', function () {

	});

	socket.on('disconnect', function () {
		chat.leaver(socket);
		delete users[socket.id];
	});
});