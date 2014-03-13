//short connect
chrome.extension.sendMessage(null, {log: "log"}, function (response) {
    if (response.isNetSpeed === true) {
        console.log("正在使用模拟低速功能");
    }
    if (response.isDebug === true) {
        console.log("正在使用debug 模式");
    }
});


//long connect
var port = chrome.runtime.connect({name: "knockknock"});
var mask = null;
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        var S = KISSY, DOM = S.DOM, Event = S.Event;


        if (request.qs == "getImageInfo") {
            document.body.scrollTop = KISSY.DOM.height('body');
            setTimeout(function () {
                port.postMessage({img_info: "1"});
                port.onMessage.addListener(function (msg) {
                    var DOM = KISSY.DOM;
                    if (!mask) {
                        mask = DOM.create('<div style=";z-index: 100000000000;position: fixed;left: 0;top:0;height:100%;width:100%;overflow-y: scroll;"><div style="padding:30px;color: white;width:100%;margin:0 auto;background:rgba(0,0,0,.8)"></div></div>');
                        document.body.appendChild(mask);
                    }
                    DOM.children(mask)[0].innerHTML = '';
                    var ul = DOM.create("<ul></ul>");
                    KISSY.each(msg.content, function (v, k) {
                        ul.appendChild(DOM.create('<li> url: <a style="color: white;" href="' + v.url + '">' + v.url + '</a>, height: ' + v.height + ' ; width:  ' + v.width + 'size: ' + v.size + '</li>'));
                    })
                    DOM.children(mask)[0].appendChild(ul);
                });
            }, 2000);
        }else{
            if(request.qs == "clearCache"){
                port.postMessage({img_info: "0"});
            }
        }

    });

