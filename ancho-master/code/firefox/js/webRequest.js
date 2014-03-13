(function() {

/*
   Client portion of WebRequest API that provides access to events and methods.
   The actual implementation runs in the background window of the extension and
   fires the events. For the implementation, please see httpRequestObserver.js.
*/


  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');

  var ProxiedEvent = require('./events').ProxiedEvent;
  var Global = require('./state').Global;
  var Utils = require('./utils');
  var inherits = require('inherits');

  // Special event that knows about web request filters.
  function WebRequestEvent(owner, type) {
    ProxiedEvent.apply(this, arguments);
  }
  inherits(WebRequestEvent, ProxiedEvent);

  WebRequestEvent.prototype.wrapListener = function(listener, filter) {
    if (!filter) {
      throw 'No filter provided to addListener';
    }
    if (!filter.urls) {
      throw 'No urls property provided to filter in addListener';
    }
    return function(details, callback) {
      if (this._checkFilter(filter, details, callback)) {
        listener.apply(this, arguments);
      }
    }.bind(this);
  };

  WebRequestEvent.prototype._checkFilter = function(filter, details, callback) {
    var urls = [];
    for (var i=0; i<filter.urls.length; i++) {
      urls.push(Utils.matchPatternToRegexp(filter.urls[i]));
    }

    if (urls.length > 0) {
      var matched = false;
      for (var i=0; i<urls.length; i++) {
        if (details.url.match(urls[i])) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return;
      }
    }
    if (filter.types) {
      if (filter.types.indexOf(details.type) === -1) {
        return;
      }
    }
    if (filter.tabId) {
      if (filter.tabId != details.tabId) {
        return;
      }
    }
    // TODO: Implement filter.windowId
    return callback();
  };

  var WebRequestAPI = function(extension) {
    this.onCompleted = new WebRequestEvent(Global, 'webRequest.completed');
    this.onHeadersReceived = new WebRequestEvent(Global, 'webRequest.headersReceived');
    this.onBeforeRedirect = new WebRequestEvent(Global, 'webRequest.beforeRedirect');
    this.onAuthRequired = new WebRequestEvent(Global, 'webRequest.authRequired');
    this.onBeforeSendHeaders = new WebRequestEvent(Global, 'webRequest.beforeSendHeaders');
    this.onErrorOccurred = new WebRequestEvent(Global, 'webRequest.errorOccurred');
    this.onResponseStarted = new WebRequestEvent(Global, 'webRequest.responseStarted');
    this.onSendHeaders = new WebRequestEvent(Global, 'webRequest.sendHeaders');
    this.onBeforeRequest = new WebRequestEvent(Global, 'webRequest.beforeRequest');
  };

  WebRequestAPI.prototype.handlerBehaviorChanged = function(callback) {
    // noop
    if (callback) {
      callback();
    }
  };

  module.exports = WebRequestAPI;

}).call(this);
