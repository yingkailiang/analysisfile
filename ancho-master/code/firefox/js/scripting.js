(function() {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;
  var CC = Components.Constructor;

  Cu.import('resource://gre/modules/Services.jsm');

  var API = require('./api');
  var readStringFromUrl = require('./utils').readStringFromUrl;

  // XHR implementation with no XSS restrictions
  function WrappedXMLHttpRequest() {
    this._inner = Cc['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance();
  }

  WrappedXMLHttpRequest.prototype = {
    get responseXML() { return this._inner.responseXML; },
    get responseText() { return this._inner.responseText; },
    get status() { return this._inner.status ? this._inner.status: 200; },
    get statusText() { return this._inner.statusText; },
    getAllResponseHeaders: function() { return this._inner.getAllResponseHeaders(); },
    getResponseHeader: function(header) { return this._inner.getResponseHeader(header); },
    open: function(method, url, async) { return this._inner.open(method, url, async); },
    send: function(body) { this._inner.send(body); },
    setRequestHeader: function(header, value) { this._inner.setRequestHeader(header, value); },
    get readyState() { return this._inner.readyState; },
    set onreadystatechange(callback) { this._inner.onreadystatechange = callback; }
  };

  exports.prepareWindow = function(extension, window) {
    if (!('chrome' in window)) {
      var api = new API(extension, window);
      window.chrome = api.chrome;
      window.ancho = api.ancho;
      window.console = api.console;

      window.addEventListener('unload', function(event) {
        window.removeEventListener('unload', arguments.callee, false);
        delete window.chrome;
        delete window.ancho;
        delete window.console;
      });
    }
  };

  exports.applyContentScripts = function(extension, win, spec, isFrame) {
    var baseUrl = Services.io.newURI(spec, '', null);
    var principal;
    // Preserving backwards compatibility with FF18 and older.
    if (Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULAppInfo).version.split('.')[0] >= 19) {
      principal = CC('@mozilla.org/systemprincipal;1', 'nsIPrincipal')();
    }
    else {
      principal = extension.backgroundWindow;
    }
    var sandbox = Cu.Sandbox(principal, { sandboxPrototype: win });
    var eventUnloaders = [];
    // Destroy the sandbox when the window goes away or the extension is disabled.
    extension.forWindow(win).once('unload', function() {
      // Remove event handlers registered by jQuery.
      // Needed until https://bugzilla.mozilla.org/show_bug.cgi?id=864313 is fixed.
      for (var i=0; i<eventUnloaders.length; i++) {
        eventUnloaders[i]();
      }
      Cu.nukeSandbox(sandbox);
    });
    var api = new API(extension, win);
    sandbox.chrome = api.chrome;
    sandbox.ancho = api.ancho;
    sandbox.console = api.console;
    sandbox.XMLHttpRequest = WrappedXMLHttpRequest;
    var processedJQuery = false;
    var contentScripts = extension.manifest.content_scripts;
    for (var i=0; i<contentScripts.length; i++) {
      var scriptInfo = contentScripts[i];
      if (isFrame && !scriptInfo.all_frames) {
        continue;
      }
      var matches = scriptInfo.matches;
      for (var j=0; j<matches.length; j++) {
        if (spec.match(matches[j])) {
          for (var k=0; k<scriptInfo.js.length; k++) {
            if (sandbox.jQuery && !processedJQuery) {
              sandbox.jQuery.ajaxSettings.xhr = function() { return new WrappedXMLHttpRequest(); };
              var jQueryEventAdd = sandbox.jQuery.event.add;
              sandbox.jQuery.event.add = function(elem, types, handler, data, selector) {
                jQueryEventAdd(elem, types, handler, data, selector);
                eventUnloaders.push(function() {
                  sandbox.jQuery.event.remove(elem, types, handler, selector);
                });
              };
              processedJQuery = true;
            }
            var scriptUri = Services.io.newURI(extension.getURL(scriptInfo.js[k]), '', null);
            var script = readStringFromUrl(scriptUri);
            try {
              Cu.evalInSandbox(script, sandbox);
            } catch(err) {
              dump('Ancho: script "' + scriptInfo.js[k] + '" failed: "' + err.message + '"\n' + err.stack + '\n');
            }
          }
          break;
        }
      }
    }
  };

  exports.loadHtml = function(extension, document, iframe, htmlSpec, callback) {
    var targetWindow = iframe.contentWindow;
    iframe.addEventListener('DOMWindowCreated', function(event) {
      var window = event.target.defaultView;
      // Check the wrappedJSObject for FF <= 18.
      if (window !== targetWindow && window.wrappedJSObject !== targetWindow) {
        return;
      }
      iframe.removeEventListener('DOMWindowCreated', arguments.callee, false);
      exports.prepareWindow(extension, targetWindow.wrappedJSObject);
    }, false);

    if (callback) {
      iframe.addEventListener('DOMContentLoaded', function(event) {
        iframe.removeEventListener('DOMContentLoaded', arguments.callee, false);
        callback(targetWindow.wrappedJSObject);
      }, false);
    }

    iframe.webNavigation.loadURI(htmlSpec, Ci.nsIWebNavigation.LOAD_FLAGS_NONE, null, null, null);
  };

}).call(this);
