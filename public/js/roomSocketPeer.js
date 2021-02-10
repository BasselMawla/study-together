// Socket connect to server
socket.emit("join room", {
  userId: user.userId,
  firstName: user.firstName,
  roomId: user.roomId
});

socket.on("user joined", firstName => {
  console.log(firstName + " has joined.");
});

$(document).ready(function() {
  // Peer connect to server
  const peer = new Peer({
    host: "localhost",
    port: 9000,
    path: "/peer"
  });

  let peerId;
  peer.on("open", function(id) {
    peerId = id;
    
    socket.emit("peer connected to server", {
      socketId: user.userId,
      peerId: peerId,
      roomId: user.roomId
    });
  });
  
  socket.on("peer connected", async (data) => {
    let mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    var conn = peer.connect(data.peerId);
    var call = peer.call(data.peerId, mediaStream);
    //console.log("Connected to peer ID: " + data.peerId);
    
    /*peer.on("call", function(call) {
      // Answer the call, providing our mediaStream
      call.answer(mediaStream);
      $("#video").append.mediaStream;
    });*/
    const myVideo = document.createElement("video")
    const video = document.createElement("video")
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStream(myVideo, stream)
      peer.on("call", call => {
        call.answer(stream)
        call.on("stream", userVideoStream => {
          addVideoStream(video, userVideoStream)
        });
      });
    });
  });
  
  function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
      video.play()
    })
    $("#video").append(video)
  }

});