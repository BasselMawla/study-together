const mysql = require( 'mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const fs = require('fs');
const { getClass } = require('./auth');



const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})





//This one is for any User wants to register in the system Default --> student
exports.sendPrivateMessage = (req, res) => {
  console.log(req.body);

  // const name = req.body.name;
  // const email = req.body.email;
  // const password = req.body.password;
  // const passwordConfirm = req.body.passwordConfirm;
  //All the above is the same as below (1 line)
  const { sender_name , sender_email , recipient_name , recipient_email , message_subject , message_text} = req.body;
  //Making sure that the sender email does  exists!
  db.query('SELECT email FROM users WHERE email = ?', [sender_email], (error, results) => {
    if(error){
      console.log(error);
    }
    if(results.length == 0){ //if the email does not exist!
      return res.render('visitProfile', {
        message: 'That email does not exist'
      })

    }



    //Saving the user image
    var file;
    var file_name = '';
    if(!req.files){
      //Do nothing
      console.log("No file sent!");
    }
    else{
      console.log('req.files has been read!');
      console.log(req.files);
      file = req.files.message_file;
      file_name = file.name;
      console.log('file name = ', file_name);

      var dir = 'public/files/sent-files/' + recipient_email + '/';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }

        file.mv(dir + file_name, (err) => {
          if(err){
            return res.render('visitProfile', {
              message: err
            });
          }else{
            console.log("succeeded saving the file");
          }
        });

    }


    var date = new Date(Date.now());
    console.log("The hour that the message has been sent is :", date.getHours());
    console.log("The minutes that the message has been sent is :", date.getMinutes());

    db.query('INSERT INTO users_messaging SET ?',{sender_name: sender_name, sender_email: sender_email, receiver_name: recipient_name, receiver_email: recipient_email, date: date, subject: message_subject, text: message_text, media: file_name, isRead: 0}, (error, resultss) => {
      if(error){
        console.log(error);
      }else{
        console.log(`results: ${resultss}`);
        return res.redirect('/profile');
      }
    });

  });
}

exports.getAllMessages = async (req, res, next) => {
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
            req.user = result[0];
            db.query('SELECT * FROM users_messaging WHERE receiver_email = ? ORDER BY sender_name ASC', [result[0].email], (errors, results) => {
              if(!results){
                return next();
              }
              else{
                req.messages = results;
                return next();
                // db.query('SELECT * FROM course_registrar WHERE course_id IN (SELECT id FROM courses WHERE instructor_id = ?)', [result[0].id], (errorss, resultss) => {
                //   console.log('registered students : ', resultss);
                //   req.allRegisteredStudents = resultss;
                //   return next();
                // });
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