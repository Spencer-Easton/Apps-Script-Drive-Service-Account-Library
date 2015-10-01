var super_ = this;

function Init(tokenService){
  super_.getToken = tokenService;
  return super_;
}

function checkToken(){
  if(!("getToken" in super_)){
    throw new Error("{error:'Token Service not set use Init()'}")
  }
  if (typeof super_.getToken !== 'function'){
    throw new Error("{error:'Token Service is not a valid function'}")
  }
  
  var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+ super_.getToken();
  var driveScope = "https://www.googleapis.com/auth/drive";  
  var results = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  
  if("error" in results){
    return {error:'Invalid Token'};
  }
  
  if (results.scope.indexOf(driveScope) == -1){
    return {error:'Token does not contain the required scope of '+ driveScope}
  }
 return {success:"Valid Token"};
}


function ServiceAccount(email){
 return new ServiceAccount_(email);
}

function ServiceAccount_(email){
  var sadrive = {};
  
  sadrive.transferFileToUser = function(fileId, transferToEmail){
    var token = super_.getToken();
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
    var token = super_.getToken();
    return JSON.parse(UrlFetchApp.fetch("https://www.googleapis.com/drive/v2/permissionIds/"+email,{headers:{Authorization:"Bearer "+token}})).id;
  }
  
  
  
  
  sadrive.getAllFolders = function(){
    var token = super_.getToken();
    var query = "mimeType = 'application/vnd.google-apps.folder'";
    return driveList(query, token);
  }
  
  
  
  
  sadrive.getFilesInFolder = function(folderId){
    var token = super_.getToken();
    var query = "'"+folderId+"' in parents and mimeType != 'application/vnd.google-apps.folder'";
    return driveList(query, token);
  }
  
  
  
  function driveList(query){
    var token = super_.getToken();
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
    var token = super_.getToken();
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
  
  function isString(o) {
    return (Object.prototype.toString.call(o) === '[object String]');
  }
  
  function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }
  
  return sadrive;
}
