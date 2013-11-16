var express = require('express')
, app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server)
, chat = require('./chat')
, globals = require('./globals')
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