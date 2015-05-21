# Drive-Service-Account-Libarary
Library for using service accounts with drive

######Note: I wrote this for me.  There is no error checking. Things may be unintuitive or misspelled. Want to fix something let me know or fork it.  

####You will need to add the base library:   
GAS_Service_Accounts  
MJ5317VIFJyKpi9HCkXOfS0MLm9v2IJHf


####Initialize the service with:  
Init(Array ScopesArray, String Service-Account-Email, String rsaKey);
 
####Get access to a users drive with:  
var thisUser = ServiceAccount(String usersEmail);  
thisUser.getAllFolders();  
thisUser.transferFolderToUser(String folderId, String recipientsEmail);  
thisUser.getFilesInFolder(String folderId);  
thisUser.transferFileToUser(String fileId, recipientEmail);  
thisUser.batchPermissionChange(Array fileId/folderId*, recipientEmail);  
    *In drive a folder is a file so either may be used. You can batch up to 1000 at a time;
 
