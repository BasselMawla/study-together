const mysql = require("mysql");

exports.connectToDatabase = function() {
  const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  });

  database.connect((error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("MySQL connected succefully");
    }
  });

  return database;
}