var express = require('express')
	, app = express()
	, github = require('octonode')
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, chat = require('./chat')
	, globals = require('./globals')
	, question = require('./question')
	, webrtc = require('socket.io').listen(8001);

app.use(express.static(__dirname + '/public'));
server.listen(8080);
// routing
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});
app.get('/test', function(req, res) {
    res.sendfile(__dirname + '/test/test_runner.html');
});

var queue = globals.queue;
var users = globals.users;

io.sockets.on('connection', function (socket) {
	socket.github = "ANON";
	socket.gitlog = -1;
	socket.changeQ = false;
	socket.pid = -1;
	socket.qid = -1;
	users[socket.id] = socket;
	socket.on('joinRoom', function () {
		if(chat.joiner(socket)) {
			var partner = users[socket.pid];
			if(partner.qid != -1) {
				socket.qid = partner.qid;
				socket.emit('newq', question.getByIndex(socket.qid));
			} else {
				var qid = question.get();
				socket.changeQ = false;
				socket.qid = qid;
				if(socket.pid != -1) {
					users[socket.pid].changeQ = false;
					users[socket.pid].qid = qid;
				}
				socket.emit('newq', question.getByIndex(qid));
				partner.emit('newq', question.getByIndex(qid));
			}
		}
	});
	socket.on('leaveRoom', function () {
		chat.leaver(socket);
	});
	socket.on('chat', function (data) {
		chat.sendMessage(socket, data);
	});
	socket.on('question', function () {
		io.sockets.in(sockets.room).emit('updateQ', question.get());
	});
	socket.on('updatePartner', function (data) {
		if(socket.pid != -1) {
			users[socket.pid].emit('partnerCode', data);
		}
	});
	socket.on('reqQuestion', function () {
		var flag = true;
		if(socket.pid in users) {
			var partner = users[socket.pid];
			if (partner.changeQ == false)
				flag = false;
		}
		if(flag) {
			var qid = question.get();
			socket.changeQ = false;
			socket.qid = qid;
			if(socket.pid != -1) {
				users[socket.pid].changeQ = false;
				users[socket.pid].qid = qid;
				users[socket.pid].emit('newq', question.getByIndex(qid));
			}
			socket.emit('newq', question.getByIndex(qid));
		} else {
			socket.changeQ = true;
			socket.emit('qwait');
		}
	});
	socket.on('runCode', function (code) {
		question.run(socket, code);
	});
	// githut specific
	socket.on('login', function (usename, pass) {
		socket.gitlog = github.client({
			  username: usename,
			  password: pass
			});
		socket.gitlog.me().repos({
		  "name": "PrePair.me",
		  "description": "Your interview portfolio",
		}, function(err, data) {
			if(err){
				socket.emit('notif', "wrong login");
			} else {
				socket.github = usename;
				socket.emit('logged', usename);
			}
		});
	});
	socket.on('commit', function () {
		socket.emit('notif', "Commits are currently blocked");
	});

	socket.on('disconnect', function () {
		chat.leaver(socket);
		var i = queue.indexOf(socket.id);
	      if(i != -1) {
	        queue.splice(i, 1);
	      }
		delete users[socket.id];
	});
});
