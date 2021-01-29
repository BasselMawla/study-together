const express = require("express");
const database = require("../js/modules/database");

exports.getInstitutions = (req, res, next) => {
  const db = database.connectToDatabase();
  
  try {
    db.query("SELECT name, short_name FROM institution", (error, results) => {
      if(error) {
        console.log(error);
      } else if (!results) {
        res.status(500).redirect("/");
      } else {
        res.locals.institutions = results;
        next();
      }
    });
  } catch(error) {
    console.log(error);
  }
}