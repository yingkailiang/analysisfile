//tell research.js (content script) when button has been pushed
chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, "button_pushed");
		console.log("BUTTON PUSHED");
		console.log("# active tabs: "+tabs.length);
	});
});

//listens for tabId requests content scripts and sends id of sender back
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if(msg == "request_id"){
		if(typeof sender.tab !== 'undefined') {
			sendResponse({id: sender.tab.id});
			console.log("SENDING ID");
		}
	}
});

//removes old tabId from researchList once the tab has been closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	chrome.storage.local.get(function(data){
		var list = data.researchList;
		list.splice(list.indexOf(tabId), 1);
		chrome.storage.local.set({'researchList': list});
	});
});

window.onload = function(){
	console.log("BACKGROUND PAGE IS LOADED");
	//initializes researchList if it does not exist
	chrome.storage.local.get(function(data){
		if(typeof data.researchList === 'undefined') {
			var list = new Array;
			console.log("CREATING NEW RESEARCH LIST");
			chrome.storage.local.set({'researchList': list});
		}
	});
	
	//uncomment below to clear local storage
	//chrome.storage.local.clear();
}



	