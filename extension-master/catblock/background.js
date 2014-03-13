var storage = window.localStorage;
var slow = -1;
var isNetSpeed;

var imgurl = [];

function fnum(ns){
    if(!ns) return;
    var ns=ns.toString(),op,j=0;
    if(ns.length>3){
        var nsl=ns.length,ca=[];
        for(var i=nsl-1;i>-1;i--){
            ++j;
            var cae=ns.substr(i,1);
            if(j==3 && i !=0) {cae=','+cae; j=0;}
            ca[i]=cae;
        }
        op = ca.join('');
    }else{
        op = ns;
    }
    return op;
}

var imageInfo = [];
chrome.webRequest.onBeforeRequest.addListener(function (info) {
        var obj = {};
        isNetSpeed = storage.getItem('isnetspeeddelay');


        if (info.type === "image" && info.tabId !== -1 && !(info.url.indexOf('log.mmstat.com')!==-1 ||  info.url.indexOf('atpanel.com')!==-1) ) {
            (function(url){
                var img = new Image();
                img.src=url;
                img.onload = function(){
                    var imgFileSize;
                    var xhr=new XMLHttpRequest();
                    xhr.open("GET",img.src,false);
                    xhr.onreadystatechange=function(){
                        if(xhr.status==200&&xhr.readyState==4){
                            var oImgFileSize=xhr.getResponseHeader("Content-Length");
                            //format the number for better readability
                            var dispImgFileSize = fnum(oImgFileSize);
                            if(oImgFileSize<=1024) imgFileSize = dispImgFileSize+' bytes';
                            if(oImgFileSize>1024 && oImgFileSize<=1024000) imgFileSize = (oImgFileSize/1024).toFixed(2)+' KB';
                            if(oImgFileSize>1024000)imgFileSize=(oImgFileSize/1024/1024).toFixed(2)+' MB';
                            console.log(img,imgFileSize)
                            imageInfo.push({
                                url:img.src,
                                size:imgFileSize,
                                width:img.width,
                                height:img.height
                            })
                        }
                    }
                    xhr.send(null);
                }
            })(info.url);
        }

        //模拟低俗网络
        if ("false"!== isNetSpeed && (slow = storage.getItem('netspeeddelay')) && slow > 0) {
            UIIL.pause(slow);
        }

        //debug模式
        if (storage.getItem('debug')!== "false") {
            if (info.type === "script" || info.type === "stylesheet") {
                obj.redirectUrl = info.url.replace(/-min[.]|[.]min[.]/g, '.');
            }
        }

        return obj;

    }, // filters
    {
        urls:[
            "http://*/*"
        ]
    }, // extraInfoSpec
    ["blocking"]);


chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.log == "log"){
            sendResponse({
                isNetSpeed: storage.getItem('isnetspeeddelay') !== "false",
                isDebug : storage.getItem('debug') !== "false"
            })
        }
    });


chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.img_info == "1")
            port.postMessage({content: imageInfo});
        else if(msg.img_info == '0'){
            imageInfo = []
        }
    });
});
