(function() {
  var app = angular.module("votingApp", ["ngCookies"]);

  /* NavBar controller */
  app.controller("NavController", ["$scope", "$cookies", function($scope, $cookies) {
    /* Manage a browser cookie to control cross-page navbar highlighting */
    $scope.cookie = $cookies.getObject("max-vote");
    if($scope.cookie === undefined) { $scope.cookie = 0; $cookies.put("max-vote", "0"); }

    /* Temp Test Object */
    $scope.data = {
      authUser: true,
      username: "John"
    };

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

  /* Home page controller */
  app.controller("HomeController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");

    $("#dashboard-signup").click(function() {
      $cookies.put("max-vote", "1");
      window.location.href = "/signup";
    });
  }]);

  /* Signup page controller */
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

  /* Settings page controller */
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

  /* Login page controller */
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

  /* Dashboard page controller */
  app.controller("DashController", ["$scope", "$cookies", function($scope, $cookies) {
    $cookies.remove("max-vote");

  }]);
})();


/*

-------------------------

    $scope.selectView = function(setView) {
      switch(setView) {
        case 0:
          if($scope.authUser) {
            $scope.authUser = true;
            window.location.href = "/dashboard";
            $scope.view = 5;
            break;
          } else {
            window.location.href = "/";
            $scope.view = 0;
            break;
          }
        case 1:
          window.location.href = "/signup";
          $scope.view = 1;
          break;
        case 2:
          window.location.href = "/login";
          $scope.authUser = true;
          $scope.view = 2;
          break;
        case 3:
          window.location.href = "/settings";
          $scope.view = 3;
          break;
        case 4:
          window.location.href = "/";
          $scope.authUser = false;
          $scope.view = 0;
          break;
        case 5:
          $scope.authUser = true;
          window.location.href = "/dashboard";
          $scope.view = 5;
          break;
        case 6:
          $scope.authUser = true;
          window.location.href = "/dashboard";
          $scope.view = 5;
          break;
      }
    };

    $scope.isSelected = function(checkView) {
      return $scope.view === checkView;
    };
    ---------------------------------------------------------
  app.controller("StoreController", ["$http", function($http) {
    $scope.products = gems;
    var store = $scope;
    store.products = [];

    $http.get("/products.json").success(function(data)  {
      store.products = data;
    });
  }]);
  app.controller("PanelController", function() {
    $scope.tab = 0;

    $scope.selectTab =  function(setTab) {
      $scope.tab = setTab;
    };

    $scope.isSelected = function(checkTab) {
      return $scope.tab === checkTab;
    }
  });
  app.controller("ReviewController", function() {
    $scope.review = {};

    $scope.addReview = function(product) {
      product.reviews.push($scope.review);
      $scope.review = {};
    }
  });
*/
