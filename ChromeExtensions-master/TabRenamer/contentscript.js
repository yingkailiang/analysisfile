/*chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    console.log("contentscript.js running");
    var s = document.createElement('script');
    s.src = chrome.extension.getURL("background.js");
    s.onload = function() {
      this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);
  }
});*/

console.log("running contentscript.js");

/* This is the easiest/best method when you have lots of code. Include your actual JS 
 * code in a file, say script.js. */
var s = document.createElement('script');
//script.appendChild(document.createTextNode('('+ main +')();'));
s.src = chrome.extension.getURL("parser.js");
console.log("contentscript.js injected parser");
(document.body || document.head || document.documentElement).appendChild(s);

