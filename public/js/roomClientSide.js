$(document).ready(async function() {
  // Connect to Peer server
  let peer = new Peer();
  const peers = {};

  // On connect to peer server
  peer.on("open", function(peerId) {
    socket.emit("join-room", {
      peerId: peerId,
      firstName: user.firstName,
      roomId: user.roomId
    });
  });

  socket.on("user-disconnected", peerId => {
    if (peers[peerId]) {
      peers[peerId].close();
    }
  });

  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  myVideo.muted = true
  try {
    let myStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
    // Add own video to grid
    addVideoToGrid(myVideo, myStream);

    // Receive calls
    peer.on("call", call => {
      call.answer(myStream);
      
      const remoteVideo = document.createElement("video");
      call.on("stream", remoteStream => {
        addVideoToGrid(remoteVideo, remoteStream);
      });
    });

    socket.on("user-joined", peerId => {
      callPeer(peerId, myStream);
    });
  } catch (err) {
    console.log("Failed to get local stream", err);
  }
  
  // Receive on "open"
  // peer.on("connection", function(conn) {
  //   conn.on("data", function(peerId) {
  //     console.log("Received connection from peerId: " + peerId);
  //     connectedPeers[peerCount] = peerId;
  //     peerCount++;
  //   });
  // });

  function callPeer(peerId, stream) {
    const call = peer.call(peerId, stream);

    const remoteVideo = document.createElement("video");
    call.on("stream", remoteStream => {
      addVideoToGrid(remoteVideo, remoteStream);
    });
    call.on("close", () => {
      remoteVideo.remove();
    });

    peers[peerId] = call;
  }
    
  function addVideoToGrid(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    })
    videoGrid.append(video);
  }
});