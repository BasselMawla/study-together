const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const { localsName } = require("ejs");

const database = require("../js/utils/database");
const databaseController = require("../controllers/databaseController");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!isTextInputsValid(req, email, password)) {
    failWithMessage(req, res);
  } else if (!(await isValidCredentials(req, email, password))) {
    failWithMessage(req, res);
  } else {
    // Success
    await databaseController.addCoursesToSession(req, req.session.user.id);
    res.status(200).redirect("/");
  }
};

async function isValidCredentials(req, email, password) {
  try {
    let result = await database.queryPromise(
      "SELECT user.*, institution_name, institution_code " +
        "FROM user, institution " +
        "WHERE user.email = ? AND institution.institution_id = user.institution_id",
      email
    );

    if (!result[0] || !(await bcrypt.compare(password, result[0].password))) {
      req.session.messageFail = "Incorrect email or password";
      return false;
    } else {
      // Success
      // Add user info to session
      req.session.user = {
        id: result[0].user_id,
        first_name: result[0].first_name,
        last_name: result[0].last_name,
        email: result[0].email,
        institution: result[0].institution_name,
        institution_code: result[0].institution_code,
        profile_picture: result[0].profile_picture
      };

      return true;
    }
  } catch (err) {
    throw err;
  }
}

function isTextInputsValid(req, email, password) {
  if (!email) {
    // TODO: Validate email
    req.session.messageFail = "Please enter a valid email!";
    return false;
  } else if (!password) {
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
