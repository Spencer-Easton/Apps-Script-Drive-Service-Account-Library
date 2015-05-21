var super_ = this;


function Init(ScopesArray, SAEmail,key){
  super_.settings = {};
  super_.settings.ScopesArray = ScopesArray;
  super_.settings.SAEmail =  SAEmail;
  super_.settings.key = key;
  return super_;
}

function ServiceAccount(email){
  
  
  
  var sadrive = {};
  
  sadrive.transferFileToUser = function(fileId, transferToEmail){
    var token = getToken().token;
    var url = "https://www.googleapis.com/drive/v2/files/"+fileId+"/permissions?sendNotificationEmails=false";
    
    var payload = {"role":"owner","value":transferToEmail,"type":"user"}; 
    var params ={method:"POST",
                 contentType:'application/json',
                 headers:{Authorization: "Bearer " + token},
                 payload:JSON.stringify(payload),
                 muteHttpExceptions:true
                };
    
    var results = UrlFetchApp.fetch(url, params);
    return JSON.parse(results.getContentText());
    
  }
  
  
  sadrive.transferFolderToUser = function(folderId, transferToEmail){    
    return this.transferFileToUser(folderId, transferToEmail);
  }
  
  
  sadrive.fetchPermissionId = function(email){
    var token = getToken().token;
    return JSON.parse(UrlFetchApp.fetch("https://www.googleapis.com/drive/v2/permissionIds/"+email,{headers:{Authorization:"Bearer "+token}})).id;
  }
  
  
  
  
  sadrive.getAllFolders = function(){
    var token = getToken().token;
    var query = "mimeType = 'application/vnd.google-apps.folder'";
    return driveList(query, token);
  }
  
  
  
  
  sadrive.getFilesInFolder = function(folderId){
    var token = getToken().token;
    var query = "'"+folderId+"' in parents and mimeType != 'application/vnd.google-apps.folder'";
    return driveList(query, token);
  }
  
  
  
  function driveList(query){
    var token = getToken().token;
    var filesArray = [];
    var pageToken = "";
    var query = encodeURIComponent(query);
    var params = {method:"GET",
                  contentType:'application/json',
                  headers:{Authorization:"Bearer "+token},
                  muteHttpExceptions:true
                 };
    
    var url = "https://www.googleapis.com/drive/v2/files?q="+query;
    
    do{
      var results = UrlFetchApp.fetch(url,params); 
      if(results.getResponseCode() != 200){
        Logger.log(results);
        break;
      }
      
      var files = JSON.parse(results.getContentText());
      url = "https://www.googleapis.com/drive/v2/files?q="+query;  
      
      for(var i in files.items){
        filesArray.push({"name":files.items[i].title, "id":files.items[i].id})
      }
      
      pageToken = files.nextPageToken;
      url += "&pageToken="+encodeURIComponent(pageToken);
    }while(pageToken != undefined)
      
      var filesObj = {};
    filesObj["fileObjs"] = filesArray;
    
    return filesObj;
    
  }
  
  
  
  sadrive.batchPermissionChange = function(fileIds, transferToEmail){
    var token = getToken().token;
    var url = "https://www.googleapis.com/batch";
    var permissions = JSON.stringify({"role":"owner","value":transferToEmail,"type":"user"});
    var permissionLength = (byteCount(permissions));
    
    const boundary = '-------DriveOwnershipTools';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var multipartRequestBody = "";
    
    for(var i in fileIds){
      multipartRequestBody += delimiter;
      multipartRequestBody += 'Content-Type: application/http\r\n';
      multipartRequestBody += 'Content-ID: <item'+i+':'+transferToEmail+'>\r\n';
      multipartRequestBody += 'Content-Transfer-Encoding: binary\r\n\r\n';
      multipartRequestBody += 'POST /drive/v2/files/'+fileIds[i]+'/permissions\r\n';
      multipartRequestBody += 'Content-Type: application/json\r\n'
      multipartRequestBody += 'Content-Length: '+permissionLength+'\r\n\r\n';
      multipartRequestBody += permissions+'\r\n\r\n'    
    }
    multipartRequestBody += close_delim;
    
    
    var parameters = {method:'POST',
                      headers : {'Authorization': 'Bearer '+ token},                    
                      contentType:'multipart/mixed; boundary=' + boundary,
                      contentLength:byteCount(multipartRequestBody).toString(),
                      payload: multipartRequestBody,                    
                      muteHttpExceptions:true};
    
    var results = UrlFetchApp.fetch(url,parameters);
    
    return results.getContentText();
  }
  
  
  function getToken(){
    var cache = PropertiesService.getScriptProperties();
    var user = email;
    var token = JSON.parse(cache.getProperty(user));
    var nowTime = parseInt((Date.now()/1000).toString().substr(0,10));
    
    
    if(!token || (parseInt(token.experation) < nowTime)){
      token = requestToken(user);
      cache.setProperty(user, JSON.stringify(token));
    }
    
    return token;
  }
  
 
  
  
  function requestToken(email){
    
    var myJwt = GSA.GAS_JWT(super_.settings.key, super_.settings.ScopesArray,super_.settings.SAEmail,email);
    myJwt.generateJWT().requestToken();
    return {"token":myJwt.getToken(),"experation":myJwt.getExperation()};
  }
  
  function isString(o) {
    return (Object.prototype.toString.call(o) === '[object String]');
  }
  
  function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }
  
  
  return sadrive;
  
}
