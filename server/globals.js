module.exports.queue = [];
module.exports.users = {};


// generic functions
module.exports.isConnected = function (socket) {
	return socket.paired;
	if(socket.room && (socket.pid in module.exports.users))
		return true;
	return false;
};