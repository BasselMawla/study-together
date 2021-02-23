const mysql = require("mysql");
let dbPool = mysql.createPool({
  connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

dbPool.on("acquire", function (connection) {
  //console.log('Connection %d acquired', connection.threadId);
});

dbPool.on("release", function (connection) {
  //console.log('Connection %d released\n', connection.threadId);
});

exports.queryPromise = (queryString, queryParams) => {
  return new Promise((resolve, reject) => {
    dbPool.query(queryString, queryParams, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};
