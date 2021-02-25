const express = require("express");
const database = require("../js/utils/database");

exports.getCourses = async (req, res, next) => {
  const institution_code = req.params.institution_code;
  const department_code = req.params.department_code;

  try {
    let result = await database.queryPromise(
      "SELECT course.course_name, course.course_code, dept.department_name " +
        "FROM (institution as inst INNER JOIN department as dept " +
        "ON inst.institution_id = dept.institution_id) " +
        "INNER JOIN course ON dept.department_id = course.department_id " +
        "WHERE inst.institution_code = ? AND dept.department_code = ?",
      [institution_code, department_code]
    );

    if (!result[0]) {
      res.redirect("/" + institution_code);
    } else {
      // Save department info
      res.locals.department_name = result[0].department_name;
      res.locals.department_code = department_code;

      // Save the courses
      let courses = [];
      result.forEach((resultCourse, i) => {
        let course = {
          course_name: resultCourse.course_name,
          course_code: resultCourse.course_code
        };
        courses[i] = course;
      });
      res.locals.courses = courses;
      next();
    }
  } catch (err) {
    throw err;
  }
};
