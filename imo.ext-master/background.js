
function checkForValidUrl(tabId, changeInfo, tab) {
  
  if (tab.url.indexOf('//imo.im') > -1) {

    chrome.pageAction.show(tabId);	
  }
//  alert(tab.url);
};

function requestInfo(details) {
	alert('request');	
};

var tabID = null;
var port = null;


chrome.tabs.onUpdated.addListener(checkForValidUrl);

function onRequest(request, sender, sendResponse) {

  chrome.pageAction.show(sender.tab.id);

  sendResponse({});
};


chrome.extension.onRequest.addListener(onRequest); 

chrome.webRequest.onCompleted.addListener(
  function(details) {
		if(details.type === 'xmlhttprequest'){
			if(port != null)port.postMessage(details);
		}
    return true;
  },
  {urls: ["<all_urls>"]},
["responseHeaders"]);
  
//console.log(chrome.tabs);
  
chrome.extension.onConnect.addListener(function(port) {
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    if (msg.joke == "Knock knock")
      port.postMessage({question: "Who's there?"});
    else if (msg.answer == "Madame")
      port.postMessage({question: "Madame who?"});
    else if (msg.answer == "Madame... Bovary")
      port.postMessage({question: "I don't get it."});
  });
});

function showNotification(arg){
	var notification = webkitNotifications.createNotification(
  chrome.extension.getURL("icon.png"),  // icon url - can be relative
  arg,  // notification title
  arg  // notification body text
  );
  
  notification.show();
  setTimeout(function(){ notification.cancel(); },10000);
};

//-------------------initialization of variables------------------ in local storage
if(localStorage["once"] == undefined){
	localStorage["once"]=null;
}
if(localStorage["perm"] == undefined){
	localStorage["perm"]=null;
}

initVar('o_style',true);
initVar('o_video',true);
initVar('o_offline',true);
initVar('o_bug1',true);

//-------------------initialization of variables------------------

function initVar(id,value){
	if(localStorage[id] == undefined){
		localStorage[id]=JSON.stringify(value);
	}	
}

function saveVar(id,value){
	localStorage[id]=JSON.stringify(value);
};

function getVar(id){
	if(localStorage[id] != null){
		return JSON.parse(localStorage[id]);
	}else{return null};
};

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(tabID == null)
	{
		tabID=sender.tab.id;
		port = chrome.tabs.connect(tabID,{name: "knockknock"});  
		port.postMessage({joke: "Knock knock"});
		//console.log('------------------:)---------');
	}
	
	if(request.command == 'setlists'){	
		localStorage['once']=JSON.stringify(request.once);
		localStorage['perm']=JSON.stringify(request.perm);		
		//localStorage.clear(); // in case sth. goes wrong with permanent storage
	}
	
	if(request.command == 'getlists'){
		sendResponse({once: JSON.parse(localStorage["once"]), perm: JSON.parse(localStorage["perm"])});
	}	
	
	if(request.command == 'close'){
		tabID=null;
	}
	
	if(request.command == 'save'){
		saveVar(request.id,request.value);
		sendResponse({error: 'no'});
	}
	
	if(request.command == 'get'){
		var req = request.id;
		console.log(request);
		sendResponse({req: getVar(request.id), value: getVar(request.id)});
	}
	
	if(request.notification){
		showNotification(request.notification);
	}
	
	//console.log(request);
	
});
  



