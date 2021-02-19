$(document).ready(function() {
  let messages = $("#messages");
  let form = $("#form");
  let input = $("#input");

  form.submit(event => {
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

  socket.on("chat message", data => {
    // Receive message to the server
    appendMessage(data.firstName, data.message. data.datetime, false);
  });

  function appendMessage(firstName, message, datetime, isSelf) {
    let styleClass;
    if (isSelf) {
      styleClass = "my-message";
    }
    else {
      styleClass = "remote-message";
    }
    
    let li = $("<li></li>");//.text(firstName + ": " + message);
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