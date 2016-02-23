"use strict";

angular.element(document).ready(function () {
  if (window.cordova) {
    console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
    document.addEventListener('deviceready', function () {
      console.log("Deviceready event has fired, bootstrapping AngularJS.");
      angular.bootstrap(document.body, ['ngapp']);
    }, false);
  } else {
    console.log("Running in browser, bootstrapping AngularJS now.");
    angular.bootstrap(document.body, ['ngapp']);
  }
});


angular.module("ngapp", [ "ngTouch", "ui.router", "ngMdIcons", "ngMaterial", "ngCordova", "ngStorage" ,"ngMessages"])
// ngTouch is No Longer Supported by Angular-Material

.run(function(shared,$localStorage,$sessionStorage,$location,$cordovaSQLite,$cordovaDialogs, $cordovaDevice){
  // $localStorage['username'] = ctrl.loginForm.email;
  // $localStorage['password'] = ctrl.loginForm.password;

  // $location.path("/main");

  if($localStorage['username'] == ""){
    $location.path("/login");
  }

  console.log($localStorage['username']);
  /* Hijack Android Back Button (You Can Set Different Functions for Each View by Checking the $state.current)
  document.addEventListener("backbutton", function (e) {
      if($state.is('init')){
        navigator.app.exitApp();
      }  else{
        e.preventDefault();
      }
    }, false);*/

        //$cordovaDialogs.alert('Test', 'Test Body', 'OK');
        //sqlite
        //dbShared = $cordovaSQLite.openDB({name: "offline_data.db" });
        // $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS event_type (id integer primary key, name text)");
        // $scope.execute = function() {
        //   var query = "INSERT INTO event_type (id, name) VALUES (?,?)";
        //   $cordovaSQLite.execute(dbShared, query, [1, "abc"]).then(function(res) {
        //     console.log("insertId: " + res.insertId);
        //     //$cordovaDialogs.alert('insertId', res.insertId, 'OK');
        //   }, function (err) {
        //     //$cordovaDialogs.alert('err', err, 'OK');
        //     console.error(err);
        //   });
        // };
        // $scope.execute();

        // $scope.select = function() {
        // var query = "SELECT * FROM event_type";
        //     $cordovaSQLite.execute(dbShared,query).then(function(result) {
        //         if(result.rows.length > 0) {
        //             //$cordovaDialogs.alert('row db ', "SELECTED -> " + result.rows.item(0).id + " " + result.rows.item(0).name, 'OK');
        //             console.log("SELECTED -> " + result.rows.item(0).id + " " + result.rows.item(0).name);
        //         } else {
        //             console.log("NO ROWS EXIST");
        //         }
        //     }, function(error) {
        //         console.error(error);
        //     });
        // };
        // $scope.select();

        // console.log(dbShared);
      
})
.factory("interceptors_", [function() {

        return {

            // if beforeSend is defined call it
            'request': function(request) {

                if (request.beforeSend)
                    request.beforeSend(request);

                return request;
            },


            // if complete is defined call it
            'response': function(response) {

                if (response.config.complete)
                    response.config.complete(response);

                return response;
            }
        };

}])
.config(function($mdThemingProvider,$httpProvider) { 
  // Register interceptors service
  $httpProvider.interceptors.push('interceptors_');

  // Angular-Material Color Theming  
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('blue');
});
