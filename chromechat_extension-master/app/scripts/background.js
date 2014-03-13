'use strict';

if(typeof chrome.runtime !== 'undefined'){
  chrome.runtime.onInstalled.addListener(function (details) {
      console.log('previousVersion', details.previousVersion);
  });
}
