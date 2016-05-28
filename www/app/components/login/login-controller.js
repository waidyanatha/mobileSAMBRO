"use strict";

angular.module("ngapp")
.controller("LoginController", function(shared, $state, $scope,$rootScope, $mdSidenav, $mdComponentRegistry, $http, $cordovaDevice, $cordovaStatusbar,$cordovaGeolocation,$cordovaDialogs,$localStorage,$sessionStorage,$location,$cordovaSQLite,$cordovaNetwork){
    var ctrl = this;

    //version 1.1
    var databaseVersion = "1.3";
    $localStorage['databaseVersion'] = databaseVersion;
    var databaseSchema = {
      "tables": [{
          "name": "m_user",
          "columns": [{
              "name": "email",
              "type": "text"
          }, {
              "name": "pwd",
              "type": "text"
          }, {
              "name": "expired",
              "type": "integer"
          }, {
              "name": "active_user",
              "type": "integer"
          }, {
              "name": "device_token_id",
              "type": "text"
          }, {
              "name": "user_id",
              "type": "integer"
          }, {
              "name": "profile_json",
              "type": "text"
          }, {
              "name": "user_role",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "t_alert",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "cap_info_headline",
              "type": "text"
          }, {
              "name": "cap_area_name",
              "type": "text"
          }, {
              "name": "cap_scope",
              "type": "text"
          }, {
              "name": "event_event_type_name",
              "type": "text"
          }, {
              "name": "sent",
              "type": "TEXT"
          }, {
              "name": "spatial_val",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "t_alert_offline",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "created_time",
              "type": "text"
          }, {
              "name": "data_form",
              "type": "text"
          }, {
              "name": "data_form_json",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_event_type",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "icon",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_response_type",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_urgency",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_certainty",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_severity",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_scope",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_msg_type",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_group_user",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "group_type",
              "type": "text"
          }, {
              "name": "comments",
              "type": "text"
          }, {
              "name": "description",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_status",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_warning_priority",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "priority_rank",
              "type": "text"
          }, {
              "name": "color_code",
              "type": "text"
          }, {
              "name": "severity",
              "type": "text"
          }, {
              "name": "certainty",
              "type": "text"
          }, {
              "name": "urgency",
              "type": "text"
          }, {
              "name": "event_type_id",
              "type": "integer"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_template",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "template_title",
              "type": "text"
          }, {
              "name": "cap_scope",
              "type": "text"
          }, {
              "name": "cap_info_category",
              "type": "text"
          }, {
              "name": "cap_info_response_type",
              "type": "text"
          }, {
              "name": "event_event_type_id",
              "type": "integer"
          }, {
              "name": "cap_info_description",
              "type": "text"
          }, {
              "name": "cap_info_headline",
              "type": "text"
          }, {
              "name": "cap_info_parameter",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "m_predefined_area",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "event_type_id",
              "type": "integer"
          }, {
              "name": "location_id",
              "type": "integer"
          }, {
              "name": "spatial_val",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }, {
          "name": "sync_data_master",
          "columns": [{
              "name": "periodic_sync",
              "type": "integer"
          }, {
              "name": "time_sync",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }, {
              "name": "curr_location",
              "type": "text"
          }, {
              "name": "database_version",
              "type": "text"
          }, {
              "name": "database_schema",
              "type": "text"
          }]
      }, {
          "name": "t_server_url",
          "columns": [{
              "name": "id",
              "type": "integer primary key AUTOINCREMENT"
          }, {
              "name": "server_url",
              "type": "text"
          }, {
              "name": "server_location",
              "type": "text"
          }, {
              "name": "server_name",
              "type": "text"
          }, {
              "name": "active_server",
              "type": "text"
          }]
      }, {
          "name": "m_category",
          "columns": [{
              "name": "fvalue",
              "type": "text"
          }, {
              "name": "name",
              "type": "text"
          }, {
              "name": "server_url_id",
              "type": "integer"
          }]
      }]
    };

    dbShared = $cordovaSQLite.openDB({name: "offline_data.db" });
  
    var arrNewTableCreate = new Array();
    var createNewTableQuery = function(){
      arrNewTableCreate = new Array();
      for(var i=0;i<databaseSchema.tables.length;i++ ){

        var tableSchema = "CREATE TABLE IF NOT EXISTS "+databaseSchema.tables[i].name+" (";
        
        for(var j=0;j< databaseSchema.tables[i].columns.length;j++){
          tableSchema = tableSchema + databaseSchema.tables[i].columns[j].name + " " + databaseSchema.tables[i].columns[j].type;
          if(j+1 == databaseSchema.tables[i].columns.length){
            tableSchema = tableSchema + ")";
          }
          else{
            tableSchema = tableSchema + ",";
          }
        }
        arrNewTableCreate.push({name: databaseSchema.tables[i].name ,query:tableSchema,created:false});
      }  
    };

    //init run
    createNewTableQuery();

    var objTableCurrSchema = {};
    var getTablesName = function(){
      shared.selectDB("sqlite_master","SELECT name FROM sqlite_master WHERE type='table'",[],function(result){
        if(result.rows.length > 0) {
          objTableCurrSchema.tables = new Array();
          for(var i=0;i<result.rows.length;i++){
            if(result.rows.item(i).name != 'sqlite_sequence'){
              objTableCurrSchema.tables.push({name:result.rows.item(i).name,columns:new Array()});

              var idxArrNewTableCreate = findFilterAttr(arrNewTableCreate, result.rows.item(i).name, ".name");
              if(idxArrNewTableCreate != -1){
                arrNewTableCreate[idxArrNewTableCreate].created = true;
              }
            }
          } 

          if(objTableCurrSchema.tables.length > 0){
            getDetailColumn(0,objTableCurrSchema.tables[0].name);
          }
      
        } 
      },null);
    }; 

    var getDetailColumn = function(idx,tableName){
      shared.selectDB("table_info","PRAGMA table_info('"+tableName+"')",[],function(result1){
        //console.log('get all table name');
        //console.log(result1.rows.length);
        if(result1.rows.length > 0) {
          for(var j=0;j<result1.rows.length;j++){
            objTableCurrSchema.tables[idx].columns.push({"name":result1.rows.item(j).name,"type":result1.rows.item(j).type});
          } 
          //console.log("objTableCurrSchema = "+ JSON.stringify(objTableCurrSchema));
        } 

        if((idx+1) < objTableCurrSchema.tables.length){
          getDetailColumn((idx+1),objTableCurrSchema.tables[(idx+1)].name);
        }
        if(idx+1 == objTableCurrSchema.tables.length){
          createTempTable();
        }
      },null);
    };

    ctrl.customInsertForNewDBSchema = function(){
      console.log("customInsertForNewDBSchema 1");
      shared.updateDB("sync_data_master","update sync_data_master set database_version='1.2',database_schema='"+JSON.stringify(databaseSchema)+"',curr_location='POINT(100.612952 14.082130)',server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("t_server_url","update t_server_url set server_location='POINT(100.612952 14.082130)',server_name='AIT',active_server='true' ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.insertDB("t_server_url","insert into t_server_url (server_location,server_name,server_url,active_server) values ('POINT(16.865134 96.153957)','MYANMAR','http://203.81.87.42/eden/','false')",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_user","update m_user set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("t_alert","update t_alert set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("t_alert_offline","update t_alert_offline set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_event_type","update m_event_type set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_response_type","update m_response_type set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_urgency","update m_urgency set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_certainty","update m_certainty set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_severity","update m_severity set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_scope","update m_scope set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_msg_type","update m_msg_type set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_group_user","update m_group_user set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_status","update m_status set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_warning_priority","update m_warning_priority set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_template","update m_template set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      shared.updateDB("m_predefined_area","update m_predefined_area set server_url_id=1 ",[]
      ,function(result){
        console.log("success update");

      },function(error){
        console.log("error update");
      });

      //init run
      ctrl.setServerUrl();

      //init run
      ctrl.selectAllUser();
    };

    var checkDBVersion = function(){
      shared.selectDB("sync_data_master","SELECT * FROM sync_data_master",[],function(result){
        console.log("result sync_data_master");
        if(result.rows.length > 0) {
          if(result.rows.item(0).database_version != undefined){
            if(databaseVersion != result.rows.item(0).database_version){
              //diffrent database version
              console.log("Different database version");
              console.log("Database version old = "+result.rows.item(0).database_version);
              console.log("Database version new = "+databaseVersion);
              if(databaseVersion == "1.2" && result.rows.item(0).database_version == "1.1"){
                console.log("version 1.1 to 1.2");
                ctrl.customInsertForNewDBSchema = function(){
                  console.log("v1.2 change");
                  shared.updateDB("sync_data_master","update sync_data_master set database_version='1.2',database_schema='"+JSON.stringify(databaseSchema)+"' ",[]
                  ,function(result){
                    console.log("success update");

                  },function(error){
                    console.log("error update");
                  });

                  shared.updateDB("t_server_url","update t_server_url set active_server='true' where id=1 ",[]
                  ,function(result){
                    console.log("success update");

                  },function(error){
                    console.log("error update");
                  });
                  //init run
                  ctrl.setServerUrl();

                  //init run
                  ctrl.selectAllUser();
                };
                getTablesName();
              }
            }
            else{
              console.log("same database version");
              //init run
              ctrl.setServerUrl();

              //init run
              ctrl.selectAllUser();
            }
          }
          else{
            console.log("app without database schema - old version");
            getTablesName();
          }
        }
        else{
          //new application
          console.log("new application");

          for(var i=0;i<arrNewTableCreate.length;i++){
            $cordovaSQLite.execute(dbShared, arrNewTableCreate[i].query);
            arrNewTableCreate[i].created = true; 
          }

          //init run
          ctrl.setServerUrl();

          //init run
          ctrl.selectAllUser();
        } 
      },function(result){
        //new application
        console.log("new application");

        for(var i=0;i<arrNewTableCreate.length;i++){
          $cordovaSQLite.execute(dbShared, arrNewTableCreate[i].query);
          arrNewTableCreate[i].created = true; 
        }

        //init run
        ctrl.setServerUrl();

        //init run
        ctrl.selectAllUser();
      });
    };

    var createTableAndInsertData = function(i){
      console.log(arrTableSchema[i]);
      $cordovaSQLite.execute(dbShared, "DROP TABLE IF EXISTS temp_"+objTableCurrSchema.tables[i].name);
      $cordovaSQLite.execute(dbShared, arrTableSchema[i]);

      shared.insertDB(objTableCurrSchema.tables[i].name,"INSERT INTO temp_"+objTableCurrSchema.tables[i].name+" SELECT * FROM "+objTableCurrSchema.tables[i].name,[]
      ,function(result,tblName){
        console.log("success insert to "+tblName);
        $cordovaSQLite.execute(dbShared, "DROP TABLE IF EXISTS "+tblName);

        //arrNewTableCreate
        var idxArrNewTableCreate = findFilterAttr(arrNewTableCreate, tblName, ".name");
        if(idxArrNewTableCreate != -1){
          $cordovaSQLite.execute(dbShared, arrNewTableCreate[idxArrNewTableCreate].query);
          arrNewTableCreate[idxArrNewTableCreate].created = true;
        }

        //need to create table here
        
        if((i+1) < objTableCurrSchema.tables.length){
          createTableAndInsertData(i+1);
        }
        if(i+1 == objTableCurrSchema.tables.length){
          insertDataToNewTableFnc(0);
        }
      },function(error){
        console.log("error to temp_");

        if((i+1) < objTableCurrSchema.tables.length){
          createTableAndInsertData(i+1);
        }
        if(i+1 == objTableCurrSchema.tables.length){
          insertDataToNewTableFnc(0);
        }
      });
    };

    var insertDataToNewTableFnc = function(i){
      var idxNewTable = findFilterAttr(arrDataToNewTable, objTableCurrSchema.tables[i].name, ".name");
        if(idxNewTable != -1){
          shared.insertDB(arrDataToNewTable[idxNewTable].name,arrDataToNewTable[idxNewTable].query,[]
          ,function(result,tblName){
            console.log("success insert to new table ");

            if((i+1) < objTableCurrSchema.tables.length){
              $cordovaSQLite.execute(dbShared, "DROP TABLE IF EXISTS temp_"+tblName);
              insertDataToNewTableFnc(i+1);
            }
            if(i+1 == objTableCurrSchema.tables.length){
              ctrl.customInsertForNewDBSchema();
            }
          },function(error,tblName){
            console.log("error to new table ");

            if((i+1) < objTableCurrSchema.tables.length){
              $cordovaSQLite.execute(dbShared, "DROP TABLE IF EXISTS temp_"+tblName);
              insertDataToNewTableFnc(i+1);
            }
            if(i+1 == objTableCurrSchema.tables.length){
              ctrl.customInsertForNewDBSchema();
            }
          });
        }
    };

    var arrTableSchema = new Array();
    var arrDataToNewTable = new Array();
    var createTempTable = function(){
      
      // "CREATE TABLE IF NOT EXISTS m_user (email text, pwd text,expired integer,active_user integer,device_token_id text,user_id integer,profile_json text,user_role text,server_url_id integer)"
      
      arrTableSchema = new Array();
      arrDataToNewTable = new Array();
      for(var i=0;i<objTableCurrSchema.tables.length;i++ ){

        var tableSchema = "CREATE TABLE IF NOT EXISTS temp_"+objTableCurrSchema.tables[i].name+" (";
        var idxNewTable = findFilterAttr(databaseSchema.tables, objTableCurrSchema.tables[i].name, ".name");
        var insertDataToNewTable = "";
        var columnDataToNew = "";
        if(idxNewTable != -1){
          insertDataToNewTable = "insert into "+objTableCurrSchema.tables[i].name+" (";
        }
        for(var j=0;j< objTableCurrSchema.tables[i].columns.length;j++){
          tableSchema = tableSchema + objTableCurrSchema.tables[i].columns[j].name + " " + objTableCurrSchema.tables[i].columns[j].type;
          if(j+1 == objTableCurrSchema.tables[i].columns.length){
            tableSchema = tableSchema + ")";
          }
          else{
            tableSchema = tableSchema + ",";
          }

          if(idxNewTable != -1){
            var idxNewColumn = findFilterAttr(databaseSchema.tables[idxNewTable].columns, objTableCurrSchema.tables[i].columns[j].name, ".name");
            if(idxNewColumn != -1){
              columnDataToNew = columnDataToNew + databaseSchema.tables[idxNewTable].columns[idxNewColumn].name + ",";
            }
          }
        }
        arrTableSchema.push(tableSchema);

        if(idxNewTable != -1){
          if(columnDataToNew != ""){
            columnDataToNew = columnDataToNew.substring(0, columnDataToNew.length-1);
            insertDataToNewTable = insertDataToNewTable + columnDataToNew + ") select " + columnDataToNew + " from temp_"+objTableCurrSchema.tables[i].name;
            console.log(insertDataToNewTable);
            arrDataToNewTable.push({name: objTableCurrSchema.tables[i].name, query:insertDataToNewTable});
          }
        }
      }

      for(var i=0;i<arrNewTableCreate.length;i++){
        if(arrNewTableCreate[i].created == false){
          $cordovaSQLite.execute(dbShared, arrNewTableCreate[i].query);
          arrNewTableCreate[i].created = true;
        }
      }

      createTableAndInsertData(0);
    };
    ctrl.serverUrlId = 1;
    //========================================= end database section =========================================


    ctrl.loginForm = {};
    ctrl.auth = shared.info.auth;
    ctrl.title = shared.info.title;
    ctrl.hideErrorMessage = true;
    ctrl.shared = shared;
    ctrl.serverUrl = shared.apiUrl;
    ctrl.serverLocation = "POINT(100.612952 14.082130)";
    ctrl.serverName = "AIT";

    //$localStorage.$reset();
    $localStorage['username'] = "";
    $localStorage['password'] = "";
    $localStorage['userId'] = 0;
    $localStorage['userRole'] = "";

    ctrl.listServerUrl = new Array();
    ctrl.setServerUrl = function(){
      shared.selectDB("t_server_url","select * from t_server_url",[],function(result){
        console.log('get server url');
        console.log(result.rows.length);
        var serverUrl = $localStorage['serverUrl'];
        if(result.rows.length > 0) {
          ctrl.isOfflineDataExist = true;
          
          var isActive = false;
          for(var i=0;i<result.rows.length;i++){
            var dataServerUrl = {serverId:result.rows.item(i).id,serverUrl:result.rows.item(i).server_url,serverName:result.rows.item(i).server_name,activeServer:result.rows.item(i).active_server};
            ctrl.listServerUrl.push(dataServerUrl);
            if(result.rows.item(i).active_server == "true"){
              serverUrl = result.rows.item(i).server_url;
              ctrl.serverUrlId = result.rows.item(i).id;
              isActive = true;
            }
            console.log("dataServerUrl = "+ JSON.stringify(dataServerUrl));
          }
          if(isActive == false){
            serverUrl = result.rows.item(0).server_url;
            ctrl.serverUrlId = result.rows.item(0).id;

            shared.updateDB("t_server_url","update t_server_url set active_server='true' where id=?",[ctrl.serverUrlId],     //[new Date(),JSON.stringify(submitFormVal)],
            function(result){
            
                console.log('success update to db server url');
                ctrl.setServerUrl();
            },function(error){
                
                console.log('error update to db server url');
            });
          } 
        } 
        else{
          shared.insertDB("t_server_url","insert into t_server_url (server_url,server_name,server_location,active_server) values (?,?,?,?)",["http://sambro.geoinfo.ait.ac.th/eden/",ctrl.serverName,ctrl.serverLocation,"true"],     //[new Date(),JSON.stringify(submitFormVal)],
          function(result){
          
              console.log('success insert to db server url');
              ctrl.setServerUrl();
          },function(error){
              
              console.log('error to db db server url');
          });
        }
        $localStorage['serverUrl'] = serverUrl;
        $localStorage['serverId'] = ctrl.serverUrlId;
        ctrl.serverUrl = serverUrl;
        console.log("[login] serverUrl = " + $localStorage['serverUrl']);
        console.log("[login] serverId = " + $localStorage['serverId']);
      },null);
    };

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
    ctrl.serverUrlChangeContainer = false;

    ctrl.userName = "";
    ctrl.userId = 0;
    ctrl.dataUsers = new Array();
    ctrl.selectAllUser = function() {
      ctrl.dataUsers = new Array();
      console.log('select all user');
      var query = "SELECT * FROM m_user where server_url_id=?";
      $cordovaSQLite.execute(dbShared,query, [ctrl.serverUrlId]).then(function(result) {
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

    ctrl.clickDirectLogin = function(){
      $location.path("/main");
    };
    ctrl.clickSelectLogin = function(){
      ctrl.loginFormContainer = false;
      ctrl.directLoginContainer = false;
      ctrl.selectLoginContainer = true;
      ctrl.serverUrlChangeContainer = false;
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
      ctrl.serverUrlChangeContainer = false;
    };
    ctrl.clickChangeServerUrlForm = function(){
      ctrl.loginFormContainer = false;
      ctrl.directLoginContainer = false;
      ctrl.selectLoginContainer = false;
      ctrl.serverUrlChangeContainer = true;
    };

    ctrl.cancelChangeServerUrl = function(){
      ctrl.clickToLoginForm();
      ctrl.selectAllUser();
    };
    ctrl.submitChangeServerUrl = function(){
      var apiUrl = shared.apiUrl;
      //console.log(apiUrl);

      shared.apiUrl = ctrl.serverUrl;
      $localStorage['serverUrl'] = ctrl.serverUrl;

      console.log("add server "+ctrl.serverUrl);
      shared.insertDB("t_server_url","insert into t_server_url (server_location,server_name,server_url,active_server) values (?,?,?,?)",[ctrl.serverLocation,ctrl.serverName,ctrl.serverUrl,'false'],null,null);

      //shared.deleteDBWithFilter("sync_data_master","where server_url_id=?",[ctrl.serverUrlId],null,null);
      ctrl.cancelChangeServerUrl();
    };

    ctrl.userRole = "";
    ctrl.selectUser = function(email,pwd) {
      var query = "SELECT * FROM m_user where email=? and server_url_id=?";
      $cordovaSQLite.execute(dbShared,query, [email,ctrl.serverUrlId]).then(function(result) {
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
      var query = "update m_user set pwd=?,active_user=?,device_token_id=?,user_role=? where email=? and server_url_id=?";
      $cordovaSQLite.execute(dbShared, query, [pwd,1,deviceTokenId,ctrl.userRole,email,ctrl.serverUrlId]).then(function(result) {
        console.log("update user");
        
        ctrl.getUserProfile(email,ctrl.userId);

      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.insertUser = function(email,pwd) {
      shared.updateActiveUser();
      var query = "insert into m_user (email,pwd,active_user,device_token_id,user_id,user_role,server_url_id) values (?,?,?,?,?,?,?)";
      $cordovaSQLite.execute(dbShared, query, [email, pwd,1,$localStorage['deviceTokenId'],ctrl.userId,ctrl.userRole,ctrl.serverUrlId]).then(function(result) {
        console.log("insert user");
        
        ctrl.getUserProfile(email,ctrl.userId);
      }, function (err) {
        //$cordovaDialogs.alert('err', err, 'OK');
        console.error(err);
      });
    };

    ctrl.clickDeleteUser = function(idx){
        var email = ctrl.dataUsers[idx].email;
        var query = "delete from m_user where email=? and server_url_id=?";
        $cordovaSQLite.execute(dbShared, query, [email,ctrl.serverUrlId]).then(function(result) {
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
      var apiUrl = shared.apiUrl;
      console.log(apiUrl);
      if(apiUrl == null){
        apiUrl = "http://sambro.geoinfo.ait.ac.th/eden/";
        shared.apiUrl = apiUrl;
      }

      var promiseLoadData = shared.loadDataLogin(apiUrl+'default/index/user_info',ctrl.loginForm.email,ctrl.loginForm.password);
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
          var query = "update m_user set profile_json=? where email=? and server_url_id=?";
          $cordovaSQLite.execute(dbShared, query, [JSON.stringify(response) , ctrlDetail.email,ctrl.serverUrlId]).then(function(result) {
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

    ctrl.clickChangeServerUrl = function(idx){
      console.log("clickChangeServerUrl idx");
      console.log(idx);
      ctrl.serverUrlId = ctrl.listServerUrl[idx].serverId;
      $localStorage['serverUrl'] = ctrl.listServerUrl[idx].serverUrl;
      shared.updateDB("t_server_url","update t_server_url set active_server='false'",[]
      ,function(result){
        console.log("success update t_server_url active_server = false");

        shared.updateDB("t_server_url","update t_server_url set active_server='true' where id=?",[ctrl.serverUrlId]
        ,function(result1){
          console.log("success update t_server_url active_server = true");

        },function(error1){
          console.log("error update t_server_url active_server = true");
        });

      },function(error){
        console.log("error update t_server_url active_server = false");
      });

    };

    //init run
    checkDBVersion();

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
