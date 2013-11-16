function writeMessage (string, cls) {
	$("#chat").append("<font class=\"" + cls + "\">" + string + "<br/></font>");
}

var socket = io.connect('http://localhost:8080');

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
	socket.emit('joinRoom');
});

socket.on('match', function (partner) {
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
