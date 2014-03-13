/*global chrome:false*/
'use strict';


//In background.js:
// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.browserAction.setBadgeText({
    text: ''
  });
});
