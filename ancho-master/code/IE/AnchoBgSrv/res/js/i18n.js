/******************************************************************************
 * i18n.js
 * Part of Ancho browser extension framework
 * Implements chrome.i18n
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 ******************************************************************************/
var manifest = require("manifest").manifest;
var locales = require("locales").locales;

//TODO : proper setup
var currentLocale = manifest.default_locale || 'en';

require("i18n_spec.js");
var preprocessArguments = require("typeChecking.js").preprocessArguments;
var notImplemented = require("typeChecking.js").notImplemented;

var getLocalizedMessage = function (messageName, substitutions) {
  if (locales[currentLocale]) {
    var info = locales[currentLocale][messageName];
    if (info && info.message) {
      //TODO - substitutions
      return info.message.replace(/\$\$/g, '$');
    }
  }
  return "";
}

var isLocalizedMessageIdentifier = function (name) {
  if (typeof(name) != 'string') {
    return false;
  }
  return !!name.match(/__MSG_\w+__/);
}

var getLocalizedMessageFromIdentifier = function (name) {
  m = name.match(/__MSG_(\w+)__/);
  if (m && m.length == 2) {
    return getLocalizedMessage(m[1]);
  }
  return undefined;
}

exports.getLocalizedMessage = getLocalizedMessage;
exports.isLocalizedMessageIdentifier = isLocalizedMessageIdentifier;
exports.getLocalizedMessageFromIdentifier = getLocalizedMessageFromIdentifier;

//******************************************************************************
//* main closure
(function(me) {
  //============================================================================
  // private variables


  //============================================================================
  // public methods

  //----------------------------------------------------------------------------
  // chrome.i18n.getAcceptLanguages
  me.getAcceptLanguages = function(callback) {
    var args = notImplemented('chrome.i18n.getAcceptLanguages', arguments);
  };

  //----------------------------------------------------------------------------
  // chrome.i18n.getMessage
  //   returns   string
  me.getMessage = function(messageName, substitutions) {
    try {
      var args = preprocessArguments('chrome.i18n.getMessage', arguments);
    } catch (e) {
      return undefined; //According to documentation call format failures are reported by returning undefined
    }
    return getLocalizedMessage(args.messageName, args.substitutions);
  };


  //============================================================================
  //============================================================================
  // main initialization


}).call(this, exports);

exports.createAPI = function(instanceID) {
  //We don't need special instances
  return exports;
}

exports.releaseAPI = function(instanceID) {
  //Nothing needs to be released
}