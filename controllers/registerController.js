const express = require("express");
const session = require("express-session");
const bcrypt = require('bcryptjs');
const { promisify } = require("util");
const database = require("../js/modules/database");
const db = database.connectToDatabase();

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
    password_confirmation);

  if(!textInputsIsValid) {
    failWithMessage(req, res);
  } else if (!(await isEmailWithinDomain(req, email, institution))) {
    failWithMessage(req, res);
  } else if (!(await isEmailDuplicate(req, email))) {
    failWithMessage(req, res);
  } else { // Success
    registerUser(
      req,
      res,
      first_name,
      last_name,
      email,
      password,
      institution);
  }
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

async function isEmailWithinDomain(req, email, institution) {
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

async function isEmailDuplicate(req, email) {
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

async function registerUser(req, res, first_name, last_name, email, password, institution) {
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

/*exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;

    // Missing info
    if(!email || !password){
      return res.status(400).render("login", { // 400 = forbidden
          message: "Please provide an email and password"
      });
    }

    database.query("SELECT * FROM user WHERE email = ?", [email], async (error, result) => {
      console.log("Query result: ", result);
      if(!result[0] || password != result[0].password) {//(await bcrypt.compare(password, result[0].password))) {
          res.status(401).render("login" , {
            message: "Email and password don't match!"
          })
      }
      else { // Success: email and password match
        const userId = result[0].id;

        app.use(cookieParser());
        app.use(session({secret: "Shh, its a secret!"}));
        
        app.get("/", function(req, res) {
           if(req.session.page_views){
              req.session.page_views++;
              res.send("You visited this page " + req.session.page_views + " times");
           } else {
              req.session.page_views = 1;
              res.send("Welcome to this page for the first time!");
           }
        });

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
      }

    })

  } catch (e) {
    console.log(e);
  }
}*/
