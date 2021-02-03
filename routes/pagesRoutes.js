const express = require("express");
const router = express.Router();
const session = require("express-session");
const databaseController = require("../controllers/databaseController");

router.get("/", async (req, res) => {
  if(req.session.user) {
    res.render("index", {
      user: req.session.user
    });
  } else {
    res.render("index");
  }
});

router.get("/register", databaseController.getInstitutions, async (req, res) => {
  if(req.session.user) {
    res.redirect("/");
  } else if(res.locals.institutions) {
    if(!req.session.isRefreshed) {
      req.session.isRefreshed = true;
      res.render("register", {
        institutions: res.locals.institutions,
        messageFail: req.session.messageFail
      });
    } else {
      res.render("register", {
        institutions: res.locals.institutions
      });
    }
  } else {
    res.status(500).redirect("/");
  }
})

router.get("/login", async(req, res) => {
  if(req.session.usern) {
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
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  });

  res.status(200).redirect("/");
})


router.get("/profile", (req, res) => {
  if(!req.session.user) {
    res.redirect("/login");
  }  else {
    res.render("profile",{
      user: req.session.user
    });
  }
})

//router.get("/profile/:id", )

module.exports = router;
