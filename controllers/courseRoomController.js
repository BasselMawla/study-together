const express = require("express");
const database = require("../js/utils/database");

exports.getRoom = async (req, res, next) => {
  const institutionCode = req.params.institution_code;
  const courseCode = req.params.course_code;

  if (!req.session.user) {
    res.redirect("/login");
  }
  try {
    const userId = req.session.user.id;
    let result = await database.queryPromise(
      "SELECT RC.*" +
        "FROM registered_course as RC, course, institution as inst " +
        "WHERE RC.user_id = ? AND RC.course_id = course.course_id " +
        "AND course.course_code = ? AND course.institution_id = inst.institution_id " +
        "AND inst.institution_code = ?",
      [userId, courseCode, institutionCode]
    );

    if (!result[0]) {
      res.redirect("/");
    } else {
      // Get chat messages
      res.locals.messagesList = await retrieveChat(result[0].course_id);
      res.locals.questionsList = await retrieveQuestions(result[0].course_id);
      next();
    }
  } catch (err) {
    throw err;
  }
};

async function retrieveChat(courseId) {
  try {
    let result = await database.queryPromise(
      "SELECT user.first_name, CM.user_id, CM.text, CM.file_name, CM.time_sent " +
        "FROM user, chat_message as CM " +
        "WHERE user.user_id = CM.user_id AND CM.course_id = ? " +
        "ORDER BY time_sent ASC",
      [courseId]
    );
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function retrieveQuestions(courseId) {
  try {
    let result = await database.queryPromise(
      "SELECT user.first_name, q.user_id, q.question_id, q.question_title, q.question_description, q.time_sent " +
        "FROM user, question as q " +
        "WHERE user.user_id = q.user_id AND q.course_id = ? " +
        "ORDER BY time_sent ASC",
      [courseId]
    );
    return result;
  } catch (err) {
    console.log(err);
  }
}
