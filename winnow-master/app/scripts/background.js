'use strict';

// Chrome-Extension ENV
var bg = function () {
  return chrome.extension.getBackgroundPage();
}

var tabArray = [];
function getTabs() {
  chrome.tabs.query({}, function(tabs) {
    tabArray = tabs;
  });
  return true;
}

var windowArray = [];
function getWindows() {
  chrome.windows.getAll({}, function(windows) {
    windowArray = windows;
  });
  return true;
}

// UI
function toggleButtonsOff() {
  $("button").removeClass("btn-primary");
}

function showMe() {
  getWindows();
  getTabs();

  console.log(tabArray);
  console.log(windowArray);
}

function setWindowId() {
  chrome.windows.getCurrent({}, function(currentWindow){
    console.log('setWindowId:' + currentWindow.id);
    $("#id").text(currentWindow.id);
  })
}

function setWindowName() {
  $("#name").text("Some Name");
}


function sendCurrentTabToWindow(tabId, winId) {
  chrome.tabs.move(tabId,
                  { 'windowId' : winId, 'index' : -1 },
                  function (res){
    console.log(res);
  })
}

function setWindowNames() {
  chrome.windows.getAll({}, function(all) {
    // all is []
    $.each(all, function(i, chromeWindow) {
      if (chromeWindow.id != $("#id").text()) {
        var newButton = $("#window-button").clone();
        newButton.removeClass('hide');
        newButton.text(chromeWindow.id);

        newButton.click(function(){
          var windowId = parseInt($(this).text());
          var tabId = parseInt($("#active-tab-id").text());
          sendCurrentTabToWindow(tabId, windowId);
        });

        $("#window-buttons").append(newButton);
      }
    });
  });
}

// DATA
var cpord = {
  "status" : "idle",
  "active" : "do"
};

// using the convention "win-189":"a custom window name"
var windowNames = {
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

function setActiveTab() {
  chrome.tabs.getSelected(function(tab) {
    $("#active-tab-id").text(tab.id);
  });
};

// INIT
$(function() {
  // when the Popup loads...
  $("button").click(function() {
    toggleButtonsOff();
    $(this).addClass("btn-primary");
    chrome.browserAction.setIcon({path: ('/images/' + $(this).attr('id') + '-icon-48.png') });
    updateState($(this).attr('id'));
  });

  // Toggle the appropriate button when the popup loads
  $("button#" + bg().getStatus()).addClass("btn-primary");

  $("#do").click(function(){
    showMe();
  });

  $("#win3").click(function(){
    setWindowId();
  });

  setWindowId();
  setWindowName();
  setWindowNames();
  setActiveTab();
});
