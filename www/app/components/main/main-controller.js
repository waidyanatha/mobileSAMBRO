"use strict";

angular.module("ngapp")
.controller("MainController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage,$cordovaSQLite,$cordovaNetwork){
    var ctrl = this;

    var typeNetwork = $cordovaNetwork.getNetwork();
    var isNetworkOnline = $cordovaNetwork.isOnline();
    var isNetworkOffline = $cordovaNetwork.isOffline();

    console.log('network');
    console.log(typeNetwork);
    console.log(isNetworkOnline);
    console.log(isNetworkOffline);

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      console.log('online listener');
      var onlineState = networkState;
      console.log(onlineState);
      
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      console.log('offline listener');
      var offlineState = networkState;
      console.log(offlineState);
      
    });

      //$cordovaStatusbar.overlaysWebView(true); // Always Show Status Bar = false
      //$cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style

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

      shared.checkUserCached();

      ctrl.auth = shared.info.auth;
      ctrl.username = $localStorage['username'];

      ctrl.toggle = angular.noop;
      ctrl.addAlert = function(){
        $location.path("/alert-form");
      }

      ctrl.title = shared.info.title;
      ctrl.logout = shared.logout;

      ctrl.isOpen = function() { return false };
      $mdComponentRegistry
      .when("left")
      .then( function(sideNav){
        ctrl.isOpen = angular.bind( sideNav, sideNav.isOpen );
        ctrl.toggle = angular.bind( sideNav, sideNav.toggle );
      });

      ctrl.toggleRight = function() {
      $mdSidenav("left").toggle()
          .then(function(){
          });
      };

      ctrl.close = function() {
      $mdSidenav("right").close()
          .then(function(){
          });
      };



      //============================================================ Alert ============================================================
      ctrl.dataAlerts = {};

      ctrl.insertAlert = function(dataAlert) {
        var query = "insert into t_alert (id, cap_info_headline, cap_area_name, cap_scope,event_event_type_name,sent) values (?,?,?,?,?,?)";
        $cordovaSQLite.execute(dbShared, query, [dataAlert.id, dataAlert['cap_info.headline'],dataAlert['cap_area.name'],dataAlert['scope'],dataAlert['event_event_type.name'],dataAlert['sent']]).then(function(result) {
          console.log("insert alert");
          
        }, function (err) {
          //$cordovaDialogs.alert('err', err, 'OK');
          console.error(err);
        });
      };
      ctrl.deleteAlert = function() {
        var query = "delete from t_alert";
        $cordovaSQLite.execute(dbShared, query).then(function(result) {
          console.log("delete alert");
          
        }, function (err) {
          //$cordovaDialogs.alert('err', err, 'OK');
          console.error(err);
        });
      };
      ctrl.selectAlert = function() {
        var query = "SELECT * FROM t_alert";
        $cordovaSQLite.execute(dbShared,query).then(function(result) {
          if(result.rows.length > 0) {
            ctrl.dataAlerts = new Array();
            for(var i=0;i<result.rows.length;i++){
              var dataAlert = {
                'id' : result.rows.item(i).id,
                'cap_info.headline': result.rows.item(i).cap_info_headline,
                'cap_area.name': result.rows.item(i).cap_area_name,
                'scope': result.rows.item(i).cap_scope,
                'event_event_type.name': result.rows.item(i).event_event_type_name,
                'sent': result.rows.item(i).sent
              };

              ctrl.dataAlerts.push(dataAlert);
            }
          }
        }, function(error) {
            console.error(error);
        });
      };

      if(isNetworkOffline){
        ctrl.selectAlert();
      }
      else{
        var promiseLoadData = shared.loadDataAlert(shared.apiUrl+'cap/alert.json');
        promiseLoadData.then(function(response) {
          //console.log(response);
          ctrl.deleteAlert();
          ctrl.dataAlerts = new Array();
          for(var i=0;i<response.length;i++){
            var capInfoHeadline = response[i]['cap_info.headline'];
            //console.log(angular.isArray(capInfoHeadline));
            if(angular.isArray(capInfoHeadline)){
              capInfoHeadline = response[i]['cap_info.headline'][0];
            }
            var dataAlert = {
              'id' : response[i]['id'],
              'cap_info.headline': angular.isArray(response[i]['cap_info.headline']) ? response[i]['cap_info.headline'][0] : response[i]['cap_info.headline'],
              'cap_area.name':angular.isArray(response[i]['cap_area.name']) ? response[i]['cap_area.name'][0] : response[i]['cap_area.name'],
              'scope':response[i].scope,
              'event_event_type.name':angular.isArray(response[i]['event_event_type.name']) ? response[i]['event_event_type.name'][0] : response[i]['event_event_type.name'],
              'sent': response[i]['sent']
            };

            ctrl.dataAlerts.push(dataAlert);
            ctrl.insertAlert(dataAlert);
          }
          //ctrl.dataAlerts = response;
        }, function(reason) {
          console.log('Failed: ' + reason);
        });
      }

});
