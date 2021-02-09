let socket = io();
socket.emit("join room", {
  userId: user.userId,
  firstName: user.firstName,
  roomId: user.roomId
});

socket.on("user joined", firstName => {
  console.log(firstName);
});

$(document).ready(function() {
  let messages = $("#messages");
  let form = $("#form");
  let input = $("#input");

  form.submit(event => {
    event.preventDefault();
    let chatItem = $("<li></li>").text(user.firstName + ": " + input.val());
    messages.append(chatItem);
    window.scrollTo(0, document.body.scrollHeight);

    if (input.val()) {
      socket.emit("chat message", {
        firstName: user.firstName,
        message: input.val(),
        roomId: user.roomId
      });
      input.val("");
    }
  });

  socket.on("chat message", data => {
    let chatItem = $("<li></li>").text(data.firstName + ": " + data.message);
    messages.append(chatItem);
    window.scrollTo(0, document.body.scrollHeight);
  });
});