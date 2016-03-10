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
      ctrl.sendForm = ctrl.sendFormViaDBFnc(ctrl.loginForm.email,ctrl.loginForm.password);
    });

    //$cordovaStatusbar.overlaysWebView(true); // Always Show Status Bar
    //$cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style

    $localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";

    ctrl.loginFormContainer = true;
    ctrl.directLoginContainer = false;
    ctrl.selectLoginContainer = false;

    ctrl.userName = "";
    ctrl.dataUsers = new Array();
    ctrl.selectAllUser = function() {
      ctrl.dataUsers = new Array();
      var query = "SELECT * FROM m_user";
      $cordovaSQLite.execute(dbShared,query).then(function(result) {
          if(result.rows.length > 0) {
              for(var i=0;i<result.rows.length;i++){
                var dataUser = {
                  'email' : result.rows.item(i).email,
                  'pwd': result.rows.item(i).pwd,
                  'active_user': parseInt(result.rows.item(i).active_user)
                };

                if(dataUser.active_user == 1){
                    $localStorage['username'] = dataUser.email;
                    $localStorage['password'] = dataUser.pwd;

                    $location.path("/main");
                }

                ctrl.dataUsers.push(dataUser);
              }
              ctrl.clickSelectLogin();

          } 
      }, function(error) {
          console.error(error);
      });
    };

    ctrl.selectAllUser();

    ctrl.clickDirectLogin = function(){
      $location.path("/main");
    };
    ctrl.clickSelectLogin = function(){
      ctrl.loginFormContainer = false;
      ctrl.directLoginContainer = false;
      ctrl.selectLoginContainer = true;
    };
    ctrl.clickDirectLoginUsers = function(idx){
      $localStorage['username'] = ctrl.dataUsers[idx].email;
      $localStorage['password'] = ctrl.dataUsers[idx].pwd;
      ctrl.updateUser(ctrl.dataUsers[idx].email,ctrl.dataUsers[idx].pwd);
      $location.path("/main");
    };
    ctrl.clickToLoginForm = function(){
      ctrl.loginFormContainer = true;
      ctrl.directLoginContainer = false;
      ctrl.selectLoginContainer = false;
    };

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
      shared.updateActiveUser();
      var query = "update m_user set email=?,pwd=?,active_user=?";
      $cordovaSQLite.execute(dbShared, query, [email, pwd,1]).then(function(result) {
        console.log("update user");
        
      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.insertUser = function(email,pwd) {
      shared.updateActiveUser();
      var query = "insert into m_user (email,pwd,active_user) values (?,?,?)";
      $cordovaSQLite.execute(dbShared, query, [email, pwd,1]).then(function(result) {
        console.log("insert user");
        
      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.sendFormFnc = function()
    {
      console.log('call this sendform');

      var promiseLoadData = shared.loadDataLogin(shared.apiUrl+'default/index/user_info',ctrl.loginForm.email,ctrl.loginForm.password);
      promiseLoadData.then(function(response) {
        console.log('success');
        console.log(response);  

        var passEncrypt = CryptoJS.AES.encrypt(ctrl.loginForm.password, "Secret Passphrase");

        $localStorage['username'] = ctrl.loginForm.email;
        $localStorage['password'] = passEncrypt;
        ctrl.selectUser(ctrl.loginForm.email,passEncrypt);

        $location.path("/main");
      }, function(reason) {
        console.log('failed');
       //$localStorage.$reset();
       ctrl.hideErrorMessage = false;
      });

    };

    ctrl.sendFormViaDBFnc = function(email,password)
    {
      var ctrlDetail = this;
      ctrlDetail.email = email;
      ctrlDetail.passEncrypt = CryptoJS.AES.encrypt(password, "Secret Passphrase");

      shared.sendFormViaDBFnc(email,ctrlDetail.passEncrypt
      ,function(result){
          if(result.rows.length > 0) {
              $localStorage['username'] = ctrlDetail.email;
              $localStorage['password'] = ctrlDetail.passEncrypt;

              $location.path("/main");
          } else {
              console.log('failed');
              ctrl.hideErrorMessage = false;
          }
      });
    };

    //==================== application goes online or offline ====================
    ctrl.sendForm = ctrl.sendFormFnc;
    if(isNetworkOffline){
      ctrl.sendForm = ctrl.sendFormViaDBFnc(ctrl.loginForm.email,ctrl.loginForm.password);
    }

    // var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase");
    // // AABsAABkAABiAAAAAAAAAABNAABlAABPAAC0AABHAAA=

    // var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
    // // 4d657373616765

    // decrypted.toString(CryptoJS.enc.Utf8);
    // // Message

});
