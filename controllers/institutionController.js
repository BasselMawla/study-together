const express = require("express");
const database = require("../js/modules/database");

exports.getDepartments = async (req, res, next) => {
  const institution_code = req.params.institution_code;

  try {
    let result = await database.queryPromise(
      "SELECT inst.institution_name, dept.department_id, " +
      "dept.department_name, dept.department_code " +
      "FROM institution as inst INNER JOIN department as dept " +
      "ON inst.institution_id = dept.institution_id " +
      "WHERE inst.institution_code = ?",
      institution_code
    );

    if(!result[0]) {
      res.redirect("/");
    } else {
      // Save the institution info
      res.locals.institution_code = institution_code;
      res.locals.institution_name = result[0].institution_name;

      // Save the departments
      let departments = [];
      result.forEach((resultDept, i) => {
        let dept = {
          department_id: resultDept.department_id,
          department_name: resultDept.department_name,
          department_code: resultDept.department_code
        };
        departments[i] = dept;
      });
      res.locals.departments = departments;
      next();
    }
  } catch (err) {
    throw err;
  }
}

exports.getDepartmentsAndCourses = async (req, res, next) => {
  const institution_code = req.session.institution_code;

  try {
    let result = await database.queryPromise(
      "SELECT course.course_name, course.course_code, dept.department_name " +
      "FROM (institution as inst INNER JOIN department as dept " +
      "ON inst.institution_id = dept.institution_id) " +
      "INNER JOIN course ON dept.department_id = course.department_id " +
      "WHERE inst.institution_code = ?",
      institution_code
    );

    if(!result[0]) {
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

});
