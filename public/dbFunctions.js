const mysql = require('mysql');

// We construct database for registering
const db = mysql.createConnection({
   host: process.env.DATABASE_HOST,
   port: process.env.DATABASE_PORT,
   user: process.env.DATABASE_USER,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE
});
// Now we need to connect it
db.connect( (error) => {
     if(error){
        console.log(error);
     }else{
        console.log("Database functionality connected...");
     }
});

var courses = [];


function getAllCourses() {

    db.query('SELECT * FROM courses',  (error, result) => {

    if(error){ //if error occured
      console.log(errors);
      return null;
    }

    if(!result){

      return null;
    }
    else{
      let size = result.length;
      for (i = 0; i < size; i++) {
          const course = {
            id: result[i].id,
            name: result[i].name,
            instructor_id: result[i].instructor_id,
            instructor_name: result[i].instructor_name
          }
          courses.push(course);

        }
        console.log('Courses inside else: ', courses);
        return courses;
     }

  });
  console.log('Courses that are returning: ', courses);
  return courses;

}

/////////////////////////////////////////////

function getCourseByInstructorId(id) {
  const courses =[];
  db.query('SELECT * FROM courses WHERE instructor_id = ?', [id], (error, result) => {

    if(errors){ //if error occured
      console.log(errors);
      return null;
    }
    if(!result){
      return null;
    }
    else{
      let size = result.length;
      for (i = 0; i < size; i++) {
          const course = {
            id: result[i].id,
            name: result[i].name,
            instructor_id: result[i].instructor_id,
            instructor_name: result[i].instructor_name
          }
          courses.push(course);

        }
        return courses;
     }

  });

}
/////////////////////////////////////////////
function getAllUsers() {
  const users =[];

  db.query('SELECT * FROM users ',  (error, result) => {

    if(errors){ //if error occured
      console.log(errors);
      return null;
    }
    if(!result){
      return null;
    }
    else{
      let size = result.length;
      for (i = 0; i < size; i++) {
          const user = {
            id: result[i].id,
            name: result[i].name,
            email: result[i].email
          }
          users.push(user);

        }
        return users;
     }

   });

  }
//////////////////////////////////////////////////
  function logAllUsers(){
    console.log('Logging all users');
     db.query('SELECT * FROM users ', (error, result) => {
      if(error){
        console.log(error);
      }
      else if(!result){
        console.log('List of registered users is empty');
      }
      else{
        let size = result.length;
        for (i = 0; i < size; i++) {
          console.log((i+1) + "-" ,result[i]);
        }
      }
    });
  }
//////////////////////////////////////////////////
  function getUserByEmail(email){

    db.query('SELECT * FROM users WHERE email = ?',[email],  (error, result) => {
      if(error){
        console.log(error);
      }
      if(!result){
        return null;
      }
      else{
        console.log('inside - Got a user by email : ',result[0]);
        return result[0];

      }

    });
  }
  //////////////////////////////////////////////////
  function getUserById(id){
    db.query('SELECT * FROM users WHERE id = ?',[id],  (error, result) => {
      if(error){
        console.log(error);
      }
      if(!result){
        return null;
      }
      else{

        return result[0];
      }

    });
  }

  //////////////////////////////////////////////////////



// exports.getAllUsers = getAllUsers;
// exports.logAllUsers = logAllUsers;
// exports.getUserByEmail = getUserByEmail;
// exports.getUserById = getUserById;
// exports.getAllCourses = getAllCourses;
// exports.getCourseByInstructorId = getCourseByInstructorId;





//
