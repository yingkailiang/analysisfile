/**
 * @author christophe
 */
const Services = require("services");
const Logger = require("logger").Logger;

exports.Manager = {
    add: function add(url){
        try {        
            var uri = Services.io.newURI(url, null, null);
            var host = uri.host;
            host = (host.charAt(0) == ".") ? host.substring(1, host.length) : host;
            var uri = Services.io.newURI("http://" + host, null, null);
            Services.perms.add(uri, "install", Services.perms.ALLOW_ACTION);
        } 
        catch (err) {
            Logger.error(err);
        }
        
    }
}
