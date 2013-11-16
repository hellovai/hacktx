function writeMessage (string, cls) {
	$("#chat-convo").append("<font class=\"message-" + cls + "\">" + string + "<br/></font>");
	$("#chat-convo").scrollTop($("#chat-convo")[0].scrollHeight);
}

function resParse(datain) {
	data = jQuery.parseJSON(datain);
	var fin = "<ul>";
	for (var i = 0; i < data.length; i++) {
    	if(data[i].status) {
    		fin = fin + '<li><div>CASE ' + i + ': <font class="pass">PASS</font></div></li>'
    	} else {
    		fin = fin + '<li><div>CASE ' + i + ': <font class="fail">FAIL</font><br /><font>Input:' + data[i].input + '</font><br /><font>Outpu:' + data[i].output + '</font></div></li>'
    	}
    	//Do something
	}
	return fin + "</ul>";
}

var socket = io.connect('http://www.mealmaniac.com:8080');

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

	$('#totallogin').click(function(){
		console.log("DONE");
		socket.emit('login', $.trim($("input[id='inputEmail3']").val()), $.trim($("input[id='inputPassword3']").val()));
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
	joinRoom(room, 100);
});

function joinRoom(room, delay) {
	if(roomJoinAllow) {
		console.log("JOINING: " + room);
		webrtc.joinRoom(room.toString());
	} else if (delay > 6400)
		return;
	else
		setTimeout(joinRoom(room, delay*2), delay);
}
// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (flag, data) {
	var sender = "Partner";
	if(flag) sender = "You";
	writeMessage("<b class='c_" + sender + "'>" + sender + ": </b>" + data, "message");
});

socket.on('notif', function (data) {
	writeMessage(data, "alert");
});

socket.on('partnerCode', function(code) {
	partnerEdit.doc.setValue(code);
});

socket.on('newq', function (question) {
	$("#questionName").html("<h1>" + question.title + "</h1>");
	$("#questionText").html("<p>" + question.details + "</p>");
});

socket.on('solo', function() {
	writeMessage("Your partner left you!", "alert");
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
	$("#" + div).html(resParse(result));
});

socket.on('logged', function(username) {
	$('#hideme').html(username);
	$('#cancelme').focus().click();
});
