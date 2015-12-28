/* Module Dependencies */
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var parseUrl = require("parseurl");
var bodyParser = require("body-parser");
var session = require("express-session");
var dotenv = require("dotenv").load();

var passport = require("passport");
var TwitterStrategy = require("passport-twitter").Strategy;
var ensureLogin = require("connect-ensure-login");

/* Passport Authentication Setup */
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenScret, profile, callback) {
    return callback(null, profile);
}));

passport.serializeUser(function(user, callback) {
  callback(null, user);
});

passport.deserializeUser(function(object, callback) {
  callback(null, object)
});

/* MongoDB setup */
var MongoClient = require("mongodb").MongoClient;
var Database = require("mongodb").Db;
var Server = require("mongodb").Server;
var MongoStore = require("connect-mongo")(session);
var url = "mongodb://localhost:27017/max-vote";
var mongoDb = new Database("max-vote", new Server("localhost", 27017));

/* Express Application */
var app = express();

/* HTTP page routes */
var router = express.Router();

/* Express-Session session setup */
app.use(session({
  name: "max-vote0.0.0",
  secret: "m-l-h-93",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 600000 }
}));

/* App Engine setup */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

/* GET home page. */
router.get("/", function(request, response, next) {
  //var sessionData = request.session;
  response.render("home", { title: "MaxVote | A simple live-polling resource", currentUser: request.user });
});

/* GET signup page. */
router.get("/signup", function(request, response, next) {
  //var sessionData = request.session;

  response.render("signup", { title: "MaxVote | Sign Up", currentUser: request.user});
});

/* GET login page. */
router.get("/login", function(request, response, next) {
  //var sessionData = request.session;
  response.render("login", { title: "MaxVote | Log in", currentUser: request.user });
});

/* GET Twitter Authentication */
router.get("/auth/twitter", passport.authenticate("twitter"));
router.get("/auth/twitter/callback", passport.authenticate("twitter",
  {
    successReturnToOrRedirect: "/dashboard",
    failureRedirect: "/login"
  }))

/* GET dashboard page. */
router.get("/dashboard", ensureLogin.ensureLoggedIn("/login"), function(request, response, next) {
  //var sessionData = request.session;

  mongoDb.open(function(error, db) {
    if(error) { console.log("Error opening db: "  + error); }

    db.collection("polls", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        var pollData = [];
        var currentUser = request.user;
        console.log(currentUser);

        collection.find({}, function(error, documents) {
          documents.each(function(error, item) {
            if(error || !item) {
              db.close();
              console.log(request.user);
              response.render("dashboard", {
                title: "MaxVote | Dashboard",
                currentUser: request.user,
                pollData: pollData
              });
            }
            pollData.push(item);
          });
        });
      }
    });
  });
});

/* HTTP page routing */
app.use("/", router);
app.use("/signup", router);
app.use("/login", router);
app.use("/auth/local", router);
app.use("/auth/twitter", router);
app.use("/dashboard", router);
app.use("/dashboard/data", router);

/* Catch 404 error and forward to error handler */
app.use(function(request, response, next) {
  var error = new Error("Not Found");
  error.status = 404;
  next(error);
});

/*
 * Error Handlers
 */

/* Development error handler that prints a stack trace */
if (app.get("env") === "development") {
  app.use(function(error, request, response, next) {
    response.status(error.status || 500);
    response.render("error", {
      message: error.message,
      error: error
    });
  });
}

/* Production error handler without stacktraces leaking to user */
app.use(function(error, request, response, next) {
  response.status(error.status || 500);
  response.render("error", {
    message: error.message,
    error: {}
  });
});

module.exports = app;


/*

// POST new user signup data
router.post("/signup/new", function(request, response, next) {
  //var sessionData = request.session;

  var userData = [];
  var userListFinished = false;
  var newUser = request.body;
  var newUserEmail = newUser.email;
  var validUser = true;

  mongoDb.open(function(error, db) {
    if(error) { console.log("Error opening db: " + error); }

    db.collection("users", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {

        collection.find({}, function(error, documents) {
          documents.each(function(error, item) {

            // if the documents are done being processed, initiate validation and DB insertion
            if(error || !item) {
              userData.forEach(function(user) {
                if(user.email === newUserEmail) {
                  validUser = false;
                  db.close();
                  response.status(500).send("User Exists.");
                }
              });

              if(validUser) {
                collection.save(newUser, function(error, result) {
                  if(error) { console.log("Insertion error: " + error); }
                  else {
                    console.log("Insertion successful: " + result);
                    db.close();
                    response.sendStatus(200).end();
                  }
                });
              }
            }
            //if a document in the query cursor still exists, push it to the userData array
            userData.push(item);
          });
        });
      }
    });
  });
});
*/
