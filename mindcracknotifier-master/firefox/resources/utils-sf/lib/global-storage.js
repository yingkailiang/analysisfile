/**
 * @author christophe
 */
"use strict";
const Trait = require("traits").Trait;
const Services = require("services");


const KEY="jetchromeStorage";

const GlobalStorage = Trait.compose({
     get storage(){       
        if (!(this._key in Services.appshell.hiddenDOMWindow)) {
            Services.appshell.hiddenDOMWindow[this._key] = {};
        }
        return Services.appshell.hiddenDOMWindow[this._key];
    },
    constructor: function GlobalStorage(key){
		this._key=key || KEY;
        return this._public;
    }
    /*,
     register: function(extension){
     this._storage.extensions.push(extension);
     },
     unregister: function(extension){
     this._storage.extensions = this._storage.extensions.filter(function(item){
     return item != extension
     })
     }*/
});

const globalStorage= GlobalStorage();

//exports.__defineGetter__("storage", function (){return globalStorage.storage});

//exports=globalStorage;
exports.storage=globalStorage.storage;