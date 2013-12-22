var socket = io.connect('http://localhost:3000');

socket.on('notif', function (message) {
	write_alert(message);
	notify(1);
})

// chat events
socket.on('match', function (github, room) {
	$('#conversation').html('');
	write_alert("We found a partner!");
	notify(1);
});

socket.on('solo', function (partner) {
	if(partner)
		write_alert("You have left your partner!");
	else
		write_alert("Your partner has left!");
	notify(2);
});

socket.on('updatechat', function (me, message) {
	write_message(me, message);
	if(!me) notify(1);
});

socket.on('changeQuestion', function () {
	write_alert("Your partner is requesting a new question!");
	$('#toggleQuestion').addClass('glow');
	notify(0);
});

socket.on('newQuestion', function (title, info) {
	write_alert("A new challenge is ready!");
	write_question(title, info);
	notify(0);
});

socket.on('runStatus', function( me, result ) {
	var div = '#remote-result';
	var who = "remote";
	if(me) {
		div = '#self-result';
		who = "self";
	}
	show_result(who, div, result);
});

socket.on('updateCode', function (newdata) {
	remoteEdit.setValue(newdata);
});