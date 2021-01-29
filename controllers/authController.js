const express = require("express");
const session = require("express-session");
const url = require('url');
const bcrypt = require("bcryptjs");
const database = require("../js/modules/database");
const databaseController = require("../controllers/databaseController");

//var cookieParser = require('cookie-parser');
//var session = require('express-session');

exports.register = (req, res) => {
  const {
    institution,
    first_name,
    last_name,
    email,
    password,
    password_confirmation
  } = req.body;

  const textInputsValidity = isTextInputsValid(first_name, last_name, email, password, password_confirmation);
  if(textInputsValidity !== 1) {
    failWithMessage(res, textInputsValidity);
  }

  const db = database.connectToDatabase();
  db.query(
    "SELECT short_name, email_domain " +
    "FROM institution, institution_email_domain " +
    "WHERE short_name = ? AND institution.id = institution_email_domain.institution_id",
    [institution],
    (error, results) => {
      if (error) {
        console.log(error);
      }
      else if (!results) {
        failWithMessage(res, "Institution not found!");
      }
      else if (!isInDomain(email, results)) {
        failWithMessage(res, "You need an email from your selected institution.");
      }
      else {
        console.log("within domain");
        res.render("/");
      }
    });
};

function failWithMessage(res, message) { 
  session.messageFail = message;
  res.redirect("/register");
}

function isInDomain(email, results) {
  const emailDomain = email.substr(email.indexOf("@")+1); // Everything after @

  for(var i=0; i<results.length; i++) {
    const institutionDomain = results[i].email_domain;
    const emailDomainSubstring = emailDomain.substr(-institutionDomain.length);
    if (emailDomainSubstring === institutionDomain) {
      return true;
    }
  }
  return false;
}

function isTextInputsValid(first_name, last_name, email, password, password_confirmation) {
  if (!first_name || !last_name) {
    return "Please enter a valid name!";
  }
  else if (!email) { // TODO: Validate email
    return "Please enter a valid email!";
  }
  else if (!password) {
    return "Please enter a password!";
  }
  else if (password !== password_confirmation) {
    return "Passwords do not match!";
  }
  return 1;
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

    database.query("SELECT * FROM user WHERE email = ?", [email], async (error, results) => {
      console.log("Query Results: ", results);
      if(!results[0] || password != results[0].password) {//(await bcrypt.compare(password, results[0].password))) {
          res.status(401).render("login" , {
            message: "Email and password don't match!"
          })
      }
      else { // Success: email and password match
        const userId = results[0].id;

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
