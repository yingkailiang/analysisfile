(function() {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');

  function ConsoleAPI(extension) {
    try {
      this.debugEnabled = Services.prefs.getBoolPref('extensions.ancho@salsitasoft.com.loggingEnabled');
    }
    catch(e) {
      this.debugEnabled = false;
    }
    // TODO: Preference observer.
  }

  ConsoleAPI.prototype = {
    error: function() {
      dump('ERROR: ');
      dump(this._toString.apply(this, arguments));
      dump('\n');
    },

    warn: function() {
      dump('Warning: ');
      dump(this._toString.apply(this, arguments));
      dump('\n');
    },

    log: function() {
      dump('Log: ');
      dump(this._toString.apply(this, arguments));
      dump('\n');
    },

    debug: function() {
      if (this.debugEnabled) {
        dump('Debug: ');
        dump(this._toString.apply(this, arguments));
        dump('\n');
      }
    },

    _toString: function(args) {
      if ('undefined' === typeof(args)) {
        return 'undefined';
      }
      var s = '';
      for (var i = 0; i < arguments.length; i++) {
        if ('object' === typeof(arguments[i])) {
          s += JSON.stringify(arguments[i], null, 2);
        } else {
          s += arguments[i].toString();
        }
        if (i < arguments.length - 1) {
          s += ' ';
        }
      }
      return s;
    }
  };

  module.exports = ConsoleAPI;

}).call(this);
