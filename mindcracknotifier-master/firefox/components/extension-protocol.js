/**
 * @author christophe
 * this component create a "about:apps" page
 * this page is redirected to main page of the extension
 */
Components.utils['import']("resource://gre/modules/XPCOMUtils.jsm");
Components.utils['import']("resource://gre/modules/Services.jsm");

const Component = (function(){
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	const Cu = Components.utils;
	
	function ExtensionProtocol(){
	}
	
	ExtensionProtocol.prototype = {
		classID: Components.ID("{1825291d-8d5c-4c55-9152-be8a0c0117ab}"),
		contractID: "@mozilla.org/network/protocol;1?name=chrome-extension",
		defaultPort: -1,
		protocolFlags: Ci.nsIProtocolHandler.URI_STD | Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,
		allowPort: function(port, scheme){
			return false;
		},
		newURI: function(spec, charset, baseURI){//chrome-extension://jetid/ie.html#http%3A bug !!
			var uri = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIStandardURL);
			uri.init(Ci.nsIStandardURL.URLTYPE_STANDARD, this.defaultPort, spec, charset, baseURI);
			uri.QueryInterface(Ci.nsIURI);
			return uri;
		},
		newChannel: function(uri){
			try { 
				//Cu.reportError(uri.spec);
				// console.log("newChannel", uri);
				var translatedSpec = "resource://"+uri.host+ "/extension/data"+ uri.path;
				// console.log("translatedSpec", translatedSpec)
				var translatedURI = Services.io.newURI(translatedSpec, uri.originCharset, null);
				//console.log("translatedURI", translatedURI)
				var channel = Services.io.newChannelFromURI(translatedURI);
				channel.originalURI = uri;
				//console.log("newChannel => ", channel)
				return channel;
			} 
			catch (err) {
				Cu.reportError(err);
				return Services.io.newChannel("data:text/plain,"+err.message, null, null);
			}
		},
		QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsIProtocolHandler])
	}
	return ExtensionProtocol;
	
})();



/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
 */
if (XPCOMUtils.generateNSGetFactory) 
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([Component]);
else 
    var NSGetModule = XPCOMUtils.generateNSGetModule([Component]);

var EXPORTED_SYMBOLS = ["Component"];