(function() {

  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');

  var Event = require('./events').Event;
  var Utils = require('./utils');

  function TabsAPI(extension, window) {
    this._extension = extension;

    // TODO: Make sure this is really a tab.
    this._tab = Utils.getWindowId(window);
    this._chromeWindow = null; //Utils.getChromeWindow(window);

    // Event handlers
    this.onCreated = new Event(extension, 'tab.created');
    this.onActivated = new Event(extension, 'tab.activated');
    this.onRemoved = new Event(extension, 'tab.removed');
    this.onUpdated = new Event(extension, 'tab.updated');
  }

  TabsAPI.prototype = {
    getCurrent: function(callback) {
      // TODO: Check whether we are really a tab
      callback({ id: this._tab});
    },

    sendRequest: function(tabId, request, callback) {
      var sender = Utils.getSender(this._extension.id, this._tab);
      this._extension.emit('extension.request.' + tabId, request, sender, callback);
    },

    sendMessage: function(tabId, message, callback) {
      var sender = Utils.getSender(this._extension.id, this._tab);
      this._extension.emit('extension.message.' + tabId, message, sender, callback);
    },

    query: function(queryInfo, callback) {
      // TODO: Currently we only handle currentWindow, windowId and active properties
      // of queryInfo.
      var windows = [];
      var result = [];
      if (queryInfo.currentWindow ||
        (queryInfo.windowId && queryInfo.windowId === Utils.WINDOW_ID_CURRENT)) {
        // Just the current window.
        if (this._chromeWindow) {
          windows.push(this._chromeWindow);
        }
        else {
          // We're in the background window, so use the most recent browser window.
          var chromeWindow = Services.wm.getMostRecentWindow('navigator:browser');
          windows.push(chromeWindow);
        }
      }
      else {
        var browserWindows = Services.wm.getEnumerator('navigator:browser');
        while (browserWindows.hasMoreElements()) {
          windows.push(browserWindows.getNext());
        }
      }

      function createTabFromBrowser(browser) {
        return {
          id: Utils.getWindowId(browser.contentWindow),
          url: browser.contentDocument.location.href
        };
      }

      for (var i=0; i<windows.length; i++) {
        var win = windows[i];
        var tabbrowser = win.document.getElementById('content');
        if (queryInfo.active) {
          result.push(createTabFromBrowser(tabbrowser.selectedBrowser));
        }
        else {
          for (var j=0; j<tabbrowser.browsers.length; j++) {
            result.push(createTabFromBrowser(tabbrowser.browsers[j]));
          }
        }
      }

      callback(result);
    },

    create: function(createProperties, callback) {
      if (!('active' in createProperties)) {
        createProperties.active = true;
      }
      var tabbrowser = this._getBrowserForWindowId(createProperties.windowId);
      var tab = tabbrowser.addTab(createProperties.url || 'about:blank');
      if (createProperties.active) {
        tabbrowser.selectedTab = tab;
      }
      if (callback) {
        var browser = tabbrowser.getBrowserForTab(tab);
        callback({ id: Utils.getWindowId(browser.contentWindow) });
      }
    },

    update: function(tabId, updateProperties, callback) {
      if (typeof(tabId) != 'number') {
        // No tabId specified, shift the arguments
        callback = updateProperties;
        updateProperties = tabId;
        tabId = null;
      }
      var tabbrowser = this._getBrowserForWindowId(null);
      var browser = this._getBrowserForTabId(tabbrowser, tabId);

      browser.loadURI(updateProperties.url);
      if (updateProperties.active) {
        tabbrowser.selectedBrowser = browser;
      }
      if (callback) {
        callback({ id: tabId ? tabId : Utils.getWindowId(browser.contentWindow) });
      }
    },

    executeScript: function(tabId, executeScriptProperties, callback) {
      // TODO: This looks totally wrong to me. The code should be run in a sandbox.
      var tabbrowser = this._getBrowserForWindowId(null);
      var browser = this._getBrowserForTabId(tabbrowser, tabId);
      var doc = browser.contentDocument;
      if (doc && doc.body) {
        var scriptElement = doc.createElement('script');
        scriptElement.setAttribute('type', 'text/javascript');
        var tt = doc.createTextNode(executeScriptProperties.code);
        scriptElement.appendChild(tt);
        doc.body.appendChild(scriptElement);
      }
      if (callback) {
        callback();
      }
    },

    _getBrowserForTabId: function(tabbrowser, tabId) {
      if (!tabId) {
        return tabbrowser.selectedBrowser;
      }
      for (var i=0; i<tabbrowser.browsers.length; i++) {
        var browser = tabbrowser.browsers[i];
        if (Utils.getWindowId(browser.contentWindow) == tabId) {
          return tabbrowser.getBrowserAtIndex(i);
        }
      }
      return null;
    },

    _getBrowserForWindowId: function(windowId) {
      var browserWindow;
      if (!windowId) {
        browserWindow = Services.wm.getMostRecentWindow('navigator:browser');
      }
      else {
        var browserWindows = Services.wm.getEnumerator('navigator:browser');

        while (browserWindows.hasMoreElements()) {
          browserWindow = browserWindows.getNext();
          if (Utils.getWindowId(browserWindow) === windowId) {
            break;
          }
        }
      }
      return browserWindow.document.getElementById('content');
    }
  };

  module.exports = TabsAPI;

}).call(this);
