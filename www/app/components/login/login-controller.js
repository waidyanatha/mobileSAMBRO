"use strict";

angular.module("ngapp")
.controller("LoginController", function(shared, $state, $scope,$rootScope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$localStorage,$sessionStorage,$location,$cordovaSQLite,$cordovaNetwork){
    var ctrl = this;

    ctrl.loginForm = {};
    ctrl.auth = shared.info.auth;
    ctrl.title = shared.info.title;
    ctrl.hideErrorMessage = true;
    ctrl.shared = shared;

    //$localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";
    $localStorage['userId'] = 0;
    $localStorage['userRole'] = "";

    
    ctrl.setServerUrl = function(){
      shared.selectDB("t_server_url","select * from t_server_url",[],function(result){
        console.log('get server url');
        console.log(result.rows.length);
        var serverUrl = $localStorage['serverUrl'];
        if(result.rows.length > 0) {
          ctrl.isOfflineDataExist = true;
          
          for(var i=0;i<result.rows.length;i++){
              serverUrl = result.rows.item(i).server_url;
          } 
        } 
        else{
          shared.insertDB("t_server_url","insert into t_server_url (server_url) values (?)",
          [serverUrl],     //[new Date(),JSON.stringify(submitFormVal)],
          function(result){
          
              console.log('success insert to db server url');
          },function(error){
              
              console.log('error to db db server url');
          });
        }
        $localStorage['serverUrl'] = serverUrl;
        console.log($localStorage['serverUrl']);
      },null);
    };
    ctrl.setServerUrl();
    
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

    

    ctrl.loginFormContainer = true;
    ctrl.directLoginContainer = false;
    ctrl.selectLoginContainer = false;

    ctrl.userName = "";
    ctrl.userId = 0;
    ctrl.dataUsers = new Array();
    ctrl.selectAllUser = function() {
      ctrl.dataUsers = new Array();
      console.log('select all user');
      var query = "SELECT * FROM m_user";
      $cordovaSQLite.execute(dbShared,query).then(function(result) {
          if(result.rows.length > 0) {
              for(var i=0;i<result.rows.length;i++){
                var dataUser = {
                  'email' : result.rows.item(i).email,
                  'pwd': result.rows.item(i).pwd,
                  'active_user': parseInt(result.rows.item(i).active_user),
                  'device_token_id': result.rows.item(i).device_token_id,
                  'user_id' : parseInt(result.rows.item(i).user_id),
                  'profile_json' : JSON.parse(result.rows.item(i).profile_json),
                  'user_role' : result.rows.item(i).user_role
                };

                console.log(dataUser.email);
                console.log(dataUser.pwd);

                if(dataUser.active_user == 1){
                    $localStorage['username'] = dataUser.email;
                    $localStorage['password'] = dataUser.pwd;
                    $localStorage['userId'] = dataUser.user_id;
                    $localStorage['userRole'] = dataUser.user_role;
                    ctrl.userRole = dataUser.user_role;
                    ctrl.userId = dataUser.user_id;

                    ctrl.updateUser(dataUser.email,dataUser.pwd,dataUser.device_token_id);

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
      $localStorage['userId'] = ctrl.dataUsers[idx].user_id;
      $localStorage['userRole'] = ctrl.dataUsers[idx].user_role;

      ctrl.userId = ctrl.dataUsers[idx].user_id;
      ctrl.userRole = ctrl.dataUsers[idx].user_role;
      ctrl.updateUser(ctrl.dataUsers[idx].email,ctrl.dataUsers[idx].pwd,ctrl.dataUsers[idx].device_token_id);
      $location.path("/main");
    };
    ctrl.clickToLoginForm = function(){
      ctrl.loginFormContainer = true;
      ctrl.directLoginContainer = false;
      ctrl.selectLoginContainer = false;
    };

    ctrl.userRole = "";
    ctrl.selectUser = function(email,pwd) {
      var query = "SELECT * FROM m_user where email=?";
      $cordovaSQLite.execute(dbShared,query, [email]).then(function(result) {
          if(result.rows.length > 0) {
              var deviceTokenId = result.rows.item(0).device_token_id;
              ctrl.userRole = result.rows.item(0).user_role;
              if($localStorage['deviceTokenId'] != '' && $localStorage['deviceTokenId'] != result.rows.item(0).device_token_id){
                deviceTokenId = $localStorage['deviceTokenId'];
              }
              ctrl.userId = esult.rows.item(0).user_id;
              ctrl.updateUser(email,pwd,deviceTokenId);
          } else {
              ctrl.insertUser(email,pwd);
          }
      }, function(error) {
          console.error(error);
      });
    };

    ctrl.updateUser = function(email,pwd,deviceTokenId) {
      shared.updateActiveUser();
      var query = "update m_user set pwd=?,active_user=?,device_token_id=?,user_role=? where email=?";
      $cordovaSQLite.execute(dbShared, query, [pwd,1,deviceTokenId,ctrl.userRole,email]).then(function(result) {
        console.log("update user");
        
        ctrl.getUserProfile(email,ctrl.userId);

      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.insertUser = function(email,pwd) {
      shared.updateActiveUser();
      var query = "insert into m_user (email,pwd,active_user,device_token_id,user_id,user_role) values (?,?,?,?,?,?)";
      $cordovaSQLite.execute(dbShared, query, [email, pwd,1,$localStorage['deviceTokenId'],ctrl.userId,ctrl.userRole]).then(function(result) {
        console.log("insert user");
        
        ctrl.getUserProfile(email,ctrl.userId);
      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.clickDeleteUser = function(idx){
        var email = ctrl.dataUsers[idx].email;
        var query = "delete from m_user where email=?";
        $cordovaSQLite.execute(dbShared, query, [email]).then(function(result) {
          console.log("delete user " + email);
          ctrl.dataUsers.splice(idx, 1);
          
        }, function (err) {
          //$cordovaDialogs.alert('err', err, 'OK');
          console.error(err);
        });
    }

    ctrl.sendFormFnc = function()
    {
      console.log('call this sendform');

      shared.clearCache();

      var promiseLoadData = shared.loadDataLogin(shared.apiUrl+'default/index/user_info',ctrl.loginForm.email,ctrl.loginForm.password);
      promiseLoadData.then(function(response) {
        console.log('success');
        console.log(response);  

        //ctrl.userId = response.userId;
        ctrl.userId = 34;
        ctrl.userRole = response.r[0];

        var passEncrypt = CryptoJS.AES.encrypt(ctrl.loginForm.password, "Secret Passphrase").toString();

        $localStorage['username'] = ctrl.loginForm.email;
        $localStorage['password'] = passEncrypt;
        $localStorage['userId'] = ctrl.userId;
        $localStorage['userRole'] = ctrl.userRole;

        //grab the user id and save it to the database

        ctrl.getAllUserData(function(){
          console.log("success get id from url = "+ctrl.userId.toString());
          ctrl.selectUser(ctrl.loginForm.email,passEncrypt);

          $location.path("/main");
        },function(){
          console.log("failed get id from url");
          ctrl.selectUser(ctrl.loginForm.email,passEncrypt);

          $location.path("/main");
        });

        
      }, function(reason) {
        console.log('failed');
       //$localStorage.$reset();
       ctrl.hideErrorMessage = false;
      });

    };

    ctrl.getUserProfile = function(email,userId,success,failed)
    {
      if(isNetworkOnline){
        console.log('get user profile = '+ userId.toString());
        var ctrlDetail = this;
        ctrlDetail.email = email;
        var promiseLoadData = shared.loadDataAlert(shared.apiUrl+'pr/person/'+userId.toString()+'.s3json');
        promiseLoadData.then(function(response) {
          console.log('saving content to DB');
          var query = "update m_user set profile_json=? where email=?";
          $cordovaSQLite.execute(dbShared, query, [JSON.stringify(response) , ctrlDetail.email]).then(function(result) {
            console.log("updated user profile");

            ctrl.checkTokenId(response);
            if(success != undefined){
              success();  
            }
            
          }, function (err) {
            //$cordovaDialogs.alert('err', err, 'OK');
            console.error(err);
            if(failed != undefined){
              failed();  
            }
          });
        }, function(reason) {
          console.log('Failed: ' + reason);
          if(failed != undefined){
              failed();  
            }
        });
      }
    };

    ctrl.checkTokenId = function(dataJson){
      console.log("check token id");
      //GCM , OTHER
      var typeContact = "OTHER";
      var otherContacts = dataJson['$_pr_person'][0];
      var isTokenIdExist = false;
      if(otherContacts['$_pr_contact'] != undefined){
        otherContacts = dataJson['$_pr_person'][0]['$_pr_contact'];
        for(var i=0;i<otherContacts.length;i++){
          if(otherContacts[i].contact_method['@value'] == typeContact){
            if(otherContacts[i].value['@value'] == $localStorage['deviceTokenId']){
              isTokenIdExist = true;
              break;
            }
          }
          
        }
      }

      if(isTokenIdExist == false){
        ctrl.saveToken(ctrl.userId);
      }
      else{
        console.log("token id exists");
      }
    };

    ctrl.saveToken = function(userId){
      console.log("saving token id");
      //GCM , OTHER
      var typeContact = "OTHER";
      var dataJsonToken = {
          "$_pr_person": [{ 
            "$_pr_contact": [{
              "contact_method": {
                "@value": typeContact
                },
                "value": {
                "@value": $localStorage['deviceTokenId']
                },
                "contact_description": "token_id"
            }]
          }]
        };
      var url = shared.apiUrl+'pr/person/'+userId.toString()+'.s3json';
      var promiseSendDataForm = shared.sendDataForm(url,JSON.stringify(dataJsonToken));
      promiseSendDataForm.then(function(response) {
          console.log("success Save token id");
      }, function(reason) {
          console.log("failed Save token id");
      });
    };

    ctrl.sendFormViaDBFnc = function(email,password)
    {
      var ctrlDetail = this;
      ctrlDetail.email = email;
      ctrlDetail.passEncrypt = CryptoJS.AES.encrypt(password, "Secret Passphrase").toString();

      shared.sendFormViaDBFnc(email,ctrlDetail.passEncrypt
      ,function(result){
          if(result.rows.length > 0) {
              ctrl.userId = parseInt(result.rows.item(0).user_id);

              $localStorage['username'] = ctrlDetail.email;
              $localStorage['password'] = ctrlDetail.passEncrypt;
              $localStorage['userId'] = ctrl.userId;
              $localStorage['userRole'] = result.rows.item(0).user_role;
              
              $location.path("/main");
          } else {
              console.log('failed');
              ctrl.hideErrorMessage = false;
          }
      });
    };

    ctrl.getAllUserData = function(success,failed){
      var promiseLoadData = shared.loadDataAlert(shared.apiUrl+'pr/person.s3json');
      promiseLoadData.then(function(response) {
        console.log('get all data profile');
        var urlContentId = "";
        var getUserId = "0";
        for(var i=0;i<response['$_pr_person'].length;i++){
          if(response['$_pr_person'][i]['$_pr_email_contact'] != undefined){
            if(response['$_pr_person'][i]['$_pr_email_contact'][0].value['@value'] == ctrl.loginForm.email){
              urlContentId = response['$_pr_person'][i]['$_pr_email_contact'][0]['@url'];
              var resArr = urlContentId.split("/person/");
              if(resArr.length>1){
                resArr = resArr[1].split("/");
                getUserId = resArr[0];
                break;
              }
              
            }  
          }
        }

        if(getUserId != "0"){
          ctrl.userId = parseInt(getUserId);
        }

        success();
      }, function(reason) {
        console.log('Failed: ' + reason);
        failed();
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
