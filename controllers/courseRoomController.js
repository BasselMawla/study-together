const { render } = require("ejs");
const express = require("express");
const database = require("../js/modules/database");

exports.getRoom = async (req, res, next) => {
  const institutionCode = req.params.institution_code;
  const courseCode = req.params.course_code;

  if (!req.session.user) {
    res.redirect("/login");
  } else {
    const userId = req.session.user.id;
    /* Check that:
    * The course exists in the institution
    * The user registered in the course
    */

    console.log("userId: " + userId);
    console.log("courseCode: " + courseCode);
    console.log("institutionCode: " + institutionCode);
    let result = await database.queryPromise(
      "SELECT RC.*" +
      "FROM registered_course as RC, course, institution as inst " +
      "WHERE RC.user_id = ? AND RC.course_id = course.course_id " +
        "AND course.course_code = ? AND course.institution_id = inst.institution_id " +
        "AND inst.institution_code = ?",
      [userId, courseCode, institutionCode]
    );

    if(!result[0]) {
      res.redirect("/");
    }
    else {
      next();
    }
  }
}