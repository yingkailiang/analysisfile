"use strict";
const Services = require("utils-sf/services");


var firebug;

function getFirebug(){
    if (firebug) {
        return firebug;
    }
    
    var activeWindow = Services.ww.activeWindow;
    if (activeWindow && activeWindow.gBrowser && activeWindow.gBrowser.mTabs && activeWindow.Firebug) {
        return firebug = activeWindow.Firebug;
    }
    
    var windowEnumerator = Services.ww.getWindowEnumerator();
    while (windowEnumerator && windowEnumerator.hasMoreElements()) {
        var window = windowEnumerator.getNext();
        if (window.gBrowser && window.gBrowser.mTabs && window.Firebug) {
            return firebug = window.Firebug;
        }
    }
    return null;
}

var logQueue = {};
const methods = ['log', 'info', 'warn', 'error', 'assert', 'debug', 'dir'];
const standardConsole = {}

function start(){
    methods.forEach(function(name){
        logQueue[name] = [];
        standardConsole[name] = console[name];
        console[name] = (function(name){
            return function(){
                try {
                    var Firebug = getFirebug()
                    var Console = Firebug.ConsoleBase;
                    while (logQueue.length > 0) {
                        Console.log(logQueue[name][0]);
                        logQueue[name].shift();
                    }
                    Console.logFormatted(arguments, null, name);
                } 
                catch (err) {
                    standardConsole[name].apply(standardConsole, arguments);
                    logQueue[name].push(arguments);
                }
            };
        })(name);
    });
    require("unload").when(function(){
        methods.forEach(function(name){
            console[name] = standardConsole[name];
        })
    });
}

start();
