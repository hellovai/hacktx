var globals = require('./globals')
	, db = require('./db');

// sets question for user
// if partner has a question, given preference
// else we take youre question
// else we give random
var set = function (socket) {
	console.log('Done');
}

// gets new question for both
// disregards any current question info
var getNew = function (socket) {
	console.log('Done');
}

module.exports.setQ = set;
module.exports.getNew = getNew;
