"use strict";

angular.module("ngapp")
.controller("AlertFormController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage,$cordovaSQLite,$filter){
    shared.checkUserCached();

    var ctrl = this;    

    //$cordovaStatusbar.overlaysWebView(false); // Always Show Status Bar = false
    //$cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style

    ctrl.auth = shared.info.auth;
    ctrl.username = $localStorage['username'];

    ctrl.toggle = angular.noop;

    ctrl.title = shared.info.title;
    ctrl.logout = shared.logout;
    ctrl.responseDebug = "";

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

    ctrl.todayDate = new Date();
    $scope.minDate = new Date(
        ctrl.todayDate.getFullYear(),
        ctrl.todayDate.getMonth() - 2,
        ctrl.todayDate.getDate());
    $scope.maxDate = new Date(
        ctrl.todayDate.getFullYear(),
        ctrl.todayDate.getMonth() + 2,
        ctrl.todayDate.getDate());

    ctrl.dataAlertForm = {
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
        warningPriority : null,
        urgency : null,
        certainty : null,
        severity : null,
        scope : null,
        description : null
    };

    ctrl.currPage = 1;
    ctrl.hidePage = [false,true,true,true,true,true,true];
    ctrl.progress = 100/ctrl.hidePage.length;
    ctrl.progressText = ctrl.currPage.toString()+"/"+ctrl.hidePage.length.toString();
    ctrl.btnBackName = "< Home";
    ctrl.btnNextName = "Next >";
    ctrl.hideNextBtn = false;

    ctrl.changePageView = function(){

        if(ctrl.currPage == ctrl.hidePage.length){
            ctrl.hideNextBtn = true;
            ctrl.btnNextName = " ";
        }
        else{
            ctrl.hideNextBtn = false;
            ctrl.btnNextName = "Next >";
        }
        ctrl.progressText = ctrl.currPage.toString()+"/"+ctrl.hidePage.length.toString();
        ctrl.progress = 100/ctrl.hidePage.length*(ctrl.currPage);
        if(ctrl.currPage == 1){
            ctrl.btnBackName = "< Home";
        }
        else{
            ctrl.btnBackName = "< Back";
        }
    }

    ctrl.goBack = function(){
        if(ctrl.currPage == 1){
            $location.path("/main");
        }
        else{
            ctrl.hidePage[ctrl.currPage-1] = true;
            ctrl.currPage -= 1;
            ctrl.hidePage[ctrl.currPage-1] = false;    
            ctrl.changePageView();
        }
        
    };

    ctrl.goNext = function(){    
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

    ctrl.disabledNextBtn = function(){
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
            if(ctrl.dataAlertForm.scope != null){
                return false;
            }
            
        }
        else if(ctrl.currPage == 7){
            if(ctrl.dataAlertForm.description != null && ctrl.dataAlertForm.description != ""){
                return false;
            }
            
        }

        return true;
    }

    ctrl.submitForm = function(){
        //console.log('click it');
        var capAreasVal = new Array();
        for(var i=0;i<ctrl.dataPredefinedAreaOptions.length;i++){
            if(ctrl.dataPredefinedAreaOptions[i].selected){
                var areaVal = {
                    "name" : ctrl.dataPredefinedAreaOptions[i].name,
                    "is_template" : {
                        "@value" : "F"
                    }
                };
                capAreasVal.push(areaVal);
            }    
        }

        var submitFormVal = {
            "$_cap_alert": [{
                "status": {
                  "@value" : "Test"
                 },
                 "is_template" : {
                  "@value" : "F"
                 },
                 "scope" : {
                  "@value" : ctrl.dataAlertForm.scope
                 },
                 "template_id" : {
                    "@value" : ctrl.dataAlertForm.template.id.toString()
                 },
                 "restriction" : {
                    "@value" : "TEST"
                 },
                 "addresses" : {
                    "@value" : "TEST"
                 },
                 "$_cap_info" : [ {
                    "sender_name" : $localStorage["username"],
                    "event" : ctrl.dataAlertForm.eventType.name,
                    "headline" : ctrl.dataAlertForm.eventType.name,
                    "description" : ctrl.dataAlertForm.description,
                    "event_type_id" : {
                      "@value" : ctrl.dataAlertForm.eventType.id.toString()
                    },
                    "urgency" : {
                      "@value" : ctrl.dataAlertForm.urgency
                     },
                     "severity" : {
                      "@value" : ctrl.dataAlertForm.severity
                     },
                     "certainty" : {
                      "@value" : ctrl.dataAlertForm.certainty
                     },
                    "expires": {
                        "@value" : $filter('date')(ctrl.dataAlertForm.expireDate,"yyyy-MM-ddTHH:mm:ss")  
                    },
                    "effective": {
                        "@value": $filter('date')(ctrl.dataAlertForm.effectiveDate,"yyyy-MM-ddTHH:mm:ss")
                    },
                    "is_template": {
                      "@value": "F"
                    }
                }],
                "$_cap_area" : capAreasVal
            }]
        };

        //$cordovaDialogs.alert('go to url ', shared.apiUrl+'cap/alert.s3json', 'OK');
        var url = shared.apiUrl+'cap/alert.s3json';
        var promiseSendDataForm = shared.sendDataForm(url,submitFormVal);
        promiseSendDataForm.then(function(response) {
            console.log("success Save");
            console.log(response);
            ctrl.responseDebug = response;
            $location.path("/main");
            //$cordovaDialogs.alert('success', response, 'OK');
        }, function(reason) {
            console.log("failed Save");
            console.log(reason);
            ctrl.responseDebug = reason;
            //$cordovaDialogs.alert('failed', reason, 'OK');
            $location.path("/main");
        });
    };

    ctrl.clickEventTypeOption = function(ev,eventTypeObj){
        
        ctrl.dataAlertForm.eventType = eventTypeObj;
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage = 2; //go to template
        ctrl.hidePage[ctrl.currPage-1] = false;  
        ctrl.changePageView();
    };

    ctrl.clickTemplateOption = function(ev,templateObj){
        
        ctrl.dataAlertForm.template = templateObj;
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage = 3; //go to location
        ctrl.hidePage[ctrl.currPage-1] = false;  
        ctrl.changePageView();
    };

    ctrl.clickWarningPriority = function(idx){
        console.log(idx);
        ctrl.dataAlertForm.severity = ctrl.dataWarningPrioritys[idx].severity;
        ctrl.dataAlertForm.certainty = ctrl.dataWarningPrioritys[idx].certainty;
        ctrl.dataAlertForm.urgency = ctrl.dataWarningPrioritys[idx].urgency;
    };

    ctrl.dataOptions = {};
    ctrl.dataEventTypeOptions = {};
    ctrl.dataUrgencyOptions = {};
    ctrl.dataCertaintyOptions = {};
    ctrl.dataSeverityOptions = {};
    ctrl.dataScopeOptions = {};
    var promiseLoadData = shared.loadDataAlert(shared.apiUrl+'cap/alert/create.s3json?options=true&references=true');
    promiseLoadData.then(function(response) {
      //console.log(response);
      ctrl.dataOptions = response;

      var dataField = response['$_cap_alert'][0]['$_cap_info'][0]['field'];
      for(var i=0;i<dataField.length;i++){
        if(dataField[i]['@name'] == "event_type_id"){
            ctrl.dataEventTypeOptions = new Array();
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                    ctrl.dataEventTypeOptions.push(dataField[i]['select'][0]['option'][j]);
                }
                
            }
        }
        else if(dataField[i]['@name'] == "urgency"){
            ctrl.dataUrgencyOptions = new Array();
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                    ctrl.dataUrgencyOptions.push(dataField[i]['select'][0]['option'][j]);
                }
                
            }
        }
        else if(dataField[i]['@name'] == "certainty"){
            ctrl.dataCertaintyOptions = new Array();
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                    ctrl.dataCertaintyOptions.push(dataField[i]['select'][0]['option'][j]);
                }
                
            }
        }
        else if(dataField[i]['@name'] == "severity"){
            ctrl.dataSeverityOptions = new Array();
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                    ctrl.dataSeverityOptions.push(dataField[i]['select'][0]['option'][j]);
                }
                
            }
        }
      }
      dataField = response['$_cap_alert'][0]['field'];
      for(var i=0;i<dataField.length;i++){
        if(dataField[i]['@name'] == "scope"){
            ctrl.dataScopeOptions = new Array();

            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                    var dataScopeOption = {
                      '@value': dataField[i]['select'][0]['option'][j]['@value'],
                      '$':dataField[i]['select'][0]['option'][j]['$']
                    };

                    ctrl.dataScopeOptions.push(dataScopeOption);
                }
                
            }
        }
      }
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    ctrl.dataTemplateOptions = {};
    var promiseLoadDataTemplate = shared.loadDataAlert(shared.apiUrl+'cap/template.json');
    promiseLoadDataTemplate.then(function(response) {
      //console.log(response);
      ctrl.dataTemplateOptions = response;
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    ctrl.dataWarningPrioritys = {};
    var promiseLoadDataWarningPriority = shared.loadDataAlert(shared.apiUrl+'cap/warning_priority.json');
    promiseLoadDataWarningPriority.then(function(response) {
      //console.log(response);
      ctrl.dataWarningPrioritys = response;
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    ctrl.dataPredefinedAreaOptions = {};
    var promiseLoadDataPredefinedArea = shared.loadDataAlert(shared.apiUrl+'cap/area.json?~.is_template=True');
    promiseLoadDataPredefinedArea.then(function(response) {
      //console.log(response);
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
