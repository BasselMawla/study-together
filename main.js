const express = require("express");
const app = express();
const server = require("http").Server(app);
const path = require("path");
const dotenv = require("dotenv");
const database = require("./js/modules/database");
const ejs = require("ejs");
const io = require("socket.io")(server);

server.listen(process.env.SERVER_PORT || 3000, function () {
  console.log("Server started on port " + process.env.SERVER_PORT);
});

const fileupload = require("express-fileupload");
app.use(fileupload());

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

dotenv.config({
  path: ".env"
});
database.connectToDatabase();

//const database = require("./public/database").connectToDatabase();

// Parse URL-encoded bodies (req.body) (as sent by HTML forms)
app.use(
  express.urlencoded({
    extended: false
  })
);
//Parse JSON bodies (as send from forms) -> comes with json formats
app.use(express.json());

app.set("view engine", "ejs");

// Define Routes
app.use("/", require("./routes/pagesRoute"));
app.use("/auth", require("./routes/authRoute"));

//require("./mysocket.js")(io);
