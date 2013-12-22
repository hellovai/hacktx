var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'self-video',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotes',
    // immediately ask for camera access
    autoRequestMedia: true
});
var RTCready = false;

webrtc.on('readyToCall', function () {
	RTCready = true;
});


function joinWebRTC (roomname, delay) {
	console.log(roomname, delay);
	if(delay > 2000)
		console.log("failed!")
	else if(!RTCready)
		setTimeout(joinWebRTC(roomname), delay*2)
	else
		webrtc.joinRoom(roomname);
}

function leaveWebRTC () {
	if(RTCready)
		webrtc.leaveRoom()
}