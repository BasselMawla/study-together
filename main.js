const express = require("express");
const app = express(); // start the server
const server = require("http").Server(app)
server.listen(process.env.port || 3000, function () {
  console.log("Server started on port : 3000");
})
console.log("listening on port: 3000");
const io = require("socket.io")(server);
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
var expressHbs = require("express-handlebars");
const fileupload = require("express-fileupload");

app.use(express.static("public"))

io.on("connection", socket => {
  socket.on("join-room", (className, userId) => {
    console.log("User " + userId + " joined room " + className)

    socket.join(className)
    socket.to(className).broadcast.emit("user-connected", userId)

    socket.on("disconnect", () => {
      socket.to(className).broadcast.emit("user-disconnected", userId)
    })
  })
})

var hbs = require('hbs');
hbs.registerHelper('equal', function (args1, args2) {
  if (args1 == args2) {
    return true
  } else {
    return false
  }
});

dotenv.config({
  path: './.env'
});

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (req.body) (as sent by HTML forms)
app.use(express.urlencoded({
  extended: false
}));
//Parse JSON bodies (as send from forms) -> comes with json formats
app.use(express.json());
app.use(cookieParser()); //initializinf the cookie inside the browser
app.use(fileupload());

app.set('view engine', 'hbs');


db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySQL Connected");
  }
})

// Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

require('./mysocket.js')(io);