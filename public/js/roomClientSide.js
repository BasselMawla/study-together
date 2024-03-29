$(document).ready(async function () {
  const clientsUl = document.getElementById("clients");

  // Connect to Peer server
  let peer = new Peer();
  // config: {
  //   'iceServers':
  //     [{ 'urls': 'stun:stun.l.google.com:19302' }],
  //     'sdpSemantics': 'unified-plan'
  // }
  const peers = {};

  // On connect to peer server
  // TODO: Check if peerId is needed for video
  peer.on("open", function (peerId) {
    console.log("my peerID is " + peerId);
    socket.emit("join-room", {
      userId: user.userId,
      peerId,
      firstName: user.firstName,
      roomId: user.roomId
    });
    console.log("roomId: " + user.roomId);
  });

  // Add users to DOM
  socket.on("room-users", (roomUserList) => {
    console.log(roomUserList);
    displayUserList(roomUserList);
  });

  socket.on("user-disconnected", (peerId) => {
    if (peers[peerId]) {
      peers[peerId].close();
    }
  });

  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  myVideo.muted = true;
  try {
    let myStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
    // Add own video to grid
    addVideoToGrid(myVideo, myStream);
    console.log("Added own video to grid");

    // Receive calls
    peer.on("call", (call) => {
      console.log("Receiving call from " + call.peer);
      call.answer(myStream);

      // Make sure stream is received only once
      let streamCount = 0;
      const remoteVideo = document.createElement("video");
      call.on("stream", (remoteStream) => {
        if (streamCount == 0) {
          addVideoToGrid(remoteVideo, remoteStream);
          console.log("Added video after receiving call from " + call.peer);
          streamCount++;
        }
      });
      call.on("close", () => {
        remoteVideo.parentElement.remove();
      });
    });

    socket.on("user-joined", (peerId) => {
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
    console.log("Calling peer with ID: " + peerId);
    const call = peer.call(peerId, stream);

    // Make sure stream is received only once
    let streamCount = 0;
    const remoteVideo = document.createElement("video");
    call.on("stream", (remoteStream) => {
      if (streamCount == 0) {
        addVideoToGrid(remoteVideo, remoteStream);
        console.log("Added video after calling peer " + peerId);
        streamCount++;
      }
    });
    call.on("close", () => {
      remoteVideo.parentElement.remove();
      console.log("Removed video of " + peerId);
    });
    peers[peerId] = call;
  }

  function addVideoToGrid(video, stream) {
    const muteButton = document.createElement("button");
    muteButton.innerHTML = "Mute";

    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    muteButton.addEventListener("click", () => {
      if (video.muted) {
        video.muted = false;
        console.log("Muted");
        muteButton.innerHTML = "Mute";
      } else {
        video.muted = true;
        console.log("Unmuted");
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
    });

    div.append(video);
    div.append(muteButton);
    videoGrid.append(div);
  }

  function displayUserList(roomUserList) {
    clientsUl.innerHTML = "";
    roomUserList.sort();
    roomUserList.forEach((roomUser) => {
      const li = document.createElement("li");
      li.innerText = roomUser.firstName;
      li.dataset.userId = roomUser.userId;
      clientsUl.appendChild(li);
    });
  }
});
