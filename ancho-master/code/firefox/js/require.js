(function() {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;
  var Cm = Components.manager;

  Cu.import('resource://gre/modules/NetUtil.jsm');
  Cu.import('resource://gre/modules/XPCOMUtils.jsm');
  Cu.import('resource://gre/modules/Services.jsm');

  var classID = Components.ID('{5fcd7754-243f-43ac-8128-f470b45eb234}');

  function findModuleInPath(id, scriptUrl) {
    var url = null;
    do {
      if (url) {
        url = Services.io.newURI('..', '', url);
      }
      else {
        url = scriptUrl;
      }
      var nodeModules = Services.io.newURI('node_modules/', '', url);
      var moduleUrl = Services.io.newURI(id + '.js', '', nodeModules);
      var channel = Services.io.newChannelFromURI(moduleUrl);
      try {
        var inputStream = channel.open();
        return moduleUrl;
      }
      catch(e) {
        // No stream so the module doesn't exist
      }
    }while(!url.equals(this._baseUrl));
    return null;
  }

  function Require() {
    this.wrappedJSObject = this;
  }

  Require.prototype = {
    QueryInterface: XPCOMUtils.generateQI([]),
    classID: classID,
    service: true,

    moduleCache: {},

    createRequire: function(baseUrl) {
      var self = this;
      this._baseUrl = baseUrl;
      return function require(id, scriptUrl) {
        if (baseUrl && !scriptUrl) {
          scriptUrl = baseUrl;
        }
        if (!scriptUrl) {
          // No base URL available so we need to get it from the stacktrace.
          try {
            // To get a stacktrace we have to thrown an exception.
            throw new Error();
          }
          catch (e) {
            var frames = e.stack.split('\n');
            var baseSpec = frames[1].match(/@(.*):\d+$/)[1];
            scriptUrl = Services.io.newURI(baseSpec, '', null);
          }
        }

        var url;
        if (id[0] != '.' && id[0] != '/') {
          // Try to find the module in the search path
          url = findModuleInPath(id, scriptUrl);
        }
        else {
          url = Services.io.newURI(id + '.js', '', scriptUrl);
        }
        if (!url) {
          // TODO: Logging.
          return;
        }

        var spec = url.spec;
        if (spec in self.moduleCache) {
          return self.moduleCache[spec];
        }

        var scriptLoader = Cc['@mozilla.org/moz/jssubscript-loader;1'].
          getService(Ci.mozIJSSubScriptLoader);

        var context = {};
        var directoryUrl = Services.io.newURI('.', '', url);
        context.require = function(id) { return require(id, directoryUrl); };
        context.process = { title: 'Ancho' };

        // Need to add to the cache here to avoid stack overflow in case of require() cycles
        // (e.g. A requires B which requires A).
        self.moduleCache[spec] = context.exports = {};
        // Support for 'module.exports' (overrides 'exports' if 'module.exports' is used).
        context.module = {};

        try {
          scriptLoader.loadSubScript(spec, context);
        } catch (e) {
          dump('\nERROR: Loading of subscript "' + spec + '" failed:\n');
          dump(e + '\n');
        }
        if (context.module.exports) {
          context.exports = context.module.exports;
        }
        self.moduleCache[spec] = context.exports;
        return context.exports;
      };
    }
  };

  var NSGetFactory = XPCOMUtils.generateNSGetFactory([Require]);
  var factory = NSGetFactory(classID);

  exports.register = function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).registerFactory(
      classID,
      '',
      '@salsitasoft.com/ancho/require;1',
      factory
    );
  };

  exports.unregister = function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).unregisterFactory(classID, factory);
  };
}).call(this);
