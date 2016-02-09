"use strict";

angular.module("ngapp")
.controller("MainController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage){

    shared.checkUserCached();

    var ctrl = this;

    this.auth = shared.info.auth;
    this.username = $localStorage['username'];

    this.toggle = angular.noop;

    this.title = shared.info.title;
    this.logout = shared.logout;

    document.addEventListener("deviceready", function () {
        //alert('test0_');
        $cordovaStatusbar.overlaysWebView(false); // Always Show Status Bar
        $cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style
        //window.plugins.orientationLock.lock("portrait");

        //alert('test1');    
        //$cordovaDialogs.alert('deviceready', 'Message', 'OK');

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
           //$cordovaDialogs.alert('success', 'Message', 'OK');
           //$cordovaDialogs.alert('Lon = '+position.coords.longitude+" , Lat = "+position.coords.latitude, 'Message', 'OK');
          ctrl.longitude = position.coords.longitude;
          ctrl.latitude = position.coords.latitude;

        }, function(err) {
          // error
        });


      }, false);


    this.isOpen = function() { return false };
    $mdComponentRegistry
    .when("left")
    .then( function(sideNav){
      ctrl.isOpen = angular.bind( sideNav, sideNav.isOpen );
      ctrl.toggle = angular.bind( sideNav, sideNav.toggle );
    });

    this.toggleRight = function() {
    $mdSidenav("left").toggle()
        .then(function(){
        });
    };

    this.close = function() {
    $mdSidenav("right").close()
        .then(function(){
        });
    };

    this.dataAlerts = {};
    var promiseLoadData = shared.loadDataAlert('http://sambro.geoinfo.ait.ac.th/eden/cap/alert.json');
    promiseLoadData.then(function(response) {
      //console.log(response);
      ctrl.dataAlerts = new Array();
      for(var i=0;i<response.length;i++){
        var capInfoHeadline = response[i]['cap_info.headline'];
        console.log(angular.isArray(capInfoHeadline));
        if(angular.isArray(capInfoHeadline)){
          capInfoHeadline = response[i]['cap_info.headline'][0];
        }
        var dataAlert = {
          'cap_info.headline': angular.isArray(response[i]['cap_info.headline']) ? response[i]['cap_info.headline'][0] : response[i]['cap_info.headline'],
          'cap_area.name':angular.isArray(response[i]['cap_area.name']) ? response[i]['cap_area.name'][0] : response[i]['cap_area.name'],
          'scope':response[i].scope,
          'event_event_type.name':angular.isArray(response[i]['event_event_type.name']) ? response[i]['event_event_type.name'][0] : response[i]['event_event_type.name']
        };

        ctrl.dataAlerts.push(dataAlert);
      }
      //ctrl.dataAlerts = response;
    }, function(reason) {
      console.log('Failed: ' + reason);
    });


});
