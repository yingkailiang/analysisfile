// Copyright (c) 2012 by Nick Simmonds.  All rights reserved.

var gMailUrl = "https://mail.google.com/?view=cm&fs=1&tf=1&source=mailto&to=";
var gMailSub = "&su=";
var yMailUrl = "http://compose.mail.yahoo.com?to=";
var lMailUrl = "http://mail.live.com/?rru=compose&to=";
var owaHTTP = localStorage["owaUrl"];
var owaUrl = "https://"+owaHTTP+"/owa/?ae=Item&a=New&t=IPM.Note&to=";
var subject = "&subject=";
var gmail;
var yahoo;
var owa;
var live;

//Context menu entry for Gmail fires this block
function clickHandleGmail(){
	// info starts out undefined, so this returns the whole function
	// when the context menu item is clicked
	return function mailToGoogle (info) {
			var link = info.linkUrl;
            link = link.replace("mailto:",gMailUrl);
			link = link.replace("?subject=","&su=");
			window.open(link);
	}
}

//same as the previous block, but for Yahoo!
function clickHandleYmail() {
    return function mailToYahoo (info) {
        var link = info.linkUrl;
        link = link.replace("mailto:",yMailUrl);
        link = link.replace("?subject=",subject);
        window.open(link);
    }
}

function clickHandleLmail() {
    return function mailToLive (info) {
        var link = info.linkUrl;
        link = link.replace("mailto:",lMailUrl);
        link = link.replace("?subject=",subject);
        window.open(link);
    }
}

function clickHandleOWA() {
    return function mailToOWA (info) {
        var link = info.linkUrl;
        link = link.replace("mailto:",owaUrl);
        link = link.replace("?subject=",subject);
        window.open(link);
    }
}
// remove pre-existing context menu items

chrome.contextMenus.removeAll()


// create the context menu items

if (localStorage["gmail"] != "false") {
    chrome.contextMenus.create({
        "title" : "Send via Gmail",
        "contexts" :["link"],
        "onclick" : clickHandleGmail(),
        "id": "gmail"
   });
}


if (localStorage["yahoo"] != "false") {
    chrome.contextMenus.create({
        "title" : "Send via Yahoo!",
        "contexts" : ["link"],
        "onclick" : clickHandleYmail(),
        "id":"yahoo"
    });
}

if (localStorage["live"] != "false") {
    chrome.contextMenus.create({
        "title" : "Send via Microsoft Live Mail",
        "contexts" : ["link"],
        "onclick" : clickHandleLmail(),
        "id":"live"
    });
}

if (localStorage.owa != "false") {
    chrome.contextMenus.create({
        "title" : "Send via OWA",
        "contexts" : ["link"],
        "onclick" : clickHandleOWA(),
        "id":"owa"
    });
}
