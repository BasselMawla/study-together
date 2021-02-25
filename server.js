const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const database = require("./js/utils/database");
const roomsUtil = require("./js/utils/roomsUtil");

//const { PeerServer } = require("peer");
//const peerServer = PeerServer({ port: 9000, path: "/peer" });

const dotEnv = require("dotenv");
dotEnv.config({ path: "config.env" });

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

// Socket.io
const http = require("http").Server(app);
const io = require("socket.io")(http);

// Parse URL-encoded bodies (req.body) (as sent by HTML forms)
app.use(
  express.urlencoded({
    extended: false
  })
);

//Parse JSON bodies (as send from forms) -> comes with json formats
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: Number(process.env.JWT_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000
    }
  })
);

app.set("view engine", "ejs");

app.use("/", require("./routes/pagesRoutes"));
app.use("/auth", require("./routes/authRoutes"));

// Initializations
database.initializeDB();
roomsUtil.createRoomsFromDB();

// Socket io code
io.on("connection", (socket) => {
  socket.on("join-room", ({ peerId, firstName, roomId }) => {
    const user = {
      socketId: socket.id,
      peerId,
      firstName
    };
    roomsUtil.joinRoom(user, roomId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-joined", user.peerId);

    const roomUsers = roomsUtil.getRoomUsers(roomId);
    if (roomUsers) {
      console.log("in here");
      io.to(roomId).emit("room-users", roomUsers);
    }
  });
  socket.on("chat message", (data) => {
    socket.to(data.roomId).broadcast.emit("chat message", {
      firstName: data.firstName,
      message: data.message
    });
    require("./controllers/databaseController").insertChatMessage(
      data.roomId,
      data.userId,
      data.message,
      data.datetime
    );
  });
  socket.on("disconnecting", function () {
    let joinedRooms = socket.rooms;

    // Remove the user from all rooms they are in except the self-room
    let index = 0;
    joinedRooms.forEach((roomId) => {
      if (index !== 0) {
        const peerId = roomsUtil.leaveRoom(roomId, socket.id);
        socket.to(roomId).broadcast.emit("user-disconnected", peerId);
      }
      index++;
    });
  });
  socket.on("disconnect", () => {});
});

// Server start
http.listen(process.env.PORT || 3001, function () {
  console.log("Server started on port " + process.env.SERVER_PORT);
});
