var globals = require('./globals')
, rand = require("generate-key");
var queue = globals.queue;
var users = globals.users;

var joiner = function (socket) {
	if(queue.length == 0) {
		queue.push(socket.id);
		socket.emit('notif', "Finding you a partner...");
	} else {
		var part_id = queue.pop();
		if(part_id )
		var partner = users[part_id];
		var room = rand.generateKey(10);
		socket.room = room;
		partner.room = room;
		partner.join(room);
		socket.join(room);
		partner.emit('match', socket.github);
		socket.emit('match', partner.github);
	}
}

var leaver = function (socket) {	
	if(socket.room) {
		room = socket.room;
		socket.leave(room);
		partner = io.sockets.clients(room)[0];
		if(partner) {
			partner.leave(room);
			partner.emit("solo");
		}
	}
	socket.emit("left");
}

var sendMessage = function (socket, message) {
	if(socket.room) {
		socket.broadcast.to(socket.room).emit('updatechat', false, data);
	}
	socket.emit('updatechat', true, data);
}

module.exports.joiner = joiner;
module.exports.leaver = leaver;
module.exports.sendMessage = sendMessage;