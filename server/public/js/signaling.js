var socket = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'self-video',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotes',
    // immediately ask for camera access
    autoRequestMedia: true,
    //url for call
    url: "http://mealmaniac.com:3000"
});

var RTCready = false;
socket.on('readyToCall', function () {
	RTCready = true;
});

function joinWebRTC (delay) {
	if(delay > 700)
		socket.delayed();
	else if(!RTCready)
		setTimeout(joinWebRTC(delay * 2), delay );
	else
		socket.joinRoom();
}

function leaveWebRTC () {
	if(RTCready) socket.leaveRoom()
}