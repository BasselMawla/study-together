const express = require("express");
const router = express.Router();
const session = require("express-session");
const databaseController = require("../controllers/databaseController");
const institutionController = require("../controllers/institutionController");
const departmentController = require("../controllers/departmentController");

router.get("/", async (req, res) => {
  res.render("index", {
    user: req.session.user
  });
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
    res.render("profile", {
      user: req.session.user
    });
  }
})

router.get("/:institution", institutionController.getInstitutionInfo, (req, res) => {
    res.render("institution", {
      user: req.session.user,
      institution_name: res.locals.institution_name,
      instition_code: res.locals.institution_code,
      departments: res.locals.departments
    });

})

router.get("/:institution/:department", departmentController.getCourses, (req, res) => {
  res.render("department", {
    user: req.session.user,
    institution_code: req.params.institution,
    department_name: res.locals.department_name,
    department_code: res.locals.department_code,
    courses: res.locals.courses
  });
})

//router.get("/profile/:id", )

module.exports = router;
