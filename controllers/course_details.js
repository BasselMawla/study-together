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






// This one for a Instructor who wishes to post announcement for certain course
exports.addAnnouncement = async (req, res) => {
  console.log("class name: ", req.body);


  const { announce_author, courseName, announce_text } = req.body;
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
              var datee = new Date(Date.now());

              db.query('INSERT INTO announcement SET ?',{class_name: courseName, author_name: announce_author, text: announce_text, date: datee}, (errorr, resultsss) => {
                if(errorr){
                  console.log(errorr);
                }else{
                  console.log(`results: ${resultsss}`);
                  db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS announceDate FROM announcement WHERE class_name = ?', [courseName], (error, resultss) => {
                    db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS questionDate FROM question_post WHERE course_name = ?', [courseName], (error, resultsss) => {
                      if(error){
                        console.log(error);
                      }

                        return res.render('class', {
                          user: result[0],
                          class_name: courseName,
                          announcements: resultss,
                          questions: resultsss
                        })

                    });
                  });
                }
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







// This one for a user who wishes to post question for certain course
exports.addQuestion = async (req, res) => {
  console.log("class name: ", req.body);


  const { question_author, courseName, question_text } = req.body;
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
              var datee = new Date(Date.now());

              db.query('INSERT INTO question_post SET ?',{course_name: courseName, author_name: question_author, text: question_text, date: datee, upvoted: 0}, (errorr, resultsss) => {
                if(errorr){
                  console.log(errorr);
                }else{
                  console.log(`results: ${resultsss}`);
                  db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS announceDate FROM announcement WHERE class_name = ?', [courseName], (error, resultss) => {
                    db.query('SELECT *, DATE_FORMAT(date,\'%d/%m (%h:%i)\') AS questionDate FROM question_post WHERE course_name = ?', [courseName], (error, resultsss) => {
                      if(error){
                        console.log(error);
                      }

                        return res.render('class', {
                          user: result[0],
                          class_name: courseName,
                          announcements: resultss,
                          questions: resultsss
                        })

                    });
                  });
                }
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
