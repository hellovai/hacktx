function writeMessage (string) {
	$("#chat").append(string + "<br/>");
}

var socket = io.connect('http://localhost:8080');

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	socket.emit('joinRoom');
});

socket.on('match', function (partner) {
	writeMessage("Found: " + partner);
});
// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (flag, data) {
	var sender = "other";
	if(flag) sender = "self";
	writeMessage(sender + ":" + data);
});

socket.on('notify', function (data) {
	writeMessage(data, "alert");
});

socket.on('rejoin', function () {
	webrtc.leaveRoom(webrtc.roomName);
	writeMessage("Partner has left!", "alert");
	socket.emit('join');
	$("#leavejoin").attr('value', 'joining');
});

socket.on('webchat', function(data) {
	webrtc.join(data);
});

// on load of page
$(function(){
	// when the client clicks SEND
	$('#datasend').click( function() {
		var message = $('#data').val();
		$('#data').val('');
		// tell server to execute 'sendchat' and send along one parameter
		if(message.length > 0 ) {
			socket.emit('chat', message);
		}
		$("#data").focus();
	});

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

	// when the client hits ENTER on their keyboard
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#datasend').focus().click();
		}
	});
});
