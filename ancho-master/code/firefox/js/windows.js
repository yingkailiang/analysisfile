(function() {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');

  var Utils = require('./utils');

  // Map of popups to the window that contains them.
  // Global for the whole extension.
  function WindowsAPI(extension, contentWindow) {
    this._contentWindow = contentWindow;
  }

  WindowsAPI.prototype = {
    WINDOW_ID_CURRENT: Utils.WINDOW_ID_CURRENT,

    getCurrent: function(getInfo, callback) {
      callback({ id: Utils.getWindowId(this._contentWindow) });
    }
  };

  module.exports = WindowsAPI;

}).call(this);
