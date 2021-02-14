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
  let peer = new Peer();

  let peerId;
  peer.on("open", function(id) {
    peerId = id;
    
    socket.emit("peer connected to server", {
      socketId: user.userId,
      peerId: peerId,
      roomId: user.roomId
    });
    console.log("My peerID: " + peerId);
  });
  
  // Receive on "open"
  peer.on("connection", function(conn) {
    conn.on("data", function(data) {
      console.log(data);
    });
  });

  socket.on("peer connected", data => {
    var conn = peer.connect(data.peerId);

    // When the connection is established
    conn.on("open", function() {
      conn.send("hi!");
    });

    const myVideoElement = document.createElement("video");
    const remoteVideoElement = document.createElement("video");

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then(myStream => {
      // Add own video to page
      addVideoStream(myVideoElement, myStream);

      // Call peer with my media stream
      let call = peer.call(data.peerId, myStream);

      // Receive call from peer
      call.on("stream", function(remoteStream) {
        // Attach remoteStream to vid
        addVideoStream(remoteVideoElement, remoteStream)
      });
    })
    .catch(function(err) {
      console.log("Failed to get local stream", err);
    });
  });
  
  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    })

    video.style.width = "300px";
    video.style.height = "100%";

    $("#video").append(video);
  }
});





    /*peer.call(data.peerId);
    //console.log("Connected to peer ID: " + data.peerId);
    
    /*peer.on("call", function(call) {
      // Answer the call, providing our mediaStream
      call.answer(mediaStream);
      $("#video").append.mediaStream;
    });
    const myVideo = document.createElement("video")
    const video = document.createElement("video")
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(stream => {
      addVideoStream(myVideo, stream);
      peer.on("call", call => {
        call.answer(stream);
        call.on("stream", userVideoStream => {
          addVideoStream(video, userVideoStream);
        });
      });
    }); */