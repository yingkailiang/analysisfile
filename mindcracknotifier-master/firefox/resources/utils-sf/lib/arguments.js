/**
 *
 */
"use strict";
const Types = require("types").Types;

function isArray(o){
    return typeof o == "object" && 'length' in o;
}

function assert(test, message){
    if (!test) {
        throw new Error(message);
    }
}

exports.check = function check(args, argumentTypes){
    var minArguments = argumentTypes.filter(function(item){
        return item.required != false;
    }).length;
    var maxArguments = argumentTypes.length;
    assert(!(args.length < minArguments), "not enough arguments");
    assert(!(args.length > maxArguments), "too much arguments");
    
    var j = 0, missingArgs = maxArguments - args.length;
    for (var i = 0, length = argumentTypes.length; i < length && missingArgs > 0; i++) {
        var value;
        if (argumentTypes[i].required == false) {
            var defaultValue = null;
			if (Types.check(args[j], argumentTypes[i].type) == false) {
                if ('default' in argumentTypes[i]) {
					defaultValue = argumentTypes[i]['default'];
				}
				else {
					if (argumentTypes[i].type == "object") {
						defaultValue = {}
						for (var k in argumentTypes[i].children) {
							if ('default' in argumentTypes[i].children[k]) {
								defaultValue[k] = argumentTypes[i].children[k]['default']
							}
						}
					}
				}
            	Array.prototype.splice.call(args, j, 0, defaultValue);
		    }           
            missingArgs--;
        }
        j++;
    }
	//console.log("new args",args)
    
    
    
    
    /*
     * setting default value for first argument if omited
     */
    /*
     if (argumentTypes.length > 0 && !argumentTypes[0].required && Types.check(args[0], argumentTypes[0].type) == false && 'default' in argumentTypes[0]) {
     Array.prototype.unshift.call(args, argumentTypes[0]['default']);
     }
     */
    /*
     * setting default value for last argument if omited
     */
    /*
     if (args.length < maxArguments && argumentTypes[argumentTypes.length - 1].required == false && Types.check(args[argumentTypes.length - 1], argumentTypes[argumentTypes.length - 1].type) == false && 'default' in argumentTypes[argumentTypes.length - 1]) {
     Array.prototype.push.call(args, argumentTypes[argumentTypes.length - 1]['default']);
     }
     */
   
    
    argumentTypes.forEach(function(item, i){
    
    
        if (item.required==false && (!(i in args) ||args[i]==undefined )) {
            return true;
        }
        if (!('type' in item)) {
            return true;
        }
        
        if (item.type && item.type.some &&
        !item.type.some(function(type){
            return Types.check(args[i], type) != false;
        })) {
            throw new Error(" arguments[" + i + ']:"' + args[i] + '" must be one of these types ' + JSON.stringify(item.type) + ' not "' + typeof args[i] + '"');
        }
        
        
        if (!Types.check(args[i], item.type)) {
            throw new Error(" arguments[" + i + ']:"' + args[i] + '" must be of type "' + item.type + '" not "' + typeof args[i] + '"');
        }
        
        
        if (item.children) {
            if (args[i] !== null && typeof args[i] == "object") {
				for (var propertyName in item.children) {
					if (item.children[propertyName].required == false && !(propertyName in args[i])) {
						if ('default' in item.children[propertyName]) {
							args[i][propertyName] = item.children[propertyName]['default'];
						}
						continue;
					}
					if (!(propertyName in args[i])) {
						throw new Error("arguments[" + i + ']:"' + JSON.stringify(args[i]) + '" must have a "' + propertyName + '" property');
					}
					
					if (Array.isArray(item.children[propertyName].type)) {
						if (!item.children[propertyName].type.some(function(type){
							return Types.check(args[i][propertyName], type);
						})) {
							throw new Error("arguments[" + i + '].' + propertyName + ':"' + args[i][propertyName] + '" must be of types "' + JSON.stringify(item.children[propertyName].type) + '" not "' + typeof args[i][propertyName] + '"');
						};
											}
					else 
						if (!Types.check(args[i][propertyName], item.children[propertyName].type)) {
						
							throw new Error("arguments[" + i + '].' + propertyName + ':"' + args[i][propertyName] + '" must be of type "' + item.children[propertyName].type + '" not "' + typeof args[i][propertyName] + '"');
						}
				}
			}
        }
        
    });
    
};


