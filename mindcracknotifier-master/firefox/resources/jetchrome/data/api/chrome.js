
if (!this.chrome){
	chrome={};
} 

if (!(this.chrome.extension)) {
	const context=self.options;
    var _chrome = (function(){
    
        var Event = function(){
            return {
                listeners_: [],
                addListener: function addListener(listener){
                    this.listeners_.push(listener);
                },
                removeListener: function removeListener(listener){
                    this.listeners_ = this.listeners_.filter(function(item){
                        return item != listener
                    });
                },
                hasListener: function hasListener(listener){
                    return this.listeners_.indexOf(listener) != -1
                }
            }
        };
        var Trait = {
            compose: function(prototype){
                function f(){
                    if (this instanceof f) {
                        return this.constructor.apply(this, arguments[0] && arguments[0]._arguments || arguments);
                    }
                    return new f({
                        _arguments: arguments
                    });
                }
                f.prototype = prototype;
                return f;
            }
        };
        
        var Port = Trait.compose({
            _sender: null,
            _port: null,
            _name: null,
            _connected: false,
            _emit: function(name, data){
                var message = {
                    id: this._id
                };
                if (data) {
                    for (var key in data) {
                        message[key] = data[key]
                    }
                }
                this._port.emit(name, message);
                // console.log("background emit", name, JSON.stringify(message));
            },
            _listen: function(event, once){
                var topic = "on" + event[0].toUpperCase() + event.slice(1);
                //console.log("background _listen", topic,event, this)
                this._port[once ? 'once' : 'on'](event, (function(event, message){
                    //console.log("background received", event, message)
                    if (message.id == this._id) {
                        this[topic].listeners_.forEach(function(listener){
                            Function.apply.call(listener, null, message.arguments);
                        })
                    }
                }).bind(this, event));
            },
             get sender(){
                return this._sender;
            },
             get name(){
                return this._name
            },
            constructor: function(data){
                this._id = data.id || 10000000000000000 * Math.random();
                ;
                this._port = data.worker.port;
                this._name = data.name;
                this._connected = true;
                this._listen("message");
                this._listen("disconnect", true);
                //this.onDisconnect.addListener(this.destroy.bind(this));
                if (data.connect) {
                    this._emit("connect", {
                        name: this._name,
                        sender: data.sender
                    });
                }
                if (data.sender) {
                    this._sender = data.sender;
                }
                const _onDetach = (function(worker){
                    worker.removeListener("detach", _onDetach);
                    this.destroy();
                }).bind(this, data.worker);
                
                data.worker.once("detach", _onDetach);
                return this._public;
            },
            destroy: function(){
                this.onDisconnect.listeners_.forEach(function(listener){
                    listener()
                });
                this._connected = false;
                this.onMessage.listeners_ = [];
                this.onDisconnect.listeners_ = [];
            },
            onMessage: new Event(),
            onDisconnect: new Event(),
            postMessage: function(){
                if (!this._connected) {
                    Logger.warn("Port.postMessage: not connected")
                }
                this._emit("message", {
                    arguments: Array.prototype.slice.call(arguments, 0)
                })
            },
            disconnect: function(){
                if (!this._connected) {
                    Logger.warn("Port.disconnect: not connected")
                }
                this._emit("disconnect");
                this.destroy();
            }
        });
        /*
         var Port = function(info){
         var _port = {
         onMessage: new Event(),
         onDisconnect: new Event(),
         postMessage: function(message){
         self.port.emit("message", {
         id: this.portId_,
         message: message
         })
         }
         }
         _port.__defineGetter__("name", (function(){
         return this;
         }).bind(info.name));
         _port.__defineGetter__("portId_", (function(){
         return this;
         }).bind(info.id));
         return _port;
         }
         */
        var messageIndex = 0;
        var _chrome = {
            extension: {
                getURL: function(path){
                    return [context.__chrome_extension_baseURI, (path || "").replace(/^\//, "")].join("");
                },
                connect: function(extensionId, connectInfo){
                    var args = Array.prototype.slice.call(arguments);
                    extensionId = typeof arguments[0] == "string" && args.shift();
                    connectInfo = args.shift() || {};
                    var chromePort = Port({
                        name: connectInfo.name,
                        connect: true,
                        worker: self
                    });
                    /*
                     window.addEventListener("unload", function(){
                     chromePort.disconnect();
                     }, false);*/
                    return chromePort;
                    /*
                     self.port.emit("connect", {
                     id: messageId,
                     info: connectInfo
                     });
                     
                     self.port.on("message", function(message){
                     if (message.id == messageId) {
                     try {
                     chromePort.onMessage.listeners_.forEach(function(listener){
                     Function.apply.call(listener, null, message.arguments);
                     });
                     
                     }
                     catch (err) {
                     console.error(err);
                     }
                     }
                     });
                     self.port.on("disconnect", function(message){
                     if (message.id == messageId) {
                     try {
                     chromePort.onDisconnect.listeners_.forEach(function(listener){
                     Function.apply.call(listener, null, message.arguments);
                     });
                     
                     }
                     catch (err) {
                     console.error(err);
                     }
                     }
                     });
                     */
                },
                sendRequest: function(extensionId, request, sendResponse){
                    var args = Array.prototype.slice.call(arguments);
                    if (typeof args[args.length - 1] == "function") {
                        sendResponse = args.pop();
                    }
                    request = args.pop();
                    extensionId = args.pop();
                    /*
                     * console.log("sendrequest",{ sendResponse: sendResponse,
                     * request: request, extensionId: extensionId })
                     */
                    var messageId = messageIndex++;
                    self.port.emit("request", {
                        id: messageId,
                        request: request
                    });
                    if (sendResponse) {
                        self.port.on("response", function(message){
                            if (message.id == messageId) {
                                self.port.removeListener("response", arguments.callee);
                                try {
                                    Function.apply.call(sendResponse, null, message.arguments);
                                } 
                                catch (err) {
                                    console.error(err);
                                }
                            }
                        });
                    }
                }
            },
            i18n: {
				localeMessages:context.__chrome_i18n_messages||{},
                getMessage: function(name, substitution){
                    //dev.argument.check(arguments, chromeAPI.i18n.command.getMessage.argument, "i18n.getMessage");
                    var data = (name in chrome.i18n.localeMessages) ? chrome.i18n.localeMessages[name] : null;
                    if (!data) {
                        return "";
                    };
                    var output = data.message;
                    output = output.replace(/\$([\w]+)\$/g, function(found, matched){
                        return data.placeholders[matched].content;
                    });
                    if (substitution) {
                        if (typeof substitution == "string") {
                            substitution = [substitution];
                        }
                        output = output.replace(/\$(\d)/g, function(found, matched){
                            return substitution[parseInt(matched) - 1];
                        });
                    }
                    return output;
                }
            }
        };
        ["request"].forEach(function(type){
            var eventType = "on" + type[0].toUpperCase() + type.slice(1);
            self.port.on(type, function(message){
                var messageId = message.id;
               //console.log("[content] receiving", eventType, message);
                chrome.extension[eventType].listeners_.forEach(function(listener){
                    try {
 // firefox 10 bug :      JSON.parse(JSON.stringify(message.request) convert array into object !!              	
//                        listener(JSON.parse(JSON.stringify(message.request)), message.sender, function(){
                        listener(message.request, message.sender, function(){
                            self.port.emit("response", {
                                id: messageId,
                                arguments: Array.prototype.slice.call(arguments)
                            });
                        });
                    } 
                    catch (err) {
                        console.error(err);
                    }
                });
            });
            
            _chrome.extension[eventType] = Event();
            
        });
        
        _chrome.extension.onConnect = Event();
        
        self.port.on("connect", function(message){
            //console.log("[content] receiving", message);
            var messageId = message.id;
            chrome.extension.onConnect.listeners_.forEach(function(listener){
                try {
                    message.worker = self;
                    var chromePort = Port(message);
                    listener(chromePort);
                } 
                catch (err) {
                    console.error(err);
                }
            });
        });
        
        if (window.chrome) {
            for (var k in window.chrome) {
                _chrome[k] = window.chrome[k];
            }
        }
        return _chrome;
    })();

    for (var k in _chrome) {
       /* Object.defineProperty(chrome, k, {
            value: _chrome[k]
        });*/
		chrome[k]=_chrome[k];		
    }
    //console.log("chrome injected", window.location.href, chrome)
}
else {
     //console.log("already injected")
}
// self.on("message", function(e){ console.log(e)});
//console.log("[content] chrome inject in content page : ", window.location, window.chrome);

