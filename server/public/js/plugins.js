// menu items
$('#toggleRoom').click(function() {
	socket.emit('toggleRoom');
});

$('#toggleQuestion').click(function() {
	$(this).removeClass('glow');
	socket.emit('getQuestion');
});

// button shortcuts
$('#message').keydown(function(event) {
    if (event.keyCode == 13) {
        console.log(this.value)
        socket.emit('messages', this.value);
        $('#message').val('');
        return false;
     }
});

// generic functions
function write_alert (message) {
	$('#conversation').append('<font class="message message-alert">' + message + '</font><br />');
}

function write_message (me, message) {
	var who = ["c_remote", "Partner"];
	if(me) who = ["c_self", "You"];
	$('#conversation').append('<font class="message"><font class="' + who[0] + '">' + who[1] + ':</font> ' + message + '</font><br />');
}