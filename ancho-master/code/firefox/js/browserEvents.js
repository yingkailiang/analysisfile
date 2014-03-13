(function() {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;

  var Utils = require('./utils');
  var Binder = require('./binder');

  var prepareWindow = require('./scripting').prepareWindow;
  var applyContentScripts = require('./scripting').applyContentScripts;

  function BrowserEvents(extension, window) {
    this._extension = extension;
    this._tabbrowser = window.document.getElementById('content');
  }

  BrowserEvents.prototype = {
    load: function() {
      this._tabbrowser.addEventListener('DOMWindowCreated',
        Binder.bind(this, 'onWindowCreated'), false);

      var container = this._tabbrowser.tabContainer;
      container.addEventListener('TabOpen', Binder.bind(this, 'onTabOpen'), false);
      container.addEventListener('TabClose', Binder.bind(this, 'onTabClose'), false);
      container.addEventListener('TabSelect', Binder.bind(this, 'onTabSelect'), false);
      // Apply content scripts on any tabs that are already open.
      for (var i=0; i<this._tabbrowser.browsers.length; i++) {
        var browser = this._tabbrowser.browsers[i];
        if (this._isContentBrowser(browser.contentDocument)) {
          var location = browser.contentDocument.location.href;
          browser._anchoCurrentLocation = location;
          if ('complete' === browser.contentDocument.readyState) {
            applyContentScripts(this._extension, browser.contentWindow, location, false);
          }
          // TODO: Apply to all the frames as well.
        }
      }
    },

    unload: function() {
      this._tabbrowser.removeEventListener('DOMWindowCreated',
        Binder.unbind(this, 'onWindowCreated'), false);
      var container = this._tabbrowser.tabContainer;
      container.removeEventListener('TabOpen', Binder.unbind(this, 'onTabOpen'), false);
      container.removeEventListener('TabClose', Binder.unbind(this, 'onTabClose'), false);
      container.removeEventListener('TabSelect', Binder.unbind(this, 'onTabSelect'), false);
    },

    onContentLoaded: function(document, isFrame) {
      var win = document.defaultView;
      var browser = this._tabbrowser.mCurrentBrowser;

      // We don't want to trigger the content scripts for about:blank.
      if (this._isContentBrowser(document)) {
        if (!isFrame) {
          if (browser._anchoCurrentLocation != document.location.href) {
            browser._anchoCurrentLocation = document.location.href;
            var tabId = Utils.getWindowId(browser.contentWindow);
            this._extension.emit('tab.updated',
              tabId, { url: document.location.href }, { id: tabId });
          }
        }
        applyContentScripts(this._extension, document.defaultView, document.location.href, isFrame);
      }
    },

    onTabOpen: function(event) {
      var browser = this._tabbrowser.getBrowserForTab(event.target);
      browser._anchoCurrentLocation = browser.contentDocument.location.href;
      this._extension.emit('tab.created', { id: Utils.getWindowId(browser.contentWindow) });
    },

    onTabClose: function(event) {
      var browser = this._tabbrowser.getBrowserForTab(event.target);
      this._extension.emit('tab.removed', Utils.getWindowId(browser.contentWindow), {});
    },

    onTabSelect: function(event) {
      this._extension.emit('tab.activated',
        { tabId: Utils.getWindowId(this._tabbrowser.selectedBrowser.contentWindow) });
    },

    onWindowCreated: function(event) {
      var document = event.target;
      var win = document.defaultView;
      var isFrame = !!((document instanceof Ci.nsIDOMHTMLDocument) && win.frameElement);
      if (isFrame) {
        win.frameElement.addEventListener('load', Binder.bindAnonymous(this, function(event) {
          win.frameElement.removeEventListener('load', Binder.unbindAnonymous(), false);
          this.onContentLoaded(win.frameElement.contentDocument, true);
        }), false);
      }
      else {
        // Tabs loaded by the session saver are in the 'uninitialized' state so we ignore
        // them. Other windows are 'loading' when this event is received.
        if ('loading' === document.readyState) {
          document.addEventListener('readystatechange', Binder.bindAnonymous(this, function(event) {
            if ('interactive' === document.readyState) {
              document.removeEventListener('readystatechange', Binder.unbindAnonymous(), false);
              this.onContentLoaded(document, false);
            }
          }), false);
        }
      }

      if ('ancho-extension:' === document.location.protocol) {
        prepareWindow(this._extension, win.wrappedJSObject);
      }
    },

    _isContentBrowser: function(document) {
      if (!document.head || !document.body) {
        // Not an HTML document.
        return false;
      }
      if ('about:' === document.location.protocol) {
        return false;
      }
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=863303
      // Currently there is a bug in Firefox and tabs opened by the session
      // saver are erroneously given the readyState 'complete', so we
      // need this hack to check whether they have really been loaded.
      if (!document.head.hasChildNodes() && !document.body.hasChildNodes()) {
        return false;
      }
      return true;
    }
  };

  module.exports = BrowserEvents;
}).call(this);
