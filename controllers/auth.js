const mysql = require( 'mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const fs = require('fs');





const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})



exports.login = async (req, res) => {
  try {
    const {email , password } = req.body;

    //if some one is submitting a login with no email or password
    if( !email || !password ){
      return res.status(400).render('login', { //400 is a forbidden code!
          message: 'Please provide an email and password'
      })
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
      console.log('results: ' ,results);
      if(!results[0] || !(await bcrypt.compare(password, results[0].password) ) ) { //no user in the db or wait for comparsion of password
          res.status(401).render('login' , {
            message: 'Email or Password is incorrect'
          })
      }
      else{ //if email and password is matching
        const id = results[0].id;
        //creating a new unique token that will be stored in cookie
        const token = jwt.sign({id: id}, process.env.JWT_SECRET , {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log("The token is: " + token);

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES + 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }
        res.cookie('jwt', token, cookieOptions); //setting up the cookie inside the browser
        //Remeber we need to start the cookie thru the cookie parser in main.js
        res.status(200).redirect('/');
      }

    })

  } catch (e) {
    console.log(e);
  }
}






exports.isLoggedIn = async (req, res, next) => {
  console.log("body: ",req.body);
  //Step 1 is verify the token
  if( req.cookies.jwt ){ //grabbing the cookie who is named jwt
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      console.log(decoded);

      //Check if the user still exists
      db.query('SELECT *, DATE_FORMAT(birthday,\'%d/%m/%Y\') AS birthdate FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result);
        if(!result){
          return next();
        }else{
          req.user = result[0];
          //Get all other users informations
          db.query('SELECT * FROM users WHERE id <> ?', [result[0].id], (errors, results) => {
            if(!results){
              return next();
            }
            else{
              req.users = results;
              //If instructor
              if(result[0].isAdmin){
                db.query('SELECT * FROM courses WHERE instructor_id = ? ORDER BY name', [result[0].id], (errorss, resultss) => {
                  db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS messageDate FROM users_messaging WHERE receiver_email = ?', [result[0].email], (errorsss, resultsss) => {
                    if(errorss || errorsss){
                      return next();
                    }
                    else{
                      req.courses = resultss;
                      req.privateMessages = resultsss;
                      return next();
                    }
                  });
                });
              }
              //If student
              else{
                db.query('SELECT * FROM course_registrar WHERE student_id = ? ORDER BY course_name', [result[0].id], (errorss, resultss) => {
                  db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS messageDate FROM users_messaging WHERE receiver_email = ?', [result[0].email], (errorsss, resultsss) => {
                    if(!resultss){
                      return next();
                    }
                    else{
                      req.registered = resultss;
                      req.privateMessages = resultsss;
                      return next();
                    }
                  });
                });
              }
            }
          });
        }
      })
    }
    catch (e) {
      console.log(e);
      return next();
    }
  }
  else{
    next();
  }
}





exports.logout = (req, res) => {
  res.cookie('jwt', 'logout' , {
    expires: new Date( Date.now() + 2*1000),
    httpOnly: true
  });
  res.status(200).redirect('/');

}



exports.authAdmin = async (req, res, next) => {
  //Step 1 is verify the token
  if( req.cookies.jwt ){ //grabbing the cookie who is named jwt
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      console.log(decoded);

      //Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result);
        if(!result){
          return next();
        }else{
          // req.user = result[0];
          if(result[0].isAdmin){
            req.user = result[0];
            db.query('SELECT * FROM courses WHERE instructor_id = ?', [result[0].id], (errors, results) => {
              if(!results){
                return next();
              }
              else{
                req.mycourses = results;

                db.query('SELECT * FROM course_registrar WHERE course_id IN (SELECT id FROM courses WHERE instructor_id = ?)', [result[0].id], (errorss, resultss) => {
                  console.log('registered students : ', resultss);
                  req.allRegisteredStudents = resultss;
                  return next();
                });
              }
            });

          }
          else{
            return next();
          }

        }

      })


    } catch (e) {
      console.log(e);
      return next();
    }
  } else{
    next();
  }
}



exports.authStudent = async (req, res, next) => {
  //Step 1 is verify the token
  if( req.cookies.jwt ){ //grabbing the cookie who is named jwt
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);


      //Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {

        if(!result){
          return next();
        }
        else{
          db.query('SELECT * FROM courses', (error, results) => {
            if(!results){
              return next()
            }
            else{
              req.courses = results;
              if(!result[0].isAdmin){
                req.user = result[0];
                return next();
              }
              else{
                return next();
              }
            }
          });
        }

      })


    } catch (e) {
      console.log(e);
      return next();
    }
  } else{
    next();
  }
}

// This one for a user who is already registered in
exports.getClass = async (req, res) => {
  const { courseName } = req.body;

  if(req.files) {
    var file;
    var file_name = '';
    file = req.files.resource_file;
    file_name = file.name;
    console.log('File name = ', file_name);

    var dir = 'public/files/course/' + courseName + '/';
    console.log(dir);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    file.mv(dir + file_name, (err) => {
      if(err) {
        return res.render('class', {
          message: err
        });
      } else {
        console.log("File sent as resource");
      }
    });

    var date = new Date(Date.now());

    db.query('INSERT INTO course_resource SET ?', {course_name: courseName, file_name: file_name, date: date}, (error, result) => {
      if(error) {
        console.log(error);
      } else {
        console.log("successfully uploaded file");
      }
    });
  }

  //Step 1 is verify the token
  if( req.cookies.jwt ){ //grabbing the cookie who is named jwt
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);


      //Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {

        if(!result){
          return res.render('profile', {
            message: 'This user does not exist anymore'
          });
        }
        else{
          //Making sure that the course name does not exit!
          db.query('SELECT * FROM courses WHERE name = ?', [courseName], (error, results) => {
            if(error){
              console.log(error);
            }
            if(results.length == 0){ //if the course does not exist!
              return res.render('profile', {
                message: 'That course does not exist anymore'
              });
            }
            else{
              //req.class_name = courseName;
              db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS announceDate FROM announcement WHERE class_name = ?', [courseName], (error, result_announcements) => {

                db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS questionDate FROM question_post WHERE course_name = ?', [courseName], (error, result_questions) => {

                  db.query('SELECT * FROM course_chat WHERE course_name = ?', [courseName], (error, result_chat) => {

                    db.query('SELECT * FROM comment_post WHERE course_name = ? ORDER BY post_id ASC', [courseName], (error, result_comments) => {

                      db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS resource_date FROM course_resource WHERE course_name = ? ORDER BY id ASC', [courseName], (error, result_resources) => {

                        if(error){
                          console.log(error);
                        }

                        return res.render('class', {
                          user: result[0],
                          class_name: courseName,
                          announcements: result_announcements,
                          questions: result_questions,
                          chat: result_chat,
                          allComments: result_comments,
                          resultResources: result_resources
                        });
                      });
                    });
                  });
                });
              });
            }
          });
        }
      });
    } catch (e) {
        console.log(e);
    }
  } else{
      return res.render('profile', {
        message: 'Failure'
      });
  }
}
