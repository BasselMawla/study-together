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
      audio: true,
      video: true
    });
    // Add own video to grid
    addMyVideoToGrid(myVideo, myStream);

    // Receive calls
    peer.on("call", call => {
      call.answer(myStream);

      const remoteVideo = document.createElement("video");
      
      // Make sure stream is received only once
      let streamCount = 0;
      call.on("stream", remoteStream => {
        if(streamCount == 0) {
          addVideoToGrid(remoteVideo, remoteStream);
          streamCount++;
        }
      });
      call.on("close", () => {
        remoteVideo.parentElement.remove();
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

    // Make sure stream is received only once
    let streamCount = 0;
    call.on("stream", remoteStream => {
      if(streamCount == 0) {
        addVideoToGrid(remoteVideo, remoteStream);
        streamCount++;
      }
    });
    call.on("close", () => {
      remoteVideo.parentElement.remove();
    });

    peers[peerId] = call;
  }

  function addVideoToGrid(video, stream) {
    const muteButton = document.createElement("button");

    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    muteButton.addEventListener("click", () => {
      const vid = muteButton.previousSibling;
      if (vid.muted) {
        vid.muted = false;
        muteButton.innerHTML = "Mute";
      }
      else {
        vid.muted = true;
        muteButton.innerHTML = "Unmute";
      }
    });
    
    muteButton.innerHTML = "Mute";
    const div = document.createElement("div");
    div.append(video);
    div.append(muteButton);
    videoGrid.append(div);

    console.log("addVideoToGrid() called");
  }

  function addMyVideoToGrid(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    })

    const div = document.createElement("div");
    div.append(video);
    videoGrid.append(div);
  }
});
