const express = require("express");
const database = require("../js/modules/database");

exports.getInstitutions = async (req, res, next) => {
  try {
    let result = await database.queryPromise("SELECT name, institution_code FROM institution");

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