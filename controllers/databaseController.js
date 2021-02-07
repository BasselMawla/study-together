const express = require("express");
const database = require("../js/modules/database");

exports.getInstitutions = async (req, res, next) => {
  try {
    let result = await database.queryPromise("SELECT institution_name, institution_code FROM institution");

    if (!result) {
      res.status(500).redirect("/");
    } else {
      res.locals.institutions = result;
      next();
    }
  } catch(err) {
    throw err;
  }
}

exports.addCoursesToSession = async (req, userID) => {
  try {
    let result = await database.queryPromise(
      "SELECT course.course_code, department.department_code " +
      "FROM course INNER JOIN department, registered_course as RC " +
      "WHERE RC.user_id = ? " +
        "AND course.course_id = RC.course_id " +
        "AND department.department_id = course.department_id",
      userID);
    
    req.session.user.courses = result;
  } catch (err) {
    throw err;
  }
}