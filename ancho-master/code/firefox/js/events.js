(function() {
  var inherits = require('inherits');

  function Event(owner, type) {
    this._owner = owner;
    this._type = type;
  }

  Event.prototype = {
    get type() {
      return this._type;
    },

    addListener: function(listener) {
      this._owner.addListener(this.type, listener);
    },

    removeListener: function(listener) {
      this._owner.removeListener(this.type, listener);
    },

    hasListener: function(listener) {
      var listeners = this._owner.listeners(this.type);
      for (var i=0; i<listeners.length; i++) {
        if (listener === listeners[i]) {
          return true;
        }
      }
      return false;
    },

    fire: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this._type);
      this._owner.emit.apply(this, args);
    }
  };

  // Event that should only be received if the correct tab ID
  // is specified by the sender.
  function TabSpecificEvent(owner, type, tabId) {
    Event.apply(this, arguments);
    this._tabId = tabId;
  }
  inherits(TabSpecificEvent, Event);

  Object.defineProperty(TabSpecificEvent.prototype, 'type', {
    get: function type() {
      return this._tabId ? this._type + '.' + this._tabId : this._type;
    }
  });

  // Event that let's us proxy the listener in a wrapper so we can
  // do pre/post-processing. Just override `wrapListener` to create the
  // new listener, invoking the original listener as appropriate.
  function ProxiedEvent(owner, type) {
    Event.apply(this, arguments);
    this._wrappers = [];
  }
  inherits(ProxiedEvent, Event);

  ProxiedEvent.prototype.wrapListener = function(listener) {
    throw "wrapListener must be implemented in derived class";
  };

  ProxiedEvent.prototype.addListener = function(listener) {
    // Additional arguments are also passed to `wrapListener` so we
    // can have the behavior of the wrapper depend on these arguments.
    var wrapper = this.wrapListener.apply(this, arguments);
    this._wrappers.push({ listener: listener, wrapper: wrapper });
    return Event.prototype.addListener.call(this, wrapper);
  };

  ProxiedEvent.prototype.removeListener = function(listener) {
    for (var i=0; i<this._wrappers.length; i++) {
      if (this._wrappers[i].listener === listener) {
        var wrapper = this._wrappers[i].wrapper;
        this._wrappers.splice(i, 1);
        return Event.prototype.removeListener(this, wrapper);
      }
    }
    // Not found.
  };

  function SynchronousEvent(owner, type) {
    ProxiedEvent.apply(this, arguments);
    this._results = [];
  }
  inherits(SynchronousEvent, ProxiedEvent);

  Object.defineProperty(SynchronousEvent.prototype, 'results', {
    get: function results() {
      return this._results;
    }
  });

  SynchronousEvent.prototype.wrapListener = function(listener) {
    return function() {
      this._results.push(listener.apply(this, arguments));
    }.bind(this);
  };

  SynchronousEvent.prototype.synchronousFire = function() {
    this._results = [];
    this.fire.apply(this, arguments);
    return this._results;
  };

  exports.Event = Event;
  exports.TabSpecificEvent = TabSpecificEvent;
  exports.ProxiedEvent = ProxiedEvent;
  exports.SynchronousEvent = SynchronousEvent;
}).call(this);
