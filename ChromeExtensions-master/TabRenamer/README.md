API

##parser.js
+ sends type:"sentTabName", text:"tabname" //send tab names of current tabs
+ sends type:"incomingTabNames", text:"refreshed batch of tab names following" 
+ sends type:"updatedTabs", text:"tabs have been updated" //this doesn't do anything yet
+ sends type:"storeNewTabs", array:tabstorage //send the tabs injected into the page to background
+ sends type:"parserNeedsTabNames" //parser needs tab names from background (if any)
+ sends type:"parserSentAllTabNames", text:"all parsed tab names sent" //parser sends this once all tab names
  have been sent
+ sends type:"parserRunning", value: ksumparserscriptrunning

+ receives type: "displayTabNames", array:tabs //parser makes changes in browser, then see ""

+ "tabs" array format is Primary Input Social Input etc.

+ doesn't have a listener
+ triggers 'changed' event on all tab text divs

##popup.js
+ sends type:"getTabName" //popup makes a request to get tab names from background
+ sends type:"enteredTabNames" //popup sends user tab name input to background

##background.js
+ receieves from parser and popup
+ receives "getTabName" //background must respond with array of tab names
+ receives "incomingTabNames" //background now knows to clear tabnames array
+ receives "sentTabName" //background will add the tab name sent in message
+ receives "updatedTabs" //user hit save button
+ receives "enteredTabNames" //see "displayTabNames" below
+ receives "storeNewTabs" //background will save tab names sent by parser
+ receives "parserNeedsTabNames" //background will send tab names to parser
+ receives "parserRunning" //parser sends this to background, which decides to inject script again if needed

+ sends "displayTabNames" //background sends this once it receives user input from popup to parser
+ sends a response ("getTabName" triggers response) filled with tab names to popup
