// Socket connect to server
socket.emit("join room", {
  userId: user.userId,
  firstName: user.firstName,
  roomId: user.roomId
});

socket.on("user joined", firstName => {
  console.log(firstName + " has joined.");
});

let connectedPeers = [];
let peerCount = 0;

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
    conn.on("data", function(peerId) {
      console.log("Received connection from peerId: " + peerId);
      connectedPeers[peerCount] = peerId;
      peerCount++;
    });
  });

  const myVideoElement = document.createElement("video");
  myVideoElement.muted = true
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

  // Just joined room, receiving calls from peers already in room
  peer.on("call", function(call) {
    // Answer call with my stream
    call.answer(myStream);
    
    console.log("peerCount: " + peerCount);
    const videoId = connectedPeers[peerCount-1];
    console.log("videoId: " + videoId);

    // Receive stream from call
    call.on("stream", function(remoteStream) {
      // Add remote stream
      const remoteVideoElement = document.createElement("video");
      remoteVideoElement.id = "video" + videoId;
      addVideoStream(remoteVideoElement, remoteStream);
    })

    socket.on("peer disconnected", function(data) {
      $("#video" + data.peerId).remove();
    });
  });

  // Already in room, new peer joined, call them
  socket.on("peer connected", data => {
    var conn = peer.connect(data.peerId);
    const videoId = data.peerId;
    console.log ("Connecting to peerId: " + data.peerId);
    //peerCount++;
    // When the connection is established
    conn.on("open", function() {
      conn.send(peerId);
    });
    
    conn.on("close", function() {
      $("#video" + videoId).remove();
      socket.emit("peer disconnecting", {
        peerId: peerId,
        roomId: user.roomId
      });
    });

    // Call peer with my media stream
    let call = peer.call(data.peerId, myStream);

    // Receive stream from call
    call.on("stream", function(remoteStream) {
      // Attach remoteStream to vid
      const remoteVideoElement = document.createElement("video");
      remoteVideoElement.id = "video" + videoId;
      addVideoStream(remoteVideoElement, remoteStream);
    })
  });
  
  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    })

    video.style.width = "300px";
    video.style.height = "300px";

    $("#video").append(video);
  }
});