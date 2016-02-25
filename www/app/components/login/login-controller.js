"use strict";

angular.module("ngapp")
.controller("LoginController", function(shared, $state, $scope,$rootScope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$localStorage,$sessionStorage,$location,$cordovaSQLite,$cordovaNetwork){
    var ctrl = this;

    ctrl.loginForm = {};
    ctrl.auth = shared.info.auth;
    ctrl.title = shared.info.title;
    ctrl.hideErrorMessage = true;
    ctrl.shared = shared;
    
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
      ctrl.sendForm = ctrl.sendFormFnc;
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      console.log('offline listener');
      var offlineState = networkState;
      console.log(offlineState);
      ctrl.sendForm = ctrl.sendFormViaDBFnc;
    });

    //$cordovaStatusbar.overlaysWebView(true); // Always Show Status Bar
    //$cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style

    ctrl.selectUser = function(email,pwd) {
      var query = "SELECT * FROM m_user";
      $cordovaSQLite.execute(dbShared,query).then(function(result) {
          if(result.rows.length > 0) {
              ctrl.updateUser(email,pwd);
          } else {
              ctrl.insertUser(email,pwd);
          }
      }, function(error) {
          console.error(error);
      });
    };

    ctrl.updateUser = function(email,pwd) {
      var query = "update m_user set email=?,pwd=?";
      $cordovaSQLite.execute(dbShared, query, [email, pwd]).then(function(result) {
        console.log("update user");
        
      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.insertUser = function(email,pwd) {
      var query = "insert into m_user (email,pwd) values (?,?)";
      $cordovaSQLite.execute(dbShared, query, [email, pwd]).then(function(result) {
        console.log("insert user");
        
      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    $localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";

    ctrl.sendFormFnc = function()
    {
      console.log('call this sendform');

      var promiseLoadData = shared.loadDataLogin(shared.apiUrl+'default/index/user_info',ctrl.loginForm.email,ctrl.loginForm.password);
      promiseLoadData.then(function(response) {
        console.log('success');
        console.log(response);
        $localStorage['username'] = ctrl.loginForm.email;
        $localStorage['password'] = ctrl.loginForm.password;
        ctrl.selectUser(ctrl.loginForm.email,ctrl.loginForm.password);

        $location.path("/main");
      }, function(reason) {
        console.log('failed');
       //$localStorage.$reset();
       ctrl.hideErrorMessage = false;
      });

    };

    ctrl.sendFormViaDBFnc = function()
    {
      console.log('call this sendform via DB');

     
      var query = "SELECT * FROM m_user where email=? and pwd=?";
      $cordovaSQLite.execute(dbShared,query,[ctrl.loginForm.email, ctrl.loginForm.password]).then(function(result) {
          if(result.rows.length > 0) {
              $localStorage['username'] = ctrl.loginForm.email;
              $localStorage['password'] = ctrl.loginForm.password;

              $location.path("/main");
          } else {
              console.log('failed');
              ctrl.hideErrorMessage = false;
          }
      }, function(error) {
          console.error(error);
      });
    };

    //==================== application goes online or offline ====================
    ctrl.sendForm = ctrl.sendFormFnc;
    if(isNetworkOffline){
      ctrl.sendForm = ctrl.sendFormViaDBFnc;
    }

});
