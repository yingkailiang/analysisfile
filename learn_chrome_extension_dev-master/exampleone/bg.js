(function(){
	// chrome.browserAction.onClicked.addListener(function(tab) {
		//扩展向内容脚本发送消息
		// chrome.tabs.sendMessage(tab.id,{greeting: "hello to content script!"}, function(response) {
		  	// console.log(response.farewell);
		// });
	// });

	var resOK = {
		farewell: "extension send response back..."
	};

	var resError = {
		farewell: "extension hasError!"
	};

	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	    console.log("Request comes from content script " + sender.tab.url);

	    if (request.greeting === "hello to extention!"){
	    	sendResponse(resOK);
	    }else{
	    	sendResponse(resError);
	    }
	});

})();

