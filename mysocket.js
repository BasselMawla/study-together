const mysql = require('mysql');
var fs = require('fs'); // required for file serving

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

//Some connection has initiated
module.exports = (io) => {
  io.on('connection', (socket) => {

    console.log('anonymous user has connected');
    socket.on('create', (data) => {

      // A user wants to create a connection
      let userNew = {
        id: data.ID,
        username: data.username,
        userRoom: data.Room,

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

      db.query('INSERT INTO course_chat SET ?', {
        course_name: data.Room,
        author_name: data.user,
        author_id: data.userID,
        date: data.time,
        text: data.value
      }, (error, resultsss) => {
        if (error) {
          console.log(error);
        } else {
          //io.sockets.in(room).emit('chat message', data);
          io.to(data.Room).emit("chat message", data);
        }
      });
    });

    socket.on('user image', (image) => {
      io.sockets.emit('addimage', 'Image Received : ', image);
    });

    socket.on('disconnect', () => {
      console.log('User was disconnected');
    });
  });
};