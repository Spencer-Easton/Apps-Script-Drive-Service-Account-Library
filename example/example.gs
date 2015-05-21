function myFunction() {
  
  saDrive.Init(["https://www.googleapis.com/auth/drive"], 
                "588349927081-pahia6qu6u25udjjannj3tc6mt1hokig@developer.gserviceaccount.com",
                PropertiesService.getScriptProperties().getProperty("rsaKey"));

  var test8 = saDrive.ServiceAccount("8test@myDomain.org");
  var me = saDrive.ServiceAccount("myEmail@myDomain.org")
  Logger.log(test8.getAllFolders());
  Logger.log(me.getAllFolders());
  
}
