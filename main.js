const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");

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

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: Number(process.env.JWT_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000 }
}));

app.set("view engine", "ejs");

app.use("/", require("./routes/pagesRoutes"));
app.use("/auth", require("./routes/authRoutes"));

// Socket io code
io.on("connection", socket => {
  socket.on("join room", data => {
    socket.join(data.roomId);
    socket.to(data.roomId).emit("user joined", data.firstName);
  });
  socket.on("chat message", data => {
    socket.to(data.roomId).emit("chat message", data);
  });
  socket.on("peer connected to server", data => {
    socket.to(data.roomId).emit("peer connected", {peerId: data.peerId});
  });
  socket.on("peer disconnecting", data => {
    socket.to(data.roomId).emit("peer disconnected", {peerId: data.peerId});
  });
});

// Server start
http.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port " + process.env.SERVER_PORT);
});