var express = require("express");
var router = express.Router();

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
  response.render("login", { title: "MaxVote | Log in"});
});

/* GET dashboard page. */
router.get("/dashboard", function(rquest, response, next) {
  response.render("dashboard", { title: "MaxVote | Dashboard"});
});

/* GET settings page. */
router.get("/settings", function(request, response, next) {
  response.render("settings", { title: "MaxVote | Settings"});
});

module.exports = router;
