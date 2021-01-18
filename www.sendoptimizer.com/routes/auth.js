// ----------- IMPORTS ----------- //
var express = require("express");
var app = express.Router();
const passport = require("passport");

// ----------- SET UP PASSPORT JS ----------- //
var passportConfig = require("./auth-passport-config");
app.use(passportConfig);

// ----------- HELPERS ----------- //
// Middleware to check if the user is authenticated
function isValidUser(u) {
  // console.log(u);
  var allowedUsers = ["mbacak@gmail.com", "behappy54321@gmail.com"];
  // If the user exists, and is in the list of allowed emails, they are valid.
  console.log("user --- ", u);
  return (
    u &&
    // -------------
    // u._json &&
    // allowedUsers.find((e) => e === u._json.email && u._json.email_verified) !==
    //   undefined
    // -------------
    u.emails &&
    u.emails.find(
      (e) =>
        allowedUsers.find((e2) => e.verified && e.value === e2) !== undefined
    ) !== undefined
  );
}
function isUserAuthenticated(req, res, next) {
  console.log("----- ", req.url);
  /*
  res.send(
    JSON.stringify(req.user) +
      "<br/><br/><br/>" +
      isValidUser(req.user) +
      "<br/><br/><br/>" +
      Object.keys(res)
        .map((k) => k)
        .join("<br/>") +
      "<br/><br/><br/>" +
      Object.keys(req)
        .map((k) => k)
        .join("<br/>") +
      "<br/><br/><br/>" +
      Object.keys(req.session)
        .map((k) => k)
        .join("<br/>") +
      "<br/><br/><br/>" +
      JSON.stringify(req.sessionKey) +
      "<br/><br/><br/>" +
      Object.keys(req.sessionCookies)
        .map((k) => k)
        .join("<br/>") +
      "<br/><br/><br/>" +
      JSON.stringify(req.sessionOptions) +
      "<br/><br/><br/>" +
      req.url
  );
  //*/

  if (isValidUser(req.user)) {
    // If this is an authorized-user, logged in with google.
    return next();
  } else if (req.user) {
    // If someone logged in but wasn't authorized.
    // if (req.url === "/not-authorized") next();
    // else {
    console.log("Requested URL: " + req.url);
    console.log("NOT AUTHORIZED");
    res.redirect("/not-authorized");
    // }
  } else {
    // This user was not authorized, and hasn't logged in yet.
    console.log("Requested URL: " + req.url);
    console.log("NOT AUTHORIZED");
    res.redirect("/login");
  }
}

// ----------- ROUTES ----------- //
// ----------- ROUTES ----------- //
// ----------- ROUTES ----------- //
// ----------- ROUTES ----------- //
// ----------- ROUTES ----------- //
// passport.authenticate middleware is used here to authenticate the request
app.get(
  "/auth/google",
  passport.authenticate("google", {
    // scope: ["profile", "email"], // Used to specify the required data
    scope: ["email"], // Used to specify the required data
  })
);

// The middleware receives the data from Google and runs the function on Strategy config
app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect("/");
    // res.redirect("/secret");
  }
);

// Secret route
app.get("/secret", isUserAuthenticated, (req, res) =>
  res.send("You have reached the secret route")
);

// Login
app.get("/login", (req, res) => {
  res.render("login", { title: "Welcome to Send Optimizer" });
});

function doLogout(req, res, nextPage, nextPageTitle) {
  console.log("logging out....");
  req.logout();
  if (req.session && req.session.destroy)
    req.session.destroy((err) => {
      if (err) {
        return res.send({ error: "Logout error" });
      }
      req.session = null;
      res.clearCookie("express:sess", { path: "/" });
      // return res.send({ clearSession: "success" });
      // res.end();
      // return res.send("Logged out!");
      return res.render(nextPage, { nextPageTitle });
    });
  // else res.send("no session found...");
  else return res.render(nextPage, { title: nextPageTitle });
}

// Logout route
app.get("/logout", (req, res) => {
  // if (req.session) {
  doLogout(req, res, "logout", "You have been logged out.");
  // } else {
  // res.redirect("/login");
  // }
});

// not-authorized route
app.get("/not-authorized", (req, res) => {
  // if (req.user) {
  doLogout(req, res, "not-authorized", "Not Authorized");
  // } else {
  // res.redirect("/login");
  // }
});

if (process.env.DEBUG_MODE !== "development") app.use(isUserAuthenticated);

// ----------- EXPORT ----------- //
module.exports = app;
