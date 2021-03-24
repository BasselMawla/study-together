const express = require("express");
const database = require("../js/utils/database");

exports.getInstitutions = async (req, res, next) => {
  try {
    let result = await database.queryPromise(
      "SELECT institution_name, institution_code FROM institution"
    );

    if (!result) {
      res.status(500).redirect("/");
    } else {
      res.locals.institutions = result;
      next();
    }
  } catch (err) {
    throw err;
  }
};

exports.deleteRegisteredCourse = async (req, res) => {
  const courseCode = req.body.courseToDelete;
  if (!req.session.user || !courseCode) {
    //TODO: Implement redirectWithMessage()
    res.redirect("/");
  } else {
    const userID = req.session.user.id;
    try {
      let isDeleted = await database.queryPromise(
        "DELETE FROM registered_course " +
          "WHERE user_id = ? AND course_id " +
          "IN (SELECT course_id FROM course WHERE course_code = ?)",
        [userID, courseCode]
      );
      if (!isDeleted) {
        console.log("Course not deleted!");
        res.redirect("/");
      } else {
        console.log("Course deleted!");
        await exports.addCoursesToSession(req, userID);
        res.status(200).redirect("/delete-course");
      }
    } catch (err) {
      throw err;
    }
  }
};

exports.addCoursesToSession = async (req, userID) => {
  try {
    let result = await database.queryPromise(
      "SELECT course.course_code, department.department_code " +
        "FROM course INNER JOIN department, registered_course as RC " +
        "WHERE RC.user_id = ? " +
        "AND course.course_id = RC.course_id " +
        "AND department.department_id = course.department_id",
      userID
    );
    req.session.user.courses = result;
  } catch (err) {
    throw err;
  }
};

exports.insertChatMessage = async (roomId, userId, message, datetime) => {
  //TODO: Change datetime to timeSent
  // TODO: Sanitize input
  if (roomId && userId && message && datetime) {
    // Get codes by splitting roomID (eg. aub_cmps200)
    const institution_code = roomId.split("_")[0];
    const course_code = roomId.split("_")[1];
    try {
      // TODO: Use prepared statement for chat since it is used a lot
      let result = await database.queryPromise(
        "INSERT INTO chat_message" +
          "(user_id, text, time_sent, course_id) " +
          "VALUES (?, ?, ?, " +
          "(SELECT course_id " +
          "FROM institution as inst, course " +
          "WHERE institution_code = ? AND course_code = ? " +
          "AND course.institution_id = inst.institution_id))",
        [userId, message, datetime, institution_code, course_code]
      );
    } catch (err) {
      throw err;
    }
  } else {
    console.log("Missing data in insertChatMessage in databaseController");
  }
};

exports.insertQuestion = async (
  roomId,
  userId,
  questionTitle,
  questionDescription,
  timeSent
) => {
  // TODO: Sanitize input
  if (roomId && userId && questionTitle && timeSent) {
    // Get codes by splitting roomID (eg. aub_cmps200)
    const institution_code = roomId.split("_")[0];
    const course_code = roomId.split("_")[1];
    try {
      let result = await database.queryPromise(
        "INSERT INTO question" +
          "(user_id, question_title, question_description, time_sent, course_id) " +
          "VALUES (?, ?, ?, ?, " +
          "(SELECT course_id " +
          "FROM institution as inst, course " +
          "WHERE institution_code = ? AND course_code = ? " +
          "AND course.institution_id = inst.institution_id))",
        [
          userId,
          questionTitle,
          questionDescription,
          timeSent,
          institution_code,
          course_code
        ]
      );

      return result.insertId;
    } catch (err) {
      throw err;
    }
  } else {
    console.log("Missing data in insertQuestion in databaseController");
  }
};

// Retrieves the question info and comments
exports.retrieveQuestion = async (roomId, questionId) => {
  if (roomId && questionId) {
    let questionInfo = {
      info: await retrieveQuestionInfo(roomId, questionId),
      comments: await retrieveComments(questionId)
    };

    return questionInfo;
  } else {
    console.log("Missing data in retrieveQuestion in databaseController");
  }
};

exports.insertComment = async (questionId, userId, commentText, timeSent) => {
  // TODO: Sanitize input
  if (questionId && userId && commentText && timeSent) {
    try {
      await database.queryPromise(
        "INSERT INTO comment" +
          "(question_id, user_id, comment_text, time_sent) " +
          "VALUES (?, ?, ?, ?)",
        [questionId, userId, commentText, timeSent]
      );
    } catch (err) {
      throw err;
    }
  } else {
    console.log("Missing data in insertComment in databaseController");
  }
};

// Helper
async function retrieveQuestionInfo(roomId, questionId) {
  // Get codes by splitting roomID (eg. aub_cmps200)
  const institutionCode = roomId.split("_")[0];
  const courseCode = roomId.split("_")[1];
  try {
    // Retreive question info and check it is in the room
    let result = await database.queryPromise(
      "SELECT question.question_description " +
        "FROM institution as inst, course, question " +
        "WHERE inst.institution_code = ? " +
        "AND course.course_code = ? " +
        "AND question.question_id = ? " +
        "AND question.course_id = course.course_id",
      [institutionCode, courseCode, questionId]
    );

    return result[0];
  } catch (err) {
    throw err;
  }
}

// Helper
async function retrieveComments(questionId) {
  try {
    // Retreive question info and check it is in the room
    let result = await database.queryPromise(
      "SELECT user.first_name, comment.comment_text, comment.time_sent " +
        "FROM user, comment " +
        "WHERE user.user_id = comment.user_id " +
        "AND comment.question_id = ? " +
        "ORDER BY time_sent ASC",
      questionId
    );

    return result;
  } catch (err) {
    throw err;
  }
}
