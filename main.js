var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const {joinUser, removeUser, findUser} = require('./users');
const {fillCourses} = require('./room')
//const {Menu, MenuItem} = require('electron')
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});


let regCourses = fillCourses();



//Some connection has initiated
io.sockets.on('connection', function(socket) {
  let givenId = socket.id;
  console.log('anonymous user has connected');
  socket.on('create', (data) => {
    // A user wants to create a connection
    let userNew = {
      id : givenId,
      username : data.username,
      userRoom : data.Room,

    }
    socket.nickname = `${data.username}`;
    socket.join(data.Room);

    console.log('User information has been sent');

    io.to(data.Room).emit("new user", userNew);
    // var numClients = clientsList.length;
    // console.log('Number of users : ' + numClients);


  });


  //io.sockets.in(room).emit('event', data);
  socket.on('chat message', (data) => {
        console.log(data);
        //io.sockets.in(room).emit('chat message', data);
        if(data.Room !== data.preRoom ){
          console.log(`Leaving the room : ${data.preRoom}`);
          socket.leave(data.preRoom);
          console.log(`Joining new room from ${data.user} ==> new room is ${data.Room}`);
          socket.join(data.Room);
          io.to(data.Room).emit("room changed", data);
        }else{
          io.to(data.Room).emit("chat message", data);
        }


    });
    socket.on('disconnect', () => {
        console.log('User was disconnected');

    });
});

http.listen(3000, function () {});
