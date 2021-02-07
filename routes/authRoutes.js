const express = require("express");
const router = express.Router();

const registerController = require("../controllers/registerController");
const loginController = require("../controllers/loginController");
const registerCourseController = require("../controllers/registerCourseController");

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.post("/register-course", registerCourseController.registerCourse);

module.exports = router;