# Drive-Service-Account-Libarary
Library for using service accounts with drive

This library is specifically designed for transfer of ownership of files and folder in Google Drive inside a domain setting.

######Note: This was written by an amature. I would say I'm mediocre at best. I wrote this for my own uses at work.  There is no error checking. Things may be unintuitive or misspelled. Want to fix something let me know or fork it.  


####Initialize the service with: 

     The function passed to init will be invoked by this library to  
     get an Oauth2 Token. It is responsible for checking the freshness of the token as  
     this library will not do so. See the example script for an example of  
     a token service function    
Init(function tokenService);  

 
####Get access to a users drive with:  
var thisUser = ServiceAccount(String usersEmail);  
thisUser.getAllFolders();  
thisUser.transferFolderToUser(String folderId, String recipientsEmail);  
thisUser.getFilesInFolder(String folderId);  
thisUser.transferFileToUser(String fileId, recipientEmail);  
thisUser.batchPermissionChange(Array fileId/folderId*, recipientEmail);  
    *In drive a folder is a file so either may be used. You can batch up to 1000 at a time;
 
