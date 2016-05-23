"use strict";

angular.element(document).ready(function () {
  if (window.cordova) {
    console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
    document.addEventListener('deviceready', function () {
      console.log("Deviceready event has fired, bootstrapping AngularJS.");
      angular.bootstrap(document.body, ['ngapp']);
    }, false);

    document.addEventListener("resume", function(){
      console.log("Device resume event has fired");
    }, false);

    document.addEventListener("pause", function(){
      console.log("Device pause event has fired");
    }, false);

    document.addEventListener("backbutton", function(){
        callBackButton();
    }, false);
  } else {
    console.log("Running in browser, bootstrapping AngularJS now.");
    angular.bootstrap(document.body, ['ngapp']);
  }
});

angular.module("ngapp", [ "ngTouch", "ui.router", "ngMdIcons", "ngMaterial", "ngCordova", "ngStorage" ,"ngMessages"])
// ngTouch is No Longer Supported by Angular-Material

.run(function(shared,$localStorage,$sessionStorage,$location,$cordovaSQLite,$cordovaDialogs, $cordovaDevice,$cordovaStatusbar,$cordovaPush,$rootScope,$cordovaMedia,$cordovaNetwork){
  // $localStorage['username'] = ctrl.loginForm.email;
  // $localStorage['password'] = ctrl.loginForm.password;

  // $location.path("/main");
  
  //http://203.159.29.15:8181/eden/
  //http://sambro.geoinfo.ait.ac.th/eden/
  $localStorage['serverUrl'] = "http://sambro.geoinfo.ait.ac.th/eden/";

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

  $cordovaStatusbar.overlaysWebView(false); 
  $cordovaStatusbar.styleHex('#e2a704'); // Status Bar With Red Color, Using Angular-Material Style
  $cordovaStatusbar.show();

  //$cordovaDialogs.alert('Test', 'Test Body', 'OK');
  //sqlite
  console.log('TEST MOBILE');

  var androidConfig = {
    "senderID": "70029886742"
  };

  var isNetworkOnline = $cordovaNetwork.isOnline();
  if(isNetworkOnline){
    $cordovaPush.register(androidConfig).then(function(result) {
      // Success
      console.log('success cordovaPush');
      console.log(result);
    }, function(err) {
      console.log('error cordovaPush');
      console.log(err);
      // Error
    });
  }

  var srcSound = "/android_asset/www/assets/sound/sound.mp3";
  //file:///android_asset/www/app/app.js
  mediaSound = $cordovaMedia.newMedia(srcSound);
  mediaSound.setVolume(1.0);
  //mediaSound.play(); 

  $localStorage['deviceTokenId'] = "";
  $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
    console.log('listener cordovaPush');
    console.log(notification.event);
    switch(notification.event) {
      case 'registered':
        if (notification.regid.length > 0 ) {
          $localStorage['deviceTokenId'] = notification.regid;
          console.log('registration ID = ' + notification.regid);
        }
        break;

      case 'message':
        mediaSound.play(); 
        // this is the actual push notification. its format depends on the data model from the push server
        console.log('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
        break;

      case 'error':
        console.log('GCM error = ' + notification.msg);
        break;

      default:
        alert('An unknown GCM event has occurred');
        break;
    }
  });

  // WARNING: dangerous to unregister (results in loss of tokenID)
  //$cordovaPush.unregister(options).then(function(result) {
    // Success!
  //}, function(err) {
    // Error
  //})

  //background service always running
  //myService = cordova.plugins.myService;
  //getStatus();

  //var timerCount = 0;
  // window.plugins.BackgroundJS.LockBackgroundTime(function(){}, function(msg){console.log(msg);});
  // setInterval(function() {
  // console.log(timerCount++);
  // },1000);

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
