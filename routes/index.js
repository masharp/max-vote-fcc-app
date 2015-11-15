var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(request, response, next) {
  response.render("index", { title: "MaxVote | A simple live-polling resource." });
});

module.exports = router;
