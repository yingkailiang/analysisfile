'use strict';

// Chrome-Extension ENV

var bg = function () {
  return chrome.extension.getBackgroundPage();
}

// UI
function toggleButtonsOff() {
  $("button").removeClass("btn-primary");
}

// DATA
var cpord = {
  "status" : "idle",
  "active" : "do"
};

function setStatus(status) {
  cpord.status = status;
}

function getStatus(status) {
  return cpord.status;
}

function updateState (id) {
  bg().setStatus(id);
}

// INIT
$(function () {
  // when the Popup loads...
  $("button").click(function() {
    toggleButtonsOff();
    $(this).addClass("btn-primary");
    chrome.browserAction.setIcon({path: ('/images/' + $(this).attr('id') + '-icon-48.png') });

    updateState($(this).attr('id'));
  });

  // Toggle the appropriate button when the popup loads
  $("button#" + bg().getStatus()).addClass("btn-primary");
});
