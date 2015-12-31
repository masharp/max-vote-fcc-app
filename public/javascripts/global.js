/* Max-Vote Web Application
  - This is an application that allows authenticated users to store polls and allow friends to vote.
    The authenticated user can share the poll via Twitter or a direct link. The authenticated user then
    can see live results as their friends vote. The results are displayed numerically and in a graph.

    JSON Structure
        POLL = {
          name: pollname
          options: [],
          results: []
        }
        USER = {
          id: id,
          name: name,
          username: username,
          polls: [poll, poll, poll]
        }
*/


(function() {
  var app = angular.module("votingApp", ["ngCookies"]);

  /*--------------- NavBar controller --------------------------- */
  app.controller("NavController", ["$scope", "$cookies", "$http", function($scope, $cookies, $http) {
    /* Manage a browser cookie to control cross-page navbar highlighting */
    $scope.cookie = $cookies.getObject("max-vote");

    if($scope.cookie === undefined) { $scope.cookie = 0; $cookies.put("max-vote", "0"); }

    $scope.user = user;

    if($scope.user) {
      $scope.data = {
        authUser: true,
        username: $scope.user.username
      }
    } else {
      $scope.data = {
        authUser: false,
        username: ""
      }
    }

    /* Function to trigger click events on the navbar and call the page route */
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
      }
    }

    $scope.logout = function() {
      $http.get("/logout").then(function() {
        $scope.data.authUser = false;
        $scope.data.username = "";

        window.location.href = "/";
      });
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
  app.controller("SignupController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");
    $(".fail-label").hide();

    $scope.signupTwitter = function() {
      window.location.href="http://127.0.0.1:3000/auth/twitter";
    };
  }]);

  /* ------------------ Login page controller ------------------ */
  app.controller("LoginController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");
    $("#login-fail").hide();

    /* Make a POST request to trigger server-side Passport authentication strategy */
    $scope.authenticateUserTwitter = function() {
      window.location.href="http://127.0.0.1:3000/auth/twitter";
    };
  }]);

  /* ------------------- Dashboard page controller ------------------*/
  app.controller("DashController", ["$scope", "$cookies","$http", function($scope, $cookies, $http) {
    $cookies.remove("max-vote");
    $scope.panel = 0;
    $scope.selectedPoll = -1;

    $scope.user = user;
    $scope.pollName = "";

    $scope.newPoll = {
      poll: {
        user: $scope.user.username,
        name: "",
        options: []
      },
      results: {
        name: "",
        values: []
      }
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

    /*Angular removePoll Control Function
        - takes the specific poll and POSTS it to the server to be removed */
    $scope.removePoll = function(poll) {
      var currentPoll = $scope.savedPolls[poll];

      $http.post("/dashboard/remove", currentPoll).then(function successCallback(response) {
        window.location.href = "/dashboard";
      });
    };

    /*Angular savePoll Controll Function
        - takes the poll and POSTS it to the server to be saved */
    $scope.savePoll = function() {
      //reset the newPoll options
      $scope.newPoll.poll.options = [];
      $scope.newLink = "";
      $scope.newPoll.poll.name = $scope.pollName;
      $scope.newPoll.results.name = $scope.pollName;

      $(".poll-option").each(function() {
        var optionText = $(this).val();
        $scope.newPoll.poll.options.push(optionText);
        $scope.newPoll.results.values.push(0);
      });

      $http.post("/dashboard/add", $scope.newPoll).then(function successCallback(response) {
        $scope.newLink = "localhost:3000/" + $scope.user.username + "/" + $scope.pollName;
        $scope.selectPanel(2);
      });
    };

    /* jQuery Event Delegation for dynamically removing element associated with the 'i' element selector */
    $(document).on("click", "i.fa-times", function(event) {
      $(this).prev().remove();
      $(this).next().remove(); //removes the leftover whitespace
      $(this).remove();

      //reset the options to remove the deleted option value
      $scope.newPoll.options = [];
    });
    /* ------ */

    /* Angular MyPolls Control Functions */
    $scope.selectPoll = function(poll) {
      google.load("visualization", "1", {"packages":["corechart"], "callback": drawChart});

      var currentPoll = $scope.savedPolls[poll]; //capture the current poll object from Angular scope
      var pollData = [["Options", "Results"]]; //begin with the chart titling

      //transfer poll data from capture array to full chart array (including chart titling)
      for(var i = 0; i < currentPoll.options.length; i++) {
        pollData.push([currentPoll.options[i], Number(currentPoll.results[i])]);
      };

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
  }]);

  /* ------------------ Voting page controller ------------------ */
  app.controller("VoteController", ["$scope", "$http", function($scope, $http) {
    $scope.panel = 0;
    $scope.pollData = pollData;
    $scope.username = username;
    $scope.choiceIndex = 0;

    $scope.vote = function() {
      var vote = {
        username: $scope.username,
        pollName: $scope.pollData.name,
        choice: $scope.choiceIndex
      }

      $http.post("/vote", vote).then(function successCallback(response) {
        $scope.selectPanel(1);
      });
    };

    /* Angular Panel Control Functions */
    $scope.selectPanel =  function(panel) {
      $scope.panel = panel;
    };
    $scope.isSelected = function(panel) {
      return $scope.panel === panel;
    };
    /* ------ */

  }]);
})();
