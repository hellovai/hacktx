var joiner = function (socket) {
	
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
	
}

module.exports = joiner;
module.exports = leaver;
module.exports = sendMessage;