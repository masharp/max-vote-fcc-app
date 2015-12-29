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

  /* authentication success callback that checks if a new database entry is necessary */
  function(token, tokenScret, profile, callback) {
    var userData = [];
    var validUser = true;

    mongoDb.open(function(error, db) {
      var newUser = parseUserData(profile);
      newUser.polls = [];
      console.log(newUser);

      db.collection("users", function(error, collection) {
        if(error) { console.log("Collection error: " + error); }
        else {

          collection.find({}, function(error, documents) {
            documents.each(function(error, item) {

              // if the documents are done being processed, initiate validation and DB insertion
              if(error || !item) {
                userData.forEach(function(user) {
                  if(user.username === newUser.username) {
                    validUser = false;
                    db.close();
                    return callback(null, profile);
                  }
                });

                if(validUser) {
                  collection.save(newUser, function(error, result) {
                    if(error) { console.log("Insertion error: " + error); }
                    else {
                      db.close();
                      return callback(null, profile);
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
  }
));

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

  var currentUser = parseUserData(request.user);

  response.render("home", { title: "MaxVote | A simple live-polling resource", currentUser: currentUser });
});

/* GET signup page. */
router.get("/signup", function(request, response, next) {
  //var sessionData = request.session;

  var currentUser = parseUserData(request.user);

  response.render("signup", { title: "MaxVote | Sign Up", currentUser: currentUser });
});

router.get("/logout", function(request, response, next) {
  request.logout();
  request.session.destroy(function(error) {
    response.redirect("/");
  });
});

/* GET login page. */
router.get("/login", function(request, response, next) {
  //var sessionData = request.session;
  var currentUser = parseUserData(request.user);

  response.render("login", { title: "MaxVote | Log in", currentUser: currentUser });
});

/* GET Twitter Authentication */
router.get("/auth/twitter", passport.authenticate("twitter"));
router.get("/auth/twitter/callback", passport.authenticate("twitter",
  {
    successReturnToOrRedirect: "/dashboard",
    failureRedirect: "/login"
  })
);

/* GET dashboard page. */
router.get("/dashboard", ensureLogin.ensureLoggedIn("/login"), function(request, response, next) {
  //var sessionData = request.session;

  var currentUser = parseUserData(request.user);

  mongoDb.open(function(error, db) {
    if(error) { console.log("Error opening db: "  + error); }

    db.collection("users", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        var pollData = [];

        collection.find({username: currentUser.username}, function(error, document) {
          db.close();
          response.render("dashboard", {
            title: "MaxVote | Dashboard",
            currentUser: currentUser,
            pollData: document.polls
          });
        });
      }
    });
  });
});

/*POST dashboard for new poll saving */
router.post("/dashboard", function(request, response, next) {
  var newPoll = request.body;
  var currentUser = parseUserData(request.user);

  console.log(newPoll.name + " " + currentUser.username);
});

/* HTTP page routing */
app.use("/", router);
app.use("/signup", router);
app.use("/login", router);
app.use("/logout", router);
app.use("/auth/local", router);
app.use("/auth/twitter", router);
app.use("/dashboard", router);

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

/* Function to parse Passport-Twitter user data for necessary information */
function parseUserData(userObj) {
  if (!userObj) return null;

  var newUser = {
    id: userObj.id,
    name: userObj.displayName,
    username: userObj.username
  }

  return newUser;
}

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
