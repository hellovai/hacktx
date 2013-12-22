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
	reRun(socket, config.threshhold, true, Math.random());
}

// gets new question for both
// disregards any current question info
var getNew = function (socket) {
	reRun(socket, config.threshhold, true, Math.random());
}

module.exports.setQ = set;
module.exports.getNew = getNew;

// grabs random question from the db
function getRandQuestionGTE(socket, threshold, trigger, rand) {
	db.questions.findOne( { random : { $gte : rand } }, function(err, res) {
		if(err || !res) {
			reRun(socket, threshold, trigger, rand);
		} else if(noOverlap(socket, res)) {
			sendQ(socket, res)
		} else {
			reRun(socket, threshold, trigger, rand);
		}
	});
}
function getRandQuestionLTE(socket, threshold, trigger, rand) {
	db.questions.findOne( { random : { $lte : rand } }, function(err, res) {
		if(err || !res) {
			reRun(socket, threshold, trigger, rand);
		} else if(noOverlap(socket, res)) {
			sendQ(socket, res)
		} else {
			reRun(socket, threshold, trigger, rand);
		}
	});
}


function reRun (socket, threshold, trigger, rand) {
	if (trigger == false) {
		trigger = true;
		rand = Math.random();
	} else trigger = false;
	
	if(threshold < crit) {
		db.questions.findOne(function (err, res) {
			sendQ(socket, res);
		});
	} else if(trigger)
		getRandQuestionGTE(socket, threshold * config.decay, trigger, rand)
	else
		getRandQuestionLTE(socket, threshold * config.decay, trigger, rand)
}

function noOverlap(socket, q) {
	if(q.folder != socket.question) {
		if(!isConnected(socket))
			return true
		var partner = users[socket.pid];
		if(partner.question != q.folder)
			return true
	}
	return false
}

//grabs list of best possible questions for user
function bestFit(socket) {
	return undefined;
	var sock_seen = set.Set([]);
	var sock_fin = set.Set([]);
	var part_seen = set.Set([]);
	var part_fin = set.Set([]);
	if(socket.loggedIn) {
		sock_seen.union( set.Set(socket.userData.questions.viewed) );
		sock_fin.union( set.Set(socket.userData.questions.finished) );
	}
	if(isConnected(socket))
		if(users[socket.pid].loggedIn) {
			var partner = users[socket.pid];
			part_seen.union( set.Set(partner.userData.questions.viewed) );
			part_fin.union( set.Set(partner.userData.questions.finished) );
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
	return db.questions.findOne( { folder : name } );
}

//sends socket and partner new question
function sendQ(socket, q) {
	socket.question = q.folder;
	if(isConnected(socket)) {
		users[socket.pid].question = q.folder;
		users[socket.pid].emit('newQuestion', q.title, q.details);
	}
	socket.emit('newQuestion', q.title, q.details);
}