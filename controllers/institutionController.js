const express = require("express");
const session = require("express-session");
const database = require("../js/modules/database");

exports.getInstitutionInfo = async (req, res, next) => {
  const institution_short_name = req.params.institution;

  try {
    let result = await database.queryPromise(
      "SELECT inst.institution_name, dept.department_id, " +
      "dept.department_name, dept.department_code " +
      "FROM institution as inst INNER JOIN department as dept " +
      "ON inst.institution_id = dept.institution_id " +
      "WHERE inst.short_name = ?",
      institution_short_name
    );

    if(!result[0]) {
      res.redirect("/");
    } else {
      // Save the institution info
      res.locals.institution_short_name = institution_short_name;
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