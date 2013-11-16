var express = require('express')
, app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server)
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
	socket.github = null;
	users[socket.id] = socket;
	socket.on('joinRoom', function () {
		if(queue.length == 0) {
			queue.push(socket.id);
			socket.emit('notif', "Finding you a partner...");
		} else {
			var threshold = 0.8;
			var partner = users[queue.pop()];
			socket.emit('match', partner.github);
		}
	});
	socket.on('leaveRoom', function () {

	});
	socket.on('chat', function () {

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

	});
});