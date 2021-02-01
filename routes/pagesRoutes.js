const express = require("express");
const router = express.Router();
const session = require("express-session");
const databaseController = require("../controllers/databaseController");

router.get("/", (req, res) => {
  if(req.session.user) {
    res.render("index", {
      user: req.session.user
    });
  } else {
    res.render("index");
  }
});

router.get("/register", databaseController.getInstitutions, (req, res) => {
  if(req.session.user) {
    res.redirect("/");
  } else if(res.locals.institutions) {
    if(!req.session.isRefreshed) {
      req.session.isRefreshed = true;
      res.render("register", {
        institutions: res.locals.institutions,
        messageFail: req.session.messageFail
        //queryData: req.query
      });
    } else {
      res.render("register", {
        institutions: res.locals.institutions
        //queryData: req.query
      });
    }
  } else {
    res.status(500).redirect("/");
  }
})

router.get("/login", (req, res) => {
  if(req.session.user) {
    res.redirect("/");
  } else if(!req.session.isRefreshed) {
    req.session.isRefreshed = true;
    res.render("login", {
      messageFail: req.session.messageFail
    });
  } else {
    res.render("login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).redirect("/");
})

//router.get("/profile/:id", )

module.exports = router;