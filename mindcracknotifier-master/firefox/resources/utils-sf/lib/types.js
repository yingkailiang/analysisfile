/**
 *
 */
const Logger = require("logger").Logger;

function isArray(o){
    return typeof o == "object" && 'length' in o;
}

const Types = {
    getType: function(o){
        var result = "undefined";
        Object.keys().reverse().some(function(k){
            if (k.toUpperCase() == k && _this[k]) {
                result = k;
            }
        });
        return result;
    },
    check: function(obj, type){
        if (typeof type == "string") {
            if (type in this) {
                return this[type](obj);
            }
            if (["string", "function", "object", "boolean", "number"].indexOf(type) != -1) {
                return typeof obj == type;
            }
            Logger.warn('unknown type:', type, typeof obj, obj)
            return;
        }
        return type.some(function(t){
            return Types.check(obj, t)
        });
    },
    
    ANY: function(){
        return true;
    },
    NULL: function(obj){
        return obj === null;
    },
    BOOLEAN: function(obj){
        return typeof obj == "boolean";
    },
    OBJECT: function(obj){
        return typeof obj == "object" && !(obj instanceof Array) && obj != null;
    },
    ARRAY: function(obj){
        return typeof obj == "object" && typeof obj.length == "number";
    },
    STRING: function(obj){
        return typeof obj == "string";
    },
    INTEGER: function(obj){
        return typeof obj == "number" && parseInt(obj) == obj;
    },
    CALLBACK: function(obj){
        return typeof obj == "function";
    },
    TABID: function(obj){
        return obj == null || Types.INTEGER(obj);
    },
    WINDOWID: function(obj){
        return obj == null || Types.INTEGER(obj);
    },
    EXTENSIONID: function(obj){
        return obj == null ||
        typeof obj == "string" && obj.length == 32 &&
        /[a-z]{32}/.test(obj);
    },
    POSITION: function(obj){
        return Types.INTEGER(obj);
    },
    DIMENSION: function(obj){
        return Types.INTEGER(obj) && obj >= 0;
    },
    IMAGEDATA: function(obj){
        return Types.OBJECT(obj) && 'height' in obj && 'width' in obj && 'data' in obj;
    },
    COLOR: function(obj){
        return typeof obj == "object" && obj.length == 4 && obj.some &&
        !obj.some(function(item){
            return !Types.INTEGER(item);
        });
    }
}

exports.Types = Types;
