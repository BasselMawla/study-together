$(document).ready(function() {
  let messages = $("#messages");
  let form = $("#form");
  let input = $("#input");

  form.submit(event => {
    event.preventDefault();
    // Make sure message is not empty
    if (input.val()) {
      // Append message locally
      appendMessage(user.firstName, input.val());

      // Send message to server
      socket.emit("chat message", {
        userId: user.userId,
        firstName: user.firstName,
        message: input.val(),
        roomId: user.roomId
      });
      input.val("");
    }
  });

  socket.on("chat message", data => {
    // Send message to the server
    appendMessage(data.firstName, data.message);
  });

  function appendMessage(firstName, message) {
    let chatItem = $("<li></li>").text(firstName + ": " + message);
    messages.append(chatItem);
    window.scrollTo(0, document.body.scrollHeight);
  }
});