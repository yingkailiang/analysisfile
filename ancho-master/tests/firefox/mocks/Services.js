(function() {
  var _ = require('underscore'),
    url = require('url'),
    nsIURI = require('./components').nsIURI,
    nsIChannel = require('./components').nsIChannel;

  var IOService = {
    newURI: function(spec, encoding, baseURI) {
      if (baseURI) {
        var baseSpec = baseURI.spec;
        if ('/' !== _.last(baseSpec)) {
          baseSpec += '/';
        }
        spec = url.resolve(baseSpec, spec);
      }
      return new nsIURI(spec);
    },

    newChannelFromURI: function(uri) {
      return new nsIChannel(uri);
    }
  };

  var Services = {
    io: IOService
  };

  exports.Services = Services;
}).call(this);
