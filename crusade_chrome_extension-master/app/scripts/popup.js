'use strict';

function channelIdCallback(message) {
  $('#channelId').val(message.channelId);

  var history = localStorage.getItem('history') ;
  if(history === null) {
    history = '[]' ;
  }
  history = JSON.parse(history) ;
  console.log('history', history) ;
  var ul = $('ul#history') ;
  for(var i = 0 ; i < history.length ; i++) {
    var entry = history[i] ;

    ul.append($("<li>").text(entry.time+" - "+entry.payload)) ;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.pushMessaging.getChannelId(true, channelIdCallback);
});