const express = require("express");
const router = express.Router();

const registerController = require("../controllers/registerController");
const loginController = require("../controllers/loginController");
const registerCourseController = require("../controllers/registerCourseController");
const databaseController = require("../controllers/databaseController");

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.post("/register-course", registerCourseController.registerCourse);
router.post("/delete-course", databaseController.deleteRegisteredCourse);

module.exports = router;
