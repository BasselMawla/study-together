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
      const muteButton = document.createElement("button");
      call.on("stream", remoteStream => {
        addVideoToGrid(remoteVideo, muteButton, remoteStream);
        console.log("Received call, added video");
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
    const muteButton = document.createElement("button");
    call.on("stream", remoteStream => {
      addVideoToGrid(remoteVideo, muteButton, remoteStream);
      console.log("Called peer, added video");
    });
    call.on("close", () => {
      remoteVideo.remove();
      muteButton.remove();
    });

    peers[peerId] = call;
  }

  function addVideoToGrid(video, muteButton, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    muteButton.addEventListener("click", () => {
      const vid = muteButton.previousSibling;
      console.log("previousSibling: " + vid);
      if (vid.muted) {
        vid.muted = false;
        console.log("Unmuted");
      }
      else {
        vid.muted = true;
        console.log("Muted");
      }
    });
    
    muteButton.innerHTML = "Toggle Mute";
    //const div = document.createElement("div");
    videoGrid.append(video);
    videoGrid.append(muteButton);
    //videoGrid.append(div);

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
