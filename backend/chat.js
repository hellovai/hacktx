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
		partner.room = room;
		socket.room = room;
		partner.pid = socket.id;
		socket.pid = partner.id;
		partner.join(room);
		socket.join(room);
		partner.emit('match', socket.github);
		socket.emit('match', partner.github);
	}
}

var leaver = function (socket) {	
	if(socket.room) {
		socket.leave(room);
		if(socket.pid in users) {
			users[socket.pid].leave(room);
			users[socket.pid].emit('solo');
			users[socket.pid].pid = -1;
		}
		socket.pid = -1;
	}
	socket.emit("left");
}

var sendMessage = function (socket, message) {
	if(socket.room && (socket.pid in users)) {
		users[socket.pid].emit('updatechat', false, data);
	}
	socket.emit('updatechat', true, data);
}

module.exports.joiner = joiner;
module.exports.leaver = leaver;
module.exports.sendMessage = sendMessage;