(function() {
  var app = angular.module("votingApp", ["ngCookies"]);

  /*--------------- NavBar controller --------------------------- */
  app.controller("NavController", ["$scope", "$cookies", function($scope, $cookies) {
    /* Manage a browser cookie to control cross-page navbar highlighting */
    $scope.cookie = $cookies.getObject("max-vote");
    if($scope.cookie === undefined) { $scope.cookie = 0; $cookies.put("max-vote", "0"); }

    /* Temp Test Object */
    $scope.data = {
      authUser: true,
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
  app.controller("SignupController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");

    var userObj = {
      name: function() { return $("#signup-name").val(); },
      email: function() { return $("#signup-email").val(); },
      password: function() { return $("#signup-pass").val(); }
    }

    $("#generic-signup").click(function() {
      console.log("generic clicked");
    });
    $("#twitter-signup").click(function() {
      console.log("twitter clicked");
    });

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

    var userLogin = {
      email: function() { return $("#login-email").val(); },
      password: function() { return $("#login-pass").val(); }
    }

    $("#generic-login").click(function() {
      console.log("generic clicked");
    });
    $("#twitter-login").click(function() {
      console.log("twitter clicked");
    });
  }]);

  /* ------------------- Dashboard page controller ------------------*/
  app.controller("DashController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");
    $scope.panel = 0;
    $scope.poll = -1;

    $scope.savedPolls = [
      {
        name: "Helloasdasdasdasdasdadasdadasssssssssssssssssssssssssssssssssdadasdadsada?",
        options: ["Yes", "No"],
        results: [2, 3]
      },
      {
        name: "Hello?",
        options: ["Yes", "No"],
        results: [4, 5]
      },
      {
        name: "Hello?",
        options: ["Yes", "No"],
        results: [1, 0]
      },
    ];

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
      var currentPoll = $scope.savedPolls[poll]; //capture the current poll

      /* Assign Plotly chart attributes */
      var chartData = [{
        values: currentPoll.results,
        labels: currentPoll.options,
        type: "pie"
      }];

      /* Assign Plotly chart styling */
      var chartLayout = {
        height: 300,
        width: 300
      };

      /* Instantiate a new chart on the given DOM element */
      Plotly.newPlot("poll-" + poll, chartData, chartLayout);


      $scope.poll =  poll; // display the poll via Angular
    }

    $scope.pollSelected = function(poll) {
      return $scope.poll === poll;
    }
    
    /* jQuery Event Delegation for dynamically removing a poll and updating the UI */
    $(document).on("click", ".poll-remove-btn", function(event) {
      $(this).parent().parent().remove();
      $(this).next().remove();

      console.log("boo");
    });

  }]);
})();
