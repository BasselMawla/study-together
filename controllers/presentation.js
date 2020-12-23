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





// // req.user & req.other & message( req.teachStudent 3 | req.instructorTeach | mutualCourses ) ? req.otherCourses
// exports.showVisitProfile = (req, res) => {
//
//
//   const{ email } = req.body;
//   console.log("HELLLOOOOOOOO", email);
//   res.redirect("/searchPeople");
//
// }




exports.showVisitProfile =  async (req, res) => {

  const{ email} = req.body;
  console.log("visit email: ", email);

  //Step 1 is verify the token
  if( req.cookies.jwt ){ //grabbing the cookie who is named jwt
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      console.log(decoded);

      //Check if the user still exists
      db.query('SELECT *, DATE_FORMAT(birthday,\'%d/%m/%Y\') AS birthdate FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result);
        if(error){
          console.log(error);
        }
        if(!result){
          console.log("No user is signed in!!!");
          return res.status(400).render('login', { //400 is a forbidden code!
              message: 'Please provide an email and password'
          })
        }
        else{
          //req.user = result[0];
          //Get other user informations
          console.log("your data is stored and waiting for the host data...");
          db.query('SELECT *, DATE_FORMAT(birthday,\'%d/%m/%Y\') AS birthdate FROM users WHERE email = ?', [email], (errors, results) => {
            if(errors){
              console.log(errors);

            }
            if(!results){ //NOT RECEIVED ANY DATA ABOUT THE HOST
              console.log("No other user has been selected!!");
              res.status(401).render('searchPeople', { //400 is a forbidden code!
                  message : "No other user has been selected!!"
              });
            }
            else{
              //req.other = results[0];
              console.log("Other data has been stored no checking the relationship between the profile and visitor...");
              console.log(result[0]);
              console.log(results[0]);

              //---> HERE WE HAVE PERSONAL DATA AND THE HOST DATA AS WELL

              //If instructor visits student
              if(result[0].isAdmin  && !results[0].isAdmin){
                console.log("Instructor is visiting a student");
                db.query('SELECT id, name, status FROM course_registrar JOIN courses ON course_registrar.course_id = courses.id AND instructor_id = ? AND student_id = ?', [result[0].id, results[0].id], (error, resultss) => {
                  if(error){
                    console.log(error);
                  }
                  if(!resultss){
                    console.log("Instructor: this student has no classes with me");
                    db.query('SELECT * FROM course_registrar WHERE student_id = ?', [results[0].id], (error, resultsss) => {
                      if(error){
                        console.log(error);

                      }
                      if(!resultsss){
                          console.log("Instructor: The student has not registered in any course yet!");
                          res.render('/visitProfile', {
                            user: result[0],
                            other: results[0],
                            message :"This student has no courses registered!"
                          })
                      }
                      else{
                        console.log("Instructor: The student classes are obtained!",resultsss);
                        //req.otherCourses = resultsss;
                        res.render('/visitProfile', {
                          user: result[0],
                          other: results[0],
                          otherCourses: resultsss,
                          message :"This student is registered in your class!"
                        });

                      }
                    });

                  }
                  else{
                    console.log('Instructor: This student have registered classes with me!');
                    console.log(resultss);
                    //req.mutualCourses = resultss;
                    //res.status(200).redirect('/visitProfile');
                    res.render('visitProfile', {
                      user: result[0],
                      other: results[0],
                      mutualCourses: resultss

                    });


                    }
                  });
                }


              //If student visit instructor
              else if(!(result[0].isAdmin) && (results[0].isAdmin)){
                console.log("Student is visiting an instructor");
                db.query('SELECT id, name, status FROM course_registrar JOIN courses ON course_registrar.course_id = courses.id AND instructor_id = ? AND student_id = ?;', [results[0].id, result[0].id], (error, resultss) => {
                  if(error){
                    console.log(error);

                  }
                  if(!resultss){
                    db.query('SELECT * FROM courses WHERE instructor_id = ?', [results[0].id], (error, resultsss) => {
                      if(error){
                        console.log(error);
                      }
                      if(!resultsss){
                        console.log("This instructor is not teaching any course currently");
                        res.render('visitProfile', {
                          user: result[0],
                          other: results[0],
                          message: "I am sorry my dear, I am not teaching any courses at the moment"
                        });

                      }
                      else{
                        //req.otherCourses = resultsss;
                        res.render('visitProfile', {
                          user: result[0],
                          other: results[0],
                          otherCourses: resultsss,
                          message: "Hello " + result[0].name + ", check out my classes that I am teaching these days!"
                        });
                      }
                    });
                  }
                  else{
                    console.log("Here are the courses you registered with this instructor");
                    //req.mutualCourses = resultss; //ID , course_name , status
                    res.render('visitProfile', {
                      user: result[0],
                      other: results[0],
                      mutualCourses: resultss,
                      message: "Hello " + result[0].name + ", it seems I teach you those courses! never hesitate to ask me  about anything"
                    });

                  }
                });
              }
              //If student visit student
              else if(!result[0].isAdmin && !results[0].isAdmin){
                console.log("Student is visiting another student");
                db.query('SELECT c1.course_id, c1.course_name FROM course_registrar c1, course_registrar c2 WHERE c1.course_id = c2.course_id AND c1.student_id = ? AND c2.student_id = ?', [result[0].id, results[0].id], (error, resultss) => {
                  if(!resultss){

                    db.query('SELECT * FROM course_registrar WHERE student_id = ?', [results[0].id], (error, resultsss) => {
                      if(error){
                        console.log(error);
                      }
                      if(!resultsss){
                        console.log("This student did not register in any course yet");
                        res.render('visitProfile', {
                          user: result[0],
                          other: results[0],
                          message: "Hi my friend, I am not registering any courses. If you have any suggestion"
                        });

                      }
                      else{
                        console.log("You don't have any mutual course registered with this student -> the host courses : ", otherCourses);

                        res.render('visitProfile', {
                          user: result[0],
                          other: results[0],
                          otherCourses: resultsss,
                          message: "Hi friend! it feels so sad since we are not having courses in common, please have a look on my courses"
                        });
                      }
                    });
                  }
                  else{
                    console.log("Here are the common courses between you and this student", resultss );

                    res.render('visitProfile', {
                      user: result[0],
                      other: results[0],
                      mutualCourses: resultss,
                      message: "Hi friend! it seems we have courses in common, send me anything if you feel like studying together"
                    });

                  }
                });
              }
              //If instructor visits instructor
              else{
                db.query('SELECT * FROM courses WHERE instructor_id = ?', [results[0].id], (error, resultss) => {
                  if(error){
                    console.log(error);
                  }
                  if(!resultss){
                    console.log("the hosted instructor is not teaching any course at the moment");
                    res.render('visitProfile', {
                      user: result[0],
                      other: results[0],
                      message: "Hi fellow! Unfortunately I am not teaching any course at the moment."
                    });
                    }
                  else{
                    console.log("Instructor visits another instructor");
                    req.otherCourses = resultss;
                    res.render('visitProfile', {
                      user: result[0],
                      other: results[0],
                      otherCourses: resultss,
                      message: "Hi fellow! it feels so great to see you on my profile, please have a look on the courses I am teaching at the moment"
                    });
                  }
                });

              }
            }
          });
        }
      });
    }
    catch (e) {
      console.log(e);

    }
  }
  else{

  }
}
