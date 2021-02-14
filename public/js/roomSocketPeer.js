// Socket connect to server
socket.emit("join room", {
  userId: user.userId,
  firstName: user.firstName,
  roomId: user.roomId
});

socket.on("user joined", firstName => {
  console.log(firstName + " has joined.");
});

$(document).ready(async function() {
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

  const myVideoElement = document.createElement("video");
  const remoteVideoElement = document.createElement("video");
  let myStream;
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
    addVideoStream(myVideoElement, myStream);
  } catch (err) {
    console.log("Failed to get local stream", err);
  }

  // Receive call from peer
  peer.on('call', function(call) {
    call.answer(myStream);

    // Receive stream from peer
    call.on("stream", function(remoteStream) {
      // Attach remoteStream to vid
      addVideoStream(remoteVideoElement, remoteStream);
    })
  });

  socket.on("peer connected", data => {
    var conn = peer.connect(data.peerId);

    // When the connection is established
    conn.on("open", function() {
      conn.send("hi!");
    });

    // Call peer with my media stream
    let call = peer.call(data.peerId, myStream);

    // Receive stream from peer
    call.on("stream", function(remoteStream) {
      // Attach remoteStream to vid
      addVideoStream(remoteVideoElement, remoteStream);
    })
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