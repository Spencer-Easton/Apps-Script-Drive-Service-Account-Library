# Drive-Service-Account-Library
Library for using service accounts with drive

This library is specifically designed for transfer of ownership of files and folders in Google Drive inside a domain setting.

######Note: I wrote this for my own uses at work.  There is no error checking. Things may be unintuitive or misspelled. Want to fix something let me know or fork it.  


####Initialize the service with: 

     The function passed to init will be invoked by this library to  
     get an Oauth2 Token. It is responsible for checking the freshness of the token as  
     this library will not do so. You can use the checkToken() method to see if the  
     tokenService is generating valid tokens the library can use. See the example script for  
     an example of a token service function.     

Init(function tokenService);  

 
####Get access to a users drive with:  
var thisUser = ServiceAccount(String usersEmail);  
thisUser.getAllFolders(Object options);  
thisUser.transferFolderToUser(String folderId, String recipientsEmail);  
thisUser.getFilesInFolder(String folderId, Object options);  
thisUser.transferFileToUser(String fileId, recipientEmail);  
thisUser.batchPermissionChange(Array fileId/folderId*, recipientEmail);  
    *In drive a folder is a file so either may be used. You can batch up to 1000 at a time;  
    
#####Search options  
There are three options you can pass as an object to `getAllFolders()` and `getFilesInFolder()`.  Look in the example folder for sample code.  

    {  
      additionalQuery: String        // https://developers.google.com/drive/v2/web/search-parameters  
      byPage: Number                 // number of entries to return between 1-1000   
      nextPageToken: String          // the token to the next page. This is returned from a previous `getAllFolders()` and `getFilesInFolder()` request        
    }

####Check the token service  
    function checkToken(){
      var ts = tokenService("user@myDomain.org")
      saDrive.Init(ts);
      Logger.log(saDrive.checkToken());
    }
