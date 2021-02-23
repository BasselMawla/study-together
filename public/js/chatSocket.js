$(document).ready(function () {
  let messages = $("#messages");
  let form = $("#form");
  let input = $("#input");

  // Load chat messages on entry
  if (messagesList) {
    messagesList.forEach((row) => {
      const isSelf = row.user_id === user.userId;
      const datetime = moment.unix(row.time_sent).format("ddd DD/MM hh:mmA");
      appendMessage(row.first_name, row.text, datetime, isSelf);
    });
  }

  // Submitted chat message
  form.submit((event) => {
    event.preventDefault();
    // Make sure message is not empty
    if (input.val()) {
      const now = moment().unix();
      const datetime = moment.unix(now).format("ddd DD/MM hh:mmA");

      // Append message locally
      appendMessage(user.firstName, input.val(), datetime, true);

      // Send message to server
      socket.emit("chat message", {
        userId: user.userId,
        firstName: user.firstName,
        message: input.val(),
        roomId: user.roomId,
        datetime: now
      });
      input.val("");
    }
  });

  // Received chat messsage
  socket.on("chat message", (data) => {
    // Receive message to the server
    appendMessage(data.firstName, data.message.data.datetime, false);
  });

  function appendMessage(firstName, message, datetime, isSelf) {
    let styleClass;
    if (isSelf) {
      styleClass = "my-message";
    } else {
      styleClass = "remote-message";
    }

    let li = $("<li></li>");
    li.addClass(styleClass);

    let text = $("<span></span>").text(firstName + ": " + message);
    let time = $("<span></span>").text(datetime);
    time.addClass("timestamp");

    li.append(text);
    li.append($("<br>"));
    li.append(time);

    messages.append(li);
    window.scrollTo(0, document.body.scrollHeight);
  }
});
