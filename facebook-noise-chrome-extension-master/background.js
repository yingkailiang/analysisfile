// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when a message is passed.  We assume that the content script
// wants to show the page action.



function setIsOnOff(value){
	localStorage['state'] = value;
	chrome.tabs.query({}, function(tabs) {
	    var message = value;
	    for (var i=0; i<tabs.length; ++i) {
	        chrome.tabs.sendMessage(tabs[i].id, {"action":message});
	    }
	});
}


function onRequest(request, sender, sendResponse) {

 	if (request.method == "getState"){
    	sendResponse({status: localStorage['state']});
 	}
    else
      sendResponse({}); // snub them.

};



// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);
