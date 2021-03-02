$(document).ready(function () {
  let messagesContainer = document.getElementById("messages-container");
  let messages = $("#messages");
  let form = $("#chat-form");
  let input = $("#chat-input");

  // Load chat messages on entry
  if (messagesList) {
    messagesList.forEach((row) => {
      const isSelf = row.user_id === user.userId;
      const timeSent = formatTime(row.time_sent);
      appendMessage(row.first_name, row.text, timeSent, isSelf);
    });
  }

  // Submitted chat message
  form.submit((event) => {
    event.preventDefault();
    // Make sure message is not empty
    if (input.val()) {
      const now = moment().unix();
      const timeSent = formatTime(now);

      // Append message locally
      appendMessage(user.firstName, input.val(), timeSent, true);

      // Send message to server
      socket.emit("chat message", {
        userId: user.userId,
        firstName: user.firstName,
        message: input.val(),
        roomId: user.roomId,
        timeSent: now // Sent as unix timestamp to server
      });
      input.val("");
    }
  });

  // Received chat messsage
  socket.on("chat message", (data) => {
    // Receive message from the server
    appendMessage(
      data.firstName,
      data.message,
      formatTime(data.timeSent),
      false
    );
  });

  function appendMessage(firstName, message, timeSent, isSelf) {
    let styleClass;
    if (isSelf) {
      styleClass = "my-message";
    } else {
      styleClass = "remote-message";
    }

    let li = $("<li></li>");
    li.addClass(styleClass);

    let text = $("<span></span>").text(firstName + ": " + message);
    let time = $("<span></span>").text(timeSent);
    time.addClass("timestamp");

    li.append(text);
    li.append($("<br>"));
    li.append(time);

    messages.append(li);
    messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
  }

  function formatTime(timeSent) {
    return moment.unix(timeSent).format("ddd DD/MM hh:mmA");
  }
});
