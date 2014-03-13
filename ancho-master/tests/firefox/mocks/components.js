(function() {
  var _ = require('underscore'),
    _s = require('underscore.string'),
    util = require('util'),
    path = require('path'),
    url = require('url'),
    jsm = require('../utils/jsm');

  var nextWindowID = 1;

  function nsISupports() {}
  nsISupports.prototype = {
    QueryInterface: function(iid) { return this; }
  };

  function nsIDOMEventTarget() {}
  util.inherits(nsIDOMEventTarget, nsISupports);
  nsIDOMEventTarget.prototype.addEventListener = function() {};
  nsIDOMEventTarget.prototype.removeEventListener = function() {};

  function nsIDOMWindow() {
    this.outerWindowID = nextWindowID++;
  }
  util.inherits(nsIDOMWindow, nsIDOMEventTarget);

  function nsIDOMDocument(win) {
    this.defaultView = win || new nsIDOMWindow();
  }
  util.inherits(nsIDOMWindow, nsIDOMEventTarget);

  function nsIDOMElement() {}
  util.inherits(nsIDOMElement, nsIDOMEventTarget);

  function nsIURI(spec) {
    this.spec = spec;
    this.parsed = url.parse(this.spec);
    this.path = this.parsed.path;
    if (_s.endsWith(this.path, '/')) {
      this.path = this.path.substr(0, this.path.length-1);
    }
  }
  util.inherits(nsIURI, nsISupports);
  nsIURI.prototype.equals = function(uri) {
    return (this.parsed.scheme === uri.parsed.scheme) &&
      (this.parsed.host === uri.parsed.host) &&
      (path.normalize(this.parsed.path) === path.normalize(uri.parsed.path)) &&
      (this.parsed.hash === uri.parsed.hash);
  };

  function nsIChannel(uri) {
    this.URI = uri;
  }
  util.inherits(nsIChannel, nsISupports);
  nsIChannel.prototype.open = function() {};

  function makeService(obj) {
    return {
      getService: function() { return obj; }
    };
  }

  var Components = {
    interfaces: ['nsISupports', 'nsIDOMEventTarget', 'nsIDOMWindow', 'nsIDOMDocument', 'nsIDOMElement',
      'nsIURI', 'nsIChannel'],
    classes: {
      '@mozilla.org/moz/jssubscript-loader;1' : makeService({ loadSubScript: function() {} })
    },
    utils: {
      import: function(spec) {
        var modulePath = path.resolve('../mocks', path.basename(url.parse(spec).path));
        modulePath = modulePath.substr(0, modulePath.length-1);
        var symbols = require(modulePath);
        for (var symbol in symbols) {
          GLOBAL[symbol] = symbols[symbol];
        }
      }
    }
  };

  exports.nsISupports = nsISupports;
  exports.nsIDOMEventTarget = nsIDOMEventTarget;
  exports.nsIDOMWindow = nsIDOMWindow;
  exports.nsIDOMDocument = nsIDOMDocument;
  exports.nsIDOMElement = nsIDOMElement;
  exports.nsIURI = nsIURI;
  exports.nsIChannel = nsIChannel;
  exports.Components = Components;
}).call(this);
