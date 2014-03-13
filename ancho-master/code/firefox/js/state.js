(function() {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');
  Cu.import('resource://gre/modules/FileUtils.jsm');

  const APP_STARTUP = 1;
  const APP_SHUTDOWN = 2;
  const ADDON_ENABLE = 3;
  const ADDON_DISABLE = 4;
  const ADDON_INSTALL = 5;
  const ADDON_UNINSTALL = 6;
  const ADDON_UPGRADE = 7;
  const ADDON_DOWNGRADE = 8;

  const DEFAULT_LOCALE = 'en';
  const LOCALE_MESSAGE_REGEXP = /^__MSG_(.*)__$/;

  var inherits = require('inherits');
  var EventEmitter2 = require('eventemitter2').EventEmitter2;
  var Utils = require('./utils');
  var WindowWatcher = require('./windowWatcher');
  var Binder = require('./binder');

  var gGlobal = null;

  function WindowEventEmitter(win) {
    this._window = win;
  }
  inherits(WindowEventEmitter, EventEmitter2);

  WindowEventEmitter.prototype.init = function() {
    this._window.addEventListener('unload', Binder.bind(this, 'shutdown'), false);
  };

  WindowEventEmitter.prototype.shutdown = function(reason) {
    if (this._window) {
      this.emit('unload', reason);
      this._window.removeEventListener('unload', Binder.unbind(this, 'shutdown'), false);
      this._window = null;
    }
  };

  function Extension(id) {
    EventEmitter2.call(this, { wildcard: true });
    this._id = id;
    this._rootDirectory = null;
    this._manifest = null;
    this._windowEventEmitters = {};
    this._windowWatcher = null;
    this._firstRun = null;
    this._messages = null;
    // TODO: Use the right locale
    this._defaultLocale = DEFAULT_LOCALE;
  }
  inherits(Extension, EventEmitter2);

  Object.defineProperty(Extension.prototype, 'id', {
    get: function id() {
      return this._id;
    }
  });

  Object.defineProperty(Extension.prototype, 'rootDirectory', {
    get: function rootDirectory() {
      return this._rootDirectory.clone();
    }
  });

  Object.defineProperty(Extension.prototype, 'firstRun', {
    get: function firstRun() {
      return this._firstRun;
    }
  });

  Object.defineProperty(Extension.prototype, 'manifest', {
    get: function manifest() {
      return this._manifest;
    }
  });

  Object.defineProperty(Extension.prototype, 'windowWatcher', {
    get: function windowWatcher() {
      if (!this._windowWatcher) {
        this._windowWatcher = new WindowWatcher(this);
      }
      return this._windowWatcher;
    }
  });

  Object.defineProperty(Extension.prototype, 'storageConnection', {
    get: function storageConnection() {
      return this._storageConnection;
    }
  });

  Extension.prototype.getURL = function(path) {
    var URI = NetUtil.newURI('ancho-extension://' + this._id + '/' + path, '', null);
    return URI.spec;
  };

  Extension.prototype.getStorageTableName = function(storageSpace) {
    return this._id.replace(/[^A-Za-z]/g, '_') + '_' + storageSpace;
  };

  Extension.prototype.getLocaleMessage = function(locale, key) {
    if (undefined === key) {
      // No locale specified so use default.
      key = locale;
      locale = this._defaultLocale;
    }
    return this._messages[locale][key];
  };

  Extension.prototype.getLocalizedText = function(str) {
    var match = str.match(LOCALE_MESSAGE_REGEXP);
    if (match) {
      return this.getLocaleMessage(match[1]).message;
    }
    else {
      return str;
    }
  };

  Extension.prototype.load = function(rootDirectory, reason) {
    this._rootDirectory = rootDirectory;
    this._firstRun = [ ADDON_ENABLE, ADDON_INSTALL, ADDON_UPGRADE, ADDON_DOWNGRADE ].indexOf(reason) != -1;
    if (ADDON_ENABLE === reason) {
      this._onEnabled();
    }

    var dbFile = rootDirectory.clone();
    dbFile.append('ancho_storage.sqlite3');
    this._storageConnection = Services.storage.openUnsharedDatabase(dbFile);

    this._loadMessages();
    this._loadManifest();
  };

  Extension.prototype.unload = function(reason) {
    if (this._windowWatcher) {
      this._windowWatcher.unload();
    }

    for (var windowId in this._windowEventEmitters) {
      this._windowEventEmitters[windowId].shutdown(reason);
    }
    this._windowEventEmitters = {};

    this.emit('unload', reason);

    if (ADDON_DISABLE === reason) {
      this._onDisabled();
    }

    this._storageConnection.asyncClose();
  };

  Extension.prototype.forWindow = function(win) {
    var windowId = Utils.getWindowId(win);
    var windowEventEmitter;
    if (!(windowId in this._windowEventEmitters)) {
      windowEventEmitter = new WindowEventEmitter(win);
      windowEventEmitter.init();
      this._windowEventEmitters[windowId] = windowEventEmitter;
    }
    else {
      windowEventEmitter = this._windowEventEmitters[windowId];
    }
    return windowEventEmitter;
  };

  Extension.prototype._loadManifest = function() {
    var manifestFile = this.rootDirectory;
    manifestFile.append('manifest.json');
    var manifestURI = Services.io.newFileURI(manifestFile);
    var manifestString = Utils.readStringFromUrl(manifestURI);
    this._manifest = JSON.parse(manifestString);
    var i, j;
    if ('content_scripts' in this._manifest) {
      for (i=0; i<this._manifest.content_scripts.length; i++) {
        var scriptInfo = this._manifest.content_scripts[i];
        for (j=0; j<scriptInfo.matches.length; j++) {
          // Convert from Google's simple wildcard syntax to a regular expression
          // TODO: Implement proper match pattern matcher.
          scriptInfo.matches[j] = Utils.matchPatternToRegexp(scriptInfo.matches[j]);
        }
      }
    }
    if ('web_accessible_resources' in this._manifest) {
      for (i=0; i<this._manifest.web_accessible_resources.length; i++) {
        this._manifest.web_accessible_resources[i] =
          Utils.matchPatternToRegexp(this._manifest.web_accessible_resources[i]);
      }
    }
  };

  Extension.prototype._loadMessages = function() {
    this._messages = {};
    var localeDir = this.rootDirectory;
    localeDir.append('_locales');
    if (localeDir.exists()) {
      var entries = localeDir.directoryEntries;
      while (entries.hasMoreElements()) {
        var entry = entries.getNext().QueryInterface(Ci.nsIFile);
        var locale = entry.leafName;
        entry.append('messages.json');
        if (entry.exists()) {
          var entryURI = Services.io.newFileURI(entry);
          var json = Utils.readStringFromUrl(entryURI);
          this._messages[locale] = JSON.parse(json);
        }
      }
    }
  };

  Extension.prototype._onEnabled = function() {
  };

  Extension.prototype._onDisabled = function() {
  };

  function GlobalId() {
    this._id = 1;
  }

  GlobalId.prototype.getNext = function() {
    return this._id++;
  };

  function Global() {
    EventEmitter2.call(this, { wildcard: true });
    this._extensions = {};
    this._globalIds = {};
  }
  inherits(Global, EventEmitter2);

  Global.prototype.getGlobalId = function(name) {
    if (!this._globalIds[name]) {
      this._globalIds[name] = new GlobalId();
    }
    return this._globalIds[name].getNext();
  };

  Global.prototype.getExtension = function(id) {
    return this._extensions[id];
  };

  Global.prototype.loadExtension = function(id, rootDirectory, reason) {
    this._extensions[id] = new Extension(id);
    this._extensions[id].load(rootDirectory, reason);
    return this._extensions[id];
  };

  Global.prototype.unloadExtension = function(id, reason) {
    this._extensions[id].unload(reason);
    delete this._extensions[id];
    return (Object.keys(this._extensions).length > 0);
  };

  Global.prototype.shutdown = function(reason) {
    this.emit('unload', reason);
    this.removeAllListeners();
  };

  exports.Global = gGlobal = new Global();

  // Bootstrapped extension lifecycle constants.
  exports.APP_STARTUP = APP_STARTUP;
  exports.APP_SHUTDOWN = APP_SHUTDOWN;
  exports.ADDON_ENABLE = ADDON_ENABLE;
  exports.ADDON_DISABLE = ADDON_DISABLE;
  exports.ADDON_INSTALL = ADDON_INSTALL;
  exports.ADDON_UNINSTALL = ADDON_UNINSTALL;
  exports.ADDON_UPGRADE = ADDON_UPGRADE;
  exports.ADDON_DOWNGRADE = ADDON_DOWNGRADE;

}).call(this);
