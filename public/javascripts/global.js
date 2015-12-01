/* Max-Vote Web Application
  - This is an application that allows authenticated users to store polls and allow friends to vote.
    The authenticated user can share the poll via Twitter or a direct link. The authenticated user then
    can see live results as their friends vote. The results are displayed numerically and in a graph.

    JSON Structure
        POLL = {
          _id: id,
          user: user_id,
          name: pollname
          options: [],
          results: []
        }
        USER = {
          _id: id,
          name: username,
          email: userEmail,
          password: userPassword
        }
*/


(function() {
  var app = angular.module("votingApp", ["ngCookies"]);

  /*--------------- NavBar controller --------------------------- */
  app.controller("NavController", ["$scope", "$cookies", function($scope, $cookies) {
    /* Manage a browser cookie to control cross-page navbar highlighting */
    $scope.cookie = $cookies.getObject("max-vote");
    var tCookie = $cookies.getObject("max-vote0.0.1");
    console.log("Session Cookie: " + tCookie);
    if($scope.cookie === undefined) { $scope.cookie = 0; $cookies.put("max-vote", "0"); }

    /* Temp Test Object */
    $scope.data = {
      authUser: false,
      username: "John"
    };

    /*Function to trigger click events on the navbar and call the page route*/
    $scope.changePage = function(page) {

      switch(page) {
        case 0:
          if(!$scope.data.authUser) {
            $cookies.put("max-vote", "0");
            window.location.href = "/";
            break;
          } else {
            $cookies.put("max-vote", "5");
            window.location.href = "/dashboard";
            break;
          }
        case 1:
          $cookies.put("max-vote", "1");
          window.location.href = "/signup";
          break;
        case 2:
          $cookies.put("max-vote", "2");
          window.location.href = "/login";
          break;
        case 3:
          $cookies.put("max-vote", "3");
          window.location.href = "/settings";
          break;
        case 4:
          $cookies.put("max-vote", "0");
          window.location.href = "/";
          break;
      }
    }
  }]);

  /* ------------------- Home page controller ------------------- */
  app.controller("HomeController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");

    $("#dashboard-signup").click(function() {
      $cookies.put("max-vote", "1");
      window.location.href = "/signup";
    });
  }]);

  /*---------------- Signup page controller ------------------------ */
  app.controller("SignupController", ["$scope", "$cookies", "$http", function($scope, $cookies, $http) {
    $cookies.remove("max-vote");
    $(".fail-label").hide();

    $("input").click(function() {
      $(".fail-label").hide();
    });

    $scope.signupGeneric = function() {
      var newUser = {
        name: $("#signup-name").val(),
        email: $("#signup-email").val(),
        password: $("#signup-pass").val()
      }
      var wait = false;

      //form validation gateways and then an $http post to save new user
      if(!newUser.name) {
        $("#name-fail").show();
        wait = true;
      } if(!newUser.email || !validateEmailAddress(newUser.email)) {
        $("#email-fail").show();
        wait = true;
      } if(newUser.password.length < 5) {
        $("#password-fail").show();
        wait = true;
      } if(!wait) {
        $http.post("/signup/new", newUser)
          .success(function(data) {
            console.log("Signup Successful " + data);
          })
          .error(function(data) {
            console.log("Signup Failed " + data);
          });
      }
    };

    $scope.signupTwitter = function() {
      console.log("Signing up with Twitter...");
    };

    //simple regex for checking the validity of most email addresses
    function validateEmailAddress(email) {
      var regx = /\S+@\S+\.\S+/;
      return regx.test(email);
    };
  }]);

  /* ----------- Settings page controller ---------------- */
  app.controller("SettingsController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");

    var changePass = {
      current: function() { return $("#settings-current").val(); },
      new: function() { return $("#settings-new").val(); }
    }
    $("#settings-btn").click(function() {
      console.log("settings clicked");
    });
  }]);

  /* ------------------ Login page controller ------------------ */
  app.controller("LoginController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");
    $("#login-fail").hide();

    $("input").click(function() {
     $("#login-fail").hide();
    });

    var userLogin = {
      email: function() { return $("#login-email").val(); },
      password: function() { return $("#login-pass").val(); }
    }

    $scope.authenticateUserGeneric = function() {
      var userEmail = userLogin.email();
      var userPassword = userLogin.password();
      console.log(userEmail + " " + userPassword);

     $scope.users.forEach(function(user) {
        if(userEmail === user.email && userPassword === user.password) {
          window.location.href = "/dashboard";
        } else {
          $("#login-fail").show();
        }
      });
    }
    $scope.authenticateUserTwitter = function() {
      console.log("Twitter Authenticating...");
    }
  }]);

  /* ------------------- Dashboard page controller ------------------*/
  app.controller("DashController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");
    $scope.panel = 0;
    $scope.selectedPoll = -1;

    var newPoll = {
      name: "",
      options: []
    };

    /* Angular Panel Control Functions */
    $scope.selectPanel =  function(panel) {
      $scope.panel = panel;
    };
    $scope.isSelected = function(panel) {
      return $scope.panel === panel;
    };
    /* ------ */

    /* Angular NewPoll Control Function */
    $scope.addOption = function() {
      $scope.option++;

      var newOption = "<input class='poll-option' type='text' placeholder='Option'><i class='fa fa-times'></i></br>";
      $("#newpoll-inputs").append(newOption);
    };

    $scope.savePoll = function() {
      newPoll.name = $("#poll-name").val();

      $(".poll-option").each(function() {
        var optionText = $(this).val();
        newPoll.options.push(optionText);
      });

      //reset the newPoll object
      newPoll.options = [];
      newPoll.name = "";
    };

    /* jQuery Event Delegation for dynamically removing element associated with the 'i' element selector */
    $(document).on("click", "i", function(event) {
      $(this).prev().remove();
      $(this).next().remove(); //removes the leftover whitespace
      $(this).remove();

      //reset the options to remove the deleted option value
      newPoll.options = [];
    });
    /* ------ */

    /* Angular MyPolls Control Functions */
    $scope.selectPoll = function(poll) {
      google.load("visualization", "1", {"packages":["corechart"], "callback": drawChart});

      var currentPoll = $scope.savedPolls[poll]; //capture the current poll object from Angular scope
      var pollData = [["Options", "Results"]]; //begin with the chart titling

      //transfer poll data from capture array to full chart array (including chart titling)
      for(var i = 0; i < currentPoll.options.length; i++) {
        pollData.push([currentPoll.options[i], currentPoll.results[i]]);
      };

      console.log(pollData);

      function drawChart() {
        var chartData = google.visualization.arrayToDataTable(pollData);

        var chart = new google.visualization.PieChart(document.getElementById("poll-" + poll));
        chart.draw(chartData);
      };

      $scope.selectedPoll =  poll; // display the poll via Angular
    };

    $scope.pollSelected = function(poll) {
      return $scope.selectedPoll === poll;
    };
    $scope.sharePoll = function(poll) {

    };

    /* jQuery Event Delegation for dynamically removing a poll and updating the UI */
    $(document).on("click", "#poll-remove-btn", function(event) {
      $(this).parent().parent().remove();
      $(this).next().remove();

      console.log("boo");
    });

  }]);
})();
