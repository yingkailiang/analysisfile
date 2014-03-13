	chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if (request.method == "getLocalStorage"){
      sendResponse({'youku_switch':localStorage["youku_switch"]});
    }else {
    	sendResponse({}); // snub them.
    }
	});