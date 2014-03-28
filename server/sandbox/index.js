// allows you to run code with desired results
var globals = require('../globals')
	,python = require('node-python');

var config = require('../config').sandbox;

var queue = globals.queue
  , users = globals.users
  , isConnected = globals.isConnected
  , getPartner = globals.getPartner
  , safeCb = globals.safeCallback
  , removeQ = globals.removeQ;

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
	var p = getPartner(socket.paired, socket.pid);
	if(p) p.emit('runStatus', false, result );
	socket.emit('runStatus', true, result );
};

module.exports.run = run;
