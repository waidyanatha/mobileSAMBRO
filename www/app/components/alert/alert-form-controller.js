"use strict";

angular.module("ngapp")
.controller("AlertFormController", function(shared, $state, $scope,$rootScope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage,$cordovaSQLite,$filter,$cordovaNetwork){
    shared.checkUserCached();

    var ctrl = this;  

    ctrl.typeNetwork = $cordovaNetwork.getNetwork();
    ctrl.isNetworkOnline = $cordovaNetwork.isOnline();
    ctrl.isNetworkOffline = $cordovaNetwork.isOffline();

    console.log('network');
    console.log(ctrl.typeNetwork);
    console.log(ctrl.isNetworkOnline);
    console.log(ctrl.isNetworkOffline);

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      console.log('online listener');
      var onlineState = networkState;
      console.log(onlineState);

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
        onSetDate : ctrl.todayDate,
        status : null,
        warningPriority : null,
        urgency : null,
        certainty : null,
        severity : null,
        scope : null,
        description : null,
        headline : null
    };

    ctrl.currPage = 1;
    ctrl.hidePage = [false,true,true,true,true,true,true,true,true,true];
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
        if(ctrl.currPage == 2 && ctrl.dataAlertForm.status != null){
            return false;
        }
        else if(ctrl.currPage == 3 && ctrl.dataAlertForm.template.id != null){
            return false;
        }
        else if(ctrl.currPage == 4){
            for(var i=0;i<ctrl.dataPredefinedAreaOptions.length;i++){
                if(ctrl.dataPredefinedAreaOptions[i].selected == true){

                    return false;
                    break;
                }
            }
            
        }
        else if(ctrl.currPage == 5){
            for(var i=0;i<ctrl.dataResponseTypeOptions.length;i++){
                if(ctrl.dataResponseTypeOptions[i].selected == true){

                    return false;
                    break;
                }
            }
        }
        else if(ctrl.currPage == 6){
            if(ctrl.dataAlertForm.urgency != null && ctrl.dataAlertForm.certainty != null && ctrl.dataAlertForm.severity != null){
                return false;
            }
            
        }
        else if(ctrl.currPage == 7){
            if(ctrl.dataAlertForm.scope != null){
                return false;
            }
            
        }
        else if(ctrl.currPage == 8){
            if(ctrl.dataAlertForm.expireDate != undefined && ctrl.dataAlertForm.onSetDate != undefined && ctrl.dataAlertForm.effectiveDate != undefined){
                return false;
            }
            
        }
        else if(ctrl.currPage == 9){
            if(ctrl.dataAlertForm.description != null && ctrl.dataAlertForm.description != "" && ctrl.dataAlertForm.headline != null && ctrl.dataAlertForm.headline != ""){
                return false;
            }
            
        }
        else if(ctrl.currPage == 10){
            return false;
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
                    },
                    "$_cap_area_location" : [{
                        "location_id" : { "@value" : ctrl.dataPredefinedAreaOptions[i]['cap_area_location.location_id'].toString() }
                    }]
                };
                capAreasVal.push(areaVal);
            }    
        }

        var responseTypeVal = '';   //sample [\"AllClear\",\"Prepare\"]
        for(var i=0;i<ctrl.dataResponseTypeOptions.length;i++){
            if(ctrl.dataResponseTypeOptions[i].selected == true){
                if(responseTypeVal == ''){
                    responseTypeVal = '[\"' + ctrl.dataResponseTypeOptions[i]['@value'] + '\"';
                }
                else{
                    responseTypeVal = responseTypeVal + ',\"' + ctrl.dataResponseTypeOptions[i]['@value'] + '\"';
                }
            }
        }
        if(responseTypeVal != ''){
            responseTypeVal = responseTypeVal + ']';
        }
        
        var submitFormVal = {
            "$_cap_alert": [{
                "status": {
                  "@value" : ctrl.dataAlertForm.status
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
                    "@value" : "n/a"
                 },
                 "addresses" : {
                    "@value" : "n/a"
                 },
                 "$_cap_info" : [ {
                    "sender_name" : $localStorage["username"],
                    "event" : ctrl.dataAlertForm.eventType.name,
                    "headline" : ctrl.dataAlertForm.headline,
                    "description" : ctrl.dataAlertForm.description,
                    "event_type_id" : {
                      "@value" : ctrl.dataAlertForm.eventType.id.toString()
                    },
                    "response_type" : {"@value": responseTypeVal},
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
                    "onset": {
                        "@value" : $filter('date')(ctrl.dataAlertForm.onSetDate,"yyyy-MM-ddTHH:mm:ss")  
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

        if(ctrl.isNetworkOffline){
            shared.insertDB("t_alert_offline","insert into t_alert_offline (created_time, data_form) values (?,?)",
            [new Date(),JSON.stringify(submitFormVal)],
            function(result){
                console.log('success insert to db');
                $location.path("/main");
            },function(error){
                console.log('error to db');
                $location.path("/main");
            });
        }
        else{
            var url = shared.sendAlertApiUrl;
            var promiseSendDataForm = shared.sendDataForm(url,JSON.stringify(submitFormVal));
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
        }

        
    };

    ctrl.clickEventTypeOption = function(ev,eventTypeObj){
        
        //filter template
        ctrl.dataTemplateOptions = new Array();
        ctrl.getTemplateData("where event_event_type_id = ?",[eventTypeObj['@value']]);

        //predefined area
        ctrl.dataPredefinedAreaOptions = new Array();
        ctrl.getPredefinedAreaData("where event_type_id = ?",[eventTypeObj['@value']]);

        angular.element( ".event-type-opt" ).removeClass('selectedList').addClass( "unSelectedList" );
        angular.element( "#event-type-opt_"+eventTypeObj['@value'] ).removeClass('unSelectedList').addClass( "selectedList" );

        ctrl.dataAlertForm.eventType = {id:eventTypeObj['@value'],name:eventTypeObj['$']};
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage ++; //go to status
        ctrl.hidePage[ctrl.currPage-1] = false;  
        ctrl.changePageView();
    };

    ctrl.clickTemplateOption = function(ev,templateObj){
        //set scope
        ctrl.dataAlertForm.scope = templateObj.scope;

        //set response type
        for(var i=0;i<ctrl.dataResponseTypeOptions.length;i++){
            if(templateObj['cap_info.response_type'] == ctrl.dataResponseTypeOptions[i]['@value']){
                ctrl.dataResponseTypeOptions[i].selected = true;
            }
        }

        angular.element( ".template-opt" ).removeClass('selectedList').addClass( "unSelectedList" );
        angular.element( "#template-opt_"+templateObj['id'] ).removeClass('unSelectedList').addClass( "selectedList" );

        ctrl.dataAlertForm.template = {id:templateObj['id'],name:templateObj.template_title};
        ctrl.hidePage[ctrl.currPage-1] = true;
        ctrl.currPage ++; //go to location
        ctrl.hidePage[ctrl.currPage-1] = false;  
        ctrl.changePageView();
    };

    ctrl.clickWarningPriority = function(idx){
        ctrl.dataAlertForm.severity = ctrl.dataWarningPrioritys[idx].severity;
        ctrl.dataAlertForm.certainty = ctrl.dataWarningPrioritys[idx].certainty;
        ctrl.dataAlertForm.urgency = ctrl.dataWarningPrioritys[idx].urgency;
    };

    ctrl.dataEventTypeOptions = new Array();
    shared.selectDB("m_event_type","select * from m_event_type",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataEventTypeOption = {
                '@value':result.rows.item(i).id,
                '$':result.rows.item(i).name
            };
            ctrl.dataEventTypeOptions.push(dataEventTypeOption);   
        } 
      } 
    },null);

    ctrl.dataResponseTypeOptions = new Array();
    shared.selectDB("m_response_type","select * from m_response_type",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataResponseTypeOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name,
                'selected':false
            };
            ctrl.dataResponseTypeOptions.push(dataResponseTypeOption);   
        } 
      } 
    },null);

    ctrl.dataUrgencyOptions = new Array();
    shared.selectDB("m_urgency","select * from m_urgency",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataUrgencyOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataUrgencyOptions.push(dataUrgencyOption);   
        } 
      } 
    },null);

    ctrl.dataCertaintyOptions = new Array();
    shared.selectDB("m_certainty","select * from m_certainty",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataCertaintyOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataCertaintyOptions.push(dataCertaintyOption);   
        } 
      } 
    },null);

    ctrl.dataSeverityOptions = new Array();
    shared.selectDB("m_severity","select * from m_severity",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataSeverityOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataSeverityOptions.push(dataSeverityOption);   
        } 
      } 
    },null);

    ctrl.dataScopeOptions = new Array();
    shared.selectDB("m_scope","select * from m_scope",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataScopeOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataScopeOptions.push(dataScopeOption);   
        } 
      } 
    },null);

    ctrl.dataStatusOptions = new Array();
    shared.selectDB("m_status","select * from m_status",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataStatusOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataStatusOptions.push(dataStatusOption);   
        } 
      } 
    },null);

    ctrl.dataTemplateOptions = new Array();
    ctrl.getTemplateData = function(filter,dataDB){
        var query = "select * from m_template "+filter;
        shared.selectDB("m_template",query,dataDB,function(result){
          if(result.rows.length > 0) {
            for(var i=0;i<result.rows.length;i++){
                var dataTemplateOption = {
                    'id':result.rows.item(i).id,
                    'template_title':result.rows.item(i).template_title,
                    'scope':result.rows.item(i).cap_scope,
                    'cap_info.category':JSON.parse(result.rows.item(i).cap_info_category),
                    'cap_info.response_type':JSON.parse(result.rows.item(i).cap_info_response_type),
                    'cap_info.event_type_id':result.rows.item(i).event_event_type_id
                };
                ctrl.dataTemplateOptions.push(dataTemplateOption);   
            } 
          } 
        },null);
    };   

    ctrl.dataWarningPrioritys = new Array();
    shared.selectDB("m_warning_priority","select * from m_warning_priority",[],function(result){
      if(result.rows.length > 0) {
        for(var i=0;i<result.rows.length;i++){
            var dataWarningPriority = {
                'id':result.rows.item(i).id,
                'name':result.rows.item(i).name,
                'priority_rank':result.rows.item(i).priority_rank,
                'color_code':result.rows.item(i).color_code,
                'severity':result.rows.item(i).severity,
                'certainty':result.rows.item(i).certainty,
                'urgency':result.rows.item(i).urgency,
                'event_type_id':result.rows.item(i).event_type_id
            };
            ctrl.dataWarningPrioritys.push(dataWarningPriority);   
        } 
      } 
    },null);

    ctrl.dataPredefinedAreaOptions = new Array();
    ctrl.getPredefinedAreaData = function(filter,dataDB){
        var query = "select * from m_predefined_area "+filter;
        shared.selectDB("m_predefined_area",query,dataDB,function(result){
      
          if(result.rows.length > 0) {
            for(var i=0;i<result.rows.length;i++){
                var dataPredefinedAreaOption = {
                  'id':result.rows.item(i).id,  
                  'name': result.rows.item(i).name,
                  'event_type_id':result.rows.item(i).event_type_id,
                  'cap_area_location.location_id': result.rows.item(i).location_id,
                  'selected':false
                };
                ctrl.dataPredefinedAreaOptions.push(dataPredefinedAreaOption);   
            } 
          } 
        },null);
     };   

});
