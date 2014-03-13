(function() {
  var Cu = Components.utils;
  Cu.import('resource://gre/modules/Services.jsm');

  const BROWSER_WINDOW_TYPE = 'navigator:browser';

  function _isBrowserWindow(browserWindow) {
    return BROWSER_WINDOW_TYPE === browserWindow.document.documentElement.getAttribute('windowtype');
  }

  function WindowWatcher(owner) {
    this._owner = owner;
    this._registry = [];
    this._initialized = false;
  }

  WindowWatcher.prototype = {
    init: function() {
      Services.ww.registerNotification(this);
      this._owner.once('unload', function() {
        this.unload();
      }.bind(this));
      this._initialized = true;
    },

    getContext: function(entry, win, remove) {
      var context;
      for (var i=0; i<entry.contexts.length; i++) {
        if (win === entry.contexts[i].window) {
          context = entry.contexts[i].context;
          if (remove) {
            entry.contexts.splice(i, 1);
          }
          return context;
        }
      }

      // This entry doesn't have a context yet for the specified window.
      context = {};
      if (!remove) {
        entry.contexts.push({ window: win, context: context });
      }
      else {
        // TODO: Log failure to find context.
      }
      return context;
    },

    fire: function(isLoad, win) {
      for (var i=0; i<this._registry.length; i++) {
        var callback = isLoad ? this._registry[i].loader : this._registry[i].unloader;
        callback.call(callback, win, this.getContext(this._registry[i], win, !isLoad));
      }
    },

    unload: function() {
      Services.ww.unregisterNotification(this);
      this.forAllWindows(this.fire.bind(this, false));
      this._registry = [];
    },

    register: function(loader, unloader) {
      var entry = {
        loader: loader,
        unloader: unloader,
        contexts: []
      };
      this._registry.push(entry);

      // start listening of browser window open/close events
      if (!this._initialized) {
        this.init();
      }

      // go through open windows and call loader there
      var self = this;
      this.forAllWindows(function(browserWindow) {
        if ('complete' === browserWindow.document.readyState) {
          // Document is fully loaded so we can watch immediately.
          loader(browserWindow, self.getContext(entry, browserWindow));
        } else {
          // Wait for the window to load before watching.
          browserWindow.addEventListener('load', function() {
            browserWindow.removeEventListener('load', arguments.callee, false);
            loader(browserWindow, self.getContext(entry, browserWindow));
          });
        }
      });
    },

    forAllWindows: function(callback) {
      var browserWindows = Services.wm.getEnumerator('navigator:browser');

      while (browserWindows.hasMoreElements()) {
        var browserWindow = browserWindows.getNext();
        callback.call(this, browserWindow);
      }
    },

    isActiveBrowserWindow: function(browserWindow) {
      return browserWindow === Services.wm.getMostRecentWindow('navigator:browser');
    },

    isActiveTab: function(browserWindow, tab) {
      return browserWindow.gBrowser.selectedTab === tab;
    },

    observe: function(subject, topic, data) {
      var browserWindow = subject;
      if (topic === 'domwindowopened') {
        if ('complete' === browserWindow.document.readyState && _isBrowserWindow(browserWindow)) {
          this.fire(true, browserWindow);
        } else {
          var self = this;
          browserWindow.addEventListener('load', function() {
            browserWindow.removeEventListener('load', arguments.callee, false);
            if (_isBrowserWindow(browserWindow)) {
              self.fire(true, browserWindow);
            }
          });
        }
      }
      if (topic === 'domwindowclosed') {
        if (_isBrowserWindow(browserWindow)) {
          this.fire(false, browserWindow);
        }
      }
    }
  };

  module.exports = WindowWatcher;
}).call(this);
