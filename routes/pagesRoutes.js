const express = require("express");
const router = express.Router();
const databaseController = require("../controllers/databaseController");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", databaseController.getInstitutions, (req, res) => {
  if(req.institutions) {
    res.render("register", {
      institutions: req.institutions
    });
  } else {
    res.status(500).redirect("/");
  }
})

router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;