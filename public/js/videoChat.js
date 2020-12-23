const socket = io("/")
const videoGrid = document.getElementById("video-grid")
const myPeer = new Peer(userId, {
    secure: true,
    host: "https://aubstudysawapeerjs.herokuapp.com",
    port: "3001"
})
const myVideo = document.createElement("video")
// Mute own audio so the user doesn't hear himself
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    addVideoStream(myVideo, stream)
    myPeer.on("call", call => {
      call.answer(stream)
      const video = document.createElement("video")
      call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on("user-connected", userId => {
      connectToNewUser(userId, stream)
    })
}).catch(e => console.error(e))

socket.on("user-disconnected", userId => {
  if(peers[userId]) {
    peers[userId].close()
  }
})

myPeer.on("open", function(){
    socket.emit("join-room", className, userId)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  console.log("Connected to user " + userId)
  console.log(stream)
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