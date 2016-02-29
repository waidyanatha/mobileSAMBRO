"use strict";

angular.module("ngapp").service("shared", function($http,$localStorage,$sessionStorage,$location,$cordovaSQLite){ // One of The Ways To Share Informations Across the Controllers

	var ctrl = this;
  this.info = {
      title: "CAP",
      auth: "Angga Bayu"
  };

  var _base64 = {
      _keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=_base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},
      decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=_base64._utf8_decode(t);return t},
      _utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},
      _utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}
  };

  this.base64__ = _base64;

  this.setHTTPHeaderAuth = function(username,password){
  	return {'Content-Type': 'application/x-www-form-urlencoded'
                      ,'Authorization': 'Basic '+ ctrl.base64__.encode(username + ":" + password)};
  };

  this.loadDataAlert = function(url) {

    return $http({
            method: 'GET',
            url: url,
            headers: ctrl.setHTTPHeaderAuth($localStorage['username'],$localStorage['password'])
        }).then(
        function (response) {
          return response.data;
      });
  };

  this.sendDataForm = function(url,dataForm) {

    return $http({
            method: 'POST',
            url: url,
            data: dataForm,
            headers: ctrl.setHTTPHeaderAuth($localStorage['username'],$localStorage['password'])
        }).then(
        function (response) {
          //alert('response');
          return response.data;
      });
  };

  this.loadDataLogin = function(url,username,password) {
    $http.defaults.headers.common['Authorization'] = 'Basic ' + ctrl.setHTTPHeaderAuth(username,password); 
    return $http({
            method: 'GET',
            url: url,
            beforeSend: function(xhr) {
              console.log('123');
              console.log(xhr);
              console.log(xhr.headers);
              console.log(ctrl.setHTTPHeaderAuth(username,password));

              //return ctrl.setHTTPHeaderAuth(username,password);
            },
            headers: ctrl.setHTTPHeaderAuth(username,password)
        }).then(
        function (response) {
          return response.data;
      });
  };

  this.logout = function(){
    $localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";
    $http.defaults.headers.common.Authorization = 'Basic ';
  	$location.path("/login");
  };

  this.checkUserCached = function(){
    if($localStorage['username'] == ""){
      $location.path("/login");
    }
  }

  this.apiUrl = "http://sambro.geoinfo.ait.ac.th/eden/";
  this.sendAlertApiUrl = this.apiUrl+'cap/alert.s3json';
  //this.apiUrl = "http://203.159.29.147:8000/eden/";


  ctrl.insertDB = function(tblName,query,dataDB,callBack,callBackErr) {
    var query = query;
    $cordovaSQLite.execute(dbShared, query, dataDB).then(function(result) {
      console.log("insert "+tblName );  
      if(callBack != null){
        callBack(result);
      }
    }, function (err) {
      //$cordovaDialogs.alert('err', err, 'OK');
      console.error("error " + tblName);
      console.error(err);
      if(callBackErr != null){
        callBackErr(err);
      }
    });
  };
  ctrl.updateDB = function(tblName,query,dataDB,callBack,callBackErr) {
    var query = query;
    $cordovaSQLite.execute(dbShared, query, dataDB).then(function(result) {
      console.log("update "+tblName );  
      if(callBack != null){
        callBack(result);
      }
    }, function (err) {
      //$cordovaDialogs.alert('err', err, 'OK');
      console.error("error " + tblName);
      console.error(err);
      if(callBackErr != null){
        callBackErr(err);
      }
    });
  };
  ctrl.deleteDB = function(tblName,callBack,callBackErr) {
    var query = "delete from "+tblName;
    $cordovaSQLite.execute(dbShared, query).then(function(result) {
      console.log("delete "+tblName);
      if(callBack != null){
        callBack(result);
      }
    }, function (err) {
      //$cordovaDialogs.alert('err', err, 'OK');
      console.error("error " + tblName);
      console.error(err);
      if(callBackErr != null){
        callBackErr(err);
      }
      
    });
  };
  ctrl.deleteDBWithFilter = function(tblName,filter,dataDB,callBack,callBackErr) {
    var query = "delete from "+tblName+" "+filter;
    $cordovaSQLite.execute(dbShared, query,dataDB).then(function(result) {
      console.log("delete "+tblName);
      if(callBack != null){
        callBack(result);
      }
    }, function (err) {
      //$cordovaDialogs.alert('err', err, 'OK');
      console.error("error " + tblName);
      console.error(err);
      if(callBackErr != null){
        callBackErr(err);
      }
      
    });
  };
  ctrl.selectDB = function(tblName,query,dataDB,callBack,callBackErr) {
    $cordovaSQLite.execute(dbShared,query,dataDB).then(function(result) {
      console.log("select "+tblName);
      if(callBack != null){
        callBack(result);
      }
    }, function(error) {
      console.error("error " + tblName);
      console.error(error);
      if(callBackErr != null){
        callBackErr(error);
      }
    });
  };

  //
  ctrl.booleanAllDataLoad = [{tblName:"m_event_type",isDataLoad:false},{tblName:"m_urgency",isDataLoad:false},{tblName:"m_certainty",isDataLoad:false},{tblName:"m_severity",isDataLoad:false},{tblName:"m_scope",isDataLoad:false},{tblName:"m_template",isDataLoad:false},{tblName:"m_warning_priority",isDataLoad:false},{tblName:"m_predefined_area",isDataLoad:false}];
  ctrl.setBooleanDataLoad = function (callBackFinish,tblName){
    var countBoolLoadData = 0;
    for(var i=0;i<ctrl.booleanAllDataLoad.length;i++){
      if(ctrl.booleanAllDataLoad[i].tblName == tblName){
        ctrl.booleanAllDataLoad[i].isDataLoad = true;
        console.log(tblName+" is load");
      }

      if(ctrl.booleanAllDataLoad[i].isDataLoad == true){
        countBoolLoadData = countBoolLoadData + 1;
      }
    }

    if(countBoolLoadData == ctrl.booleanAllDataLoad.length){
      callBackFinish();
    }
  };
  
  ctrl.loadAllMasterData = function(callBackFinish){
    var ctrlDetail = this;
    ctrlDetail.callBackFinish = callBackFinish;
    var promiseLoadData = ctrl.loadDataAlert(ctrl.apiUrl+'cap/alert/create.s3json?options=true&references=true');
    promiseLoadData.then(function(response) {
      //console.log(response);
      ctrl.dataOptions = response;

      var dataField = response['$_cap_alert'][0]['$_cap_info'][0]['field'];
      for(var i=0;i<dataField.length;i++){
        if(dataField[i]['@name'] == "event_type_id"){
            ctrl.deleteDB("m_event_type",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_event_type (id, name,icon) values (?,?,?)";
                  var dataDB = [parseInt(dataField[i]['select'][0]['option'][j]['@value']),dataField[i]['select'][0]['option'][j]['$'],''];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_event_type");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_event_type",query,dataDB,callBack,callBackErr);
                }
                
            }
        }
        else if(dataField[i]['@name'] == "response_type"){
            ctrl.deleteDB("m_response_type",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_response_type (fvalue, name) values (?,?)";
                  var dataDB = [dataField[i]['select'][0]['option'][j]['@value'],dataField[i]['select'][0]['option'][j]['$']];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_response_type");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_response_type",query,dataDB,callBack,callBackErr);
                }
                
            }
        }
        else if(dataField[i]['@name'] == "urgency"){
            ctrl.deleteDB("m_urgency",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_urgency (fvalue, name) values (?,?)";
                  var dataDB = [dataField[i]['select'][0]['option'][j]['@value'],dataField[i]['select'][0]['option'][j]['$']];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_urgency");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_urgency",query,dataDB,callBack,callBackErr);
                }
            }
        }
        else if(dataField[i]['@name'] == "certainty"){
            ctrl.deleteDB("m_certainty",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_certainty (fvalue, name) values (?,?)";
                  var dataDB = [dataField[i]['select'][0]['option'][j]['@value'],dataField[i]['select'][0]['option'][j]['$']];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_certainty");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_certainty",query,dataDB,callBack,callBackErr);
                }
                
            }
        }
        else if(dataField[i]['@name'] == "severity"){
            ctrl.deleteDB("m_severity",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_severity (fvalue, name) values (?,?)";
                  var dataDB = [dataField[i]['select'][0]['option'][j]['@value'],dataField[i]['select'][0]['option'][j]['$']];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_severity");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_severity",query,dataDB,callBack,callBackErr);
                }
                
            }
        }
      }
      dataField = response['$_cap_alert'][0]['field'];
      for(var i=0;i<dataField.length;i++){
        if(dataField[i]['@name'] == "scope"){
            ctrl.deleteDB("m_scope",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_scope (fvalue, name) values (?,?)";
                  var dataDB = [dataField[i]['select'][0]['option'][j]['@value'],dataField[i]['select'][0]['option'][j]['$']];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_scope");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_scope",query,dataDB,callBack,callBackErr);
                }  
            }
        }
        else if(dataField[i]['@name'] == "status"){
            ctrl.deleteDB("m_status",null,null);
            for(var j=0;j<dataField[i]['select'][0]['option'].length;j++){
                if(dataField[i]['select'][0]['option'][j]['@value'] != ""){
                  var query = "insert into m_status (fvalue, name) values (?,?)";
                  var dataDB = [dataField[i]['select'][0]['option'][j]['@value'],dataField[i]['select'][0]['option'][j]['$']];
                  var callBack = function(result){
                    console.log('success insert to db');
                    ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_status");
                  };
                  var callBackErr = function(error){
                    console.log('error to db');
                  };
                  ctrl.insertDB("m_status",query,dataDB,callBack,callBackErr);
                }  
            }
        }
      }
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    var promiseLoadDataTemplate = ctrl.loadDataAlert(ctrl.apiUrl+'cap/template.json');
    promiseLoadDataTemplate.then(function(response) {
      ctrl.deleteDB("m_template",null,null);
      for(var j=0;j<response.length;j++){
        
        var query = "insert into m_template (id, template_title, cap_scope, cap_info_category, cap_info_response_type, event_event_type_id) values (?,?,?,?,?,?)";
        var dataDB = [parseInt(response[j]['id']),response[j]['template_title'],response[j]['scope'],JSON.stringify(response[j]['cap_info.category']),JSON.stringify(response[j]['cap_info.response_type']), parseInt(response[j]['cap_info.event_type_id'])];
        var callBack = function(result){
          console.log('success insert to db');
          ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_template");
        };
        var callBackErr = function(error){
          console.log('error to db');
        };
        ctrl.insertDB("m_template",query,dataDB,callBack,callBackErr);
        
      }
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    ctrl.dataWarningPrioritys = {};
    var promiseLoadDataWarningPriority = ctrl.loadDataAlert(ctrl.apiUrl+'cap/warning_priority.json');
    promiseLoadDataWarningPriority.then(function(response) {
      ctrl.deleteDB("m_warning_priority",null,null);
      for(var j=0;j<response.length;j++){
        
        var query = "insert into m_warning_priority (id , name ,priority_rank , color_code , severity , certainty , urgency , event_type_id) values (?,?,?,?,?,?,?,?)";
        var dataDB = [parseInt(response[j]['id']),response[j]['name'],response[j]['priority_rank'],response[j]['color_code'],response[j]['severity'], response[j]['certainty'],response[j]['urgency'],parseInt(response[j]['event_type_id']) ];
        var callBack = function(result){
          console.log('success insert to db');
          ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_warning_priority");
        };
        var callBackErr = function(error){
          console.log('error to db');
        };
        ctrl.insertDB("m_warning_priority",query,dataDB,callBack,callBackErr);
        
      }
    }, function(reason) {
      console.log('Failed: ' + reason);
    });

    var promiseLoadDataPredefinedArea = ctrl.loadDataAlert(ctrl.apiUrl+'cap/area.json?~.is_template=True');
    promiseLoadDataPredefinedArea.then(function(response) {
      //console.log(response);
      ctrl.deleteDB("m_predefined_area",null,null);
      for(var i=0;i<response.length;i++){
        var query = "insert into m_predefined_area (id , name , event_type_id ,location_id) values (?,?,?,?)";
        var dataDB = [parseInt(response[i]['id']),response[i]['name'],parseInt(response[i]['event_type_id']),parseInt(response[i]['cap_area_location.location_id']) ];
        var callBack = function(result){
          console.log('success insert to db');
          ctrl.setBooleanDataLoad(ctrlDetail.callBackFinish,"m_predefined_area");
        };
        var callBackErr = function(error){
          console.log('error to db');
        };
        ctrl.insertDB("m_predefined_area",query,dataDB,callBack,callBackErr);
      }
      //ctrl.dataPredefinedAreaOptions = response;
    }, function(reason) {
      console.log('Failed: ' + reason);
    });
  };
  
});
