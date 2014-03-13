"use strict";const self=require("jetchrome/self");const Arguments=require("utils-sf/arguments");const Assert=require("test/assert").Assert;const Logger=require("utils-sf/logger").Logger;const chromeAPI=JSON.parse(self.data.load("format/chrome.json"));const support=JSON.parse(self.data.load("support/chrome.json"));function isSupported(a){return support.indexOf(a)==-1}exports.inject=function(extension,window,contentWindow){const EXPOSED_PROPS="___exposedProps__";contentWindow.eval("this.chrome=this.chrome||{};("+JSON.stringify(Object.keys(chromeAPI))+").forEach(function(key){chrome[key]={};})");contentWindow.chrome=contentWindow.chrome||{};var chrome=contentWindow.chrome;chrome[EXPOSED_PROPS]=chrome[EXPOSED_PROPS]||{};chrome[EXPOSED_PROPS]["mozilla"]="r";chrome.mozilla={exposeProperty:function(obj,prop,value){if(!obj[EXPOSED_PROPS]){obj[EXPOSED_PROPS]={}}obj[EXPOSED_PROPS][prop]=value||"wr"},exposeProperties:function(obj,props){if(!obj[EXPOSED_PROPS]){obj[EXPOSED_PROPS]={}}props.forEach(function(key){obj[EXPOSED_PROPS][key]="rw"})}};chrome.mozilla[EXPOSED_PROPS]={exposeProperties:"r",exposeProperty:"r"};chrome[EXPOSED_PROPS]["_listener"]="rw";contentWindow.chrome._listener=contentWindow.chrome._listener||{};var listener=contentWindow.chrome._listener;for(var namespace in chromeAPI){chrome[EXPOSED_PROPS][namespace]="wr";if(chromeAPI[namespace].type!="object"){continue}chrome[namespace][EXPOSED_PROPS]={};(chromeAPI[namespace].events||[]).forEach(function(event){var topic="on"+event[0].toUpperCase()+event.slice(1);var fullName=["chrome",namespace,topic].join(".");var unsupported=function(){Logger.warn(fullName+": not currently supported")};var supported=isSupported(fullName);chrome[namespace][topic]={addListener:supported?(function(namespace,event){return function(handler){var name=[namespace,event].join(":");if(!(name in listener)){listener[name]=[]}listener[name].push(handler)}})(namespace,event):unsupported,removeListener:supported?(function(namespace,event){return function(handler){var name=[namespace,event].join(":");if(!(name in listener)){listener[name]=[]}listener[name]=listener[name].filter(function(item){return item!=handler})}})(namespace,event):unsupported,hasListener:supported?(function(namespace,event){return function(handler){var name=[namespace,event].join(":");return listener[name]&&listener[name].indexOf(handler)!=-1}})(namespace,event):unsupported,};chrome[namespace][topic]["__exposedProps__"]={addListener:"r",removeListener:"r",hasListener:"r"};chrome[namespace][EXPOSED_PROPS][topic]="r"});if(chromeAPI[namespace].type=="object"&&chromeAPI[namespace].children){var permissionForNamespace=chromeAPI[namespace].permission==true?extension.hasPermission(namespace):true;Object.keys(chromeAPI[namespace].children).forEach(function(name){var obj=chromeAPI[namespace].children[name];var fullName=["chrome",namespace,name].join(".");switch(obj.type){case"function":chrome[namespace][name]=isSupported(fullName)?(function(namespace,name,hasPermission){return function(){var instance;try{if(!hasPermission){throw new Error("You do not have permission to use '"+fullName+"'. Be sure to declare in your manifest what permissions you need.")}Arguments.check(arguments,obj.arguments);instance=namespace=="extension"?extension:extension.api[namespace];if(!instance){throw new Error("This extension has no "+namespace+" specified.")}if(!(name in instance)){throw new Error("This function is not implemented")}}catch(err){return Logger.error(new Error([fullName,err.message].join(":"),err.fileName,err.lineNumber))}var args=Array.prototype.slice.call(arguments,0);return instance[name].apply(instance,arguments)}})(namespace,name,permissionForNamespace||(obj.permission==false)):function(){Logger.warn(fullName+": not currently supported")};break;default:chrome[namespace].__defineGetter__(name,isSupported(fullName)?function(){var obj=(namespace=="extension"?extension:extension.api[namespace]);if(!obj||!obj[name]){throw new Error("unknown method :"+fullName)}return obj[name]}:function(){Logger.warn(fullName+": not currently supported");return null})}chrome[namespace][EXPOSED_PROPS][name]="wr"})}}chrome.tabs.getCurrent=extension.api.tabs.getCurrent.bind(extension.api.tabs,window);chrome.tabs[EXPOSED_PROPS]["getCurrent"]="r";chrome.windows.getCurrent=extension.api.windows.getCurrent.bind(extension.api.tabs,contentWindow);chrome.windows[EXPOSED_PROPS]["getCurrent"]="r";chrome.extension.sendRequest=function(request,sendResponse){chrome.tabs.getCurrent(function(currentTab){extension.sendRequest(extension.id,request,sendResponse,currentTab)})};chrome.extension[EXPOSED_PROPS]["sendRequest"]="r";chrome.extension[EXPOSED_PROPS]["settings"]="wr"};