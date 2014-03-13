WsSingleton = new function(){
  this.ws = new WebSocket('ws://' + window.config.WS_HOST, 'dummy-protocol');
  this.ws.binaryType = 'blob';
  this.ws.onopen = wsCallbacks.onopen;
  this.ws.onmessage = wsCallbacks.onmessage;
  this.ws.onclose = wsCallbacks.onclose;
  this.ws.onerror = wsCallbacks.onerror;
  
  this.getInstance = function(){
    return this.ws;
  };

  return this;
}();