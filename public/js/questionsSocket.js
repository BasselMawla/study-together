$(document).ready(function () {
  let questionsContainer = document.getElementById("questions-container");
  let questions = $("#questions");
  let form = $("#submit-question-form");
  let titleInput = $("#question-title");
  let descriptionInput = $("#question-description");

  // Load questions on entry
  if (questionsList) {
    questionsList.forEach((row) => {
      const isSelf = row.user_id === user.userId;
      const timeSent = formatTime(row.time_sent);
      appendQuestion(row.first_name, row.question_title, timeSent, isSelf);
    });
  }

  // Submitted question
  // TODO: Question voting, answers, comments, votes on all
  form.submit((event) => {
    event.preventDefault();
    // Make sure question title is not empty
    if (titleInput.val()) {
      const now = moment().unix();
      const timeSent = formatTime(now);

      // Append question locally
      appendQuestion(user.firstName, titleInput.val(), timeSent, true);

      // Send question to server
      socket.emit("submit-question", {
        roomId: user.roomId,
        userId: user.userId,
        firstName: user.firstName,
        questionTitle: titleInput.val(),
        questionDescription: descriptionInput.val(),
        timeSent: now // Sent as unix timestamp to server
      });
    }
    $("#submit-question-modal").modal("toggle");
  });

  // Received question
  socket.on("question-submitted", (data) => {
    // Receive question from the server
    appendQuestion(
      data.firstName,
      data.questionTitle,
      formatTime(data.timeSent),
      false
    );
  });

  function appendQuestion(firstName, questionTitle, timeSent, isSelf) {
    let styleClass;
    if (isSelf) {
      styleClass = "my-message";
    } else {
      styleClass = "remote-message";
    }

    let li = $("<li></li>");
    li.addClass(styleClass);

    let text = $("<span></span>").text(firstName + ": " + questionTitle);
    let time = $("<span></span>").text(timeSent);
    time.addClass("timestamp");

    li.append(text);
    li.append($("<br>"));
    li.append(time);

    questions.append(li);
    questionsContainer.scrollTo(0, questionsContainer.scrollHeight);
  }

  function formatTime(timeSent) {
    return moment.unix(timeSent).format("ddd DD/MM hh:mmA");
  }
});
