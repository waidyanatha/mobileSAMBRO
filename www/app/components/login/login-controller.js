"use strict";

angular.module("ngapp")
.controller("LoginController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$localStorage,$sessionStorage,$location){

    var ctrl = this;

    this.loginForm = {};
    this.auth = shared.info.auth;
    this.title = shared.info.title;
    this.sendForm = sendForm;
    this.hideErrorMessage = true;
    this.shared = shared;

    $http.defaults.headers.common.Authorization = 'Basic ';
    $localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";

    document.addEventListener("deviceready", function () {
        $cordovaStatusbar.overlaysWebView(false); // Always Show Status Bar
        $cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style
      }, false);

    function sendForm()
    {
      console.log('call this sendform');
      console.log(ctrl.loginForm.email);
      console.log(ctrl.loginForm.password);
      console.log(ctrl.shared.setHTTPHeaderAuth(ctrl.loginForm.email,ctrl.loginForm.password));

      var promiseLoadData = shared.loadDataLogin('http://sambro.geoinfo.ait.ac.th/eden/default/index/user_info',ctrl.loginForm.email,ctrl.loginForm.password);
      promiseLoadData.then(function(response) {
        console.log('success');
        $localStorage['username'] = ctrl.loginForm.email;
        $localStorage['password'] = ctrl.loginForm.password;

        $location.path("/main");
      }, function(reason) {
        console.log('failed');
       //$localStorage.$reset();
       ctrl.hideErrorMessage = false;
      });

    }


});
