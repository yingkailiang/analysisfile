'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
        chrome.tabs.create({ url : 'options.html' })
    }
    console.log('previousVersion', details.previousVersion);
});
