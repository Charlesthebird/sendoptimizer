// ----------- IMPORTS ---------- //
var express = require("express");
var cors = require("cors");
const cookieSession = require("cookie-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const nocache = require("nocache");

var authRouter = require("./routes/auth");
var apiRouter = require("./routes/api");

// ---------- CONFIGURE EXPRESS APP ------- //
var app = express();
app.use(cors());
app.use(nocache());
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    keys: ["randomstringhere"],
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ------- SERVE THE PUBLIC, STATIC FILES ------- //
// authRouter from auth.js protects the static routes (anything past auth-setup is protected).
app.use(express.static(path.join(__dirname, "public")));

// ------- SETUP AUTH + AUTH ROUTES ------- //
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
// auth setup
app.use("/", authRouter);

// ------- SERVE THE REACT APP ------- //
// authRouter from auth.js protects the static routes (anything past auth-setup is protected).
app.use(express.static(path.join(__dirname, "react-app/build")));

// ------- SETUP THE API ROUTES (auth protected) ----------  //
app.use("/api/", apiRouter);

module.exports = app;
