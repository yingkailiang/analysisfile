/******************************************************************************
 * runtime.js
 * Part of Ancho browser extension framework
 * Implements chrome.runtime
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 ******************************************************************************/

//******************************************************************************
//* requires
var Event = require("events.js").Event;
var EventFactory = require("utils.js").EventFactory;

//require("runtime_spec.js");
var preprocessArguments = require("typeChecking.js").preprocessArguments;
var notImplemented = require("typeChecking.js").notImplemented;



var EVENT_LIST = [
    //'onStartup'
    'onInstalled'
    //'onSuspend'
    //'onSuspendCanceled'
    //'onUpdateAvailable'
    //'onConnect'
    //'onConnectExternal'
    //'onMessage'
    //'onMessageExternal'
    //'onRestartRequired'
];
var API_NAME = 'runtime';
//******************************************************************************
//* main closure
var Runtime = function(instanceID) {
  //============================================================================
  // private variables
  var _instanceID = instanceID;

  //============================================================================
  // public properties

  //============================================================================
  // events

  EventFactory.createEvents(this, instanceID, API_NAME, EVENT_LIST);

  //============================================================================
  //============================================================================
  // main initialization


}

exports.createAPI = function(instanceID) {
  return new Runtime(instanceID);
}

exports.releaseAPI = function(instanceID) {
  EventFactory.releaseEvents(instanceID, API_NAME, EVENT_LIST);
}
