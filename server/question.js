var globals = require('./globals')
	, db = require('./db')
	, config = require('./config').question
	, set = require('simplesets');

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ;

var crit = Math.pow(config.decay, config.critical) * config.threshhold;

// sets question for user
// if partner has a question, given preference
// else we take youre question
// else we give random
function setQ(socket, partner, rand) {
	var bf = bestFit(rand || false, socket, partner);
	if( bf ) {
		findInDb(bf, socket, partner);
	} else {
		findInDb([], socket, partner);
	}
}

// gets new question for single
// must be completely or else will get 
function getNew(socket) {
	var bf = bestFit(true, socket);
	if( bf ) {
		findInDb(bf, socket);
	} else {
		findInDb([], socket);
	}
}

module.exports.setQ = setQ;
module.exports.getNew = getNew;

// grabs a specific question from the db
function findInDb(qId, socket, partner) {
	if(typeof qId == "string") {
		db.questions.findOne( { folder : qId }, function (err, res) {
			if(res) {
				sendQ(socket, res, partner);
			} else {
				findInDb([], socket, partner);
			}
		});
	} else {
		if (Math.random() <= 0.5)
			db.questions.findOne( { folder : {$nin: qId}
				, random : { $gte : Math.random() } }
				, function (err, res) {
				if(res) {
					sendQ(socket, res, partner);
				} else {
					findInDb([], socket, partner);
				}
			});
		else
			db.questions.findOne( { folder : {$nin: qId}
				, random : { $lte : Math.random() } }
				, function (err, res) {
				if(res) {
					sendQ(socket, res, partner);
				} else {
					findInDb([], socket, partner);
				}
			});
	}
};

//grabs list of best possible questions for user
function bestFit(rand, socket, partner) {
	var sockSeen = new set.Set([]);
	var sockFin = new set.Set([]);
	var partSeen = new set.Set([]);
	var partFin = new set.Set([]);
	if(socket.loggedIn) {
		sockSeen.union( new set.Set(socket.user.db.questions.viewed) );
		sockFin.union( new set.Set(socket.user.db.questions.finished) );
	}
	if(partner && partner.loggedIn) {
		partSeen.union( new set.Set(partner.user.db.questions.viewed) );
		partFin.union( new set.Set(partner.user.db.questions.finished) );
	}
	var fin = sockFin.union(partFin);
	var sSeen = sockSeen.difference(fin);
	var pSeen = partSeen.difference(fin);
	
	var bSeen = pSeen.intersection(sSeen).array();
	if(!rand && bSeen.length > 0)
		return bSeen[ Math.floor( Math.random() * bSeen.length ) ];
	
	var oSeen = pSeen.union(sSeen).array();
	if(!rand && oSeen.length > 0)
		return oSeen[ Math.floor( Math.random() * oSeen.length ) ];
	
	return fin.union(pSeen).union(sSeen).array();
};

//sends socket and partner new question
function sendQ(socket, q, p) {
	if(p) sendQ(p, q);
	socket.question = q.folder;
	socket.emit('newQuestion', q.title, q.details);
	if(socket.loggedIn) {
		var i = socket.user.db.questions.viewed.indexOf(q.folder);
		if( i == -1)
			socket.user.db.questions.viewed.push(q.folder);
	}
};