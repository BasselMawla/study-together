const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const database = require("../js/modules/database");
const db = database.connectToDatabase();

exports.login = async (req, res) => {
  const {
    email,
    password
  } = req.body;

  if(!isTextInputsValid(req, email, password)) {
    failWithMessage(req, res);
  } else if(!isValidCredentials(req, email, password)) {
    failWithMessage(req, res);
  } else { // Success
    console.log("Logged in successfully");
  }
}

async function isValidCredentials(req, email, password) {
  let result = await database.queryPromise(
    db,
    "SELECT * FROM user WHERE email = ?",
    [email]);

  if(!result[0] || !(await bcrypt.compare(password, result[0].password))) {
    req.session.messageFail = "Incorrect email or password";
    return false;
  } else { // Success
    // TODO: Cookie or session for login
    return true;
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