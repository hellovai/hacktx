var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'self-video',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotes',
    // immediately ask for camera access
    autoRequestMedia: true,
    //url for call
    url: "http://mealmaniac.com:3000"
});
var socket = webrtc;

var RTCready = false;
webrtc.on('readyToCall', function () {
	RTCready = true;
});

function joinWebRTC (roomname, delay) {
	if(delay > 700)
		return
	else if(!RTCready)
		setTimeout(joinWebRTC(roomname, delay * 2), delay );
	else
		webrtc.joinRoom(roomname);
}

function leaveWebRTC () {
	if(RTCready)
		webrtc.leaveRoom()
}