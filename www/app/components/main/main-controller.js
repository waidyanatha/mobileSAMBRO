"use strict";

angular.module("ngapp")
.controller("MainController", function(shared, $state, $scope,$rootScope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage,$cordovaSQLite,$cordovaNetwork){
    var ctrl = this;

    ctrl.typeNetwork = $cordovaNetwork.getNetwork();
    ctrl.isNetworkOnline = $cordovaNetwork.isOnline();
    ctrl.isNetworkOffline = $cordovaNetwork.isOffline();

    console.log('network');
    console.log(ctrl.typeNetwork);
    console.log(ctrl.isNetworkOnline);
    console.log(ctrl.isNetworkOffline);

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

    ctrl.showAlertListPage = true;
    ctrl.showAlertDetailPage = false;
    ctrl.showProfilePage = false;
    ctrl.showSettingPage = false;

    ctrl.clickBackBtn = function(){
      ctrl.showAlertListPage = true;
      ctrl.showAlertDetailPage = false;
      ctrl.showProfilePage = false;
      ctrl.showSettingPage = false;
    };

    ctrl.clickAlertDetail = function(idx){
      ctrl.showAlertListPage = false;
      ctrl.showAlertDetailPage = true;
      ctrl.showProfilePage = false;
      ctrl.showSettingPage = false;

      ctrl.dataAlert = ctrl.dataAlerts[idx];
    };

    ctrl.clickUserProfile = function(){
      ctrl.showAlertListPage = false;
      ctrl.showAlertDetailPage = false;
      ctrl.showProfilePage = true;
      ctrl.showSettingPage = false;

      ctrl.toggle();
    };

    //============================================================ Data Alert Offline ===============================================
    ctrl.sendAlertToServerProgress = false;
    ctrl.sendAlertsToServer = function(){
        ctrl.sendAlertToServerProgress = true;
        ctrl.sendAlertToServer(0);
    };  
    ctrl.sendAlertToServer = function(idx){
        console.log('sendAlertToServer');
        console.log(idx);
        var url = shared.sendAlertApiUrl;
        if(idx < ctrl.dataOfflineAlerts.length){
          ctrl.dataOfflineAlerts[idx].is_progress = true;
          var promiseSendDataForm = shared.sendDataForm(url,ctrl.dataOfflineAlerts[idx].data_form_str);
          promiseSendDataForm.then(function(response) {
              shared.deleteDBWithFilter("t_alert_offline"," where id=?",[ctrl.dataOfflineAlerts[idx].id],null,null);
              console.log("success save");
              console.log(response);
              ctrl.dataOfflineAlerts[idx].is_send = true;
              ctrl.dataOfflineAlerts[idx].is_progress = false;
              console.log('done');
              ctrl.refreshPageAfterSendAlert();
              ctrl.sendAlertToServer(idx+1);
          }, function(reason) {
              console.log("failed save");
              console.log(reason);
              ctrl.dataOfflineAlerts[idx].is_send = true;
              ctrl.dataOfflineAlerts[idx].is_progress = false;
              console.log('done error');
              ctrl.refreshPageAfterSendAlert();
              ctrl.sendAlertToServer(idx+1);
          });
        }
        
    }

    ctrl.isOfflineDataExist = false;
    ctrl.dataOfflineAlerts = new Array();
    ctrl.getOfflineData = function(){
      shared.selectDB("t_alert_offline","select * from t_alert_offline",[],function(result){
        console.log('getOfflineData');
        console.log(result.rows.length);
        if(result.rows.length > 0) {
          ctrl.isOfflineDataExist = true;
          for(var i=0;i<result.rows.length;i++){
              var dataOfflineAlert = {
                  'id':result.rows.item(i).id,
                  'created_time':new Date(result.rows.item(i).created_time),
                  'data_form':JSON.parse(result.rows.item(i).data_form),
                  'data_form_str':result.rows.item(i).data_form,
                  'is_send':false,
                  'is_progress':false
              };
              ctrl.dataOfflineAlerts.push(dataOfflineAlert);   
          } 

          if(ctrl.isNetworkOnline && ctrl.sendAlertToServerProgress == false){
            ctrl.sendAlertsToServer();
          }
        } 
      },null);
    };
    ctrl.getOfflineData();

    ctrl.refreshPageAfterSendAlert = function(){
        var countSendAlert = 0;
        for(var i=0;i<ctrl.dataOfflineAlerts.length;i++){
            if(ctrl.dataOfflineAlerts[i].is_send == true){
                countSendAlert = countSendAlert + 1;
            }
        }
        console.log('refreshPageAfterSendAlert');
        console.log(countSendAlert);
        console.log(ctrl.dataOfflineAlerts.length);
        if(ctrl.dataOfflineAlerts.length == countSendAlert){
            ctrl.isOfflineDataExist = false;
            ctrl.sendAlertToServerProgress = false;
            console.log('reload after send data finished');
            shared.deleteDB("t_alert_offline",null,null);
            ctrl.dataOfflineAlerts = new Array();
            //ctrl.getOfflineData();
            ctrl.getDataAlertFromAPI();

            //location.reload(); 
        }
    };
    
    //============================================================ Alert ============================================================
    ctrl.dataAlerts = {};
    ctrl.dataAlert = {};
    ctrl.loadDataAlert = true;
    ctrl.insertAlert = function(dataAlert) {
      var query = "insert into t_alert (id, cap_info_headline, cap_area_name, cap_scope,event_event_type_name,sent) values (?,?,?,?,?,?)";
      $cordovaSQLite.execute(dbShared, query, [dataAlert.id, JSON.stringify(dataAlert['cap_info.headline']),JSON.stringify(dataAlert['cap_area.name']),dataAlert['scope'],JSON.stringify(dataAlert['event_event_type.name']),dataAlert['sent']]).then(function(result) {
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
      ctrl.loadDataAlert = true;
      var query = "SELECT * FROM t_alert order by datetime(sent) desc";
      $cordovaSQLite.execute(dbShared,query).then(function(result) {
        if(result.rows.length > 0) {
          ctrl.loadDataAlert = false;
          ctrl.dataAlerts = new Array();
          for(var i=0;i<result.rows.length;i++){
            var dataAlert = {
              'id' : result.rows.item(i).id,
              'cap_info.headline': JSON.parse(result.rows.item(i).cap_info_headline),
              'cap_area.name': JSON.parse(result.rows.item(i).cap_area_name),
              'scope': result.rows.item(i).cap_scope,
              'event_event_type.name': JSON.parse(result.rows.item(i).event_event_type_name),
              'sent': result.rows.item(i).sent
            };

            ctrl.dataAlerts.push(dataAlert);
          }
        }
      }, function(error) {
          console.error(error);
      });
    };

    ctrl.getDataAlertFromAPI = function(){
      ctrl.loadDataAlert = true;
      var promiseLoadData = shared.loadDataAlert(shared.apiUrl+'cap/alert.json');
      promiseLoadData.then(function(response) {
        //console.log(response);
        ctrl.loadDataAlert = false;
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
            'cap_info.headline': angular.isArray(response[i]['cap_info.headline']) ? response[i]['cap_info.headline'] : [response[i]['cap_info.headline']],
            'cap_area.name':angular.isArray(response[i]['cap_area.name']) ? response[i]['cap_area.name'] : [response[i]['cap_area.name']],
            'scope':response[i].scope,
            'event_event_type.name':angular.isArray(response[i]['event_event_type.name']) ? response[i]['event_event_type.name'] : [response[i]['event_event_type.name']],
            'sent': response[i]['sent']
          };

          ctrl.insertAlert(dataAlert);
        }
        ctrl.selectAlert();
        //ctrl.dataAlerts = response;
      }, function(reason) {
        console.log('Failed: ' + reason);
      });
    };

    //logic sync data master
    ctrl.isSync = true;
    shared.selectDB("sync_data_master","select * from sync_data_master",[],function(result){
      if(result.rows.length > 0) {
          var dateLastSync = new Date(result.rows.item(0).time_sync);
          var currentDate = new Date();
          var dateDiff = DateDiff('n',dateLastSync,currentDate);
          var periodicSyncDate = parseInt(result.rows.item(0).periodic_sync);
          console.log('sync filter');
          console.log(dateLastSync);
          console.log(currentDate);
          console.log(dateDiff);
          console.log(periodicSyncDate);
          if(dateDiff >= periodicSyncDate && ctrl.isNetworkOnline ){
            shared.loadAllMasterData(function(){
              shared.updateDB("sync_data_master","update sync_data_master set time_sync=?",[new Date()],null,null);

              //enabled button add alert
              ctrl.isSync = false;
            });
          }
          else{
            //enabled button add alert
            ctrl.isSync = false;
          }
          
          
      } else {
          //sync and insert new data
          shared.loadAllMasterData(function(){
            var periodicSyncDate = 1*24*60; //default periodic 1 day
            shared.insertDB("sync_data_master","insert into sync_data_master (periodic_sync,time_sync) values (?,?)",[periodicSyncDate,new Date()],null,null);

            //enabled button add alert
            ctrl.isSync = false;
          });
      }
    },null);

    if(ctrl.isNetworkOffline){
      ctrl.selectAlert();
    }
    else{
      ctrl.getDataAlertFromAPI();
    }

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      console.log('online listener');
      var onlineState = networkState;
      console.log(onlineState);
      
      //if(ctrl.sendAlertToServerProgress == false){
      //  ctrl.sendAlertsToServer();
      //}

      ctrl.isNetworkOffline = false;
      ctrl.isNetworkOnline = true;
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      console.log('offline listener');
      var offlineState = networkState;
      console.log(offlineState);
      
      ctrl.isNetworkOffline = true;
      ctrl.isNetworkOnline = false;
    });

});
