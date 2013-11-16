function writeMessage (string, cls) {
	$("#chat-convo").append("<font class=\"" + cls + "\">" + string + "<br/></font>");
	$("#chat-convo").scrollTop($("#chat-convo")[0].scrollHeight);
}

var socket = io.connect('http://localhost:8080');

// on load of page
$(function(){
	//when the client clicks leave
	$('#newPartner').click( function() {
		$('#conversation').append('<em>Left the room!</em><br />');
		if($(this).attr("data") == "leave") {
			socket.emit('leaveRoom');
			$(this).attr('data', 'leaving');
		} else if ($(this).attr("data") == "join"){
			socket.emit('joinRoom');
			$(this).attr('data', 'joining');
		}
	});
	$('#newQuestion').click( function () {
		socket.emit('reqQuestion');
	});
	$('#runCode').click( function() {
		console.log("CLK");
		socket.emit('runCode', editor.doc.getValue());
	});
	// when the client hits ENTER on their keyboard
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			var message = $('#data').val();
			$('#data').val('');
			if(message.length > 0 ) {
				socket.emit('chat', message);
				$('#data').val('');
			}
			$("#data").focus();
		}
	});
});

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	socket.emit('joinRoom');
});

socket.on('match', function (partner, room) {
	$("#chat-convo").html('');
	writeMessage("Matched with " + partner, "alert");
	$("#newPartner").attr('data', 'leave');
	if(roomJoinAllow) {
		webrtc.joinRoom(room);
	}
});
// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (flag, data) {
	var sender = "other";
	if(flag) sender = "self";
	writeMessage(sender + ":" + data, "message");
});

socket.on('notif', function (data) {
	writeMessage(data, "alert");
});

socket.on('partnerCode', function(code) {
	partnerEdit.doc.setValue(code);
});

socket.on('newq', function (question) {
	$("#questionName").html(question);
});

socket.on('solo', function() {
	writeMessage("You're partner left you!", "alert");
	if(roomJoinAllow)
		webrtc.leaveRoom(webrtc.roomName);
	$("#newPartner").attr('data', 'join');
});

socket.on('left', function() {
	writeMessage("Left the room!", "alert");
	if(roomJoinAllow)
		webrtc.leaveRoom(webrtc.roomName);
	$("#newPartner").attr('data', 'join');
});

socket.on('runRes', function(result, self) {
	if(self) {
		div = "userResult-div";
	} else {
		div = "pairResult-div";
	}
	console.log(result);
	$("#" + div).html(result);
});