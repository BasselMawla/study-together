const express = require("express");
const router = express.Router();
const session = require("express-session");
const databaseController = require("../controllers/databaseController");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", databaseController.getInstitutions, (req, res) => {
  if(res.locals.institutions) {
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
  if(!req.session.isRefreshed) {
    req.session.isRefreshed = true;
    res.render("login", {
      messageFail: req.session.messageFail
    });
  }
});

module.exports = router;