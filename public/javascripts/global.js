/* Max-Vote Web Application
  - This is an application that allows authenticated users to store polls and allow friends to vote.
    The authenticated user can share the poll via Twitter or a direct link. The authenticated user then
    can see live results as their friends vote. The results are displayed numerically and in a graph.

    JSON Structure
        USER = {
          id: id,
          name: name,
          username: username,
          polls: [ {
            name: pollName,
            option: pollOption,
            value: result
          }],
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

    /* Angular removePoll Control Function
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
      var newPoll = [];

      $(".poll-option").each(function() {
        var newOption = {
          name: $scope.pollName,
          option: $(this).val(),
          value: 0
        };
        newPoll.push(newOption);
      });

      $http.post("/dashboard/add", newPoll).then(function successCallback(response) {
        $scope.newLink = "localhost:3000/" + $scope.user.username + "/" + $scope.pollName;
        $scope.selectPanel(2);

        setTimeout(function() {
          window.location.href = "/dashboard";
        }, 5000);
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
      currentPoll.options.forEach(function(option) {
        pollData.push([option.name, Number(option.value)]);
      });

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
    /* Function that takes the raw database information and creates a usable array of polls.
        Begins by filtering unique polls by name and then adding each unique option+result to it's
        corresponding unique poll. */
    $scope.filterPollData = function(pollData) {
      var polls = [];

      //Get unique polls
      pollData.forEach(function(data) {
        var found = false;
        polls.forEach(function(poll) {
          if(poll.name === data.name) { found = true; return; }
        });
        if(!found) {
          polls.push({ name: data.name, options: [] });
        }
      });

      //Get unique options for each poll
      pollData.forEach(function(data) {
        var found = false;

        //check if option is found in each poll
        polls.forEach(function(poll) {
          poll.options.forEach(function(option) {
            if(option.name === data.option) { found = true; return; }
          });
        });

        if(!found) {
          polls.forEach(function(poll) {
            if(poll.name === data.name) {
              poll.options.push({ name: data.option, value: data.value })
            }
          });
        }
      });

      return polls;
    };
  }]);

  /* ------------------ Voting page controller ------------------ */
  app.controller("VoteController", ["$scope", "$http", function($scope, $http) {
    $scope.panel = 0;
    $scope.pollData = pollData;
    $scope.username = username;

    $scope.vote = function() {
      var vote = {
        username: $scope.username,
        pollName: $scope.pollData.name,
        choice: $("input[name=poll]:checked").val()
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
