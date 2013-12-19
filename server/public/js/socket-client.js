var socket = io.connect('http://localhost:3000');

socket.on('notif', function (message) {
	write_alert(message);
})

// chat events
socket.on('match', function (github, room) {
	$('#conversation').html('');
	write_alert("We found a partner!");
});

socket.on('solo', function (partner) {
	if(partner)
		write_alert("You have left your partner!");
	else
		write_alert("Your partner has left!");
});

socket.on('updatechat', function (me, message) {
	write_message(me, message);
});

socket.on('changeQuestion', function () {
	write_alert("Your partner is requesting a new question!");
	$('#toggleQuestion').addClass('glow');
});