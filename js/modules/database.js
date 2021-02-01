const mysql = require("mysql");

exports.connectToDatabase = function() {
  const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  });

  database.connect((err) => {
    if (err) {
      throw err;
    } else {
      console.log("MySQL connected succefully");
    }
  });

  return database;
}

exports.queryPromise = function(db, queryString, params) { 
  return new Promise((resolve, reject) => {
    db.query(queryString, params, (err, result) => {
      if (err) {
        reject(err);
      } 
      resolve(result);
    })
  })
}