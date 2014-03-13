/*global chrome:false, jQuery:false*/
'use strict';


/*
 * Route Messages from context scripts
 */
(function (items,
           itemHistory,
           notifyListeners) {

  var commands = {};
  chrome.extension.onMessage.addListener(function(
    request,
    sender,
    sendResponse) {

    var command = request.command;
    var payload = request.payload;
    var senderId = sender.tab.id;
    
    if (commands[command]) {
      commands[command](payload, sendResponse, senderId);
    }
  });

  commands.addItem = function (item) {
    // prevent two of the same item from being added
    if (!itemHistory[item.url]) {
      items.unshift(item);
      itemHistory[item.url] = [item.price];
      notifyListeners();
    }
  };

}(window.items,
  window.itemHistory,
  window.notifyListeners));
