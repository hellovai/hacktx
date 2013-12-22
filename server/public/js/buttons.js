$('#toggleRoom').click(function () {
	socket.emit('toggleRoom');
});

$('#toggleQuestion').click(function () {
	socket.emit('getQuestion');
});

$('#runCode').click(function () {
	socket.emit('run', selfEdit.getValue());
});

$('#message').keyup(function(e) {
	if(e.which == 13) {
		$(this).blur();
		var message = $('#message').val();
		$('#message').val('');
		if(message.length > 0 ) {
			socket.emit('messages', message);
		}
		$("#message").focus();
	}
});

$("#self-result-toggle").click(function () {
	if($(this).hasClass("fa-sort-down")) {
		scroll_down("self");
	} else {
		scroll_up("self");
	}
});

$("#remote-result-toggle").click(function () {
	if($(this).hasClass("fa-sort-down")) {
		scroll_down("remote");
	} else {
		scroll_up("remote");
	}
});