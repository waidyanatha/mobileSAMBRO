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
  } else {
    console.log("Running in browser, bootstrapping AngularJS now.");
    angular.bootstrap(document.body, ['ngapp']);
  }
});

angular.module("ngapp", [ "ngTouch", "ui.router", "ngMdIcons", "ngMaterial", "ngCordova", "ngStorage" ,"ngMessages"])
// ngTouch is No Longer Supported by Angular-Material

.run(function(shared,$localStorage,$sessionStorage,$location,$cordovaSQLite,$cordovaDialogs, $cordovaDevice,$cordovaStatusbar,$cordovaPush,$rootScope,$cordovaMedia){
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

  $cordovaStatusbar.overlaysWebView(false); 
  $cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style
  $cordovaStatusbar.show();

  //$cordovaDialogs.alert('Test', 'Test Body', 'OK');
  //sqlite
  console.log('TEST MOBILE');

  dbShared = $cordovaSQLite.openDB({name: "offline_data.db" });
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_user (email text, pwd text,expired integer,active_user integer,device_token_id text,user_id integer,profile_json text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS t_alert (id integer primary key, cap_info_headline text, cap_area_name text, cap_scope text,event_event_type_name text,sent TEXT)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS t_alert_offline (id INTEGER PRIMARY KEY AUTOINCREMENT, created_time text, data_form text);");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_event_type (id integer primary key, name text,icon text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_response_type (fvalue text, name text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_urgency (fvalue text, name text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_certainty (fvalue text, name text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_severity (fvalue text, name text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_scope (fvalue text, name text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_status (fvalue text, name text)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_warning_priority (id integer primary key, name text,priority_rank text, color_code text, severity text, certainty text, urgency text, event_type_id integer)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_template (id integer primary key, template_title text, cap_scope text, cap_info_category text, cap_info_response_type text, event_event_type_id integer)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS m_predefined_area (id integer primary key, name text, event_type_id integer,location_id integer)");
  $cordovaSQLite.execute(dbShared,"CREATE TABLE IF NOT EXISTS sync_data_master (periodic_sync integer, time_sync text)"); 

  var androidConfig = {
    "senderID": "70029886742",
  };

  $cordovaPush.register(androidConfig).then(function(result) {
      // Success
      console.log('success cordovaPush');
      console.log(result);
    }, function(err) {
      console.log('error cordovaPush');
      console.log(err);
      // Error
    });

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

    var srcSound = "file:///android_asset/www/assets/sound/sound.mp3";
    mediaSound = $cordovaMedia.newMedia(srcSound);
    mediaSound.setVolume(1.0);
    //mediaSound.play(); 


    console.log('end controller app.js');
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
