(function(){
	console.log("injected");

	// var resOK = {
		// farewell: "content script send response back..."
	// };

	// var resError = {
		// farewell: "content script hasError!"
	// };

	// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	    // console.log("Request comes from extention " + sender.tab.url);

	    // if (request.greeting === "hello to content script!"){
	    	// sendResponse(resOK);
	    // }else{
	    	// sendResponse(resError);
	    // }
	// });
	
	chrome.extension.sendMessage({greeting: "hello to extention!"}, function(response) {
		console.log(response.farewell);
	});
})();