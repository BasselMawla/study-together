const express = require("express");
const session = require("express-session");
const bcrypt = require('bcryptjs');
const { promisify } = require("util");
const database = require("../js/modules/database");

exports.register = async (req, res) => {
  const db = database.connectToDatabase();

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
    password_confirmation);

  if(!textInputsIsValid) {
    failWithMessage(req, res);
  } else if (!(await isEmailWithinDomain(req, db, email, institution))) {
    failWithMessage(req, res);
  } else if (!(await isEmailDuplicate(req, db, email))) {
    failWithMessage(req, res);
  } else { // Success
    registerUser(
      req,
      res,
      db,
      first_name,
      last_name,
      email,
      password,
      institution);
  }

  db.end((err) => {
    if (err) {
      throw err;
    }
    console.log('Database connection closed.');
  });
}


function isTextInputsValid(req, first_name, last_name, email, password, password_confirmation) {
  if (!first_name || !last_name) {
    req.session.messageFail = "Please enter a valid name!";
    return false;
  }
  else if (!email) { // TODO: Validate email
    req.session.messageFail = "Please enter a valid email!";
    return false;
  }
  else if (!password) {
    req.session.messageFail = "Please enter a password!";
    return false;
  }
  else if (password !== password_confirmation) {
    req.session.messageFail = "Passwords do not match!";
    return false;
  }
  return true;
}

async function isEmailWithinDomain(req, db, email, institution) {
  let result = await database.queryPromise(
    db,
    "SELECT short_name, email_domain " +
    "FROM institution, institution_email_domain " +
    "WHERE short_name = ? AND institution.id = institution_email_domain.institution_id",
    [institution]);
    
  if (!result) {
    req.session.messageFail = "Institution not found!";
    return false;
  }
  else if (!isInDomain(email, result)) {
    req.session.messageFail = "You need an email from your selected institution.";
    return false;
  }
  else {
    return true;
  }
}

async function isEmailDuplicate(req, db, email) {
  let result = await database.queryPromise(
    db,
    "SELECT email FROM user WHERE email = ?", 
    [email]);

  if (result[0]) {
    req.session.messageFail = "Email already exists!";
    return false;
  }
  return true;
}

function isInDomain(email, result) {
  const emailDomain = email.substr(email.indexOf("@")+1); // Everything after @

  for(var i=0; i<result.length; i++) {
    const institutionDomain = result[i].email_domain;
    const emailDomainSubstring = emailDomain.substr(-institutionDomain.length);
    if (emailDomainSubstring === institutionDomain) {
      return true;
    }
  }
  return false;
}

async function registerUser(req, res, db, first_name, last_name, email, password, institution) {
  let hashedPassword = await bcrypt.hash(password, 8);

  let result = await database.queryPromise(
    db,
    "SELECT id FROM institution WHERE short_name = ?",
    [institution]);

  if (!result) {
    req.session.messageFail = "Institution not found!";
    failWithMessage(req, res);
    return;
  } else {
    const institution_id = result[0].id;
    let insertResult = await database.queryPromise(
      db,
      "INSERT INTO user (first_name, last_name, email, password, institution_id)" +
      "VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, institution_id]);

    if (insertResult) {
        res.redirect("../login");
      }
    }
}

function failWithMessage(req, res) {
  req.session.isRefreshed = false;
  res.status(401).redirect("/register");
  return;
}

/* creating a new unique token that will be stored in cookie
const token = jwt.sign({id: id}, process.env.JWT_SECRET , {
  expiresIn: process.env.JWT_EXPIRES_IN
});

console.log("The token is: " + token);

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES + 24 * 60 * 60 * 1000
  ),
  httpOnly: true
}
res.cookie('jwt', token, cookieOptions); //setting up the cookie inside the browser
//Remeber we need to start the cookie thru the cookie parser in main.js

res.status(200).redirect("/");
} */
