var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(request, response, next) {
  response.render("index", { title: "MaxVote | A simple live-polling resource" });
});

router.get("/signup", function(request, response, next) {
  response.render("signup", { title: "MaxVote | Sign Up"});
});

router.get("/login", function(request, response, next) {
  response.render("login", { title: "MaxVote | Log in"});
});

router.get("/dashboard", function(rquest, response, next) {
  response.render("dashboard", { title: "MaxVote | Dashboard"});
});

router.get("/settings", function(request, response, next) {
  response.render("settings", { title: "MaxVote | Settings"});
});

module.exports = router;
