"use strict";

angular.module("ngapp")
.controller("AlertFormController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage,$cordovaSQLite){

    shared.checkUserCached();

    var ctrl = this;

    this.auth = shared.info.auth;
    this.username = $localStorage['username'];

    this.toggle = angular.noop;

    this.title = shared.info.title;
    this.logout = shared.logout;

    document.addEventListener("deviceready", function () {
        //alert('test0_');
        $cordovaStatusbar.overlaysWebView(false); // Always Show Status Bar = false
        $cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style
        //window.plugins.orientationLock.lock("portrait");

        //alert('test1');    
        //$cordovaDialogs.alert('deviceready', 'Message', 'OK');
        $cordovaDialogs.alert('alert', '1', 'OK');
        var db = shared.db;
        $scope.select = function() {
        var query = "SELECT * FROM event_type";
            $cordovaSQLite.execute(db,query).then(function(result) {
                if(result.rows.length > 0) {
                    $cordovaDialogs.alert('row db ', "SELECTED -> " + result.rows.item(0).id + " " + result.rows.item(0).name, 'OK');
                    
                } else {
                    console.log("NO ROWS EXIST");
                }
            }, function(error) {
                console.error(error);
            });
        };
        $scope.select();
        $cordovaDialogs.alert('alert', '2', 'OK');


      }, false);


    $scope.onSwipeLeft = function(ev) {
      alert('You swiped left!!');
    };
    $scope.onSwipeRight = function(ev) {
      alert('You swiped right!!');
    };
    $scope.onSwipeUp = function(ev) {
      alert('You swiped up!!');
    };
    $scope.onSwipeDown = function(ev) {
      alert('You swiped down!!');
    };

    this.currPage = 1;
    this.hidePage = [false,true];

    this.goBack = function(){
        if(this.currPage == 1){
            $location.path("/main");
        }
        else{
            ctrl.hidePage[ctrl.currPage-1] = true;
            ctrl.currPage -= 1;
            ctrl.hidePage[ctrl.currPage-1] = false;    
        }
        
    };

    this.goToTemplate = function(ev,id){
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage = 2;
        ctrl.hidePage[ctrl.currPage-1] = false;  
    };

    this.dataOptions = {};
    this.dataEventTypeOptions = {};
    var promiseLoadData = shared.loadDataAlert('http://sambro.geoinfo.ait.ac.th/eden/cap/alert/create.s3json?options=true&references=true');
    promiseLoadData.then(function(response) {
      console.log(response);
      ctrl.dataOptions = response;

      var dataField = response['$_cap_alert'][0]['$_cap_info'][0]['field'];
      console.log(dataField);
      for(var i=0;i<dataField.length;i++){
        if(dataField[i]['@name'] == "event_type_id"){
            ctrl.dataEventTypeOptions = dataField[i]['select'][0]['option'];
        }
      }
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    this.dataTemplateOptions = {};
    var promiseLoadDataTemplate = shared.loadDataAlert('http://sambro.geoinfo.ait.ac.th/eden/cap/template.json');
    promiseLoadDataTemplate.then(function(response) {
      console.log(response);
      ctrl.dataTemplateOptions = response;
    }, function(reason) {
      console.log('Failed: ' + reason);
    });
    

});
