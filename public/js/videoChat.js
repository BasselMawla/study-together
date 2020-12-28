//var socket = io.connect();
var muted = false;
const videoGrid = document.getElementById("video-grid")
const myPeer = new Peer(userId, {
    host: "https://peerjsaubstudy.herokuapp.com",
    port: "9000"
})
const myVideo = document.createElement("video")
// Mute own audio so the user doesn't hear himself
myVideo.muted = true
const peers = {}

const video = document.createElement("video")
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  myPeer.on("call", call => {
    call.answer(stream)
    call.on("stream", userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  $("#toggleVideo").click(function(){
    //socket.emit("user-disconnected", userId);
    video.hidden = !video.hidden;
  });

  $("#toggleMute").click(function(){
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    muted = !muted;
    if(muted) {
      $("#toggleMute").text("Unmute");
    }
    else {
      $("#toggleMute").text("Mute");
    }
  });

  socket.on("user-connected", userId => {
    connectToNewUser(userId, stream)
  })
}).catch(e => console.error(e))

socket.on("user-disconnected", userId => {
  if (peers[userId]) {
    peers[userId].close()
  }
})

myPeer.on("open", function () {
  socket.emit("join-room", className, userId)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  console.log("Connected to user " + userId)
  const video = document.createElement("video")
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream)
    console.log("Video added")
  })
  call.on("close", () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })
  videoGrid.append(video)
}