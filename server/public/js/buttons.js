function toggleRoom() {
	socket.emit('toggleRoom');
};

function toggleQuestion () {
	socket.emit('getQuestion');
};



$('#runCode').click( function() {
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

$('input[name=username]').keyup(function(e) {
	if(e.which == 13) {
		$(this).blur();
		$('input[name=password]').focus();
	}
});

$('input[name=password]').keyup(function(e) {
	if(e.which == 13) {
		$(this).blur();
		login();
	}
});

$("#self-result-toggle").click(function () {
	if($(this).hasClass("fa-plus-square")) {
		scroll_down("self");
	} else {
		scroll_up("self");
	}
});

$("#remote-result-toggle").click(function () {
	if($(this).hasClass("fa-plus-square")) {
		scroll_down("remote");
	} else {
		scroll_up("remote");
	}
});

function setCodeBoxHeight (ht) {
	var selfWidth = codeBoxWidth[codeBox];
	var remoteWidth = 99 - selfWidth;
	selfEdit.setSize(remoteWidth.toString() + "%", ht);
	remoteEdit.setSize(remoteWidth.toString() + "%", ht);
}	

var vidBox = true;
function videoToggle () {
	if(vidBox) {
		$('#video-box').animate({height:"1%"}, 400);
		$('.code-box').animate({height:"99%"}, 400);
	} else {
		$('#video-box').animate({height:"33%"}, 400);
		$('.code-box').animate({height:"67%"}, 400);
	}
	vidBox = !vidBox;
};

var codeBox = 1;
var codeBoxWidth = [49.5, 84, 49.5, 25];
function codeToggle () {
	var selfWidth = codeBoxWidth[codeBox];
	var remoteWidth = 99 - selfWidth;
	$("#self-code-box").animate({width: selfWidth.toString() + "%" },400);
	$("#remote-code-box").animate({width: remoteWidth.toString() + "%"},400);
	codeBox = (codeBox + 1) % 4;
};

$('#forkCode').click(function() {
	selfEdit.setValue(remoteEdit.getValue());
});

$('#saveCode').click(function() {
	socket.emit('save', selfEdit.getValue());
});

function loginToggle() {
	$("#modal-content,#modal-background").toggleClass("active");
	$('input[name=username]').focus()
}

function infoToggle () {
	$("#login-content,#modal-background").toggleClass("active");
	socket.emit('getUserInfo');
}

function login() {
	socket.emit('login', document.cookie);
}