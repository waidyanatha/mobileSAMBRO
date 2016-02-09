"use strict";

angular.module("ngapp", [ "ngTouch", "ui.router", "ngMdIcons", "ngMaterial", "ngCordova", "ngStorage" ,"ngMessages"])
// ngTouch is No Longer Supported by Angular-Material

.run(function(shared,$localStorage,$sessionStorage,$location){
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
