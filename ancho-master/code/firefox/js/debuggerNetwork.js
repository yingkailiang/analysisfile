(function() {

  /*
      Handler for Network domain of debugger protocol.
  */

  var DebugData = require('./debuggerData');

  function processNetworkCommand(target, method, commandParams, callback) {
    if (!DebugData.getProperty(target.tabId, 'protocol')) {
      return;  // not attached
    }
    switch (method) {
      case 'enable':
        DebugData.setProperty(target.tabId, 'networkMonitor', true);
        break;

      case 'disable':
        DebugData.setProperty(target.tabId, 'networkMonitor', false);
        break;

      case 'setExtraHTTPHeaders':
        DebugData.setProperty(target.tabId, 'extraHttpHeaders', commandParams);
        break;

      default:
        dump('ERROR: unsupported debugger method "Network.' + method + '".\n');
        break;
    }
    if ('function' === typeof(callback)) {
      callback();
    }
  }

  module.exports = {
    register: function() {
      DebugData.setHandler('Network', processNetworkCommand);
    },

    unregister: function() {
      DebugData.setHandler('Network');
    }
  };

}).call(this);
