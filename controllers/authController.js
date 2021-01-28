const bcrypt = require("bcryptjs");
const express = require("express");
const app = express(); // Start the server
var cookieParser = require('cookie-parser');
var session = require('express-session');
const database = require("../js/modules/database");

exports.login = async (req, res) => {
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
        */
        res.status(200).redirect("/");
      }

    })

  } catch (e) {
    console.log(e);
  }
}