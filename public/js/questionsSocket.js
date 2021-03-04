$(document).ready(function () {
  let questionsContainer = document.getElementById("questions-container");
  let questions = document.getElementById("questions");
  let form = $("#submit-question-form");
  let titleInput = $("#submit-question-title");
  let descriptionInput = $("#submit-question-description");

  // Set the modal properties to show a question
  $("#view-question-modal").on("show.bs.modal", function (event) {
    var clickedQuestion = $(event.relatedTarget); // Question li that triggered the modal
    var questionId = clickedQuestion.data("questionId");

    var modal = $(this);
    modal.find("#view-question-title").val("Question ID: " + questionId);
    //modal.find("#course-name-input").val(courseCode);
  });

  // Load questions on entry
  if (questionsList) {
    questionsList.forEach((row) => {
      const isSelf = row.user_id === user.userId;
      const timeSent = formatTime(row.time_sent);
      appendQuestion(
        row.first_name,
        row.question_id,
        row.question_title,
        timeSent,
        isSelf
      );
    });
  }

  // Submitted question
  // TODO: Question voting, answers, comments, votes on all
  form.submit((event) => {
    event.preventDefault();
    // Make sure question title is not empty
    if (titleInput.val()) {
      const now = moment().unix();

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
      data.questionId,
      data.questionTitle,
      formatTime(data.timeSent),
      false
    );
  });

  function appendQuestion(
    firstName,
    questionId,
    questionTitle,
    timeSent,
    isSelf
  ) {
    let styleClass;
    if (isSelf) {
      styleClass = "my-message";
    } else {
      styleClass = "remote-message";
    }

    let li = document.createElement("li");
    li.classList.add(styleClass);

    li.setAttribute("data-question-id", questionId);
    li.setAttribute("data-target", "#view-question-modal");
    li.setAttribute("data-toggle", "modal");

    let questionSpan = document.createElement("span");
    questionSpan.textContent = firstName + ": " + questionTitle;

    let timeSpan = document.createElement("span");
    timeSpan.textContent = timeSent;
    timeSpan.classList.add("timestamp");

    li.appendChild(questionSpan);
    li.appendChild(document.createElement("br"));
    li.appendChild(timeSpan);

    questions.appendChild(li);
    questionsContainer.scrollTo(0, questionsContainer.scrollHeight);
  }

  function formatTime(timeSent) {
    return moment.unix(timeSent).format("ddd DD/MM hh:mmA");
  }
});
