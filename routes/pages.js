const express = require( 'express');
const authController = require('../controllers/auth');
const regController = require('../controllers/registration');
const presController = require('../controllers/presentation');
const messController = require('../controllers/messaging');
const router = express.Router();

router.get('/', authController.isLoggedIn , (req , res) => {
  res.render('index', {
    user: req.user
  });
});

router.get('/register', (req , res) => {
  res.render('register');
});

router.get('/login', (req , res) => {
  res.render('login');
});



//Creating a middleware
router.get('/profile', authController.isLoggedIn,  (req , res) => {

  if(req.user){
    res.render('profile' ,{
      user: req.user,
      courses: req.courses,
      privateMessages: req.privateMessages,
      registered: req.registered
    });
  }
  else{
    res.redirect('/login')
  }

});

// req.user & req.other & message( req.teachStudent 3 | req.instructorTeach | mutualCourses ) ? req.otherCourses
//Creating a middleware
router.get('/visitProfile', (req , res) => {

  if(req.user && req.other){
    res.render('visitProfile' ,{
      user: req.user,
      other: req.other,
      otherCourses: req.otherCourses
    });
  }
  else{
    res.redirect('/')
  }

});






router.get('/addCourse', authController.authAdmin, (req, res) => {
  if(req.user){
    res.render('addCourse' ,{
      user: req.user
    });
  }
  else{
    res.redirect('/')
  }
});


router.get('/studentRegister' , authController.authStudent , (req, res) => {
  console.log("Courses from Controller : ", req.courses);
  if(req.user){
    res.render('studentRegister' ,{
      user: req.user,
      courses: req.courses
    });
  }
  else{
    res.redirect('/')
  }
});



router.get('/editMyStudents', authController.authAdmin, (req, res) => {
  if(req.user){
    res.render('editMyStudents' , {
      user: req.user,
      mycourses: req.mycourses,
      students: req.allRegisteredStudents
    });
  }else{
    res.redirect('/')
  }
});



router.get('/searchPeople', authController.isLoggedIn, (req , res) => {

  if(req.user){
    console.log("WOWWWWWW",req.user);
    res.render('searchPeople' ,{
      user: req.user,
      courses: req.courses,
      registered: req.registered,
      users: req.users
    });
  }
  else{
    res.redirect('/login')
  }
});


//messageRegistrar
router.get('/messages', messController.getAllMessages, (req , res) => {
  if(req.user){
    res.render('messages' ,{
      user: req.user,
      messages: req.messages
    });
  }
  else{
    res.redirect('/login')
  }
});
///authController.messageRegistrar

router.get('/class', (req, res) => {
  res.render('class');
})


router.get('/question_post', (req, res) => {
  res.render('question_post');
})


module.exports = router;
