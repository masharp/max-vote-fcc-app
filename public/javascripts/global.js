(function() {
  var app = angular.module("votingApp", []);

  app.controller("PageController", function() {
    this.view = 0;
    this.authUser = false;
    this.username = "John";

    this.selectView = function(setView) {
      switch(setView) {
        case 0:
          $(".active").removeClass("active");
          $("#home-btn").parent().addClass("active");
          if(this.authUser) {
            this.view = 5;
            window.history.pushState({view: 5}, null, "dashboard");
            break;
          } else {
            this.view = 0;
            window.history.pushState({view: 0}, null, "home");
            break;
          }
        case 1:
          $(".active").removeClass("active");
          $("#signup-btn").parent().addClass("active");
          this.view = setView;
          window.history.pushState({view: 1}, null, "signup");
          break;
        case 2:
          $(".active").removeClass("active");
          $("#login-btn").parent().addClass("active");
          this.view = setView;
          window.history.pushState({view: 2}, null, "login");
          this.authUser = true;
          break;
        case 3:
          $(".active").removeClass("active");
          $("#settings-btn").parent().addClass("active");
          this.view = setView;
          window.history.pushState({view: 2}, null, "settings");
          break;
        case 4:
          $(".active").removeClass("active");
          $("#home-btn").parent().addClass("active");
          this.view = 0;
          window.history.pushState({view: 4}, null, "home");
          this.authUser = false;
          break;
        case 5:
          $(".active").removeClass("active");
          $("#home-btn").parent().addClass("active");
          this.view = setView;
          window.history.pushState({view: 5}, null, "dashboard");
          break;
        case 6:
          $(".active").removeClass("active");
          $("#home-btn").parent().addClass("active");
          this.view = setView;
        window.history.pushState({view: 6}, null, "newpoll");
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
