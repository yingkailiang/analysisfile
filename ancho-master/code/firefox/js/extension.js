(function() {

  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');
  Cu.import('resource://gre/modules/NetUtil.jsm');

  var Utils = require('./utils');
  var TabSpecificEvent = require('./events').TabSpecificEvent;

  function ExtensionAPI(extension, window) {
    // TODO: Make sure we are running in a tab
    this._tab = Utils.getWindowId(window);
    this._chromeWindow = Utils.getChromeWindow(window);

    this._extension = extension;
    // Event handlers
    this.onRequest = new TabSpecificEvent(extension, 'extension.request', this._tab);
    this.onMessage = new TabSpecificEvent(extension, 'extension.message', this._tab);
  }

  ExtensionAPI.prototype = {
    sendRequest: function(extensionId, request, callback) {
      this._sendHelper(extensionId, request, callback, 'extension.request.*');
    },

    sendMessage: function(extensionId, message, callback) {
      this._sendHelper(extensionId, message, callback, 'extension.message.*');
    },

    getURL: function(path) {
      return this._extension.getURL(path);
    },

    _sendHelper: function(extensionId, message, callback, type) {
      if ('undefined' === typeof(message) || 'function' === typeof(message)) {
        callback = message;
        message = extensionId;
      }
      callback = callback || function() {};

      var sender = Utils.getSender(this._extension.id, this._tab);
      this._extension.emit(type, message, sender, callback);
    }
  };

  module.exports = ExtensionAPI;

}).call(this);
