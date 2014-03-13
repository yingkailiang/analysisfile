'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
      chrome.pageAction.show(tabId);    
});


chrome.tabs.executeScript({file: "content.js"});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {


    // read `newIconPath` from request and read `tab.id` from sender
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
       function(tabs){
          chrome.storage.sync.get('bookmark', function(value) {
            var s_value = JSON.stringify(value);
            console.log(s_value);
            if(!(s_value.indexOf('\"'+tabs[0].url+'\"') === -1)) {
              chrome.pageAction.setIcon({
                  //path: request.newIconPath,
                  path: {'19': 'images/icon-19-2.png','38':'images/icon-38-2.png'},
                  tabId: tabs[0].id
              });
            }
          });
       }
    );

});




