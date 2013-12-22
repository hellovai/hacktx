// allows you to run code with desired results
var globals = require('../globals')
	,python = require('node-python');

var queue = globals.queue;
var users = globals.users;
var isConnected = globals.isConnected;
var config = require('../config').sandbox;

var os = python.import('os');
var sys = python.import('sys');
sys.path.append(os.path.dirname(__dirname + "/sandbox"));
var pysand = python.import('codewrap').Sandbox(config.basepath, config.user)

var run = function (socket, code) {
	if (code.length == 0) {
		result = '{"status":-1, "error":"Write some code!"}';
	} else if(socket.question !== undefined) {
		socket.emit('runStatus', true, '{status:2}');
		result = pysand.Run( socket.question, code ).toString();
	} else
		result = '{"status":-1, "error":"Get a question first!"}';
	if(isConnected(socket))
		users[socket.pid].emit('runStatus', false, result );
	socket.emit('runStatus', true, result );
};

module.exports.run = run;
