const express = require("express");
const app = express(); // Start the server
const server = require("http").Server(app);

server.listen(process.env.SERVER_PORT || 3000, function () {
  console.log("Server started on port " + process.env.SERVER_PORT);
})

const io = require("socket.io")(server);
const path = require("path");
const dotenv = require("dotenv");

const fileupload = require("express-fileupload");
app.use(fileupload());

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

let ejs = require("ejs");

dotenv.config({
  path: ".env"
});

const database = require("./public/database").connectToDatabase();

// Parse URL-encoded bodies (req.body) (as sent by HTML forms)
app.use(express.urlencoded({
  extended: false
}));
//Parse JSON bodies (as send from forms) -> comes with json formats
app.use(express.json());

app.set("view engine", "ejs");

// Define Routes
app.use("/", require("./routes/pages"));
//app.use("/auth", require("./routes/auth"));

//require("./mysocket.js")(io);