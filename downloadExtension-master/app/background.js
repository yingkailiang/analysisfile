var name_read = false;
var state_read = false;
var fileURL;
var fullFilePath;	
var fileName;	
var filetype;

// when download is created, set the fileURL
chrome.downloads.onCreated.addListener(function (item){	
    name_read = false;	
	state_read = false;
	fileURL = item.url; 
});


// occurs when any attribute of the file being downloaded changes
chrome.downloads.onChanged.addListener(function (item){	
	//set the fileName,filetype and the full file path of the downloaded file
	if(!name_read){		
		fullFilePath = item.filename.current;
		var filePathSplit = fullFilePath.split('\\');
		fileName = filePathSplit[filePathSplit.length - 1];
		var nameSplit = fileName.split('.');
		filetype = nameSplit[nameSplit.length - 1];		
		name_read= true;		
	}
	
	// if the download is complete then find the new path
	if(name_read && !state_read && item.state != null && item.state.current == "complete"){
		var length = localStorage.length;
		var newFilePath;
		var filePathFound = false;
		console.log("local storage length: " + length);
		
		//searching through local storage for the URL keys
		for(var i = 0;i < length; i++){
			console.log("key: " + localStorage.key(i));
			if(fileURL.search(localStorage.key(i)) >= 0){				
				filePathFound = true;
				var f_path = localStorage.getItem(localStorage.key(i));
				newFilePath = f_path.replace('/','\\');
				break;
			}
		}
		
		//if a URL is not found matching the download URL set the new Path
		// to the default download location
		if(!filePathFound){
			var index = fullFilePath.search(fileName);
			var default_folder = fullFilePath.substr(0,index-1);
			newFilePath = default_folder;			
		}		
		state_read = true;
		
		// connect to the native app to organize the 
		console.log('full path:' + fullFilePath);
		console.log('new path: ' + newFilePath);
		console.log('file name: '+ fileName);
		console.log('file type: ' + filetype);
		
		connectToNativeApp(fullFilePath,newFilePath,fileName,filetype);					
	}
});



chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
  console.log('in name listener');
  suggest({filename: item.filename,
           conflict_action: 'overwrite',
           conflictAction: 'overwrite'});
});


function connectToNativeApp(oldFilePath,newFilePath,fileName,fileType){	
	console.log('connecting to native app');
	var port = chrome.runtime.connectNative("com.google.chrome.example.nativefoldercreator");	
	//sending message to native app in JSON format
	port.postMessage({commandType:"organizeFiles", oldPath:oldFilePath,newPath:newFilePath,type:fileType,name:fileName});	
	port.onMessage.addListener(function(msg) {
		console.log("Received: " + JSON.stringify(msg));		
	});	
	
	port.onDisconnect.addListener(function() {
		console.log("Disconnected");
	});
}

