const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const database = require("../js/modules/database");

exports.login = async (req, res) => {
  const {
    email,
    password
  } = req.body;

  if(!isTextInputsValid(req, email, password)) {
    failWithMessage(req, res);
  } else if(!(await isValidCredentials(req, email, password))) {
    failWithMessage(req, res);
  } else { // Success
    // TODO: Implement remember me function
    res.status(200).redirect("/");
  }
}

async function isValidCredentials(req, email, password) {
  try {
    let result = await database.queryPromise(
      "SELECT * FROM user WHERE email = ?",
      [email]);

    if(!result[0] || !(await bcrypt.compare(password, result[0].password))) {
      req.session.messageFail = "Incorrect email or password";
      return false;
    } else { // Success
      // Add user info to session
      req.session.user = [
        result[0].id,
        result[0].first_name,
        result[0].last_name,
        result[0].email,
        result[0].institution_id];

      return true;
    }
  } catch (err) {
    throw err;
  }
}

function isTextInputsValid(req, email, password) {
  if (!email) { // TODO: Validate email
    req.session.messageFail = "Please enter a valid email!";
    return false;
  }
  else if (!password) {
    req.session.messageFail = "Please enter a password!";
    return false;
  }
  return true;
}

function failWithMessage(req, res) {
  req.session.isRefreshed = false;
  res.status(401).redirect("/login");
  return;
}