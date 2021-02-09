$(document).ready(function() {
  const connectedUsersString = $("#connectedUserIds").val();
  const myId = $("#myId").val();
  const connectedUserIds = connectedUsersString.split(",");

  const peer = new Peer(myId, {
    host: "localhost",
    port: 9000,
    path: "/peer"
  });

  console.log("My Local ID: " + myId);
  console.log("connectedUserIds: " + connectedUserIds);

  peer.on("open", function(id) {
    console.log("My peer ID is: " + id);
  });

  connectedUserIds.forEach(userId => {
    if(userId !== myId) {
      var conn = peer.connect(userId);
      // on open will be launched when you successfully connect to PeerServer
      conn.on("open", function(){
        // here you have conn.id
        conn.send("Hi! My ID is " + myId);
      });
    }
  });

  peer.on("connection", function(conn) {
    conn.on("data", function(data){
      console.log(data);
    });
  });
});