const mysql = require( 'mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');



const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})



//This one is for any User wants to register in the system Default --> student
exports.register = (req, res) => {
  console.log(req.body);

  // const name = req.body.name;
  // const email = req.body.email;
  // const password = req.body.password;
  // const passwordConfirm = req.body.passwordConfirm;
  //All the above is the same as below (1 line)
  const { name , mobile , gender , dobDay , dobMonth , dobYear , email , password , passwordConfirm} = req.body;
  //Making sure that the email does not exit!
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
    if(error){
      console.log(error);
    }
    if(results.length > 0){ //if the email is already exists!
      return res.render('register', {
        message: 'That email is already in use'
      })

    }else if( password !== passwordConfirm){
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }

    let hashedPassword = await bcrypt.hash(password, 8);
    const birthdate = dobYear + "-" + dobMonth + "-" + dobDay;

    //Saving the user image
    var file;
    var image_name = '';
    if(!req.files){
      //Do nothing
      console.log("No image readed!");
    }
    else{
      console.log('req.files has been read!');
      console.log(req.files);
      file = req.files.image;
      image_name = file.name;
      console.log('image name = ', image_name);
      if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif"){
        file.mv('public/images/uploaded-images/' + image_name, (err) => {
          if(err){
            return res.render('register', {
              message: err
            });
          }else{
            console.log("succeeded saving the image");
          }
        });
      }
      else{
        message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('register',{message: message});
      }
    }





    db.query('INSERT INTO users SET ?',{name: name, phone: mobile, gender: gender, birthday: birthdate, email: email, password: hashedPassword, isAdmin: 0, image: image_name}, (error, resultss) => {
      if(error){
        console.log(error);
      }else{
        console.log(`results: ${resultss}`);
        return res.render('register', {
          message: 'User registered!'
        });
      }
    });

  });
}





// This one for a teacher who desire to teach a course
exports.addCourse = (req, res) => {
  console.log(req.body);


  const { courseName , instructorName , instructorId} = req.body;
  //Making sure that the course name does not exit!
  db.query('SELECT name FROM courses WHERE name = ?', [courseName], (error, results) => {
    if(error){
      console.log(error);
    }
    if(results.length > 0){ //if the course is already exists!
      return res.render('addCourse', {
        message: 'That course is already in use'
      })

    }
    else{
      db.query('INSERT INTO courses SET ?',{name: courseName, instructor_id: instructorId, instructor_name: instructorName}, (error, resultss) => {
        if(error){
          console.log(error);
        }else{
          console.log(`results course: ${resultss}`);
          return res.render('addCourse', {
            message: 'Course registered!'
          });
        }
      });
    }



  });
}










// This one is for student who whiches to resgiter in a coures
exports.registerCourse = (req, res) => {
  console.log(req.body);


  const { courseName , studentName , studentId} = req.body;
  //Making sure that the student name does not exit!
  db.query('SELECT id, name, instructor_id FROM courses WHERE name = ?', [courseName], (error, results) => {
    console.log('Inside the Student registration query with result', results[0]);
    if(error){
      console.log(error);
    }
    if(results.length == 0){ //if the course does not exist!
      return res.render('studentRegister', {
        message: 'That course does not exist'
      })

    }
    else{
      db.query('SELECT * FROM course_registrar WHERE student_id = ? AND course_name = ?', [studentId, courseName], (errors, resultss) => {
        if(error){
          console.log(error);
        }
        console.log('Existed? : ', resultss);
        if(resultss.length > 0){
          return res.render('studentRegister', {
            message: 'You are already registered in this course'
          })
        }
        else{
          db.query('INSERT INTO course_registrar SET ?',{course_id: results[0].id, student_id: studentId, status: 0, course_name: courseName, student_name: studentName}, (error, resultsss) => {
            if(error){
              console.log(error);
            }else{
              console.log('Student has successfully registere : ', results[0]);
              //return res.status(201).redirect('/studentRegister');
              return res.render('studentRegister', {
                message: 'Congrats! now your course is waiting the intructor approval.'
              });
            }
          });
        }

      });

    }

  });
}




// This one is for student who whiches to resgiter in a coures - Instructor side
exports.editRegistrar = (req, res) => {
  console.log("Editing registration by a teacher");
  console.log(req.body);



  const { select , course_id , student_id} = req.body;
  //Making sure that the student name does not exit!
  if(!select){
    return res.render('editMyStudents', {
      message: 'Operation has failed since no input was selected.'
    });
  }
  else if(select == 1){
    db.query('UPDATE course_registrar SET status = 1 WHERE course_id = ? AND student_id = ?', [course_id , student_id], (error, result) => {
      if(error){
        console.log(error);
      }
      if(!result){
        console.log(result);
        return res.render('editMyStudents', {
          message: 'Please revise the IT department!'
        });
      }
      else{
        return res.render('editMyStudents', {
          message: 'Thank you!'
        });
      }
    });
  }
  else{
    db.query('DELETE FROM course_registrar WHERE course_id = ? AND student_id = ?', [course_id , student_id], (errors, results) => {
      if(errors){
        console.log(errors);
      }
      if(!results){
        return res.render('editMyStudents', {
          message: 'Student has not been deleted for anonymous reason!'
        });
      }
      else{
        return res.render('editMyStudents', {
          message: 'Student has been deleted from the course'
        });
      }
    });
  }
}

exports.messageRegistrar = (req , res) => {
  console.log('Message Registrar!!!');
  return res.render('messages', {
    message: 'Message Registrar!!!'
  })
}
