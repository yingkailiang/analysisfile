(function() {
  const { classes: Cc, interfaces: Ci, utils: Cu, manager: Cm } = Components;

  Cu.import('resource://gre/modules/NetUtil.jsm');
  Cu.import('resource://gre/modules/XPCOMUtils.jsm');
  Cu.import('resource://gre/modules/Services.jsm');

  const SCHEME = 'ancho-extension';

  var classID = Components.ID('{b0a95b24-4270-4e74-8179-f170d6dab4a1}');

  var extensionURIs = {};

  exports.registerExtensionURI = function(id, uri) {
    extensionURIs[id] = uri;
  };

  exports.unregisterExtensionURI = function(id) {
    delete extensionURIs[id];
  };

  exports.getExtensionURI = function(id) {
    return extensionURIs[id];
  };

  function AnchoProtocolHandler() {
  }

  AnchoProtocolHandler.prototype = {
    scheme: SCHEME,
    defaultPort: -1,
    protocolFlags: Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE |
      Ci.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE,

    newURI: function(aSpec, aOriginCharset, aBaseURI) {
      var uri = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI);
      if (aBaseURI) {
        var url = Cc['@mozilla.org/network/standard-url;1'].createInstance(Ci.nsIStandardURL);
        url.init(Ci.nsIStandardURL.URLTYPE_STANDARD, null, aBaseURI.spec, null, null);
        uri.spec = url.QueryInterface(Ci.nsIURI).resolve(aSpec);
      }
      else {
        uri.spec = aSpec;
      }
      return uri;
    },

    _mapToFileURI: function(aURI) {
      var url = Cc['@mozilla.org/network/standard-url;1'].createInstance(Ci.nsIStandardURL);
      url.init(Ci.nsIStandardURL.URLTYPE_STANDARD, null, aURI.spec, null, null);
      var uri = url.QueryInterface(Ci.nsIURI);
      var path = '.' + uri.path;
      var id = uri.userPass;
      if (id) {
        id += '@';
      }
      id += uri.host;
      var baseURI = exports.getExtensionURI(id);
      return NetUtil.newURI(path, null, baseURI);
    },

    newChannel: function(aURI) {
      var channel = NetUtil.newChannel(this._mapToFileURI(aURI), null, null);
      channel.originalURI = aURI;

      if (/.[^?]\.html?(\?.*)?$/.test(aURI.path)) {
        // Use the system principal for HTML pages.
        channel.owner = Services.scriptSecurityManager.getSystemPrincipal();
      }
      return channel;
    },

    allowPort: function(aPort, aScheme) {
      return false;
    },

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIProtocolHandler]),

    classID: classID
  };

  var NSGetFactory = XPCOMUtils.generateNSGetFactory([AnchoProtocolHandler]);
  var factory = NSGetFactory(classID);

  exports.register = function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).registerFactory(
      classID,
      '',
      '@mozilla.org/network/protocol;1?name=' + SCHEME,
      factory
    );
  };

  exports.unregister = function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).unregisterFactory(classID, factory);
  };
}).call(this);
