/*
 * Express-generated with author tweeks.
 */

/* Module Dependencies */
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var parseUrl = require("parseurl");
var bodyParser = require("body-parser");
var session = require("express-session");

/* HTTP page routes */
var routes = require("./routes/routes");

/* Express Application */
var app = express();

/*Express-Session session setup */
express().use(session({
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

/* HTTP page routing */
app.use("/", routes);
app.use("/signup", routes);
app.use("/login", routes);
app.use("/settings", routes);
app.use("/dashboard", routes);

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
