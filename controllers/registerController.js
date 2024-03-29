const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const database = require("../js/utils/database");

exports.register = async (req, res) => {
  const {
    institution,
    first_name,
    last_name,
    email,
    password,
    password_confirmation
  } = req.body;

  const textInputsIsValid = isTextInputsValid(
    req,
    first_name,
    last_name,
    email,
    password,
    password_confirmation
  );

  if (!textInputsIsValid) {
    failWithMessage(req, res);
  } else if (!(await isEmailWithinDomain(req, email, institution))) {
    failWithMessage(req, res);
  } else if (!(await isEmailDuplicate(req, email))) {
    failWithMessage(req, res);
  } else {
    // Success
    registerUser(req, res, first_name, last_name, email, password, institution);
  }
};

function isTextInputsValid(
  req,
  first_name,
  last_name,
  email,
  password,
  password_confirmation
) {
  if (!first_name || !last_name) {
    req.session.messageFail = "Please enter a valid name!";
    return false;
  } else if (!email) {
    // TODO: Validate email
    req.session.messageFail = "Please enter a valid email!";
    return false;
  } else if (!password) {
    req.session.messageFail = "Please enter a password!";
    return false;
  } else if (password !== password_confirmation) {
    req.session.messageFail = "Passwords do not match!";
    return false;
  }
  return true;
}

async function isEmailWithinDomain(req, email, institution) {
  try {
    let result = await database.queryPromise(
      "SELECT institution_code, email_domain " +
        "FROM institution, institution_email_domain as domain " +
        "WHERE institution_code = ? AND institution.institution_id = domain.institution_id",
      [institution]
    );

    if (!result) {
      req.session.messageFail = "Institution not found!";
      return false;
    } else if (!isInDomain(email, result)) {
      req.session.messageFail =
        "You need an email from your selected institution.";
      return false;
    } else {
      return true;
    }
  } catch (err) {
    throw err;
  }
}

async function isEmailDuplicate(req, email) {
  try {
    let result = await database.queryPromise(
      "SELECT email FROM user WHERE email = ?",
      email
    );

    if (result[0]) {
      req.session.messageFail = "Email already exists!";
      return false;
    } else {
      return true;
    }
  } catch (err) {
    throw err;
  }
}

function isInDomain(email, result) {
  const emailDomain = email.substr(email.indexOf("@") + 1); // Everything after @

  for (var i = 0; i < result.length; i++) {
    const institutionDomain = result[i].email_domain;
    const emailDomainSubstring = emailDomain.substr(-institutionDomain.length);
    if (emailDomainSubstring === institutionDomain) {
      return true;
    }
  }
  return false;
}

async function registerUser(
  req,
  res,
  first_name,
  last_name,
  email,
  password,
  institution
) {
  let hashedPassword = await bcrypt.hash(password, 8);

  try {
    let result = await database.queryPromise(
      "SELECT institution_id FROM institution WHERE institution_code = ?",
      institution
    );

    if (!result) {
      req.session.messageFail = "Institution not found!";
      failWithMessage(req, res);
      return;
    }
    const institution_id = result[0].institution_id;
    let insertResult = await database.queryPromise(
      "INSERT INTO user (first_name, last_name, email, password, institution_id)" +
        "VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, institution_id]
    );

    if (insertResult) {
      res.redirect("../login");
    }
  } catch (err) {
    throw err;
  }
}

function failWithMessage(req, res) {
  req.session.isRefreshed = false;
  res.status(401).redirect("/register");
  return;
}
