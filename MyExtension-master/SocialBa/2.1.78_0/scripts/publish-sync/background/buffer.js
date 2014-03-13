var maxAmount = 15;
var isautoCheck = !localStorage.noAutoCheck;

var bufferItems = localStorage.bufferItems ? JSON.parse(localStorage.bufferItems) : [];

function onClickHandler(info, tab) {
    var content = "";
    if (info.menuItemId == "socialba_page") {
        var shortUrl = tab.url;
        try { shortUrl = urlShorten.getShortUrl({ longUrl: shortUrl }, 'gplus'); } catch (ex) { }
        content = tab.title + " " + shortUrl;
    } else if (info.menuItemId == "socialba_text") {
        var shortUrl = tab.url;
        try { shortUrl = urlShorten.getShortUrl({ longUrl: shortUrl }, 'gplus'); } catch (ex) { }
        content = info.selectionText + " " + shortUrl;
    }
    chrome.tabs.sendMessage(tab.id, { from: "socialba_buffer", content: content }, function (response) {
    });
};

chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.contextMenus.create({ "title": "Share This Page", "id": "socialba_page" });
chrome.contextMenus.create({ "title": "Share Selected Text", "id": "socialba_text", contexts: ["selection"] });

chrome.extension.onRequest.addListener(
 function (request, sender, callback) {
     if ("socialbuffer" == request.from) {
         switch (request.method) {
             case "add":
                 {
                     if (bufferItems.length >= maxAmount) {
                         if (callback)
                             callback({ error: 'You can only set ' + maxAmount + ' posts at most!' });
                         return;
                     }
                     $.post('http://socialba.com/apis/buffer/add', { userId: oauthbase.user().id, verify: oauthbase.user().verify, sites: request.sites, time: request.time, message: request.msg }
                     , function (r) {
                         console.log("add: " + r);
                         var json = JSON.parse(r);

                         bufferItems.push({ id: json.threadId, time: request.time });
                         localStorage.bufferItems = JSON.stringify(bufferItems);

                         if (json.successed) {
                             console.log('true');
                         } else {
                             console.log('false');
                         }
                         if (callback != null)
                             callback(r);
                     });
                     console.log(request.msg + "--" + request.time + "--" + request.sites + "--" + oauthbase.user().id + "--" + oauthbase.user().verify);
                     break;
                 }
             case "list":
                 {
                     $.post('http://socialba.com/apis/buffer/list', { userId: oauthbase.user().id, verify: oauthbase.user().verify }
                     , function (r) {
                         console.log(JSON.stringify(r));
                         if (callback != null)
                             callback(r);
                     });
                     break;
                 }
             case "delete":
                 {
                     $.post('http://socialba.com/apis/buffer/delete', { threadId: request.id, userId: oauthbase.user().id, verify: oauthbase.user().verify }
                     , function (r) {
                         var json = JSON.parse(r);
                         if (typeof localStorage.bufferItems != 'undefined') {
                             var removeid = -1;
                             for (var i = 0; i < bufferItems.length; i++) {
                                 if (bufferItems[i].id == request.id)
                                     removeid = i;
                             }
                             if (removeid >= 0)
                                 bufferItems.splice(removeid, 1);
                         }

                         console.log(JSON.stringify(r));
                         if (callback != null)
                             callback(r);
                     });
                     break;
                 }
             case "edit":
                 {
                     $.post('http://socialba.com/apis/buffer/update', { threadId: request.item.threadId, sites: request.item.sites.join(','), time: request.item.tweet.time, message: request.item.tweet.message, userId: oauthbase.user().id, verify: oauthbase.user().verify }
                     , function (r) {
                         console.log(JSON.stringify(r));
                         if (callback != null)
                             callback(r);
                     });
                     break;
                 }
             case "options":
                 {
                     if (callback != null)
                         callback({ maxdays: maxdays, maxamount: maxAmount });
                 }
         }
     }
 });

// 开启浏览器，与服务器同步
function syncToServer() {
    $.post('http://socialba.com/apis/buffer/list', { userId: oauthbase.user().id, verify: oauthbase.user().verify }
    , function (r) {
        var json = JSON.parse(r);
        if (json.data) {
            bufferItems = []
            for (var i = 0; i < json.data.length; i++) {
                bufferItems.push({ id: json.data[i].threadId, time: json.data[i].tweet.time });
            }
            localStorage.bufferItems = JSON.stringify(bufferItems);
        }
    });
}
syncToServer();

// 检查发送是否成功
if (isautoCheck)
    setInterval(function () {
        for (var i = 0; i < bufferItems.length; i++) {
            var item = bufferItems[i];
            var now = new Date().getTime() / 1000;
            if (now > item.time && isautoCheck) {
                // TODO check
                $.post('http://socialba.com/apis/buffer/get', { threadId: item.id, userId: oauthbase.user().id, verify: oauthbase.user().verify }
                , function (r) {
                    console.log("check " + r);
                    var json = JSON.parse(r);
                    if (json.tweet.status == 1) {
                        syncToServer();
                        chrome.tabs.getSelected(null, function (tab) {
                            chrome.tabs.sendMessage(tab.id, { from: "socialba_buffer_notify", item: JSON.parse(r) }, function (response) {
                            });
                        });
                    }
                });
            }
        }

    }, 1000 * 5);