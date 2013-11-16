function writeMessage (string, cls) {
	$("#chat-convo").append("<font class=\"" + cls + "\">" + string + "<br/></font>");
	$("#chat-convo").scrollTop($("#chat-convo")[0].scrollHeight);
}

var socket = io.connect('http://localhost:8080');

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	socket.emit('joinRoom');
});

socket.on('match', function (partner) {
	$("#chat-convo").html('');
	writeMessage("Found: " + partner, "message");
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

socket.on('rejoin', function () {
	writeMessage("Partner has left!", "alert");
	socket.emit('join');
	$("#leavejoin").attr('value', 'joining');
});

socket.on('partnerCode', function(code) {
	$('#pairCode').html(code);
});

socket.on('newq', function (question) {
	$("#questionName").html(question);
});

socket.on('runRes', function(result, self) {
	if(self) {
		div = "userResult-div";
	} else {
		div = "pairResult-div";
	}
	$(div).html(result);
});


// on load of page
$(function(){

	//when the client clicks leave
	$('#leavejoin').click( function() {
		$('#conversation').append('<em>Left the room!</em><br />');
		if($(this).attr("value") == "leave") {
			socket.emit('leave');
			webrtc.leaveRoom(webrtc.room);
			$(this).attr('value', 'join');
		} else if ($(this).attr("value") == "join"){
			socket.emit('join');
			$(this).attr('value', 'joining');
		}
	});
	$('#newQuestion').click( function () {
		socket.emit('reqQuestion');
	});
	$('#runCode').click( function() {
		socket.emit('runCode', $("#userCode").val());
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

	$('#userCode').keypress(function(e) {
		socket.emit('updatePartner', $('#userCode').val());
	});
});
