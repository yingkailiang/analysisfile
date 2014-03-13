/**
 * @author christophe
 */
"use strict";
const Chrome=require("chrome");
const Cc=Chrome.Cc;
const Ci=Chrome.Ci;
const Cu=Chrome.Cu;

exports.createInstance = function(contract, nsInterface){ 
	return Cc[contract].createInstance(Ci[nsInterface]);
};

exports.queryInterface = function(component, nsInterface){ 
	return component.QueryInterface(Ci[nsInterface]);
};
