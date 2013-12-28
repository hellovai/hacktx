// allows you to export join, leave, and sendMessage function for users
var rand = require("generate-key")
	, globals = require("./globals")
	, config = require("./config").matching
	, question = require("./question");

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ;

var crit = Math.pow(config.decay, config.critical) * config.threshhold;

function join(socket) {
	socket.emit("notif", "Finding you a partner...");
	socket.searching = true;
	tryJoin(socket, config.threshhold);
};

function leave(socket, partner) {	
	if(partner && socket.room == partner.room) {
		setUp(partner);
		partner.emit("solo", false);
	}
	setUp(socket);
	socket.emit("solo", true);
};

function sendMessage(socket, message) {
	var p = getPartner(socket.paired, socket.pid);
	if(p) {
		p.emit("updatechat", false, message);
	}
	socket.emit("updatechat", true, message);
};

// local functions
function removeFeed(socket, partner, type) {
    partner.emit("remove", {
        id: socket.id,
        type: type
    });
};

function setUp (sock, part, room) {
	sock.searching = false;
	sock.paired = part ? true : false;
	sock.pid = part && part.id || undefined;
	sock.room = room;
	if(room) sock.join(room);
};

function onJoin(err, socket, partner) {
	if(err) socket.emit("notif", err);
	else {
		var room = rand.generateKey(config.roomKeyLen);
		setUp(socket, partner, room);
		setUp(partner, socket, room);
		question.setQ(socket, partner);
		socket.emit("match", partner.publicUser, room);
		partner.emit("match", socket.publicUser, room);
	}
};

function tryJoin(socket, thresh) {
	var p = removeQ();
	if (!socket.searching) {
		onJoin("Leaving the queue", socket);
	} else if ( typeof p == "undefined" || thresh < crit) {
		queue.push(socket.id);
		if(p) 
			queue.push(p.id);
		if (thresh < crit) 
			onJoin("Finding a partner is taking longer than expected...", socket);
		else 
			onJoin("Waiting for people to join the queue...", socket);
	} else if (p.searching && compare(socket, p) > thresh) {
		onJoin(null, socket, p);
	}	else {
		setTimeout( function() { 
			queue.push(p.id);
			tryJoin(socket, thresh * config.decay);
		}, config.delay);
	}
};

var compare = function (self, partner) {
	if(partner.id == self.id) return 0.0;
	if(self.loggedIn && partner.loggedIn)
		return 1.0;
	return 0.75;
};


module.exports.join = join;
module.exports.leave = leave;
module.exports.sendMessage = sendMessage;