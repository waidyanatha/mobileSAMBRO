"use strict";

angular.module("ngapp")
.controller("LoginController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$localStorage,$sessionStorage,$location){
    var ctrl = this;

    $cordovaStatusbar.overlaysWebView(false); // Always Show Status Bar
    $cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style

    ctrl.loginForm = {};
    ctrl.auth = shared.info.auth;
    ctrl.title = shared.info.title;
    ctrl.sendForm = sendForm;
    ctrl.hideErrorMessage = true;
    ctrl.shared = shared;

    $localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";

    function sendForm()
    {
      console.log('call this sendform');
      console.log(ctrl.loginForm.email);
      console.log(ctrl.loginForm.password);
      console.log(ctrl.shared.setHTTPHeaderAuth(ctrl.loginForm.email,ctrl.loginForm.password));

      var promiseLoadData = shared.loadDataLogin(shared.apiUrl+'default/index/user_info',ctrl.loginForm.email,ctrl.loginForm.password);
      promiseLoadData.then(function(response) {
        console.log('success');
        console.log(response);
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
