$(document).ready(function () {
  let questionsContainer = document.getElementById("questions-container");
  let questions = document.getElementById("questions");

  //New Change - Amr
  let commentForm = $("#comment-form");
  let commentInput = $("#comment-input");

  // Submit a question
  // TODO: Change to submitTitleInput etc
  let form = $("#submit-question-form");
  let titleInput = $("#submit-question-title");
  let descriptionInput = $("#submit-question-description");

  // View a question
  let viewQuestionTitle = $("#view-question-title");
  let viewQuestionDescription = $("#view-question-description");
  let viewQuestionComments = $("#view-question-comments");

  // Set up the modal properties to show a question
  $("#view-question-modal").on("show.bs.modal", function (event) {
    var clickedQuestion = $(event.relatedTarget); // Question li that triggered the modal
    var questionId = clickedQuestion.data("question-id");

    var modal = $(this);

    // Retrieve question info and comments from server
    socket.emit("get-question", { roomId: user.roomId, questionId });

    let questionTitleSpan = clickedQuestion.children("span")[1].textContent;
    viewQuestionTitle.text(questionTitleSpan);

    // Submitted comment
    commentForm.submit((event) => {
      event.preventDefault();
      // Make sure comment is not empty
      if (commentInput.val()) {
        const now = moment().unix();

        // Append comment locally
        appendComment(user.firstName, commentInput.val(), now);

        // Send comment to server
        socket.emit("submit-comment", {
          roomId: user.roomId,
          questionId,
          userId: user.userId,
          commentText: commentInput.val(),
          timeSent: now // Sent as unix timestamp to server
        });
        commentInput.val("");
      }
    });
  });

  $("#view-question-modal").on("hidden.bs.modal", function () {
    viewQuestionDescription.html("");
    viewQuestionComments.html("");
  });

  // Receive clicked question info from server
  socket.on("question-info", (question) => {
    if (question.info.question_description) {
      viewQuestionDescription.text(question.info.question_description);
    }

    if (question.comments) {
      viewQuestionComments.append(
        '<label class="col-form-label">Comments</label><br></br>'
      );
    }
    question.comments.forEach((comment) => {
      appendComment(
        comment.first_name,
        comment.comment_text,
        comment.time_sent
      );
    });
  });

  // Load questions on entry
  if (questionsList) {
    questionsList.forEach((row) => {
      const isSelf = row.user_id === user.userId;
      appendQuestion(
        row.first_name,
        row.question_id,
        row.question_title,
        row.time_sent,
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
      data.timeSent,
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
    // TODO: Make sure question and chat are received by others, show error otherwise (red exclamation mark)
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

    let nameSpan = document.createElement("span");
    nameSpan.textContent = firstName + ": ";

    let questionSpan = document.createElement("span");
    questionSpan.textContent = questionTitle;

    let timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(timeSent);
    timeSpan.classList.add("timestamp");

    li.appendChild(nameSpan);
    li.appendChild(questionSpan);
    li.appendChild(document.createElement("br"));
    li.appendChild(timeSpan);

    questions.appendChild(li);
    questionsContainer.scrollTo(0, questionsContainer.scrollHeight);
  }

  function appendComment(firstName, commentText, timeSent) {
    let li = $("<li></li>");

    let nameSpan = $("<span></span>");
    nameSpan.text(firstName);

    let timeSpan = $("<span></span>");
    timeSpan.addClass("timestamp");
    timeSpan.text(formatTime(timeSent));

    let textSpan = $("<span></span>");
    textSpan.text(commentText);

    li.append(nameSpan);
    li.append("<br>");
    li.append(timeSpan);
    li.append("<br>");
    li.append(textSpan);
    li.append("<br><br>");

    viewQuestionComments.append(li);
  }

  function formatTime(timeSent) {
    return moment.unix(timeSent).format("ddd DD/MM hh:mmA");
  }
});
