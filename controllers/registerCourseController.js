const express = require("express");

const database = require("../js/modules/database");
const databaseController = require("../controllers/databaseController");

exports.registerCourse = async (req, res) => {
  const courseCode = req.body.courseToRegister;
  if (!req.session.user) {
    res.redirect("/login");
  } else if (!courseCode) {
    req.session.redirectMessage = "No course selected!";
    req.session.redirectMessageType = "ERROR";
    redirectWithMessage(req, res, "ERROR");
  } else {
    const userId = req.session.user.id;
    const institutionCode = req.session.user.institution_code;

    try {
      // Check that the logged-in user exists in the institution,
      // and the institution offers the course
      let existsCheckResult = await database.queryPromise(
        "SELECT user.user_id, inst.institution_id, course_id, department_code " +
          "FROM user, institution as inst, course, department as dept " +
          "WHERE user.user_id = ? AND inst.institution_code = ? " +
          "AND user.institution_id = inst.institution_id " +
          "AND course.course_code = ? " +
          "AND course.institution_id = inst.institution_id " +
          "AND dept.department_id = course.department_id",
        [userId, institutionCode, courseCode]
      );

      if (!existsCheckResult[0]) {
        req.session.redirectMessage =
          "Error! Input error or user not authorized.";
        req.session.redirectMessageType = "ERROR";
        redirectWithMessage(req, res, "ERROR");
      } else {
        const courseId = existsCheckResult[0].course_id;
        const departmentCode = existsCheckResult[0].department_code;
        // Check that the user is not already registered for the course
        let alreadyRegisteredResult = await database.queryPromise(
          "SELECT * FROM registered_course " +
            "WHERE user_id = ? AND course_id = ?",
          [userId, courseId]
        );

        if (alreadyRegisteredResult[0]) {
          req.session.redirectMessage =
            "User is already registered for that course!";
          req.session.redirectMessageType = "ERROR";
          redirectWithMessage(req, res, "ERROR");
        } else {
          // No issues, register the user for the course
          let insertResult = await database.queryPromise(
            "INSERT INTO registered_course VALUES (?, ?)",
            [userId, courseId]
          );

          await databaseController.addCoursesToSession(req, userId);
          req.session.redirectMessage =
            courseCode + " registered successfully!";
          req.session.redirectMessageType = "SUCCESS";
          redirectWithMessage(req, res, "SUCCESS");
        }
      }
    } catch (err) {
      throw err;
    }
  }
};

function redirectWithMessage(req, res, redirectMessageType) {
  req.session.isRefreshed = false;
  if (redirectMessageType === "ERROR") {
    res.status(401).redirect("/add-course");
    return;
  } else if (redirectMessageType === "SUCCESS") {
    res.status(200).redirect("/add-course");
    return;
  }
}
