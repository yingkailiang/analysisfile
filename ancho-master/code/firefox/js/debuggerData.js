(function() {

  // singleton for debugger protocol data
  // mapping tab id --> object representing debugging state

  // debugging state (properties)
  // ---
  // GENERAL (on attach())
  // + protocol: string
  // ---
  // NETWORK
  // + networkMonitor: true / false
  // + extraHttpHeaders: object of { header-name: header-value } pairs

  var data = {};

  // singleton for sendCommand handlers
  // mapping protocol domain ---> function hadling the domain

  var handlers = {};


  module.exports = {

    // ----
    // DATA
    // ----

    // tab id in case we want to send Network notifications regardless of tab id
    ALL_TABS: -1,

    // data getter
    getProperty: function(tabId, name) {
      var debuggerTabId = this.ALL_TABS in data ?  this.ALL_TABS : tabId;
      return (data[debuggerTabId] && data[debuggerTabId][name]);
    },

    // data setter
    setProperty: function(tabId, name, value) {
      if (!(tabId in data)) {
        data[tabId] = {};
      }
      data[tabId][name] = value;
    },

    // reset tab data (on tab detach)
    reset: function(tabId) {
      if (tabId in data) {
        delete data[tabId];
        return true;
      } else {
        return false;
      }
    },


    // --------
    // HANDLERS
    // --------

    setHandler: function(domain, handler) {
      if (handler) {
        handlers[domain] = handler;
      } else {
        delete handlers[domain];
      }
    },

    getHandler: function(domain) {
      return handlers[domain];
    }

  };

}).call(this);
