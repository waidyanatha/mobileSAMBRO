"use strict";

angular.module("ngapp")
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider,$routeProvider){

    

    $urlRouterProvider.otherwise("/login");

    $stateProvider.state("main", {
        url: "/main",
        templateUrl: "app/components/main/main.html",
        title: "Cordova Angular-Material",
        controller: "MainController",
        controllerAs: "main"
    });

    $stateProvider.state("login", {
        url: "/login",
        templateUrl: "app/components/login/login.html",
        title: "Login",
        controller: "LoginController",
        controllerAs: "login"
    });

}]);
