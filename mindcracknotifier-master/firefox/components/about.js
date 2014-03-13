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
    
    
    function aboutExtensions(){
    }
    
    aboutExtensions.prototype = {
        classDescription: "about:extensions page",
        classID: Components.ID("{6DCE7182-1DCF-4601-B140-9B08498C6641}"),
        contractID: "@mozilla.org/network/protocol/about;1?what=apps",
        redirectionURL: 'extensions://engine/content/apps.html',
        
        QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
        
        newChannel: function(aURI){
            try {
                var channel = Services.io.newChannel(this.redirectionURL, null, null);
                channel.originalURI = aURI;
                return channel;
            } 
            catch (err) {
                return Services.io.newChannel("about:blank", null, null);
                //return Services.io.newChannel("data:text/plain,", null, null);
            }
        },
        getURIFlags: function(aURI){
            return Ci.nsIAboutModule.ALLOW_SCRIPT;
        }
    }
    return aboutExtensions;
    
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