const express = require("express");
const app = express();
const path = require("path");
//const server = require("http").Server(app);
const dotEnv = require("dotenv");
dotEnv.config({ path: "config.env" });

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

app.listen(process.env.SERVER_PORT || 3000, function () {
  console.log("Server started on port " + process.env.SERVER_PORT);
});

// Parse URL-encoded bodies (req.body) (as sent by HTML forms)
app.use(
  express.urlencoded({
    extended: false
  })
);

//Parse JSON bodies (as send from forms) -> comes with json formats
app.use(express.json());

app.set("view engine", "ejs");

app.use("/", require("./routes/pagesRoutes"));
app.use("/auth", require("./routes/authRoutes"));