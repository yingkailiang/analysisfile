/******************************************************************************
 * windows.js
 * Part of Ancho browser extension framework
 * Implements chrome.windows
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 ******************************************************************************/

//******************************************************************************
//* requires
var Event = require("events.js").Event;
var EventFactory = require("utils.js").EventFactory;

require("windows_spec.js");
var preprocessArguments = require("typeChecking.js").preprocessArguments;
var notImplemented = require("typeChecking.js").notImplemented;
var addonRootURL = require("extension.js").addonRootURL;


var EVENT_LIST = ['onCreated',
                  'onFocusChanged',
                  'onRemoved'];
var API_NAME = 'windows';

exports.WINDOW_ID_NONE = -1;
exports.WINDOW_ID_CURRENT = -2;
//******************************************************************************
//* main closure
var Windows = function(instanceID) {
  //============================================================================
  // private variables
  var _instanceID = instanceID;
  var _currentWindowID = 0;
  if (instanceID < 0) {
    _currentWindowID = serviceAPI.windowManager.getCurrentWindowId();
  }
  //============================================================================
  // public properties

  this.WINDOW_ID_NONE = exports.WINDOW_ID_NONE;
  this.WINDOW_ID_CURRENT = exports.WINDOW_ID_CURRENT;

  //============================================================================
  // public methods

  //----------------------------------------------------------------------------
  // chrome.windows.create
  this.create = function(createData, callback) {
    var args = preprocessArguments('chrome.windows.create', arguments);
    serviceAPI.windowManager.createWindow(args.createData, args.callback, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.windows.get
  this.get = function(windowId, getInfo, callback) {
    var args = preprocessArguments('chrome.windows.get', arguments);
    var winId = args.windowId;
    if (winId === this.WINDOW_ID_CURRENT) {
      winId = _currentWindowID || serviceAPI.windowManager.getCurrentWindowId();
    }
    serviceAPI.windowManager.getWindow(winId, (args.getInfo && args.getInfo.populate), args.callback, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.windows.getAll
  this.getAll = function(getInfo, callback) {
    var args = preprocessArguments('chrome.windows.getAll', arguments);
    serviceAPI.windowManager.getAllWindows(args.getInfo, args.callback, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.windows.getCurrent
  this.getCurrent = function(getInfo, callback) {
    var args = preprocessArguments('chrome.windows.getCurrent', arguments);
    this.get(this.WINDOW_ID_CURRENT, getInfo, callback);
  };

  //----------------------------------------------------------------------------
  // chrome.windows.getLastFocused
  this.getLastFocused = function(getInfo, callback) {
    var args = notImplemented('chrome.windows.getLastFocused', arguments);
  };

  //----------------------------------------------------------------------------
  // chrome.windows.remove
  this.remove = function(windowId, callback) {
    var args = preprocessArguments('chrome.windows.remove', arguments);
    serviceAPI.removeWindow(args.windowId, args.callback, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.windows.update
  this.update = function(windowId, updateInfo, callback) {
    var args = preprocessArguments('chrome.windows.update', arguments);
    serviceAPI.windowManager.updateWindow(args.windowId, args.updateInfo, args.callback, addonAPI.id, _instanceID);
  };

  this.test = function() {
    serviceAPI.windowManager.createPopupWindow(addonRootURL + "popup.html");
  }
  //============================================================================
  // events

  EventFactory.createEvents(this, instanceID, API_NAME, EVENT_LIST);
  //============================================================================
  //============================================================================
  // main initialization

}

exports.createAPI = function(instanceID) {
  return new Windows(instanceID);
}

exports.releaseAPI = function(instanceID) {
  EventFactory.releaseEvents(instanceID, API_NAME, EVENT_LIST);
}