(function() {

  var Binder = {
    _methodCache: {},

    bind: function(thisArg, methodName) {
      return this._findMethod(thisArg, methodName, false);
    },

    unbind: function(thisArg, methodName) {
      return this._findMethod(thisArg, methodName, true);
    },

    bindAnonymous: function(thisArg, callback) {
      var wrappedCallback = function() {
        // TODO: Assert that _currentInvocation is null.
        // Or maybe setTimeout (or equivalent) and try again?
        Binder._currentInvocation = wrappedCallback;
        var ret = callback.apply(thisArg, arguments);
        Binder._currentInvocation = null;
        return ret;
      };
      return wrappedCallback;
    },

    unbindAnonymous: function() {
      return this._currentInvocation;
    },

    _findMethod: function(thisArg, methodName, remove) {
      var methods = this._methodCache[methodName],
        method = null;
      if (methods) {
        for (var i=0; i<methods.length; i++) {
          if (methods[i].thisArg === thisArg) {
            method = methods[i].method;
            if (remove) {
              methods.splice(i, 1);
            }
            break;
          }
        }
      }
      if (!method && !remove) {
        method = thisArg[methodName].bind(thisArg);
        if (!(methodName in this._methodCache)) {
          this._methodCache[methodName] = [];
        }
        this._methodCache[methodName].push({ thisArg: thisArg, method: method });
      }
      return method;
    }
  };

  module.exports = Binder;

}).call(this);
