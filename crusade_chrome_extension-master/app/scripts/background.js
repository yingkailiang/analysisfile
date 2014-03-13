'use strict';

function channelIdCallback(message) {
  $('#channelId').val(message.channelId);
}

function messageReceived(message) {
  console.log("Push Message payload = "+ message.payload + " Subchannel Id="+message.subchannelId);
  var history = localStorage.getItem('history') ;
  if(history === null) {
    history = '[]' ;
  }
  history = JSON.parse(history) ;
  history.unshift({time: new Date(), payload: message.payload, subChannel: message.subchannelId}) ;
  while(history.length > 10) {
    history.pop()
  }
  localStorage.setItem('history', JSON.stringify(history)) ;
  console.log("Saved") ;

  var notification = window.webkitNotifications.createNotification(
      'images/icon-38.png', 'You have been pushed',
       message.payload +" [" + message.subchannelId + "]");
   notification.show();
}

function launchProcedure() {
  chrome.pushMessaging.getChannelId(true, channelIdCallback);
  chrome.pushMessaging.onMessage.addListener(messageReceived) ;
}

chrome.runtime.onInstalled.addListener(function (details) {
  launchProcedure()
});

chrome.app.runtime.onStartup.addListener(function() {
  launchProcedure() ;
});