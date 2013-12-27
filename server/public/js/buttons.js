function toggleRoom() {
	socket.toggleRoom();
};

function toggleQuestion () {
	socket.toggleQuestion();
};



$('#runCode').click( function() {
	socket.runCode(selfEdit.getValue());
});

$('#message').keyup(function(e) {
	if(e.which == 13) {
		$(this).blur();
		var message = $('#message').val();
		$('#message').val('');
		socket.chat(message);
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
	se
	remoteEdit.setSize(remoteWidth.toString() + "%", ht);
}	

function videoToggle () {
	if( typeof this.vidBox == "undefined")
		this.vidBox = true;
	if(this.vidBox) {
		$('#video-box').animate({height:"1%"}, 400);
		$('.code-box').animate({height:"99%"}, 400);
	} else {
		$('#video-box').animate({height:"33%"}, 400);
		$('.code-box').animate({height:"67%"}, 400);
	}
	this.vidBox = !this.vidBox;
};

function codeToggle () {
	if ( typeof this.counter == 'undefined' ) {
	  this.counter = 1;
	  this.widthOptions = [49.5, 84, 49.5, 25];
	}
	var selfWidth = this.widthOptions[this.counter];
	var remoteWidth = 99 - selfWidth;
	$("#self-code-box").animate({width: selfWidth.toString() + "%" },400);
	$("#remote-code-box").animate({width: remoteWidth.toString() + "%"},400);
	this.counter = (this.counter + 1) % 4;
};

$('#forkCode').click(function() {
	selfEdit.setValue(remoteEdit.getValue());
});

$('#saveCode').click(function() {
	socket.saveCode(selfEdit.getValue());
});

$('#logout').click(function() {
	logout();
});

function loginToggle() {
	$("#modal-content,#modal-background").toggleClass("active");
	$('input[name=username]').focus()
}

function infoToggle () {
	$('#infoModal').modal('toggle');
	socket.acctInfo();
}

function login() {
	var windw = popupwindow('/login', 'Login to Prepair.me', 1200, 400);
	waitForClose(windw, true);
}

function logout() {
	var windw = popupwindow('/logout', 'Logout of Prepair.me', 1200, 400);
	waitForClose(windw, false);
}

function popupwindow(url, title, w, h) {
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
}

function waitForClose (wind, ctr) {
	if (!wind.closed) setTimeout( function() {waitForClose(wind, ctr)}, 500);
	else if(ctr) socket.login();
	else socket.logout();
}