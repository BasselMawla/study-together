const database = require("./database");

let rooms = [];

// Initialize rooms into rooms array
exports.createRoomsFromDB = async () => {
  try {
    let result = await database.queryPromise(
      "SELECT institution_code, course_code " +
        "FROM institution as inst, course " +
        "WHERE inst.institution_id = course.institution_id"
    );

    result.forEach((row) => {
      const room = {
        roomId:
          row.institution_code.toLowerCase() +
          "_" +
          row.course_code.toLowerCase(),
        users: []
      };

      rooms.push(room);
    });
  } catch (err) {
    throw err;
  }
};

exports.joinRoom = (newUser, roomId) => {
  const room = getRoom(roomId);
  if (room) {
    // Check if user is already in the room
    if (!room.users.find((user) => user.peerId === newUser.peerId)) {
      room.users.push(newUser);
    }
  }
};

exports.leaveRoom = (roomId, socketId) => {
  const room = getRoom(roomId);

  if (room) {
    const index = room.users.findIndex((user) => user.socketId === socketId);
    if (index !== -1) {
      const disconnectedUser = room.users.splice(index, 1)[0];
      return disconnectedUser.peerId;
    }
  }
};

// Get room users
exports.getRoomUsers = (roomId) => {
  const room = rooms.find((room) => (room.roomId = roomId));
  return room.users;
};

function getRoom(roomId) {
  return rooms.find((room) => room.roomId === roomId);
}
