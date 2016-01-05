/* Module Dependencies */
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var parseUrl = require("parseurl");
var bodyParser = require("body-parser");
var session = require("express-session");
var dotenv = require("dotenv").load();

/* MongoDB setup */
var MongoClient = require("mongodb").MongoClient;
var mongoURL = process.env.MONGOLAB_URI;

/* Passport Authentication Setup */
var passport = require("passport");
var TwitterStrategy = require("passport-twitter").Strategy;
var ensureLogin = require("connect-ensure-login");

/*Passport Twitter Strategy and mongoDB setup */
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://max-vote.herokuapp.com/auth/twitter/callback"
  },
  /* authentication success callback that checks if a new database entry is necessary */
  function(token, tokenScret, profile, callback) {
    var userData = [];
    var validUser = true;

    MongoClient.connect(mongoURL, function(error, db) {
      if(error) console.error(error);

      //parse the required information from passport and add a polls array to the object
      var newUser = parseUserData(profile);
      newUser.polls = [];

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

/* Passport functions to serialize/deserialize user across the website via express sessions */
passport.serializeUser(function(user, callback) {
  callback(null, user);
});

passport.deserializeUser(function(object, callback) {
  callback(null, object)
});

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
  cookie: { secure: false, maxAge: 900000 }
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

/* GET home page and send user data */
router.get("/", function(request, response, next) {
  var currentUser = parseUserData(request.user);
  response.render("home", { title: "MaxVote | A simple live-polling resource", currentUser: currentUser });
});

/*GET logout request - ensure passport session is cleared and user redirected */
router.get("/logout", function(request, response, next) {
  request.logout();
  request.session.destroy(function(error) {
    response.redirect("/");
  });
});

/* GET login page. */
router.get("/login", function(request, response, next) {
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
  var currentUser = parseUserData(request.user);

  /* Connect to the database and retrieve the authenticated user's polls */
  MongoClient.connect(mongoURL, function(error, db) {
    if(error) { console.log("Error opening db: "  + error); }

    db.collection("users", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        collection.findOne({ username: currentUser.username }, function(error, document) {
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
router.post("/dashboard/add", ensureLogin.ensureLoggedIn("/login"), function(request, response, next) {
  var newPoll = request.body;
  var currentUser = parseUserData(request.user);

  /* Connect to database and use push operation to add poll to the user's polls */
  MongoClient.connect(mongoURL, function(error, db) {
    if(error) { console.error(error); }
    db.collection("users", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        collection.update(
          { username: currentUser.username },
          { $push: { polls: { $each: newPoll } } }
        );
        db.close();
        response.end();
      }
    });
  });
});

/* POST request from dashboard for removing a poll */
router.post("/dashboard/remove", ensureLogin.ensureLoggedIn("/login"), function(request, response, next) {
  var poll = request.body.name;
  var currentUser = parseUserData(request.user);

  /* Connect to the database and use pull operation to remove all entries with the specified
      poll name */
  MongoClient.connect(mongoURL, function(error, db) {
    if(error) { console.error(error); }

    db.collection("users", function(error, collection) {
      if(error) { console.error("Collection error: " + error); }
      else {
        collection.update(
          { username: currentUser.username },
          { $pull: { polls: { name: poll } } },
          { multi: true }
        );
        db.close();
        response.end();
      }
    });
  });
});

/* GET dynamic route for public poll voting - uses the username as parent and poll name
    as child */
router.get("/:dynamuser/:dynampoll", function(request, response, next) {
  var requestUsername = request.params.dynamuser;
  var requestPoll = request.params.dynampoll;

  MongoClient.connect(mongoURL, function(error, db) {
    if(error) { console.error(error); }

    db.collection("users", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        collection.findOne({ username: requestUsername }, function(error, document) {
          if(error) { console.error("Collection error: " + error); }
          if(document) {
            db.close();

            var pollData = {
              name: requestPoll,
              options: []
            };

            /* Filter the document polls for the required poll options, then add to scope variable */
            document.polls.forEach(function(poll) {
              if(poll.name === requestPoll || poll.name === requestPoll + "?") {
                pollData.options.push({name: poll.option});
              }
            });

            /* If there is poll data, render the page with the data. If not, bad url - page not found */
            if(pollData.length != 0) {
              response.render("vote", { title: "MaxVote | Public Poll", poll: pollData, user: requestUsername });
            } else {
              response.status(404);
              response.render("error", { message: "Page Not Found.", error: {} });
            }
          } else {
            db.close();
            response.status(404);
            response.render("error", { message: "Page Not Found.", error: {} });
          }

        });
      }
    });
  });
});

/* POST data from a public vote*/
router.post("/vote", function(request, response, next) {
  var username = request.body.username;
  var pollName = request.body.pollName;
  var choice = request.body.choice;

  MongoClient.connect(mongoURL, function(error, db) {
    if(error) { console.error(error); }

    db.collection("users", function(error, collection) {
      if(error) { console.error("Collection error: " + error); }
      else {
        /* find the matching poll by searching the username, poll choice, and poll name
            by taking into consideration the posibility of a ? mark */
        collection.update(
          { username: username, "polls.option" : choice,
          $or: [ {"polls.name" : pollName }, { "polls.name" : pollName + "?" } ] },
          { $inc: { "polls.$.value" : 1 } },
          false,
          true );
        db.close();
        response.end();
      }
    });
  });
});

/* HTTP page routing */
app.use("/", router);
app.use("/login", router);
app.use("/logout", router);
app.use("/auth/local", router);
app.use("/auth/twitter", router);
app.use("/dashboard", router);
app.use("/dashboard/add", router);
app.use("/dashboard/remove", router);
app.use("/:dynamuser/:dynampoll", router);
app.use("/vote", router);

/*
 * Error Handlers
 */


/* Catch 404 error and forward to error handler */
app.use(function(request, response, next) {
  var error = new Error("Not Found");
  error.status = 404;
  next(error);
});

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

/*
 * Custom Functions
 */

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
