/* Module Dependencies */
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var parseUrl = require("parseurl");
var bodyParser = require("body-parser");
var session = require("express-session");

/* MongoDB setup */
var mongo = require("mongodb").MongoClient;
var database = require("mongodb").Db;
var server = require("mongodb").Server;
var url = "mongodb://localhost:27017/max-vote";
var db = new database("max-vote", new server("localhost", 27017));
/*
mongo.connect(url, function(error, database) {
  if(error) {
    console.log("Unable to connect. Error: " + error);
  } else {
    console.log("Connnection to: " + url + " complete!");
    db = database;
  }
});
*/

/* Express Application */
var app = express();

/* HTTP page routes */
var router = express.Router();

/*Express-Session session setup */
app.use(session({
  name: "max-vote0.0.0",
  secret: "m-l-h-93",
  resave: false,
  saveUninitialized: false
}));

/* View Engine setup */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* GET home page. */
router.get("/", function(request, response, next) {
  response.render("home", { title: "MaxVote | A simple live-polling resource" });

});

/* GET signup page. */
router.get("/signup", function(request, response, next) {
  response.render("signup", { title: "MaxVote | Sign Up"});

});

/* GET login page. */
router.get("/login", function(request, response, next) {

  db.open(function(error, db) {
    if(error) {
      console.log("Error opening db: " + error);
    } else {
      console.log("Database opened.");
    }
    db.collection("users", function(error, collection) {
      var userData = [];

      collection.find({}, function(error, documents) {
        documents.each(function(error, item) {
          if(error || !item) {
            console.log("Database closed.");
            db.close();
            response.render("login", {
              title: "MaxVote | Log in",
              users: userData
            });
          }
          userData.push(item);
        });
      });
    });
  })
});

/* GET dashboard page. */
router.get("/dashboard", function(request, response, next) {
  db.open(function(error, db) {
    if(error) {
      console.log("Error opening db: "  + error);
    } else {
      console.log("Database opened.");
    }

    db.collection("polls", function(error, collection) {
      var pollData = [];

      collection.find({}, function(error, documents) {
        documents.each(function(error, item) {
          if(error || !item) {
            console.log("Database closed.")
            db.close();
            response.render("dashboard", {
              title: "MaxVote | Dashboard",
              pollData: pollData
            });
          }
          pollData.push(item);
        });
      });
    });
  });
});

/* GET settings page. */
router.get("/settings", function(request, response, next) {
  response.render("settings", {
    title: "MaxVote | Settings"
  });
});

/* Dashboard GET data */
router.get("/dashboard/data", function(request, response, next) {

});

/* HTTP page routing */
app.use("/", router);
app.use("/signup", router);
app.use("/login", router);
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

/* MongoDB Functionality */

module.exports = app;
