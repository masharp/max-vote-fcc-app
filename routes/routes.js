var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(request, response, next) {
  request.session.lastPage = "/";
  response.render("home", { title: "MaxVote | A simple live-polling resource" });

});

/* GET signup page. */
router.get("/signup", function(request, response, next) {
  request.session.lastPage = "/signup";
  response.render("signup", { title: "MaxVote | Sign Up"});

});

/* GET login page. */
router.get("/login", function(request, response, next) {
  request.session.lastPage = "/login";
  response.render("login", { title: "MaxVote | Log in"});
});

/* GET dashboard page. */
router.get("/dashboard", function(request, response, next) {
  request.session.lastPage = "/dashboard";
  response.render("dashboard", { title: "MaxVote | Dashboard"});
});

/* GET settings page. */
router.get("/settings", function(request, response, next) {
  request.session.lastPage = "/settings";
  response.render("settings", { title: "MaxVote | Settings"});
});

module.exports = router;
