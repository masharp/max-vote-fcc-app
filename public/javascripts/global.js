(function() {
  var app = angular.module("votingApp", []);

  app.controller("PageController", ["$scope", function($scope) {
    $scope.view = 0;
    $scope.authUser = false;
    $scope.username = "John";

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
  }]);
})();


/*
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
