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
        //$cordovaDialogs.alert('alert', '1', 'OK');
        var db = shared.db;
        $scope.select = function() {
        var query = "SELECT * FROM event_type";
            $cordovaSQLite.execute(db,query).then(function(result) {
                if(result.rows.length > 0) {
                    //$cordovaDialogs.alert('row db ', "SELECTED -> " + result.rows.item(0).id + " " + result.rows.item(0).name, 'OK');
                    
                } else {
                    console.log("NO ROWS EXIST");
                }
            }, function(error) {
                console.error(error);
            });
        };
        $scope.select();
        //$cordovaDialogs.alert('alert', '2', 'OK');


      }, false);


    $scope.onSwipeLeft = function(ev) {
      ctrl.goNext();
    };
    $scope.onSwipeRight = function(ev) {
      ctrl.goBack();
    };
    $scope.onSwipeUp = function(ev) {
      alert('You swiped up!!');
    };
    $scope.onSwipeDown = function(ev) {
      alert('You swiped down!!');
    };

    this.todayDate = new Date();
    $scope.minDate = new Date(
        ctrl.todayDate.getFullYear(),
        ctrl.todayDate.getMonth() - 2,
        ctrl.todayDate.getDate());
    $scope.maxDate = new Date(
        ctrl.todayDate.getFullYear(),
        ctrl.todayDate.getMonth() + 2,
        ctrl.todayDate.getDate());

    this.dataAlertForm = {
        eventType : {
            id: null,
            name: null
        },
        template : {
            id: null,
            name: null
        },
        expireDate : ctrl.todayDate,
        effectiveDate : ctrl.todayDate,
        urgency : null,
        certainty : null,
        severity : null,
        description : null
    };

    this.currPage = 1;
    this.hidePage = [false,true,true,true,true,true];
    this.progress = 100/this.hidePage.length;
    this.progressText = ctrl.currPage.toString()+"/"+ctrl.hidePage.length.toString();
    this.btnBackName = "< Home";
    this.btnNextName = "Next >";
    this.hideNextBtn = false;

    this.changePageView = function(){

        if(ctrl.currPage == ctrl.hidePage.length){
            ctrl.hideNextBtn = true;
            this.btnNextName = " ";
        }
        else{
            ctrl.hideNextBtn = false;
            this.btnNextName = "Next >";
        }
        this.progressText = ctrl.currPage.toString()+"/"+ctrl.hidePage.length.toString();
        ctrl.progress = 100/ctrl.hidePage.length*(ctrl.currPage);
        if(ctrl.currPage == 1){
            ctrl.btnBackName = "< Home";
        }
        else{
            ctrl.btnBackName = "< Back";
        }
    }

    this.goBack = function(){
        if(this.currPage == 1){
            $location.path("/main");
        }
        else{
            ctrl.hidePage[ctrl.currPage-1] = true;
            ctrl.currPage -= 1;
            ctrl.hidePage[ctrl.currPage-1] = false;    
            ctrl.changePageView();
        }
        
    };

    this.goNext = function(){    
        if(ctrl.currPage == ctrl.hidePage.length){
            //ctrl.submitForm();
        }
        else{
            ctrl.hidePage[ctrl.currPage-1] = true;
            ctrl.currPage += 1;
            ctrl.hidePage[ctrl.currPage-1] = false;    
            ctrl.changePageView();    
        }
         
    };

    this.disabledNextBtn = function(){
        if(ctrl.currPage == 1 && ctrl.dataAlertForm.eventType.id != null){
            return false;
        }
        else if(ctrl.currPage == 2 && ctrl.dataAlertForm.template.id != null){
            return false;
        }
        else if(ctrl.currPage == 3){
            for(var i=0;i<ctrl.dataPredefinedAreaOptions.length;i++){
                if(ctrl.dataPredefinedAreaOptions[i].selected == true){

                    return false;
                    break;
                }
            }
            
        }
        else if(ctrl.currPage == 4){
            if(ctrl.dataAlertForm.expireDate != undefined && ctrl.dataAlertForm.effectiveDate != undefined){
                return false;
            }
            
        }
        else if(ctrl.currPage == 5){
            if(ctrl.dataAlertForm.urgency != null && ctrl.dataAlertForm.certainty != null && ctrl.dataAlertForm.severity != null){
                return false;
            }
            
        }
        else if(ctrl.currPage == 6){
            if(ctrl.dataAlertForm.description != null && ctrl.dataAlertForm.description != ""){
                return false;
            }
            
        }

        return true;
    }

    this.submitForm = function(){
        $location.path("/main");
    };

    this.clickEventTypeOption = function(ev,eventTypeObj){
        
        ctrl.dataAlertForm.eventType = eventTypeObj;
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage = 2; //go to template
        ctrl.hidePage[ctrl.currPage-1] = false;  
        ctrl.changePageView();
    };

    this.clickTemplateOption = function(ev,templateObj){
        
        ctrl.dataAlertForm.template = templateObj;
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage = 3; //go to location
        ctrl.hidePage[ctrl.currPage-1] = false;  
        ctrl.changePageView();
    };

    this.dataOptions = {};
    this.dataEventTypeOptions = {};
    this.dataUrgencyOptions = {};
    this.dataCertaintyOptions = {};
    this.dataSeverityOptions = {};
    var promiseLoadData = shared.loadDataAlert('http://sambro.geoinfo.ait.ac.th/eden/cap/alert/create.s3json?options=true&references=true');
    promiseLoadData.then(function(response) {
      console.log(response);
      ctrl.dataOptions = response;

      var dataField = response['$_cap_alert'][0]['$_cap_info'][0]['field'];
      for(var i=0;i<dataField.length;i++){
        if(dataField[i]['@name'] == "event_type_id"){
            ctrl.dataEventTypeOptions = dataField[i]['select'][0]['option'];
        }
        else if(dataField[i]['@name'] == "urgency"){
            ctrl.dataUrgencyOptions = dataField[i]['select'][0]['option'];
        }
        else if(dataField[i]['@name'] == "certainty"){
            ctrl.dataCertaintyOptions = dataField[i]['select'][0]['option'];
        }
        else if(dataField[i]['@name'] == "severity"){
            ctrl.dataSeverityOptions = dataField[i]['select'][0]['option'];
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

    this.dataPredefinedAreaOptions = {};
    var promiseLoadDataPredefinedArea = shared.loadDataAlert('http://sambro.geoinfo.ait.ac.th/eden/cap/area.json?~.is_template=True');
    promiseLoadDataPredefinedArea.then(function(response) {
      console.log(response);
      ctrl.dataPredefinedAreaOptions = new Array();
      for(var i=0;i<response.length;i++){
        var dataPredefinedAreaOption = {
          'name': response[i].name,
          'id':response[i].id,
          'event_type_id':response[i].event_type_id,
          'selected':false
        };

        ctrl.dataPredefinedAreaOptions.push(dataPredefinedAreaOption);
      }
      //ctrl.dataPredefinedAreaOptions = response;
    }, function(reason) {
      console.log('Failed: ' + reason);
    });



    
    

});
