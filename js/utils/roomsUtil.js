const database = require("./database");

let rooms = [];

// Initialize rooms into rooms array
async function createRoomsFromDB() {
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
}

function joinRoom(newUser, roomId) {
  const room = getRoom(roomId);

  if (room) {
    // Check if user is already in the room
    if (!room.users.find((user) => user.peerId === newUser.peerId)) {
      room.users.push(newUser);
    }
  }
}

function leaveRoom(roomId, socketId) {
  const room = getRoom(roomId);
  if (room) {
    const index = room.users.findIndex((user) => user.socketId === socketId);
    if (index !== -1) {
      const disconnectedUser = room.users.splice(index, 1)[0];
      return disconnectedUser.peerId;
    }
  }
}

function getRoomUserList(roomId) {
  let users = getRoomUsers(roomId);
  let userList = users.map((user) => {
    return { userId: user.userId, firstName: user.firstName };
  });
  return userList;
}

// Get room users as an array of user objects
function getRoomUsers(roomId) {
  const room = getRoom(roomId);
  return room.users;
}

// Returns true if user with socketId is in room with roomId
function isUserInRoom(socketId, roomId) {
  const room = getRoom(roomId);
  if (!room) {
    return false;
  } else if (room.users.some((user) => user.socketId === socketId)) {
    return true;
  }
  return false;
}

function getRoom(roomId) {
  return rooms.find((room) => room.roomId === roomId);
}

module.exports = {
  createRoomsFromDB,
  joinRoom,
  leaveRoom,
  getRoomUserList,
  getRoomUsers,
  isUserInRoom
};
