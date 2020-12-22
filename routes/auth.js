const express = require( 'express');
const authController = require('../controllers/auth');
const regController = require('../controllers/registration');
const presController = require('../controllers/presentation');
const messController = require('../controllers/messaging');
const courseController = require('../controllers/course_details');
const router = express.Router();

          //same as : /auth/register
router.post('/register', regController.register);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/add-course', regController.addCourse);

router.post('/studentRegister', regController.registerCourse);

router.post('/editMyStudents' , regController.editRegistrar);

router.post('/visitProfile' , presController.showVisitProfile);

router.post('/sendPrivateMessage' , messController.sendPrivateMessage);

router.post('/class' , authController.getClass);

router.post('/addAnnouncement' , courseController.addAnnouncement);

router.post('/addQuestion' , courseController.addQuestion);



module.exports = router;
