var globals = require('./globals')
	, db = require('./db')
	, config = require('./config').question
	, sets = require('simplesets');

var isConnected = globals.isConnected;
var queue = globals.queue;
var users = globals.users;
var crit = Math.pow(config.decay, config.critical) * config.threshhold;

// sets question for user
// if partner has a question, given preference
// else we take youre question
// else we give random
var set = function (socket) {
	var q = socket.question;
	if(isConnected(socket))
		if(users[socket.pid].question !== undefined)
			q = getByFolder(users[socket.pid].question)
	if(q === undefined)
		q = getRandQuestion();
	sendQ(socket, q);
}

// gets new question for both
// disregards any current question info
var getNew = function (socket) {
	var q = bestFit(socket);
	if(q === undefined)
		q = getDiffQuestion(socket, config.threshold);
	sendQ(socket, q);
}

module.exports.setQ = set;
module.exports.getNew = getNew;

// grabs random question from the db
function getRandQuestion() {
	var rand = Math.random();
	var result = db.docs.findOne( { random : { $gte : rand } } );
	if ( result == null ) {
		result = db.docs.findOne( { random : { $lte : rand } } );
	}
	return result;
}

//grabs a question that neither people have seen
function getDiffQuestion(socket, threshold) {
	if(threshold < crit)
		return getRandQuestion();
	var q = getRandQuestion();
	if(q.folder != socket.question) {
		if(!isConnected(socket))
			return q;
		var partner = users[socket.pid];
		if(partner.question != q.folder)
			return q
	}
	return getDiffQuestion(socket, threshold * config.decay)
} 

//grabs list of best possible questions for user
function bestFit(socket) {
	var sock_seen = new set.Set([]);
	var sock_fin = new set.Set([]);
	var part_seen = new set.Set([]);
	var part_fin = new set.Set([]);
	if(socket.loggedIn) {
		sock_seen.union( new set.Set(socket.userData.questions.viewed) );
		sock_fin.union( new set.Set(socket.userData.questions.finished) );
	}
	if(isConnected(socket))
		if(users[socket.pid].loggedIn) {
			var partner = users[socket.pid];
			part_seen.union( new set.Set(partner.userData.questions.viewed) );
			part_fin.union( new set.Set(partner.userData.questions.finished) );
		}
	var finshed = sock_fin.union(part_fin);
	var left = sock_seen.difference(finshed);
	var left2 = part_seen.difference(finshed);
	var overlap = left.intersection(left2).array();
	if(overlap.length > 0)
		return overlap[0];
	var both = left.union(left2).array();
	if(both.length > 0)
		return both[0];
	// otherwise find something thats not in finished list
	return undefined;
}

//grabs a question by folder name
function getByFolder(name) {
	return db.docs.findOne( { folder : name } );
}

//sends socket and partner new question
function sendQ(socket, q) {
	socket.question = q.folder;
	if(isConnected(socket)) {
		users[socket.pid].question = q.folder;
		users[socket.pid].emit('newQuestion', q);
	}
	socket.emit('newQuestion', q);
}