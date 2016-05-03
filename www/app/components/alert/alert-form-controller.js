"use strict";

angular.element(document).ready(function () {
  if (window.cordova) {
    console.log("Running in Cordova, Back button.");
    document.addEventListener("backbutton", function(){
        callBackButton();
    }, false);

   
  } 
});

angular.module("ngapp")
.controller("AlertFormController", function(shared, $state, $scope, $compile,$rootScope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$location,$localStorage,$cordovaSQLite,$filter,$timeout,$cordovaNetwork){
    shared.checkUserCached();

    var ctrl = this;  

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
         //$cordovaDialogs.alert('success', 'Message', 'OK');
         //$cordovaDialogs.alert('Lon = '+position.coords.longitude+" , Lat = "+position.coords.latitude, 'Message', 'OK');
        console.log('Lon = '+position.coords.longitude+" , Lat = "+position.coords.latitude);
        ctrl.renderingGeolocation = false;
        ctrl.longitude = position.coords.longitude;
        ctrl.latitude = position.coords.latitude;
        map.setView([position.coords.latitude, position.coords.longitude], 16);
        mapThumbnail.setView([position.coords.latitude, position.coords.longitude], 16);
        mapThumbnailSummary.setView([position.coords.latitude, position.coords.longitude], 16);
    }, function(err) {
        // error
    });

    //right side BaseMap
    ctrl.toggleBaseMap = function () {
      $mdSidenav("baseMapContent")
        .toggle()
        .then(function () {
          //$log.debug("toggle Right is done");
        });
    };
    ctrl.closeBaseMap = function (){
      $mdSidenav('baseMapContent').close()
      .then(function () {
        //$log.debug("close RIGHT is done");
      });
    };  

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

    ctrl.evenTypeIcon = function(eventTypeName){
        return "assets/images/disaster/"+ shared.evenTypeIcon(eventTypeName) + ".png";
    }; 

    ctrl.currentDateTime = new Date();
    ctrl.todayDate = new Date(ctrl.currentDateTime.getFullYear(), ctrl.currentDateTime.getMonth(), ctrl.currentDateTime.getDate(), ctrl.currentDateTime.getHours(), ctrl.currentDateTime.getMinutes(), 0);
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
        msgType : null,
        warningPriority : null,
        urgency : null,
        certainty : null,
        severity : null,
        scope : null,
        description : null,
        instruction : null,
        headline : null,
        restriction: "",
        addresses:null,
        parameters:null
    };

    ctrl.currPage = 1;
    ctrl.hidePage = [{'pageName':'event-type','isHide':false,'loadData':true},{'pageName':'status','isHide':true,'loadData':true},{'pageName':'msgType','isHide':true,'loadData':true},{'pageName':'template','isHide':true,'loadData':true},{'pageName':'location','isHide':true,'loadData':true},{'pageName':'response-type','isHide':true,'loadData':true},{'pageName':'warning-priority','isHide':true,'loadData':true},{'pageName':'scope','isHide':true,'loadData':true},{'pageName':'addresses','isHide':true,'loadData':true},{'pageName':'note','isHide':true,'loadData':true},{'pageName':'date','isHide':true,'loadData':true},{'pageName':'parameter','isHide':true,'loadData':true},{'pageName':'submit','isHide':true,'loadData':true}];
    ctrl.progress = 100/ctrl.hidePage.length;
    ctrl.progressText = ctrl.currPage.toString()+"/"+ctrl.hidePage.length.toString();
    ctrl.btnBackName = "< Home";
    ctrl.btnNextName = "Next >";
    ctrl.hideNextBtn = false;

    ctrl.checkPageIdx = function(pageName){
        for(var i=0;i<ctrl.hidePage.length;i++){
            if(ctrl.hidePage[i].pageName == pageName){
                return i;
            }
        }
    };
    ctrl.checkPageShow = function(pageName){
        for(var i=0;i<ctrl.hidePage.length;i++){
            if(ctrl.hidePage[i].pageName == pageName){
                return ctrl.hidePage[i].isHide;
            }
        }
    };
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

        ctrl.hidePagelocation[0] = true;
        if(ctrl.hidePage[ctrl.currPage-1].pageName == 'location'){
            ctrl.hidePagelocation = [false,true,true];

            $timeout(function () { 
                mapThumbnail.invalidateSize();
            }, 1000);
        }

        if(ctrl.hidePage[ctrl.currPage-1].pageName == 'submit'){
            $timeout(function () { 
                mapThumbnailSummary.invalidateSize();
                ctrl.renderPolygonOnThumbnailSummMap();
            }, 1000);
        }
    }

    ctrl.goBack = function(){
        if(ctrl.currPage == 1){
            ctrl.goHome();
        }
        else{
            ctrl.hidePage[ctrl.currPage-1].isHide = true;
            ctrl.currPage -= 1;
            ctrl.hidePage[ctrl.currPage-1].isHide = false;    
            ctrl.changePageView();
        }
        
    };

    varOutside = ctrl;
    callBackButton = function(){
        console.log("call inside controller alert form");
        varOutside.goBack();
    };

    ctrl.goHome = function(){
        $location.path("/main");
    }

    ctrl.goNext = function(){    
        if(ctrl.currPage == ctrl.hidePage.length){
            //ctrl.submitForm();
        }
        else{
            ctrl.hidePage[ctrl.currPage-1].isHide = true;
            ctrl.currPage += 1;
            ctrl.hidePage[ctrl.currPage-1].isHide = false;    
            ctrl.changePageView();    
        }
         
    };

    ctrl.disabledNextBtn = function(){
        if(ctrl.hidePage[ctrl.currPage-1].pageName == 'event-type' && ctrl.dataAlertForm.eventType.id != null){
            return false;
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'status' && ctrl.dataAlertForm.status != null){
            return false;
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'msgType' && ctrl.dataAlertForm.status != null){
            return false;
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'template' && ctrl.dataAlertForm.template.id != null){
            return false;
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'location'){
            if(ctrl.checkInsertedAreasVal() == false || ctrl.checkPredefinedAreasVal() == false){
                return false;
            }
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'response-type'){
            for(var i=0;i<ctrl.dataResponseTypeOptions.length;i++){
                if(ctrl.dataResponseTypeOptions[i].selected == true){

                    return false;
                    break;
                }
            }
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'warning-priority'){
            if(ctrl.showNoAvailableWarningPrioritys == false){
                if(ctrl.dataAlertForm.urgency != null && ctrl.dataAlertForm.certainty != null && ctrl.dataAlertForm.severity != null){
                    return false;
                }
            }
            else{
                return false;
            }
            
            
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'scope'){
            if(ctrl.dataAlertForm.scope != null){
                return false;
            }
            
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'addresses'){
            if(ctrl.checkGroupUsersVal() == false && ctrl.dataAlertForm.scope == 'Private'){
                return false;
            }
            else if(ctrl.dataAlertForm.scope != 'Private'){
                return false;
            }
            
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'date'){
            if(ctrl.dataAlertForm.expireDate != undefined && ctrl.dataAlertForm.onSetDate != undefined && ctrl.dataAlertForm.effectiveDate != undefined){
                return false;
            }
            
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'parameter'){
            if(ctrl.checkParametersVal() != false){
                return false;
            }
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'note'){
            if(ctrl.dataAlertForm.description != null && ctrl.dataAlertForm.description != "" && ctrl.dataAlertForm.headline != null && ctrl.dataAlertForm.headline != "" && ctrl.dataAlertForm.instruction != null && ctrl.dataAlertForm.instruction != ""){

                if(ctrl.showRestriction()){
                    if(ctrl.dataAlertForm.restriction != null && ctrl.dataAlertForm.restriction != ""){
                        return false;
                    }
                }
                else{
                    return false;
                }
                
            }
            
        }
        else if(ctrl.hidePage[ctrl.currPage-1].pageName == 'submit'){
            return false;
        }

        return true;
    }

    ctrl.password = "";
    ctrl.submitForm = function(){
        //console.log('click it');
        var capAreasVal = new Array();
        var capAreasValXML = "";
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

                capAreasValXML = capAreasValXML + '<resource name="cap_area">'+
                '   <data field="name">'+ctrl.dataPredefinedAreaOptions[i].name+'</data>'+
                '   <data field="is_template" value="false"/>'+
                '   <resource name="cap_area_location">'+
                '       <data field="location_id">'+ctrl.dataPredefinedAreaOptions[i]['cap_area_location.location_id'].toString()+'</data>'+
                '   </resource>'+
                '</resource>';
            }    
        }

        var gisLocationDetails = "";
        for(var i=0;i<ctrl.newAreas.length;i++){
            var guid = shared.guid();    
            var areaVal = {
                "name" : ctrl.newAreas[i].name,
                "is_template" : {
                    "@value" : "F"
                }
            };
            capAreasVal.push(areaVal);

            capAreasValXML = capAreasValXML + '<resource name="cap_area">'+
                '   <data field="name">'+ctrl.newAreas[i].name+'</data>'+
                '   <data field="is_template" value="false"/>'+
                '   <resource name="cap_area_location">'+
                '       <reference field="location_id" resource="gis_location" uuid="urn:uuid:'+guid+'" />'+
                '   </resource>'+
                '</resource>';

            gisLocationDetails = gisLocationDetails + '<resource name="gis_location" uuid="urn:uuid:'+guid+'" ref="True">'+
                '   <data field="name">'+ctrl.newAreas[i].name+'</data>'+
                '   <data field="wkt">'+ctrl.newAreas[i].wkt+'</data>'+
                '</resource>';    
            
        }

        //ctrl.showNoAvailableWarningPrioritys
        var warningPriorityXml = "";
        if(ctrl.showNoAvailableWarningPrioritys == false){
            warningPriorityXml = '<data field="urgency">'+ctrl.dataAlertForm.urgency+'</data>'+
            '<data field="severity">'+ctrl.dataAlertForm.severity+'</data>'+
            '<data field="certainty">'+ctrl.dataAlertForm.certainty+'</data>';
        }

        var responseTypeVal = '';   //sample [\"AllClear\",\"Prepare\"]
        var responseTypeValXML = '';   //sample [\"AllClear\",\"Prepare\"]
        for(var i=0;i<ctrl.dataResponseTypeOptions.length;i++){
            if(ctrl.dataResponseTypeOptions[i].selected == true){
                if(responseTypeVal == ''){
                    responseTypeVal = '[\"' + ctrl.dataResponseTypeOptions[i]['@value'] + '\"';
                    responseTypeValXML = '["' + ctrl.dataResponseTypeOptions[i]['@value'] + '"';
                }
                else{
                    responseTypeVal = responseTypeVal + ',\"' + ctrl.dataResponseTypeOptions[i]['@value'] + '\"';
                    responseTypeValXML = responseTypeValXML + ',"' + ctrl.dataResponseTypeOptions[i]['@value'] + '"';
                }
            }
        }
        if(responseTypeVal != ''){
            responseTypeVal = responseTypeVal + ']';
            responseTypeValXML = responseTypeValXML + ']';
        }

        var capGroupUserValXML = "";
        for(var i=0;i<ctrl.dataGroupUsers.length;i++){
            if(ctrl.dataGroupUsers[i].selected == true){
                if(capGroupUserValXML == ''){
                    capGroupUserValXML = '[' + ctrl.dataGroupUsers[i]['id'] + '';
                }
                else{
                    capGroupUserValXML = capGroupUserValXML + ',' + ctrl.dataGroupUsers[i]['id'] + '';
                }
            }
        }
        if(capGroupUserValXML != ''){
            capGroupUserValXML = '<data field="addresses">'+capGroupUserValXML + ']</data>';
        }

        //<data field="parameter">[{"value":"Flood","key":"eventtype"},{"value":"Rising","key":"warningpriority"}]</data> 
        var parameterStr = "";
        if(ctrl.dataAlertForm.parameters != null){
            for(var i=0;i<ctrl.dataAlertForm.parameters.length;i++){
                if(i==0){
                    parameterStr = '<data field="parameter">[';
                }
                parameterStr = parameterStr + '{"value":"'+ctrl.dataAlertForm.parameters[i].value+'","key":"'+ctrl.dataAlertForm.parameters[i].key+'"}';
                if((i+1) == ctrl.dataAlertForm.parameters.length){
                    parameterStr = parameterStr + ']</data>';
                }
            }
        }
        
        var submitFormVal = {
            "$_cap_alert": [{
                "status": {
                  "@value" : ctrl.dataAlertForm.status
                 },
                 "msg_type": {
                  "@value" : ctrl.dataAlertForm.msgType
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
                    "@value" : ctrl.dataAlertForm.restriction
                 },
                 "addresses" : {
                    "@value" : ctrl.dataAlertForm.addresses
                 },
                 "event_type_id" : {
                    "@value" : ctrl.dataAlertForm.eventType.id.toString()
                 },
                 "$_cap_info" : [ {
                    "sender_name" : $localStorage["username"],
                    "event" : ctrl.dataAlertForm.eventType.name,
                    "headline" : ctrl.dataAlertForm.headline,
                    "description" : ctrl.dataAlertForm.description,
                    "instruction" : ctrl.dataAlertForm.instruction,
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

        var strXML = '<s3xml>'+
            '<resource name="cap_alert">'+
            '    <data field="status">'+ctrl.dataAlertForm.status+'</data>'+
            '    <data field="msg_type">'+ctrl.dataAlertForm.msgType+'</data>'+
            '    <data field="is_template" value="false"/>'+
            '    <data field="scope">'+ctrl.dataAlertForm.scope+'</data>'+
            '    <data field="template_id">'+ctrl.dataAlertForm.template.id.toString()+'</data>'+
            '    <data field="restriction">'+ctrl.dataAlertForm.restriction+'</data>'+
            '    <data field="event_type_id">'+ctrl.dataAlertForm.eventType.id.toString()+'</data>'+
            capGroupUserValXML+
            '    <resource name="cap_info">'+
            '        <data field="sender_name">'+$localStorage["username"]+'</data>'+
            '        <data field="event">'+ctrl.dataAlertForm.eventType.name+'</data>'+ 
            '        <data field="headline">'+ctrl.dataAlertForm.headline+'</data>'+
            '        <data field="description">'+ctrl.dataAlertForm.description+'</data>'+
            '        <data field="instruction">'+ctrl.dataAlertForm.instruction+'</data>'+
            '        <data field="event_type_id">'+ctrl.dataAlertForm.eventType.id.toString()+'</data>'+
            '        <data field="response_type">'+responseTypeValXML+'</data>'+
            warningPriorityXml+
            '        <data field="expires">'+$filter('date')(ctrl.dataAlertForm.expireDate,"yyyy-MM-ddTHH:mm:ss")+'</data>'+
            '        <data field="onset">'+$filter('date')(ctrl.dataAlertForm.onSetDate,"yyyy-MM-ddTHH:mm:ss")+'</data>'+
            '        <data field="effective">'+$filter('date')(ctrl.dataAlertForm.effectiveDate,"yyyy-MM-ddTHH:mm:ss")+'</data>'+
            '        <data field="is_template" value="false"/>'+
            parameterStr+
            '    </resource>'+
            capAreasValXML+
            '</resource>'+
            gisLocationDetails+
        '</s3xml>';

        console.log("xml = "+strXML);
        console.log($localStorage['password']);
        if(CryptoJS.AES.decrypt($localStorage['password'], "Secret Passphrase").toString(CryptoJS.enc.Utf8) == ctrl.password){
            if(ctrl.isNetworkOffline){
                shared.insertDB("t_alert_offline","insert into t_alert_offline (created_time, data_form,data_form_json) values (?,?,?)",
                [new Date(),strXML,JSON.stringify(submitFormVal)],     //[new Date(),JSON.stringify(submitFormVal)],
                function(result){
                    $cordovaDialogs.alert('The alert could not be sent to the server because you are offline at the moment.\nPlease check your network settings.\nThe alert will be sent as soon you are online again.','Stored alert in local', 'OK');
                    
                    console.log('success insert to db');
                    $location.path("/main");
                },function(error){
                    
                    console.log('error to db');
                    $location.path("/main");
                });
            }
            else{
                var url = shared.sendAlertApiUrl;
                var promiseSendDataForm = shared.sendDataForm(url,strXML);   //JSON.stringify(submitFormVal)
                promiseSendDataForm.then(function(response) {
                    $cordovaDialogs.alert('Success send alert to server','Success', 'OK');
                    console.log("success Save");
                    console.log(JSON.stringify(response));
                    ctrl.responseDebug = response;

                    var alertId = response.created[0];
                    shared.sendNotif(alertId,function(){
                        console.log("Send notif success ["+alertId.toString()+"]");
                        $location.path("/main");
                    },function(){
                        console.log("Send notif failed ["+alertId.toString()+"]");
                        $location.path("/main");
                    });
                    
                    //$cordovaDialogs.alert('success', response, 'OK');
                }, function(reason) {
                    console.log("failed Save");
                    console.log(JSON.stringify(reason));
                    ctrl.responseDebug = reason;
                    //$cordovaDialogs.alert('failed', reason, 'OK');
                    $location.path("/main");
                });
            }
        }
        else{
            console.log('failed');
            ctrl.hideErrorMessage = false;
            $cordovaDialogs.alert('Failed', 'Password wrong', 'OK');
        }
    };

    ctrl.clickEventTypeOption = function(ev,eventTypeObj){
        
        //filter template
        ctrl.dataTemplateOptions = new Array();
        ctrl.getTemplateData("where event_event_type_id = ?",[eventTypeObj['@value']]);

        //predefined area
        ctrl.dataPredefinedAreaOptions = new Array();
        ctrl.getPredefinedAreaData("where event_type_id = ?",[eventTypeObj['@value']]);

        //warning priority
        ctrl.dataWarningPrioritys = new Array();
        ctrl.getWarningPriorityData("where event_type_id = ?",[eventTypeObj['@value']]);

        angular.element( ".event-type-opt" ).removeClass('selectedList').addClass( "unSelectedList" );
        angular.element( "#event-type-opt_"+eventTypeObj['@value'] ).removeClass('unSelectedList').addClass( "selectedList" );

        ctrl.dataAlertForm.eventType = {id:eventTypeObj['@value'],name:eventTypeObj['$']};
        ctrl.hidePage[ctrl.currPage-1].isHide = true;
        ctrl.currPage ++; //go to status
        ctrl.hidePage[ctrl.currPage-1].isHide = false;  
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
        ctrl.dataAlertForm.parameters = templateObj['cap_info.parameter'];

        console.log("cap_info.parameter");
        console.log(JSON.stringify(ctrl.dataAlertForm.parameters));

        ctrl.dataAlertForm.headline = templateObj['cap_info.headline'][0];
        ctrl.dataAlertForm.description = templateObj['cap_info.description'][0];

        angular.element( ".template-opt" ).removeClass('selectedList').addClass( "unSelectedList" );
        angular.element( "#template-opt_"+templateObj['id'] ).removeClass('unSelectedList').addClass( "selectedList" );

        ctrl.dataAlertForm.template = {id:templateObj['id'],name:templateObj.template_title};
        ctrl.hidePage[ctrl.currPage-1].isHide = true;
        ctrl.currPage ++; //go to location
        ctrl.hidePage[ctrl.currPage-1].isHide = false;  
        ctrl.changePageView();
    };

    ctrl.clickWarningPriority = function(idx){
        ctrl.dataAlertForm.severity = ctrl.dataWarningPrioritys[idx].severity;
        ctrl.dataAlertForm.certainty = ctrl.dataWarningPrioritys[idx].certainty;
        ctrl.dataAlertForm.urgency = ctrl.dataWarningPrioritys[idx].urgency;
    };

    ctrl.showRestriction = function(){
        if(ctrl.dataAlertForm.scope == "Restricted"){
            return true;
        }

        return false;
    };

    ctrl.summaryClickDetail = function(pageName){
        for(var i=0;i<ctrl.hidePage.length;i++){
            if(ctrl.hidePage[i].pageName == pageName){
                ctrl.hidePage[ctrl.currPage-1].isHide = true;
                ctrl.currPage = i+1;
                ctrl.hidePage[ctrl.currPage-1].isHide = false;    
                ctrl.changePageView();
            }
        }
    };

    ctrl.dataEventTypeOptions = new Array();


    //SELECT met.* FROM m_event_type met INNER JOIN m_template mt ON met.id = mt.event_event_type_id
    //select * from m_event_type
    shared.selectDB("m_event_type","SELECT distinct met.* FROM m_event_type met INNER JOIN m_template mt ON met.id = mt.event_event_type_id",[],function(result){
      if(result.rows.length > 0) {

        ctrl.hidePage[ctrl.checkPageIdx('event-type')].loadData = false;

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

        ctrl.hidePage[ctrl.checkPageIdx('response-type')].loadData = false;

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

        ctrl.hidePage[ctrl.checkPageIdx('scope')].loadData = false;

        for(var i=0;i<result.rows.length;i++){
            var dataScopeOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataScopeOptions.push(dataScopeOption);   
        } 
      } 
    },null);

    ctrl.dataGroupUsers = new Array();
    ctrl.showNoAvailableGroupUsers = false;
    shared.selectDB("m_group_user","select * from m_group_user",[],function(result){
      if(result.rows.length > 0) {

        ctrl.hidePage[ctrl.checkPageIdx('addresses')].loadData = false;
        ctrl.showNoAvailableGroupUsers = false;

        for(var i=0;i<result.rows.length;i++){
            var dataGroupPerson = {
                'id':result.rows.item(i).id,
                'name':result.rows.item(i).name,
                'group_type':result.rows.item(i).group_type,
                'description': result.rows.item(i).description,
                'comments': result.rows.item(i).comments, 
                'selected':false
            };
            ctrl.dataGroupUsers.push(dataGroupPerson);   
        } 
      } 
      else{
        ctrl.hidePage[ctrl.checkPageIdx('addresses')].loadData = false;
        ctrl.showNoAvailableGroupUsers = true;
      }
    },null);

    ctrl.dataStatusOptions = new Array();
    shared.selectDB("m_status","select * from m_status",[],function(result){
      if(result.rows.length > 0) {

        ctrl.hidePage[ctrl.checkPageIdx('status')].loadData = false;

        for(var i=0;i<result.rows.length;i++){
            var dataStatusOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataStatusOptions.push(dataStatusOption);   
        } 
      } 
    },null);

    ctrl.dataMsgTypeOptions = new Array();
    shared.selectDB("m_msg_type","select * from m_msg_type",[],function(result){
      if(result.rows.length > 0) {

        ctrl.hidePage[ctrl.checkPageIdx('msgType')].loadData = false;

        for(var i=0;i<result.rows.length;i++){
            var dataMsgTypeOption = {
                '@value':result.rows.item(i).fvalue,
                '$':result.rows.item(i).name
            };
            ctrl.dataMsgTypeOptions.push(dataMsgTypeOption);   
        } 
      } 
    },null);

    ctrl.dataTemplateOptions = new Array();
    ctrl.getTemplateData = function(filter,dataDB){

        ctrl.hidePage[ctrl.checkPageIdx('template')].loadData = true;

        var query = "select * from m_template "+filter;
        shared.selectDB("m_template",query,dataDB,function(result){
          if(result.rows.length > 0) {

            ctrl.hidePage[ctrl.checkPageIdx('template')].loadData = false;

            for(var i=0;i<result.rows.length;i++){
                var dataTemplateOption = {
                    'id':result.rows.item(i).id,
                    'template_title':result.rows.item(i).template_title,
                    'scope':result.rows.item(i).cap_scope,
                    'cap_info.category':JSON.parse(result.rows.item(i).cap_info_category),
                    'cap_info.response_type':JSON.parse(result.rows.item(i).cap_info_response_type),
                    'cap_info.event_type_id':result.rows.item(i).event_event_type_id,
                    'cap_info.description':JSON.parse(result.rows.item(i).cap_info_description),
                    'cap_info.headline':JSON.parse(result.rows.item(i).cap_info_headline),
                    'cap_info.parameter':JSON.parse(result.rows.item(i).cap_info_parameter)
                };
                dataTemplateOption['cap_info.description'] = angular.isArray(dataTemplateOption['cap_info.description']) ? dataTemplateOption['cap_info.description'] : [dataTemplateOption['cap_info.description']];
                dataTemplateOption['cap_info.headline'] = angular.isArray(dataTemplateOption['cap_info.headline']) ? dataTemplateOption['cap_info.headline'] : [dataTemplateOption['cap_info.headline']];

                //filter value for parameter value
                var arrNewVal = new Array();
                if(dataTemplateOption['cap_info.parameter'] != null){
                    if(angular.isArray(dataTemplateOption['cap_info.parameter'])){
                        for(var j=0;j<dataTemplateOption['cap_info.parameter'].length;j++){
                            var val = JSON.parse(dataTemplateOption['cap_info.parameter'][j]);
                            if(angular.isArray(val)){
                                if(val.length>0){
                                    var valDetail = new Array();
                                    for(var k=0;k<val.length;k++){
                                        if(val[k].key.indexOf("sahana") > -1){
                                            valDetail.push(val[k]);
                                        }
                                    }
                                    arrNewVal = valDetail;
                                }   
                            }
                        }
                    }
                }
                dataTemplateOption['cap_info.parameter'] = arrNewVal;

                ctrl.dataTemplateOptions.push(dataTemplateOption);   
            } 
          } 
        },null);
    };   

    ctrl.dataWarningPrioritys = new Array();
    ctrl.showNoAvailableWarningPrioritys = false;
    ctrl.getWarningPriorityData = function(filter,dataDB){

        ctrl.hidePage[ctrl.checkPageIdx('warning-priority')].loadData = true;

        var query = "select * from m_warning_priority "+filter;
        console.log('query = '+query);
        console.log('dataDB = '+dataDB);
        shared.selectDB("m_warning_priority",query,dataDB,function(result){
          if(result.rows.length > 0) {

            ctrl.hidePage[ctrl.checkPageIdx('warning-priority')].loadData = false;
            ctrl.showNoAvailableWarningPrioritys = false;

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
                console.log('dataWarningPriority = '+ JSON.stringify(dataWarningPriority) ); 
            } 
          } 
          else{
            ctrl.hidePage[ctrl.checkPageIdx('warning-priority')].loadData = false;
            ctrl.showNoAvailableWarningPrioritys = true;
          }
        },null);
    };   
    

    ctrl.dataPredefinedAreaOptions = new Array();
    ctrl.getPredefinedAreaData = function(filter,dataDB){

        ctrl.hidePage[ctrl.checkPageIdx('location')].loadData = true;

        var query = "select * from m_predefined_area "+filter;
        shared.selectDB("m_predefined_area",query,dataDB,function(result){
      
          if(result.rows.length > 0) {

            ctrl.hidePage[ctrl.checkPageIdx('location')].loadData = false;

            for(var i=0;i<result.rows.length;i++){
                var dataPredefinedAreaOption = {
                  'id':result.rows.item(i).id,  
                  'name': result.rows.item(i).name,
                  'event_type_id':result.rows.item(i).event_type_id,
                  'cap_area_location.location_id': result.rows.item(i).location_id,
                  'selected':false,
                  'spatial_val':result.rows.item(i).spatial_val
                };
                ctrl.dataPredefinedAreaOptions.push(dataPredefinedAreaOption);   
            } 
          } 
          else{
            ctrl.hidePage[ctrl.checkPageIdx('location')].loadData = false;
          }
        },null);
     }; 


    ctrl.checkParametersVal = function(){
        for(var i=0;i<ctrl.dataAlertForm.parameters.length;i++){
            if(ctrl.dataAlertForm.parameters[i].value == ""){

                return false;
                break;
            }
        }
        return true;
    }; 

    //=================================== location action =================================== 
    ctrl.longitude = 0;
    ctrl.latitude = 0;
    ctrl.newArea = {name:"",wkt:"",typeSpatial:"",edited:false,idxAreas:-1};
    ctrl.newAreas = new Array();
    ctrl.hidePagelocation = [true,true,true];
    ctrl.hideAddAreaBtn = true;
    ctrl.clickAddArea = function(){
        ctrl.hidePagelocation = [true,false,true];
    };
    ctrl.clickShowMap = function(){
        ctrl.showMap();        
        ctrl.newArea = {name:"",wkt:"",typeSpatial:"",edited:false,idxAreas:-1};
        if(layerTemp != null){
            featureGroupDraw.removeLayer(layerTemp);
        }  

        var toolbarId = drawControl._toolbars.draw._leaflet_id - 1;
        //console.log('_leaflet_click'+toolbarId.toString());
        //angular.element('.leaflet-draw-draw-polygon').trigger('_leaflet_click'+toolbarId.toString());
        
        // var event = document.createEvent('Event');
        // event.initEvent('click', true, true);
        // var cb = document.getElementsByClassName('leaflet-draw-draw-polyline');
        // !cb[0].dispatchEvent(event);

        //polygonDrawer.enable();

        console.log('passed');
    };
    ctrl.showMap = function(){
        ctrl.btnBackName = "";
        ctrl.btnNextName = "";

        angular.element('#content-alert-form').hide();
        angular.element('#map').show();
        map.invalidateSize();
    };
    ctrl.clickCancelNewArea = function(){
        ctrl.hidePagelocation = [false,true,true];
        
        $timeout(function () { 
            mapThumbnail.invalidateSize();
            ctrl.renderPolygonOnThumbnailMap();
        }, 1000);
    };
    ctrl.clickCancelDrawonMap = function(){
        ctrl.btnBackName = "< Back";
        ctrl.btnNextName = "Next >";

        angular.element('#content-alert-form').show();
        angular.element('#map').hide();
    }
    ctrl.clickSubmitMap = function(){
        $cordovaDialogs.prompt('Enter area name', 'Area Name', ['Ok','Cancel'], ctrl.newArea.name)
        .then(function(result) {
          var input = result.input1;
          // no button = 0, 'OK' = 1, 'Cancel' = 2
          var btnIndex = result.buttonIndex;
          if(btnIndex == 1){
            if(input != ""){
                ctrl.newArea.name = input;
                ctrl.clickCancelDrawonMap();
                ctrl.hidePagelocation = [false,true,true];

                ctrl.clickSubmitNewArea();
            } 
            else{
                $cordovaDialogs.alert('Please enter area name!', 'Error', 'Ok');
            } 
          }
        });
    };

    ctrl.clickSubmitPredefinedArea = function(){
        ctrl.clickCancelNewArea();
    };
    ctrl.clickSubmitNewArea = function(){
        if(ctrl.newArea.wkt == ""){
            ctrl.newArea.wkt = "POINT("+ctrl.longitude+" "+ctrl.latitude+")";
            ctrl.newArea.typeSpatial = "point";
        }

        if(ctrl.newArea.edited == true){
            ctrl.newAreas[ctrl.newArea.idxAreas] = angular.extend({},ctrl.newArea);
        }
        else{
            ctrl.newAreas.push(angular.extend({},ctrl.newArea));    
        }
        
        ctrl.clickCancelNewArea();
    };
    ctrl.clickDeleteNewArea = function(idx){
        $cordovaDialogs.confirm('Are you sure want to remove \n'+ctrl.newAreas[idx].name, 'Delete', ['Ok','Cancel'])
        .then(function(buttonIndex) {
            // no button = 0, 'OK' = 1, 'Cancel' = 2
            var btnIndex = buttonIndex;
            if(btnIndex == 1){
                ctrl.newAreas.splice(ctrl.newAreas[idx].idxAreas, 1);
                ctrl.clickCancelNewArea();
            }
            
        });
    };
    ctrl.clickDeletePredefinedArea = function(idx){
        $cordovaDialogs.confirm('Are you sure want to remove \n'+ctrl.dataPredefinedAreaOptions[idx].name, 'Delete', ['Ok','Cancel'])
        .then(function(buttonIndex) {
            // no button = 0, 'OK' = 1, 'Cancel' = 2
            var btnIndex = buttonIndex;
            if(btnIndex == 1){
                ctrl.dataPredefinedAreaOptions[idx].selected = false;
                ctrl.clickCancelNewArea();
            } 
        });
    };


    ctrl.renderingGeolocation = true;
    ctrl.checkWktVal = function(){
        if(ctrl.newArea.wkt == ""){
            return true;
        }
        return false;
    };
    ctrl.checkPredefinedAreasVal = function(){
        for(var i=0;i<ctrl.dataPredefinedAreaOptions.length;i++){
            if(ctrl.dataPredefinedAreaOptions[i].selected == true){

                return false;
                break;
            }
        }
        return true;
    };
    ctrl.checkPredefinedAreaAvailableVal = function(){
        if(ctrl.dataPredefinedAreaOptions.length>0){
            return true;
        }
        return false;
    };
    ctrl.checkGroupUsersVal = function(){
        for(var i=0;i<ctrl.dataGroupUsers.length;i++){
            if(ctrl.dataGroupUsers[i].selected == true){

                return false;
                break;
            }
        }
        return true;
    };
    ctrl.checkInsertedAreasVal = function(){
        if(ctrl.newAreas.length>0){
            return false;
        }
        else{
            return true;
        }
    };
    ctrl.selectedArea = function(idx){
        ctrl.showMap();

        ctrl.newArea = angular.extend({},ctrl.newAreas[idx]);
        ctrl.newArea.edited = true;
        ctrl.newArea.idxAreas = idx;
        var wkt1 = new Wkt.Wkt();
        wkt1.read(ctrl.newArea.wkt);
        console.log(ctrl.newArea.name);

        var poly = L.polygon(wkt1.toObject()._latlngs,{color: 'green',fillOpacity: 0.3,stroke: false});
        featureGroupDraw.addLayer(poly);
        layerTemp = poly;
    };

    //=================================== map ===================================================
    var mapOSM;
    var ggl;
    var ggls;
    map = L.map('map',{
      maxZoom: 16,
      minZoom: 2,
      attributionControl:false
    }).setView([-6.1918, 106.8345], 2);

    //map.locate({setView: true, maxZoom: 16});

    mapOSM = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    if(google != undefined){
        ggl = new L.Google('HYBRID');
        ggls = new L.Google('ROADMAP');
    }
    map.addLayer(mapOSM);
    
    var mapOSMThumbnail;
    mapThumbnail = L.map('mapThumbnail',{
      maxZoom: 16,
      minZoom: 2,
      attributionControl:false
    }).setView([-6.1918, 106.8345], 2);
    mapOSMThumbnail = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    mapThumbnail.addLayer(mapOSMThumbnail);
    
    var mapOSMThumbnailSummary;
    mapThumbnailSummary = L.map('mapThumbnailSummary',{
      maxZoom: 16,
      minZoom: 2,
      attributionControl:false
    }).setView([-6.1918, 106.8345], 2);
    mapOSMThumbnailSummary = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    mapThumbnailSummary.addLayer(mapOSMThumbnailSummary);
    
    ctrl.changeMap = function (obj){
        if(obj == "gsal"){
            map.removeLayer(mapOSM);
            map.removeLayer(ggls);
            map.addLayer(ggl);
        }
        else if(obj == "osm"){
            map.removeLayer(ggl);
            map.removeLayer(ggls);
            map.addLayer(mapOSM);
        }
        else if(obj == "gstreet"){
            map.removeLayer(mapOSM);
            map.removeLayer(ggl);
            map.addLayer(ggls);
        }
    };

    var featureGroupPolyThumbnail = null;
    ctrl.renderPolygonOnThumbnailMap = function(){
        if(featureGroupPolyThumbnail != null){
            mapThumbnail.removeLayer(featureGroupPolyThumbnail);
        }
        featureGroupPolyThumbnail = L.featureGroup();
        mapThumbnail.addLayer(featureGroupPolyThumbnail);
       
        for(var i=0;i<ctrl.newAreas.length;i++){
            var wkt1 = new Wkt.Wkt();
            wkt1.read(ctrl.newAreas[i].wkt);

            var poly = L.polygon(wkt1.toObject()._latlngs,{color: 'green',fillOpacity: 0.7,stroke: true}).bindPopup(ctrl.newAreas[i].name);
            featureGroupPolyThumbnail.addLayer(poly);
        }

        for(var i=0;i<ctrl.dataPredefinedAreaOptions.length;i++){
            if(ctrl.dataPredefinedAreaOptions[i].selected == true){
                var geom = JSON.parse(ctrl.dataPredefinedAreaOptions[i].spatial_val);
                var coordinates = ctrl.changeWKTLonLat(geom.coordinates);
                var poly = L.polygon(coordinates,{color: 'green',fillOpacity: 0.7,stroke: true}).bindPopup(ctrl.dataPredefinedAreaOptions[i].name);
                featureGroupPolyThumbnail.addLayer(poly);
            }  
        }

        mapThumbnail.fitBounds(featureGroupPolyThumbnail.getBounds());
        
        if(ctrl.renderingGeolocation == true){
            ctrl.renderingGeolocation = false;
        }
    };

    var featureGroupPolyThumbnailSumm = null;
    ctrl.renderPolygonOnThumbnailSummMap = function(){
        if(featureGroupPolyThumbnailSumm != null){
            mapThumbnailSummary.removeLayer(featureGroupPolyThumbnailSumm);
        }
        featureGroupPolyThumbnailSumm = L.featureGroup();
        mapThumbnailSummary.addLayer(featureGroupPolyThumbnailSumm);

        for(var i=0;i<ctrl.newAreas.length;i++){
            var wkt1 = new Wkt.Wkt();
            wkt1.read(ctrl.newAreas[i].wkt);

            var poly = L.polygon(wkt1.toObject()._latlngs,{color: 'green',fillOpacity: 0.7,stroke: true}).bindPopup(ctrl.newAreas[i].name);
            featureGroupPolyThumbnailSumm.addLayer(poly);
        }

        for(var i=0;i<ctrl.dataPredefinedAreaOptions.length;i++){
            if(ctrl.dataPredefinedAreaOptions[i].selected == true){
                var geom = JSON.parse(ctrl.dataPredefinedAreaOptions[i].spatial_val);
                var coordinates = ctrl.changeWKTLonLat(geom.coordinates);
                var poly = L.polygon(coordinates,{color: 'green',fillOpacity: 0.7,stroke: true}).bindPopup(ctrl.dataPredefinedAreaOptions[i].name);
                featureGroupPolyThumbnailSumm.addLayer(poly);
            }  
        }

        mapThumbnailSummary.fitBounds(featureGroupPolyThumbnailSumm.getBounds());
    };

    //layer Change
    var layerBaseMapToolbar = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var contain = L.DomUtil.create('div', 'layerBaseMap');
            $(contain).addClass('leaflet-bar');
            $(contain).html('<button id="leaflet_layerBaseMap" class="leaflet-control" '+
            'style="margin:0px;width: 30px;height: 30px;padding-bottom: 0px;padding-top: 0px;padding-right: 0px;border-left-width: 0px;padding-left: 0px;border-top-width: 0px;border-bottom-width: 0px;border-right-width: 0px;background: white;border-radius: 5px;" >'+
            '<ng-md-icon icon="map"></ng-md-icon></button>');

            return contain;
        }
    });
    map.addControl(new layerBaseMapToolbar());
    var content=angular.element('#leaflet_layerBaseMap');
    var scope=content.scope();
    $compile(content.contents())(scope);
    angular.element('#leaflet_layerBaseMap').on('click', function() {
      ctrl.toggleBaseMap();
    });

    //Action button
    var actionButtonToolbar = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var contain = L.DomUtil.create('div', 'actionButton');
            $(contain).html('<div id="actionButtonId" style="width:100%;" layout="row" layout-align="center center">'+
                            '<md-button class="md-raised md-accent" aria-label="Cancel" ng-click="alertForm.clickCancelDrawonMap()">'+
                            ' Cancel '+
                            '</md-button>'+
                            '<md-button id="submitMapButtonId" class="md-raised md-accent" aria-label="Submit" ng-disabled="alertForm.checkWktVal()" ng-click="alertForm.clickSubmitMap()">'+
                            ' Submit '+
                            '</md-button> '+                          
                            '</div>');

            return contain;
        }
    });
    map.addControl(new actionButtonToolbar());
    content=angular.element('#actionButtonId');
    scope=content.scope();
    $compile(content.contents())(scope);

    //draw
    //Polygon drawer
    // var controlPolygonDrawerToolbar = L.Control.extend({
    //     options: {
    //         position: 'topright'
    //     },

    //     onAdd: function (map) {
    //         // create the control container with a particular class name
    //         var contain = L.DomUtil.create('div', 'controlPolygonDrawer');
    //         $(contain).addClass('leaflet-bar');
    //         $(contain).html('<button id="leaflet_controlPolygonDrawer" class="leaflet-control" '+
    //         'style="margin:0px;width: 30px;height: 30px;padding-bottom: 0px;padding-top: 0px;padding-right: 0px;border-left-width: 0px;padding-left: 0px;border-top-width: 0px;border-bottom-width: 0px;border-right-width: 0px;background: white;border-radius: 5px;" >'+
    //         '<ng-md-icon icon="map"></ng-md-icon></button>');

    //         return contain;
    //     }
    // });
    // map.addControl(new controlPolygonDrawerToolbar());
    // content=angular.element('#leaflet_controlPolygonDrawer');
    // scope=content.scope();
    // $compile(content.contents())(scope);
    // angular.element('#leaflet_controlPolygonDrawer').on('click', function() {
    //   ctrl.toggleBaseMap();
    // });

    var drawControl;
    var featureGroupDraw;
    var typeLayerDraw;
    var idMarkerDrawEdit;
    var layerTemp = null;
    featureGroupDraw = L.featureGroup();
    map.addLayer(featureGroupDraw);
    drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polyline:false,
          rectangle:false,
          circle:false,
          marker:false,
          polygon: {
                    allowIntersection: false,
                    showArea: true,
                    drawError: {
                        color: '#b00b00',
                        timeout: 1000
                    },
                    shapeOptions: {
                        color: 'green',
                        stroke: true,
                        opacity:0.7
                    }
                }
          },
        edit: {
          featureGroup: featureGroupDraw,
          edit: false,
          remove: true
        }
    });
    map.addControl(drawControl);

    // polygonDrawer = new L.Draw.Polygon(map,{
    //                 allowIntersection: false,
    //                 showArea: true,
    //                 drawError: {
    //                     color: '#b00b00',
    //                     timeout: 1000
    //                 },
    //                 shapeOptions: {
    //                     color: 'green',
    //                     stroke: true,
    //                     opacity:0.7
    //                 }
    //             }).enable();

    map.on('draw:created', function(e) {
        var type = e.layerType,
            layer = e.layer;

        if(layerTemp != null){
            featureGroupDraw.removeLayer(layerTemp);
        }    
        featureGroupDraw.addLayer(layer);
        layerTemp = layer;

        var wkt1 = new Wkt.Wkt();
        wkt1.fromObject(layer);
        var strPoint = wkt1.write();
        
        ctrl.newArea.wkt = strPoint;
        ctrl.newArea.typeSpatial = type;

        angular.element(document.getElementById('submitMapButtonId'))[0].disabled = false;
    });

    map.on('draw:deleted', function (e) {
        angular.element(document.getElementById('submitMapButtonId'))[0].disabled = true;
        ctrl.newArea.wkt = "";
        ctrl.newArea.typeSpatial = "";
        layerTemp = null;
    });

    ctrl.changeWKTLonLat = function (wkt1){
      for(var i=0;i<wkt1[0].length;i++){
        var y = wkt1[0][i][0];
        var x = wkt1[0][i][1];
        wkt1[0][i][0] = x;
        wkt1[0][i][1] = y;
      }

      return wkt1;
    };

    map.invalidateSize();

    $timeout(function () { 
        var bodyHeight = angular.element('body').height();
        var mainToolbarHeight = angular.element('.mainToolbar').outerHeight();
        var mapHeight = angular.element('#map').height(bodyHeight-mainToolbarHeight);
        console.log(mainToolbarHeight.toString());
        angular.element('#map').css('margin-top',mainToolbarHeight.toString()+'px');
        map.invalidateSize(); 
    }, 1000);



});
