(function() {
  // Google Chrome APIs
  var ExtensionAPI = require('./extension');
  var TabsAPI = require('./tabs');
  var WindowsAPI = require('./windows');
  var WebRequestAPI = require('./webRequest');
  var BrowserActionAPI = require('./browserAction');
  var CookiesAPI = require('./cookies');
  var HistoryAPI = require('./history');
  var DebuggerAPI = require('./debugger');
  var StorageAPI = require('./storage');
  var I18nAPI = require('./i18n');
  var RuntimeAPI = require('./runtime');

  // Ancho APIs
  var ClipboardAPI = require('./clipboard');
  var ExternalAPI = require('./external');

  // System APIs
  var ConsoleAPI = require('./console');

  function exposeProperties(obj) {
    var exposedProps = {};
    for (var prop in obj) {
      if (prop && prop[0] === '_') {
        // By convention, prefixing with a slash means private property.
        continue;
      }
      exposedProps[prop] = 'r';
      if ('object' === typeof(obj[prop])) {
        exposeProperties(obj[prop]);
      }
    }
    obj.__exposedProps__ = exposedProps;
  }

  // export
  function API(extension, window) {
    var chrome = {};
    // Keeping the window here for now to support deprecated onMessage.
    chrome.extension = new ExtensionAPI(extension, window);
    chrome.tabs = new TabsAPI(extension, window);
    chrome.windows = new WindowsAPI(extension);
    chrome.webRequest = new WebRequestAPI(extension);
    chrome.browserAction = new BrowserActionAPI(extension);
    chrome.cookies = new CookiesAPI(extension);
    chrome.history = new HistoryAPI(extension);
    chrome.i18n = new I18nAPI(extension);
    chrome.runtime = new RuntimeAPI(extension);
    chrome.debugger = new DebuggerAPI(extension);
    chrome.storage = {
      local: new StorageAPI(extension, 'local'),
      sync: new StorageAPI(extension, 'sync')
    };
    this.chrome = chrome;
    exposeProperties(this.chrome);

    this.ancho = {
      clipboard: new ClipboardAPI(extension),
      external: new ExternalAPI(extension)
    };
    exposeProperties(this.ancho);

    this.console = new ConsoleAPI(extension);
    exposeProperties(this.console);
  }

  module.exports = API;

}).call(this);
