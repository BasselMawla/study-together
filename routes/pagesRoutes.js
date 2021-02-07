const express = require("express");
const router = express.Router();
const session = require("express-session");
const databaseController = require("../controllers/databaseController");
const institutionController = require("../controllers/institutionController");
const departmentController = require("../controllers/departmentController");
const courseRoomController = require("../controllers/courseRoomController");

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

router.get("/add-course", institutionController.getDepartmentsAndCourses, (req, res) => {
  if(!req.session.isRefreshed) {
    req.session.isRefreshed = true;
    res.render("add-course", {
      user: req.session.user,
      departmentsAndCourses: res.locals.departmentsAndCourses,
      redirectMessage: req.session.redirectMessage,
      redirectMessageType: req.session.redirectMessageType
    });
  } else {
    res.render("add-course", {
      user: req.session.user,
      departmentsAndCourses: res.locals.departmentsAndCourses
    });
  }
})

router.get("/:institution_code", institutionController.getDepartments, (req, res) => {
    res.render("institution", {
      user: req.session.user,
      institution_name: res.locals.institution_name,
      instition_code: res.locals.institution_code,
      departments: res.locals.departments
    });

})

router.get("/:institution_code/:department_code", departmentController.getCourses, (req, res) => {
  res.render("department", {
    user: req.session.user,
    institution_code: req.params.institution_code,
    department_name: res.locals.department_name,
    department_code: res.locals.department_code,
    courses: res.locals.courses
  });
})

router.get(
  "/:institution_code/:department_code/:course_code",
  courseRoomController.getRoom, (req, res) => {
    res.render("course-room", {
      user: req.session.user,
      institution_code: req.params.institution_code,
      department_code: res.locals.department_code,
      course_code: req.params.course_code
    });
})

//router.get("/profile/:id", )

module.exports = router;
