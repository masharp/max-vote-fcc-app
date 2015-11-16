(function() {
  var app = angular.module("votingApp", []);

  app.controller("PageController", function() {
    this.view = 0;
    this.authUser = false;
    this.username = "John";

    this.selectView = function(setView) {
      this.view = setView;

      switch(setView) {
        case 0:
          $(".active").removeClass("active");
          $("#home-btn").parent().addClass("active");
          break;
        case 1:
          $(".active").removeClass("active");
          $("#signup-btn").parent().addClass("active");
          break;
        case 2:
          $(".active").removeClass("active");
          $("#welcome-nav").parent().addClass("active");
          this.authUser = true;
          break;
        case 3:
          $(".active").removeClass("active");
          $("#settings-btn").parent().addClass("active");
          break;
        case 4:
          $(".active").removeClass("active");
          $("#home-btn").parent().addClass("active");
          this.authUser = false;
          break;
      }
    };

    this.isSelected = function(checkView) {
      return this.view === checkView;
    };
  });
})();


/*
  app.controller("StoreController", ["$http", function($http) {
    this.products = gems;
    var store = this;
    store.products = [];

    $http.get("/products.json").success(function(data)  {
      store.products = data;
    });
  }]);
  app.controller("PanelController", function() {
    this.tab = 0;

    this.selectTab =  function(setTab) {
      this.tab = setTab;
    };

    this.isSelected = function(checkTab) {
      return this.tab === checkTab;
    }
  });
  app.controller("ReviewController", function() {
    this.review = {};

    this.addReview = function(product) {
      product.reviews.push(this.review);
      this.review = {};
    }
  });
*/
