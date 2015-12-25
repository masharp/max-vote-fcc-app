/* Module Dependencies */
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var parseUrl = require("parseurl");
var bodyParser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var twitterPassport = require("passport-twitter").Strategy;
var localPassport = require("passport-local");

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
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 600000 },
  store: new MongoStore( {
    url: url,
    //db: mongoDb
  }),
}));

/* View Engine setup */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/* Passport Authentication Setup */
app.use(passport.initialize());
app.use(passport.session());

/* GET home page. */
router.get("/", function(request, response, next) {
  //var sessionData = request.session;

  response.render("home", { title: "MaxVote | A simple live-polling resource" });

});

/* GET signup page. */
router.get("/signup", function(request, response, next) {
  //var sessionData = request.session;

  response.render("signup", { title: "MaxVote | Sign Up"});

});

/* POST new user signup data */
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

            /* if the documents are done being processed, initiate validation
               and DB insertion */
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

/* GET login page. */
router.get("/login", function(request, response, next) {
  //var sessionData = request.session;

  response.render("login", {
    title: "MaxVote | Log in"
  });

/*
  mongoDb.open(function(error, db) {
    if(error) { console.log("Error opening db: " + error); }

    db.collection("users", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        var userData = [];

        collection.find({}, function(error, documents) {
          documents.each(function(error, item) {
            if(error || !item) {
              db.close();
              response.render("login", {
                title: "MaxVote | Log in",
                userData: userData
              });
            }
            userData.push(item);
          });
        });
      }
    });
  });
  */
});

/* POST user login data */
router.post("/login", function(request, response, next) {

});

router.post("/login-twitter", passport.authenticate("twitter",
  {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
  })
);

/* GET dashboard page. */
router.get("/dashboard", function(request, response, next) {
  //var sessionData = request.session;

  mongoDb.open(function(error, db) {
    if(error) { console.log("Error opening db: "  + error); }

    db.collection("polls", function(error, collection) {
      if(error) { console.log("Collection error: " + error); }
      else {
        var pollData = [];

        collection.find({}, function(error, documents) {
          documents.each(function(error, item) {
            if(error || !item) {
              db.close();
              response.render("dashboard", {
                title: "MaxVote | Dashboard",
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

/* GET settings page. */
router.get("/settings", function(request, response, next) {
  //var sessionData = request.session;

  response.render("settings", {
    title: "MaxVote | Settings"
  });
});

/* HTTP page routing */
app.use("/", router);
app.use("/signup", router);
app.use("/signup/new", router);
app.use("/login", router);
app.use("/login-twitter", router);
app.use("/settings", router);
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
