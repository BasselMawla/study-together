const express = require("express");
const database = require("../js/modules/database");

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

exports.insertChatMessage = async (roomId, userId, message, datetime) => {
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
