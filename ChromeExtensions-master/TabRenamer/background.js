/* this is an extension script - console.log feeds to the .html file of the extension itself. This
 * can be accessed by going to Chrome's extensions page, clicking on developer tools, and then
 * clicking on the view .html option next to the extension. */

var background = chrome.extension.getBackgroundPage();
background.transfer;

console.log("running background.js");
var tabnames = []; //actively receives tab names from parser and links latest tabs to latest tabs

//links Primary, Social, etc. to latest version of tab name
var originaltabnames = []; 

var tabPair = function(originaltab, userinput) {
  this.originaltab = originaltab;
  this.userinput = userinput;
}

tabPair.prototype.toString = function() {
  return "Original tab: " + originaltab + ", user input: " + userinput;
};

/*chrome.storage.sync.clear(function() {
  // Notify that we saved.
  console.log('storage cleared');
});*/

//retrieve originaltabnames[] saved from prior use
chrome.storage.sync.get('array', function (obj) {
  if (obj !== undefined && obj !== null && obj.array !== undefined) {
    for (var i = 0; i < obj.array.length; i++) {
      console.log(obj.array[i]);
      var newtabpair = new tabPair(obj.array[i].originaltab, obj.array[i].userinput);
      originaltabnames.push(newtabpair);
    }
  }
  //nothing stored, so this method call will fill originaltabnames with default pairings
  else {
    updateOriginalTabNames();
  }
});

var numinjects = 0; //track number of times script is injected
var tabtourl = {}; //track tab ids - tab urls

/* if any tab is refreshed/re-opened */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  var url = tab.url;
  //if gmail tab is opened for the first time, inject into gmail tab if possible and no matter what tab user is
  //currently looking at
  if (numinjects == 0) {
    //iterate through all tabs and inject parser into the gmail tab 
    chrome.tabs.getAllInWindow(null, function(tabs){
      for (var i = 0; i < tabs.length; i++) {
        //check if url matches gmail regular expression
        var regex = new RegExp("https://mail.google.com/*");
        var match = tabs[i].url.match(regex);
        if (match !== null && match !== 'undefined' && changeInfo.status == 'complete') {
          //keep track of tab for Gmail
          tabtourl[tabId] = tab.url;
          console.log("executing scripts");
          //chrome.tabs.executeScript(tabs[i].id, {file:"jquery.min.js"});
        //chrome.tabs.executeScript(tabs[i].id, {file:"jquery-ui.min.js"});
        //chrome.tabs.executeScript(tabs[i].id, {file:"bootstrap.min.js"});
        numinjects++;
      chrome.tabs.executeScript(tabs[i].id, {file:"parser.js"});
      }
    }
  });
  }
  //if prior injects have already taken place, only re-inject if it's the gmail tab that's refreshed
  else if (numinjects > 0) {
    /*
    //if the refreshed tab was the Gmail tab, re-inject
    var regex = new RegExp("https://mail.google.com/*");
    var match = url.match(regex);
    if (match !== null && match !== 'undefined' && changeInfo.status == 'complete') {
      chrome.tabs.getAllInWindow(null, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          var currenturl = tabs[i].url; 
          var anothermatch = currenturl.match(regex); //check if url is part of gmail
          if (anothermatch !== null && anothermatch !== 'undefined' && changeInfo.status == 'complete') {
            //keep track of tab for Gmail
            tabtourl[tabId] = tab.url;
            console.log("executing scripts with > 0 injections");
            numinjects++;
            chrome.tabs.executeScript(tabs[i].id, {file:"parser.js"});
          }
        }
      });
      }
      */

    /*
    //if the refreshed tab was the Gmail tab, re-inject
    if (url == "https://mail.google.com/mail/u/0/#inbox" && changeInfo.status == 'complete') {
      chrome.tabs.getAllInWindow(null, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].url == "https://mail.google.com/mail/u/0/#inbox" && changeInfo.status == 'complete') {
            //keep track of tab for Gmail
            tabtourl[tabId] = tab.url;
            console.log("executing scripts");
            numinjects++;
            chrome.tabs.executeScript(tabs[i].id, {file:"parser.js"});
          }
        }
      });
    }
    */


    var regex = new RegExp("https://mail.google.com/*");
    var match = url.match(regex);
    if (match !== null && match !== 'undefined' && changeInfo.status == 'complete') {
      chrome.tabs.getAllInWindow(null, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          var currenturl = tabs[i].url; 
          var anothermatch = currenturl.match(regex); //check if url is part of gmail
          if (anothermatch !== null && anothermatch !== 'undefined' && changeInfo.status == 'complete') {
            //keep track of tab for Gmail
            tabtourl[tabId] = tab.url;
            /* the tab has been updated, not closed, so inject a test script that sends a messageback to
             * background.js with the value of 'ksumparserscriptrunning' which is in parser.js.  If parser is
             * already injected, background knows it doesn't have to re-inject; otherwise, parser will
             * re-inject */
            console.log("test injection");
            chrome.tabs.executeScript(tabs[i].id, {
              code: "if (typeof(ksumparserscriptrunning) !== 'undefined') {chrome.extension.sendMessage({type:'parserRunning', value:ksumparserscriptrunning})} else {chrome.extension.sendMessage({type:'parserRunning', value:false})};" 
            });
          }
        }
      });
    }

  }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  //if the gmail tab is closed, prepare for re-injection
  if (tabtourl[tabId] == "https://mail.google.com/mail/u/0/#inbox") {
    console.log("gmail tab closed");
    numinjects = 0;
    delete tabtourl[tabId];
  }
});

/* onMessage: fired when a message is sent from either an extension process or a content script.
 * So, this retrieves tab names from the parser.js and popup.js */
chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
  //console.log("background.js received message type: " + message.type); //right tab names
  /* if message is from test message script injected above */
  if (message.type == "parserRunning") {
    console.log("message.value: " + message.value);
    //if the variable in parser doesn't exist, parser needs to be injected
    if (message.value == false || message.value == null || message.value == undefined) {
      chrome.tabs.getAllInWindow(null, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].url == "https://mail.google.com/mail/u/0/#inbox") {
            //keep track of tab for Gmail
            //tabtourl[tabId] = tab.url;
            console.log("executing scripts in modified thing");
            numinjects++;
            chrome.tabs.executeScript(tabs[i].id, {file:"parser.js"});
          }
          else if (tabs[i].url == "https://mail.google.com/mail/u/0/#settings/inbox") {
            numinjects++;
            chrome.tabs.executeScript(tabs[i].id, {file:"settingsparser.js"});
          }
        }
      });
    }
  }
  /* message is from popup asking for all tab names*/
  else if (message.type == "getTabName") {
    console.log("background.js sending tabnames[] (below) to popup");
    printArray(tabnames);
    sendResponse(getTabNames());
  }
  /* message is from parser notifying background of new batch of tab names to be arriving */
  else if (message.type == "incomingTabNames") {
    tabnames = [];
    console.log("background.js has cleared tabnames on parser's request and ready for new batch. tabnames length: " + tabnames.length);
  }
  /* message from parser submitting a new tab name (previous tab name - newest tab name */
  else if (message.type == "sentTabName") {
    var newtabpair = new tabPair(message.text, message.text);
    tabnames.push(newtabpair);
    console.log("background.js received tab name " + message.text + ", " + message.text + ": tabnames size: " + tabnames.length);
  }
  else if (message.type == "parserSentAllTabNames") {
    //keep original tab name links updated once parser has sent all parsed tab names
    updateOriginalTabNames();
    //console.log("originaltabnames is as follows:");
    //for (var i = 0; i < originaltabnames.length; i++) {
      //console.log(originaltabnames[i].originaltab + ", " + originaltabnames[i].userinput);
    //}
  }
  //message is from parser notifying background of save button click
  else if (message.type == "updatedTabs") {
    console.log("background.js heard that tabs were updated, clearing tabnames");
    //clear tabnames to accept new ones
    tabnames = [];
  }
  //message is from parser to store injected tab names - this message only arrives if user inputs something
  else if (message.type == "storeNewTabs") {
    console.log("tabnames before changes");
    printArray(tabnames);
    //tabnames = [];
    //tabnames = message.array;
    var injectedtabs = message.array;
    for (var i = 0; i < injectedtabs.length; i++) {
      for (var j = 0; j < tabnames.length; j++) {
        if (injectedtabs[i].originaltab == tabnames[j].userinput) {
          tabnames[j].originaltab = injectedtabs[i].originaltab;
          tabnames[j].userinput = injectedtabs[i].userinput;
          break;
        }
      }
    }
    console.log("background.js stored injected tab names from user, tabnames[] below");
    printArray(tabnames);
    updateOriginalTabNames();
    console.log("originaltabnames[] below");
    printArray(originaltabnames);
    chrome.storage.sync.clear(function() {
      // Notify that we saved.
      console.log('storage cleared');
    })
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'array': originaltabnames}, function() {
      // Notify that we saved.
      console.log('saved originaltabnames[] as seen below');
      for (var i = 0; i < originaltabnames.length; i++) {
        console.log(originaltabnames[i]);
      }
    });
  }
  //message is from parser to retrieve any injected tab names upon initial load
  else if (message.type == "parserNeedsTabNames") {
    console.log("background.js sending original tab names to parser: originaltabnames size: " + originaltabnames.length);
    printArray(originaltabnames);
    sendResponse(getOriginalTabNames());
  }
});

chrome.runtime.onMessage.addListener(function(message,sender, sendResponse) {
  //message from popup with user inputted tab names of format akin to tabnames[]
  if (message.type == "enteredTabNames") {
    var tabs = message.array;
    console.log("background.js heard that the user entered " + tabs.length + " new tab names");
    printArray(tabs);
    //send user's new tab names to content script parser.js
    chrome.tabs.getSelected(null,function(tab) {
      chrome.tabs.sendRequest(tab.id, {type:"displayTabNames", array:tabs}, function(response) {});
    }); 
  }
});

function updateOriginalTabNames() {
  //if very first submission of tab names
  if (originaltabnames.length == 0) { 
    console.log("originaltabnames is new, so default values");
    /*for (var i = 0; i < tabnames.length; i++) {
      var tabpair = new tabPair(tabnames[i].originaltab, tabnames[i].userinput);
      originaltabnames.push(tabpair);
    }*/
    var tabpair1 = new tabPair('Primary', 'Primary');
    var tabpair2 = new tabPair('Social', 'Social');
    var tabpair3 = new tabPair('Promotions', 'Promotions');
    var tabpair4 = new tabPair('Updates', 'Updates');
    var tabpair5 = new tabPair('Forums', 'Forums');
    originaltabnames.push(tabpair1);
    originaltabnames.push(tabpair2);
    originaltabnames.push(tabpair3);
    originaltabnames.push(tabpair4);
    originaltabnames.push(tabpair5);
  }
  //original tab names already exists
  else {
    //update link in hard copy of tab names
    for (var j = 0; j < originaltabnames.length; j++) {
      for (var k = 0; k < tabnames.length; k++) {
        if (originaltabnames[j].userinput == tabnames[k].originaltab) {
          console.log("swapping originaltab: " +  originaltabnames[j].userinput +" with tabname: " + tabnames[k].userinput);
          originaltabnames[j].userinput = tabnames[k].userinput;
          break;
        }
      }
    }
    //now that hard copy of tab names has updated existing references to current tab names, check for outliers
    console.log("tabnames below");
    printArray(tabnames);
    console.log("originaltabnames below");
    printArray(originaltabnames);
    //check for new tab added
    //if (tabnames.length > originaltabnames.length) {
    for (var i = 0; i < tabnames.length; i++) {
      var foundnewtab = true;
      for (var ii = 0; ii < originaltabnames.length; ii++) {
        //if a certain tab found to already exist
        if (tabnames[i].userinput == originaltabnames[ii].userinput) {
          foundnewtab = false;
          console.log("original tabnames has: " + originaltabnames[i].userinput);
        }
      }
      if (foundnewtab) {
        console.log("originaltabnames[] adding " + tabnames[i].originaltab + ", " + tabnames[i].userinput);
        var newtabpair = new tabPair(tabnames[i].originaltab, tabnames[i].userinput);
        originaltabnames.push(newtabpair);
      }
    }
    //}
    /*
    console.log("tabnames below");
    printArray(tabnames);
    console.log("originaltabnames below");
    printArray(originaltabnames);
    console.log("tabnames length: " + tabnames.length + ", originaltabnames length: " + originaltabnames.length);
    //if a tab was removed, originaltabnames length > tabnames
    if (tabnames.length < originaltabnames.length) {
      var indexesofremoval = [];
      for (var i = 0; i < originaltabnames.length; i++) {
        var tabfound = false;
        for (var j = 0; j < tabnames.length; j++) {
          if (originaltabnames[i].userinput == tabnames[j].userinput) {
            console.log("originaltabnames[i].userinput: " + originaltabnames[i].userinput + " found");
            tabfound = true;
          }
        }
        if (!tabfound) {
          console.log("pushing: " + originaltabnames[i].originaltab + ", " + originaltabnames[i].userinput + ", index: " + i);
          indexesofremoval.push(i);
        }
      }
      for (var j = indexesofremoval.length - 1; j >= 0; j--) {
        console.log("originaltabnames removing " + originaltabnames[indexesofremoval[j]].originaltab + ", " + originaltabnames[indexesofremoval[j]].userinput);
        originaltabnames.splice(indexesofremoval[j], 1);
      }
    }
    */
    console.log("updateOriginalTabs[] finished");
  }
}

function getTabNames() {
  return tabnames;
}

function getOriginalTabNames() {
  return originaltabnames;
}

function printArray(array) {
  for (var i = 0; i < array.length; i++) {
    console.log(i + ": " + array[i].originaltab + ", " + array[i].userinput);
  }
}


/*//onConnect: fired when a connection is made from either an extension process or a content script.
chrome.extension.onConnect.addListener(function (port) {
  console.log("background.js onConnect fire");
  port.onMessage.addListener(function (message) {
    console.log("background.js received message: " + message);
    if (message == "Request Modified Value") {
      port.postMessage(modifiedDom);
    }
  });
});*/
