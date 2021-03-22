const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const database = require("./js/utils/database");
const roomsUtil = require("./js/utils/roomsUtil");
const databaseController = require("./controllers/databaseController");

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

    // Send new list of users
    const roomFirstNames = roomsUtil.getRoomFirstNames(roomId);
    if (roomFirstNames) {
      io.to(roomId).emit("room-users", roomFirstNames);
    }
  });
  socket.on("chat message", (data) => {
    socket.to(data.roomId).broadcast.emit("chat message", {
      firstName: data.firstName,
      message: data.message,
      timeSent: data.timeSent
    });
    databaseController.insertChatMessage(
      data.roomId,
      data.userId,
      data.message,
      data.timeSent
    );
  });
  socket.on("submit-question", async (data) => {
    if (!roomsUtil.isUserInRoom(socket.id, data.roomId)) {
      console.log("Access denied. Not in correct room.");
    }
    const questionId = await databaseController.insertQuestion(
      data.roomId,
      data.userId,
      data.questionTitle,
      data.questionDescription,
      data.timeSent
    );
    if (questionId) {
      io.to(data.roomId).emit("question-submitted", {
        firstName: data.firstName,
        questionId,
        questionTitle: data.questionTitle,
        questionDescription: data.questionDescription,
        timeSent: data.timeSent
      });
    }
  });
  socket.on("get-question", async ({ roomId, questionId }) => {
    if (!roomsUtil.isUserInRoom(socket.id, roomId)) {
      console.log("Access denied. Not in correct room.");
    } else {
      const question = await databaseController.retrieveQuestion(
        roomId,
        questionId
      );
      socket.emit("question-info", question);
    }
  });
  socket.on("disconnecting", function () {
    let joinedRooms = socket.rooms;

    // Remove the user from all rooms they are in except the self-room
    let index = 0;
    joinedRooms.forEach((roomId) => {
      if (index !== 0) {
        const peerId = roomsUtil.leaveRoom(roomId, socket.id);
        socket.to(roomId).broadcast.emit("user-disconnected", peerId);

        // Send new list of users
        const roomFirstNames = roomsUtil.getRoomFirstNames(roomId);
        if (roomFirstNames) {
          io.to(roomId).emit("room-users", roomFirstNames);
        }
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
