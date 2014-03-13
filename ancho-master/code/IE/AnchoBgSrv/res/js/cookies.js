/******************************************************************************
 * cookies.js
 * Part of Ancho browser extension framework
 * Implements chrome.cookies
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 ******************************************************************************/

//******************************************************************************
//* requires
var Event = require("events.js").Event;
var EventFactory = require("utils.js").EventFactory;

require("cookies_spec.js");
var preprocessArguments = require("typeChecking.js").preprocessArguments;
var notImplemented = require("typeChecking.js").notImplemented;

var cleanWS = require("utils.js").cleanWhiteSpace;

var EVENT_LIST = ['onChanged'];
var API_NAME = 'cookies';



// this function just copies IECookie objects to plain Javascript objects,
// so the caller can modificate it
function createCookieCopy(aCookie) {
  return {
    domain: cleanWS(aCookie.domain),
    path: cleanWS(aCookie.path),
    name: cleanWS(aCookie.name),
    value: cleanWS(aCookie.value),
    expirationDate: aCookie.expirationDate
  };
}

function parseCookieString(aCookie) {
  var idx = aCookie.indexOf('=');
  var name = cleanWS(aCookie.substr(0, idx));
  var value = cleanWS(aCookie.substr(idx + 1));
  return {
    name: name,
    value: value
  };
}


exports.invokeEventWithIDispatch = function(aEventName, aIDispatchData) {
  if (aEventName != 'cookies.onChanged') {
    console.error('Event ' + aEventName + ' unsupported!');
    return;
  }
  var cookie = createCookieCopy(aIDispatchData);
  var changeInfo = {
    cause: 'explicit',
    removed: false,
    cookie: cookie
  };
  addonAPI.invokeEventObject(
            'cookies.onChanged',
            -1,
            true, //we are skipping _instanceID
            [changeInfo]
            );
}

//******************************************************************************
//* main closure
var Cookies = function(instanceID) {
  //============================================================================
  // private variables
  var _instanceID = instanceID;
  //============================================================================
  // public methods

  //----------------------------------------------------------------------------
  // chrome.cookies.get
  this.get = function(details, callback) {
    var args = preprocessArguments('chrome.cookies.get', arguments);

    serviceAPI.cookieManager.getCookie(args.details, args.callback, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.cookies.getAll
  this.getAll = function(details, callback) {
    var args = preprocessArguments('chrome.cookies.getAll', arguments);
    serviceAPI.cookieManager.getAllCookies(args.details, args.callback, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.cookies.getAllCookieStores
  this.getAllCookieStores = function(callback) {
    var args = notImplemented('chrome.cookies.getAllCookieStores', arguments);
  };

  //----------------------------------------------------------------------------
  // chrome.cookies.remove
  this.remove = function(details, callback) {
    var args = preprocessArguments('chrome.cookies.remove', arguments);

    var callbackFunc = args.callback || function(cookie){};
    serviceAPI.cookieManager.removeCookie(args.details, callbackFunc, addonAPI.id, _instanceID);
  };

  //----------------------------------------------------------------------------
  // chrome.cookies.set
  this.set = function(details, callback) {
    var args = preprocessArguments('chrome.cookies.set', arguments);

    var callbackFunc = args.callback || function(cookie){};
    serviceAPI.cookieManager.setCookie(args.details, callbackFunc, addonAPI.id, _instanceID);
  };

  //============================================================================
  // events

  EventFactory.createEvents(this, instanceID, API_NAME, EVENT_LIST);

  //============================================================================
  //============================================================================
  // main initialization
  /*try {
  serviceAPI.cookieManager.cookiesChangedCallback = function() { console.info("COOOOOOKIES"); };
  } catch (e) {
  console.log(e.description + e.message);
  }*/
}

exports.createAPI = function(instanceID) {
  return new Cookies(instanceID);
}

exports.releaseAPI = function(instanceID) {
  EventFactory.releaseEvents(instanceID, API_NAME, EVENT_LIST);
}
