(function() {
  const Cc = Components.classes;
  const Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');

  var Event = require('./events').Event;

  function RuntimeAPI(extension) {
    this.onInstalled = new Event(extension, 'runtime.installed');    
  }

  RuntimeAPI.prototype = {
  };

  module.exports = RuntimeAPI;

}).call(this);
