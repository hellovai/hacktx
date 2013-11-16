var exec = require('child_process').exec;
var python = require('node-python');
var globals = require('../globals');
os = python.import('os'),
sysp = python.import('sys'),
cwd = os.getcwd(),
sysp.path.append(cwd + "/question");
var runner = python.import('run_wrapper')

var questions = [
"QUESTIONS BRA",
"Qs"
];
var users = globals.users;

module.exports.get = function () {
	return Math.floor(Math.random() * questions.length);
}

module.exports.getByIndex = function(index) {
	return questions[index];
}

module.exports.run = function(socket, code) {
	var result = runner.main(socket.qid, code);
	socket.emit('runRes', result, true);
	if(socket.pid != -1)
		users[socket.pid].emit('runRes', result, false);
}
