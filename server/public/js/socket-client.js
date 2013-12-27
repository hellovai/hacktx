// ported over to signaling-base
// var socket = io.connect('http://mealmaniac.com:3000/');

// socket.on('notif', function (message) {
// 	write_alert(message);
// 	notify(1);
// })

// // chat events
// socket.on('match', function (user, room) {
// 	$('#conversation').html('');
// 	write_alert("Now connected to " + user.username);
// 	setRemote(user);
// 	notify(1);
// 	joinWebRTC(room, 10);
// });

// socket.on('solo', function (partner) {
// 	if(partner)
// 		write_alert("You have left your partner!");
// 	else
// 		write_alert("Your partner has left!");
// 	leaveWebRTC();
// 	resetBox("remote");
// 	notify(2);
// });

// socket.on('updatechat', function (me, message) {
// 	write_message(me, message);
// 	if(!me) notify(1);
// });

// socket.on('changeQuestion', function () {
// 	write_alert("Your partner is requesting a new question!");
// 	$('#toggleQuestion').addClass('glow');
// 	notify(0);
// });

// socket.on('newQuestion', function (title, info) {
// 	write_alert("A new challenge is ready!");
// 	write_question(title, info);
// 	notify(0);
// });

// socket.on('runStatus', function( me, result ) {
// 	var div = '#remote-result';
// 	var who = "remote";
// 	if(me) {
// 		div = '#self-result';
// 		who = "self";
// 	}
// 	show_result(who, div, result);
// });

// socket.on('updateCode', function (newdata) {
// 	remoteEdit.setValue(newdata);
// });

// socket.on('login', function (user) {
// 	$('#modal-content,#modal-background').removeClass('active');
// 	setSelf(user);
// 	$('#viewProfile').click(infoToggle);
// 	$('#viewProfile').tooltip({
// 			trigger:'hover',
// 	});
// });

// socket.on('rLogin', function (user) {
// 	write_alert(remoteName + " is now know as " + user.username );
// 	setRemote(user);
// });