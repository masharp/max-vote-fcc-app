var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var routes = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/signup", routes);
app.use("/login", routes);
app.use("/settings", routes);
app.use("/dashboard", routes);

// catch 404 and forward to error handler
app.use(function(request, response, next) {
  var error = new Error("Not Found");
  error.status = 404;
  next(error);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(error, request, response, next) {
    response.status(error.status || 500);
    response.render("error", {
      message: error.message,
      error: error
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(error, request, response, next) {
  response.status(error.status || 500);
  response.render("error", {
    message: error.message,
    error: {}
  });
});

module.exports = app;
