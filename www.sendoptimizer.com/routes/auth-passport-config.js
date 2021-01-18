var express = require("express");
var app = express.Router();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

// Strategy config
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "155319326244-4n04u4n1geq5sekmco1mbr4b5sk45nub.apps.googleusercontent.com",
      clientSecret: "2no4nvMSUuibXfquZhtSo_dt",
      callbackURL:
        // "http://localhost:3000/auth/google/callback",
        process.env.DEBUG_MODE === "development"
          ? "http://localhost:3000/auth/google/callback"
          : // : "https://sendoptimizer.com/auth/google/callback",
            "https://send-optimizer.ue.r.appspot.com/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile); // passes the profile data to serializeUser
    }
  )
);

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
  done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = app;
