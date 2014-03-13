$(document).ready(function(){	
	load();	
				
	$(document).on('click', '.dltbtn', function(event){					
		var table_row = $(this).closest('tr');	
		var url_name = table_row.find(".url_col").text();
		table_row.remove();      
		localStorage.removeItem(url_name);
		localStorage.setItem('table', mytable.innerHTML);	
		
		return false;
	});		

	$(document).on('click', '#clearLocal', function(event){					
		localStorage.clear();
		mytable.innerHTML = '<tr><td>URLS</td><td>Filepath</td></tr>';		
		return false;
	});
	
	$(document).on('click', '#selectFolder', function(event){		
		connectToNative();
		return false;
	});
	
	var oldURL;	
	$(document).on('dblclick','.url_col',function(event){
		var table_row = $(this).closest('tr');
		var url_name = table_row.find(".url_col").text();
		oldURL = url_name;			
	});
	
	
	$(document).on('blur','.url_col',function(event){
		var table_row = $(this).closest('tr');
		var url_name = table_row.find(".url_col").text();
		var folder_path = table_row.find(".folder_col").text();
		localStorage.removeItem(oldURL);
		localStorage.setItem(url_name,folder_path);			
		return false;
	});
	
	$(document).on('blur','.folder_col',function(event){
		var table_row = $(this).closest('tr');
		var url_name = table_row.find(".url_col").text();
		var folder_path = table_row.find(".folder_col").text();		
		localStorage.setItem(url_name,folder_path);			
		return false;
	});			
				
	$('#addrow').click(function(){
		var urlName = document.getElementById("urlBox").value;
		var folder = document.getElementById("folderBox").value;	
		
		if(urlName == null || urlName == "" || folder == null || folder == ""){
			alert("Must fill out website and folder name");
			return false;
		}
		
		// storing url and folder in local storage		
		localStorage.setItem(urlName,folder);	

		// adding row in table
		$('#mytable').append('<tr><td class = "url_col" contenteditable="true" >' + urlName + '</td><td class = "folder_col" contenteditable="true" >' + folder + '</td><td><button class = "dltbtn">delete</button></td></tr>');
		localStorage.setItem('table', mytable.innerHTML);	
		
		var length = localStorage.length;
		for(var i = 0;i < length; i++){
			var key = localStorage.key(i);
			var value = localStorage.getItem(key);	
			console.log("key: " + key + " value: " + value);				
		}
			
		return false;
	});
	
	function load() {
		// when the page loads
		if ( localStorage.getItem('table')) {
			mytable.innerHTML = localStorage.getItem('table'); 			
		}		
	}
	
	function connectToNative(){
		console.log('connecting to native app');
		var port = chrome.runtime.connectNative("com.google.chrome.example.nativefoldercreator");	
		port.postMessage({commandType:"browseFolders"});		
		port.onMessage.addListener(function(msg) {				
			var parsed = JSON.parse(JSON.stringify(msg));
			var folderPath = parsed.folderPath;
			var fileForm = document.getElementById('folderBox');
			fileForm.value = folderPath;
			console.log("Received: " + folderPath);
		});
		
		port.onDisconnect.addListener(function() {
			console.log("Disconnected");
		});	
	}
	
});