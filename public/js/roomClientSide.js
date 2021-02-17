$(document).ready(async function() {
  // Connect to Peer server
  let peer = new Peer();
  const peers = {};

  // On connect to peer server
  peer.on("open", function(peerId) {
    console.log("my peerID is "+ peerId);
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
    addVideoToGrid(myVideo, myStream);

    // Receive calls
    peer.on("call", call => {
      console.log("Receiving call");
      call.answer(myStream);

      // Make sure stream is received only once
      let streamCount = 0;
      const remoteVideo = document.createElement("video");
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
    console.log("Calling peer");
    const call = peer.call(peerId, stream);

    // Make sure stream is received only once
    let streamCount = 0;
    const remoteVideo = document.createElement("video");
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
    const div = document.createElement("div");
    const muteButton = document.createElement("button");
    muteButton.innerHTML = "Mute";

    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    })
    muteButton.addEventListener("click", () => {
      if(video.muted){
        video.muted = false;
        console.log('Call unmuted');
        muteButton.innerHTML = "Mute";
      }
      else{
        video.muted = true;
        console.log('call muted');
        muteButton.innerHTML = "Unmute";
      }
    })

    div.append(video);
    div.append(muteButton);
    videoGrid.append(div);
  }
});
