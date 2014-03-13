/*global chrome:false, getDefinition:false*/
'use strict';


var commands = {};

chrome.extension.onMessage.addListener(function(
  request,
  sender,
  sendResponse) {

  var command = request.command;
  var payload = request.payload;

  if (commands[command]) {
    commands[command](payload, sendResponse);
  }

});


commands.scrapeCurrentPage = function () {
  try {
    // determine site; currently ebay||amazon
    chrome.extension.sendMessage({
      command: 'addItem',
      payload: getDefinition(document)
    });
  } catch (e) {}
};
