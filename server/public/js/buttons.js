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
var vidBox = true;
$('#videoToggle').click(function () {
	if(vidBox) {
		$('#video-box').animate({height:"1%"}, 400);
		$('.code-box').animate({height:"99%"}, 400);
	} else {
		$('#video-box').animate({height:"33%"}, 400);
		$('.code-box').animate({height:"67%"}, 400);
	}
	vidBox = !vidBox;
});

var codeBox = 1;
$("#codeToggle").click( function () {
	if(codeBox == 0 || codeBox == 2) {
		// $("#self-code-box").width("50%");
		// $("#remote-code-box").width("50%");

		$("#self-code-box").animate({width:"49.5%"},400);
		$("#remote-code-box").animate({width:"49.5%"},400);
	} else if(codeBox == 1){
		// $("#self-code-box").width("99%");
		// $("#remote-code-box").width("0%");
		$("#self-code-box").animate({width:"84%"},400);
		$("#remote-code-box").animate({width:"15%"},400)
	} else {
		// $("#self-code-box").width("0%");
		// $("#remote-code-box").width("99%");
		$("#self-code-box").animate({width:"15%"},400);
		$("#remote-code-box").animate({width:"84%"},400);
	}
	codeBox = (codeBox + 1) % 4;
});