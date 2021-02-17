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
  // myVideo.muted = true
  try {
    let myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    // Add own video to grid
    addVideoToGrid(myVideo, myStream);

    // Receive calls
    peer.on("call", call => {

      call.answer(myStream);
      console.log('receving the call');
      const remoteVideo = document.createElement("video");
      call.on("stream", remoteStream => {
        console.log("Adding video of received call ");
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
    console.log('calling peer ' + peerId);
    const remoteVideo = document.createElement("video");
    call.on("stream", remoteStream => {

      console.log('Adding the video of ' + peerId);

      addVideoToGrid(remoteVideo, remoteStream);
    });
    call.on("close", () => {
      remoteVideo.remove();
    });
    peers[peerId] = call;
  }

  function addVideoToGrid(video, stream) {
    const btn = document.createElement('BUTTON');
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    })
    btn.addEventListener("click", () => {
      if(video.muted){
        video.muted = false;
        console.log('Call unmuted');
      }
      else{
        video.muted = true;
        console.log('call muted');
      }
    })
    videoGrid.append(video);
    videoGrid.append(btn);
  }
});
