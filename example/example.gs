// Add the libraries:
// MPlPXdVxNBhfaF3UVVEuMMMh00DPSBbB3 saDrive 
// MJ5317VIFJyKpi9HCkXOfS0MLm9v2IJHf GSApp
//
// Create a service account under your script's dev console project
// Add the json Key to the script properties under "jsonKey"
// Add the serive account clientId to your domain Admin console under
//         `Manage API client access` with the scope:
//   https://www.googleapis.com/auth/drive
// Note: It may take 15 minutes to a few hours after adding the clientId 
// to the admin console before the api project becomes authorized on your domain
// The Error: There was an error requesting a Token from the OAuth server: unauthorized_client
// means you need to wait a bit longer

function myFunction(){
   Logger.log(getAllFoldersOfUser("user@myDomain.org"));
}

function getAllFoldersOfUser(email) {
  var ts = tokenService(email);
  saDrive.Init(ts);
  var dSA = saDrive.ServiceAccount(email);
  return dSA.getAllFolders();
}
 


// If userEmail is null the service account's token is returned   
function tokenService(userEmail){
  var userEmail = userEmail || ""
  var jsonKey = JSON.parse(PropertiesService.getScriptProperties().getProperty("jsonKey"));  
  var privateKey = jsonKey.private_key;
  var serviceAccountEmail = jsonKey.client_email; 
  if(!userEmail){userEmail = serviceAccountEmail};
  var sa = GSApp.init(privateKey, ['https://www.googleapis.com/auth/drive'], serviceAccountEmail).addUser(userEmail);
  var tokenObj  = JSON.parse(PropertiesService.getScriptProperties().getProperty(userEmail)) || {};
  
  return function(){
    var nowTime = parseInt((Date.now()/1000).toString().substr(0,10));
    if(!("token" in tokenObj) ||  tokenObj.expire < nowTime){
      var newToken = sa.requestToken().getToken(userEmail);
      PropertiesService.getScriptProperties().setProperty(userEmail, JSON.stringify(newToken));
      tokenObj.token = newToken.token;
      tokenObj.expire = newToken.expire;
    }
    return tokenObj.token;
  }
}

