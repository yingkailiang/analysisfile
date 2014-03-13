
function tip(s){
    //g('tip').innerHTML=s;
    console.log(s)
}
//var port = chrome.runtime.connect({name: "knockknock"});
// port.postMessage({joke: "Knock knock"});
function postMsg(data){
    //port.postMessage(data)
    chrome.runtime.sendMessage(data, function(response) {
        console.log(response.farewell);
    });
}

/*
 port.onMessage.addListener(function(msg) {
 if (msg.question == "Who's there?")
 port.postMessage({answer: "Madame"});
 else if (msg.question == "Madame who?")
 port.postMessage({answer: "Madame... Bovary"});


 });*/


function createSocketBak(){
    tip('bak ready!');
    var ws = io.connect('http://socketio.mtgox.com/mtgox');
    ws.onopen = function () {
        tip('socket back opened!');
    };
    ws.onmessage = function (evt) {
        console.log('mms ')
        // var received_msg = evt.data;
        postMsg(evt.data)
        //  showData(JSON.parse(evt.data));

    };
    ws.onclose = function () {
        tip('socket bak closed!');
        createSocket();

    }; // websocket is closed.
    ws.onerror=function(){
        createSocket();
        tip('socket error!正尝试重新连接，如不行刷新页面再试.. ');
    };

}
function createSocket(){

    var ws = new WebSocket("ws://websocket.mtgox.com/mtgox?Currency=USD");
    ws.onopen = function () {
        tip('the fucking socket opened!');
    };
    ws.onmessage = function (evt) {
        // console.log('mms ')
        // var received_msg = evt.data;
        postMsg(evt.data);
        tip(evt.data)
        //  showData(JSON.parse(evt.data));

    };
    ws.onclose = function () {
        tip('socket closed! recreating');
        createSocket();
    }; // websocket is closed.
    ws.onerror=function(){
        createSocket();
        tip('socket error!正尝试重新连接，如不行刷新页面再试.. ');
    };

}

console.log(typeof io)
setTimeout(
createSocketBak,2000)