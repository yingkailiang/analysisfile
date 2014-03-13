'use strict';

var host = chrome.extension.getURL('html/index.html')

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
         return {redirectUrl: host};
    },
    {
        urls: [
            "*://*.pizzahut.co.uk/*",
            "*://*.dominos.co.uk/*",
            "*://*.papajohns.co.uk/*",
            "*://*.just-eat.co.uk/*",
            "*://*.hungryhouse.co.uk/*",
            "*://*.grubhub.com/*",
            "*://*.meal2go.com/*",
            "*://*.curriesonline.co.uk/*",
            "*://*.eatstudent.co.uk/*"
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking"]
);