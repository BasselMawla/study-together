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

    if (!result[0]) {
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
};

exports.getDepartmentsAndCourses = async (req, res, next) => {
  if (!req.session.user) {
    console.log("User not logged in.");
    res.redirect("/login");
    return;
  }
  const institution_code = req.session.user.institution_code;

  try {
    let result = await database.queryPromise(
      "SELECT dept.department_code, dept.department_name, course.course_code, course.course_name " +
        "FROM (institution as inst INNER JOIN department as dept " +
        "ON inst.institution_id = dept.institution_id) " +
        "INNER JOIN course ON dept.department_id = course.department_id " +
        "WHERE inst.institution_code = ?",
      institution_code
    );

    if (!result[0]) {
      console.log("No courses found!");
      res.redirect("/" + institution_code);
    } else {
      let departmentsAndCourses = [];

      result.forEach((row, i) => {
        const foundIndex = departmentsAndCourses.findIndex(
          (dept) => dept.department_code === row.department_code
        );
        if (foundIndex === -1) {
          const coursesArray = [
            {
              course_code: row.course_code,
              course_name: row.course_name
            }
          ];
          departmentsAndCourses.push({
            department_code: row.department_code,
            department_name: row.department_name,
            courses: coursesArray
          });
        } else {
          departmentsAndCourses[foundIndex].courses.push({
            course_code: row.course_code,
            course_name: row.course_name
          });
        }
      });

      res.locals.departmentsAndCourses = departmentsAndCourses;
      next();
    }
  } catch (err) {
    throw err;
  }
};
