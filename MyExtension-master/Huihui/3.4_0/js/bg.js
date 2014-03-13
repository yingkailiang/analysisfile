//Chrome订单助手逻辑：11
//  0.初始化时首先将localStorame[or.der.isSwitchOn]设置为“false”
//  1.因为存在两个版本，webStore上的3.0.0.1和官网上的3.0.1
//  2.将webStore上的版本改为3.0.2，这时官网和webStore上安装的插件将自动升级3.0.2
//  3.如果previousVersion为3.0.*开头的则执行下面的判断，否则弹出到updateLog
//  4.判断localStorage里面是否有orderConfigs，如果有,增加订单助手设置到notification的左下角，
//    点击到插件设置页面。
//
var BASE_URL = 'http://zhushou.huihui.cn/';
var FEED_URL = BASE_URL + "api/hui/latest.json";
var SHARE_URL = BASE_URL + "api/hui/share.json";
var HUBMSG_URL = BASE_URL + "api/pricehub/msg?email=";
var URL_INSTALL = BASE_URL + 'installed';
var URL_UPDATE = BASE_URL + 'updatelog';
if (!localStorage['browser']) {
    localStorage['browser'] = checkBrowser() === 'chrome' ? "360" : 'chrome';
}

var browser = localStorage['browser'] || 'chrome';

/* JS Option String Object */
function StrOpt(optstr) {
    if (!optstr) optstr = "";
    var argstrs = optstr.split(';');
    for (var i = 0; i < argstrs.length; ++i) {
        var pos = argstrs[i].search('=');
        if (pos != -1) {
            var name = argstrs[i].substring(0, pos);
            var value = argstrs[i].substr(pos+1);
            this[name] = value;
        }
    }
}

StrOpt.prototype.toOptString = function() {
    var str = "";
    for (var name in this) {
        if (isFunction(this[name])) continue;
        str += name + "=" + this[name] + ";";
    }
    return str;
};

(function initLocalStorage() {
    var jsOptions, cfg;
    jsOptions= new StrOpt(get('youdaoGWZS_jsOptions'));
    if (localStorage["push.isNotify"] === undefined) {
        localStorage["push.isNotify"] = "true";
        localStorage["push.showSetting"] = 0;
        localStorage["push.customize"] = 'false';
        cfg = JSON.parse(localStorage.getItem("push.config")) || {};
        cfg.channel = "SHARE_BAICAI~SHARE_SHARE~LOCATE_SIGNIN";
        localStorage.setItem("push.config", JSON.stringify(cfg));
    }

    if (localStorage["push.figureRemind"] === undefined) {
        localStorage["push.figureRemind"] = "true";
    }

    if (localStorage["order.isFeeded"] === undefined) {
        localStorage["order.isFeeded"] = "true";
    }

    if (localStorage["order.isShowDetail"] === undefined) {
        localStorage["order.isShowDetail"] = "true";
    }
    if (isNaN(parseInt(localStorage["deprice.lastMsgId"], 10))) {
        localStorage["deprice.lastMsgId"] = parseInt(jsOptions.lastMsgId, 10) || -1;
    }
    if (localStorage['like.enable'] === undefined) {
        localStorage['like.enable'] = Math.random() > 0.5;
    }
    localStorage["order.isSwitchON"] = "true";
}());

var vendor;
/* 检查是否更新 */
(function checkUpdate() {
    var currVersion = getVersionInManifest();
    var prevVersion = get('version');
    vendor = get('vendor') || 'chrome';
    if (vendor === '@' + 'vendor@') {
        vendor = 'youdao';
    }

    set('version', currVersion);
    if (currVersion != prevVersion) {
        // The extension is just installed or upadated.
        checkPushMsgs(true, true);
        if (typeof prevVersion === 'undefined') {
            set('vendor', vendor);
            var browser = localStorage['browser'] || 'chrome';
            if (vendor === "chrome" && browser === "360") {
                set('vendor', '360');
            }
            onInstalled();
        } else {
            if (/3\.\d?$/.test(currVersion)) {
                onUpdated();
            }
            cfg = unserialize(localStorage["push.config"]) || {};
            // 如果是以前订阅的用户那么hasFeeded为true,
            // 如果是非订阅的用户那么hasFeeded为false
            if (localStorage["push.hasFeeded"] === 'false') {
                cfg.category = 0;
            }

            localStorage.setItem("push.config", JSON.stringify(cfg));
        }
    }
})();

window.addEventListener('message', function (event) {
    if (event.data.html) {
        localStorage[event.data.name] = event.data.html;
    }
});

/* 发送插件heartbeat，必须放到checkOptionStr()之前 */
(function sendHeartBeat() {
    var last = get('lastheartbeat');
    var today = (new Date).getDate();
    if (last && last == today) return;
    var version = get('version');
    var guid = get('guid');
    if (!guid || guid === '') {
        guid = "";
        for (var i = 1; i <= 32; ++i) {
            var n = Math.floor(Math.random()*16.0).toString(16);
            guid += n;
            if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
        }
        set('guid', guid);
    }
    var url = BASE_URL + 'log?type=ARMANI_EXTENSION_HEARTBEAT' + 
    '&browser=' + browser + '&extensionid=' + guid + 
    '&vendor=' + vendor + '&version=' + version;

    cfg = unserialize(localStorage["push.config"]);
    if (cfg) {
        url = appendParam(url, 'feedcat', cfg.category);
        url = appendParam(url, 'feedchn', cfg.chaneel);
    }
    url = appendParam(url, 'push',  get('push.hasFeeded'));
    url = appendParam(url, 'digit', get('push.figureRemind'));
    url = appendParam(url, 'like',  get('like.enable'));

    var img = new Image();
    img.src = url;
    set('lastheartbeat', today);
})();

function appendParam(url, name, value) {
    var sep = (url.indexOf('?') !== -1) ? '&' : '?';
    if (name !== undefined && value != undefined) {
        return url + sep + name + '=' + value;
    }
    return url;
}


/* 检查js选项字符串 */
(function checkOptionStr() {
    var o = new StrOpt(get('youdaoGWZS_jsOptions'));
    o["browser"] = get("browser") || "chrome";
    o["hasShowDeprice"] = "true";
    o["vendor"] = vendor;
    o["version"] = get('version');
    o["extensionid"] = get('guid');
    o["apiVersion"] = '2.5';
    set('youdaoGWZS_jsOptions', o.toOptString());
})();

(function checkDepriceMsgs() {
    var email, jsOptions;

    jsOptions = new StrOpt(get("youdaoGWZS_jsOptions"));
    email = jsOptions.email || '';

    if (!!!email) {
        setTimeout(function () {
            checkDepriceMsgs();
        }, 120000);
        return;
    }

    simpleAjax(HUBMSG_URL + email, function (msgs) {
        var updateMsgs, lastMsgId, msgFuncs, id;

        if (!!!msgs.list) {
            return;
        }

        updateMsgs = {};
        msgFuncs = [];
        lastMsgId = localStorage["deprice.lastMsgId"] || -1;
        localStorage["deprice.lastMsgId"] = msgs.newMsgId;

        _.each(msgs.list, function (msg) {
            if (msg.shops[0].msgId > lastMsgId) {
                updateMsgs[msg.shops[0].msgId] = msg.shops[0];
            }
        });

        localStorage["deprice.msgs"] = serialize(updateMsgs);
        for (id in updateMsgs) {
            msgFuncs.push((function(id) {
                return function () {
                    showNotification("deprice-notify.html", "deprice", id, 30);
                }
            }(id)));
        }
        getNotify(msgFuncs, 3);
    });
    setTimeout(function () {
        checkDepriceMsgs();
    }, 600000);
}());

function getChannelList () {
    var cfg = unserialize(localStorage.getItem("push.config"));
    var channelStr = cfg.channel;
    var channels = channelStr.split("~");
    var channelList = {};
    channels.forEach(function (channel) {
        var channelInfo = channel.split("_");
        var channelType;
        if (channelInfo.length > 1) {
            if (!!!channelList[channelInfo[0]]) {
                channelList[channelInfo[0]] = [];
            }
            channelList[channelInfo[0]].push(channelInfo[1]);
        } else {
            if (!!!channelList["latest"]) {
                channelList["latest"] = [];
            }
            channelList["latest"].push(channelInfo[0]);
        }
    });
    return channelList;
}

function checkShareInfoApi(isRefresh, isFirst) {
    var finalUrl;
    var channelList = getChannelList();
    var shareAPIChannel = channelList["SHARE"];
    if (!!!shareAPIChannel || shareAPIChannel.length === 0) {
        return;
    } else {
        finalUrl = SHARE_URL + "?channel=" +
            shareAPIChannel.join("~").toLowerCase();
    }
    simpleAjax(finalUrl, function (msgs) {
        if (msgs instanceof Array) {
            var latestMsg = msgs[0];
            if (!!!latestMsg) {
                return;
            }

            var stayTime = parseInt(localStorage["push.stayTime"], 10) || 30;
            var isNotify = localStorage["push.isNotify"] === "true" ? true : false;
            var notifyMsgs = [];

            var baicaiList = _.where(msgs, {type: "baicai"});
            if (baicaiList.length && isNotify) {
                var lastBaicaiTitle = localStorage["push.lastBaicaiTitle"];
                var showBaicaiList = _.filter(baicaiList, function (baicaiItem) {
                    return baicaiItem.title !== lastBaicaiTitle;
                });

                if (showBaicaiList.length) {
                    showBaicaiList.forEach(function (item, index) {
                        if (index < 1) {
                            notifyMsgs.push(item);
                        }
                    });
                    localStorage["push.lastBaicaiTitle"] = showBaicaiList[0].title;
                }
            }


            var shaiwuList = _.where(msgs, {type: "shaiwu"});
            if (shaiwuList.length && isNotify) {
                var shaiwuMaxIdItem =_.max(shaiwuList, function (shaiwuItem) {
                    return shaiwuItem.id;
                });

                var lastShaiwuMaxIdStr = localStorage["push.lastShaiwuMaxId"];
                var lastShaiwuMaxId = parseInt(lastShaiwuMaxIdStr, 10) || 0;
                console.log("lastShaiwuMaxId: ", lastShaiwuMaxId);
                if (lastShaiwuMaxId < shaiwuMaxIdItem.id) {
                    var showShaiwuList = _.filter(shaiwuList, function (shaiwuItem) {
                        return shaiwuItem.id > lastShaiwuMaxId
                    });
                    showShaiwuList.forEach(function (item, index) {
                        if (index < 1 && !notifyMsgs.length) {
                            notifyMsgs.push(item);
                        }
                    });
                    localStorage["push.lastShaiwuMaxId"] = shaiwuMaxIdItem.id;
                }
            }

            notifyMsgs.forEach(function (item) {
                localStorage["push.Disc." + item.pubTime] = serialize(item);
                showNotification("notification.html", "disc",
                                  item.pubTime, stayTime);
            });
        }
    });
    setTimeout(function () {
        checkShareInfoApi();
    }, 1000 * 60 * 60);
};
setTimeout(function () {
    checkShareInfoApi();
}, 1000 * 60 * 10);

(function () {
    var signInJson = BASE_URL + "api/hui/signin.json";
    simpleAjax(signInJson, function (data) {
        if (data) {
            var alarmDate = data.time + "";
            var alarmHour = alarmDate.slice(0, 2);
            var alarmMinute = alarmDate.slice(2, alarmDate.length + 1);
            localStorage["push.siginConf"] = JSON.stringify(data);
            signInAlam(alarmHour, alarmMinute);
        }
    });
}())

function signInAlam(alarmHour, alarmMinute) {
    var channelList = getChannelList();
    var shareAPIChannel = channelList["LOCATE"];

    if (shareAPIChannel && shareAPIChannel.indexOf("SIGNIN") !== -1) {
        var nowDate = new Date();
        var thisDayDate =new Date(nowDate.getFullYear(), nowDate.getMonth(),
                                  nowDate.getDay()).getTime();
        var alarmDate = new Date(nowDate.getFullYear(), nowDate.getMonth(),
                                 nowDate.getDate(), alarmHour, alarmMinute).getTime();
        var signinLastShow = localStorage['push.signinLastShow'];
        if (signinLastShow == thisDayDate) {
            return;
        } else {
            if (nowDate.getTime() < alarmDate) {
                setTimeout(arguments.callee, 1000, alarmHour, alarmMinute);
            } else {
                localStorage["push.signinLastShow"] = thisDayDate;
                localStorage["push.Disc." + nowDate.getTime()] = get("push.siginConf");
                var stayTime = parseInt(localStorage["push.stayTime"], 10) || 30;
                if (localStorage["push.isNotify"] === "true") {
                    showNotification("notification.html", "signin",
                                     nowDate.getTime(), stayTime);
                }
            }
        }
    }
}

function checkPushMsgs(isRefresh, isFirst) {
    var isFirstTime;

    var finalUrl = FEED_URL;
    simpleAjax(finalUrl, function (msgs) {
        var todayFeeds = [];
        var startOfDay = new Date().getTime() - 24 * 3600 * 1000;
        _.each(msgs, function (item) {
            if (item.pubTime > startOfDay) {
                todayFeeds.push(item);
            }
        });
        localStorage['push.todayFeeds'] = serialize(todayFeeds);

        if (isFirst === true) {
            return;
        }

        if (!!!todayFeeds || !!!todayFeeds.length) {
            return;
        }

        var notifyMsgs = {};
        var notifyMsgsFun = [];
        var stayTime = parseInt(localStorage["push.stayTime"], 10) || 30;
        var lastDate = localStorage["push.lastMsgDate"] || 0;
        var lastId = parseInt(localStorage["push.lastMsgId"], 10) || 0;
        _.each(msgs, function (msg) {
            var url;
            if (lastId > 0 && msg.id <= lastId || msg.pubTime <= lastDate) {
                return;
            }

            var cfg = unserialize(localStorage.getItem("push.config"));
            var category = cfg ? cfg.category >> 0 : 0;
            if (!!!(category & msg.allCategoryMask)) {
                return;
            }

            notifyMsgs[msg.pubTime] = msg;
            notifyMsgsFun.push((function (msg, stayTime) {
                return function () {
                    localStorage["push.Disc." + msg.pubTime] = JSON.stringify(msg);
                    showNotification("notification.html", "disc",  msg.pubTime, stayTime);
                };
            }(msg, stayTime)));
        });
        localStorage["push.lastMsgId"] = _.max(todayFeeds, function(msg) {return msg.id;}).id;
        localStorage["push.notifyMsgs"] = serialize(notifyMsgs);

        if (notifyMsgsFun.length > 0 &&
            localStorage["push.isNotify"] === "true") {
            getNotify(notifyMsgsFun, 1);
        }

        var figureRemind = localStorage["push.figureRemind"];
        if (figureRemind === "true") {
            var newCount = Math.min(notifyMsgsFun.length, todayFeeds.length);
            chrome.browserAction.getBadgeText({}, function (result) {
                var beforeCount = result >> 0;
                newCount += beforeCount;
                newCount = newCount > 0 ? newCount : '';
                chrome.browserAction.setBadgeText({'text': newCount + ''});
            });
        } else {
            chrome.browserAction.setBadgeText({'text': ''});
        }
    });
    if (!!!isRefresh) {
        setTimeout(function () {
            checkPushMsgs();
        }, 10 * 60 * 1000);
    }
}

setTimeout(function () { checkPushMsgs(); }, 5 * 60 * 1000);

function showNotification(name, msgType, id, stayTime) {
    var notification, extensionURL;
    extensionURL = chrome.extension.getURL(name) + "?id=" + encodeURIComponent(id);
    if (webkitNotifications.createHTMLNotification) {
        console.log("extensionURL: ", extensionURL);
        notification = webkitNotifications.createHTMLNotification(extensionURL);
        notification.dir = "rtl";
        notification.show();
        setTimeout(function () {
            notification.cancel();
            localStorage.removeItem("push.Disc." + id);
        },  stayTime * 1000);
    } else {
        if (msgType === "deprice") {
            showDepriceNotify(id);
        } else {
            if (msgType === "signin") {
                showDiscNotify(id, true);
            } else {
                showDiscNotify(id);
            }
        }
    }
}
function showDepriceNotify(id) {
    var msgs = JSON.parse(localStorage["deprice.msgs"]);
    var msg = msgs[id];

    var items = [{
        title: msg.title,
        message: "【" + msg.cnName + "】" + msg.title 
    }, {
        title: "现价" + msg.price + " ",
        message: "下降" + msg.priceChanged + "元"
    }];
    var buttons = [{
        title: "马上去看看",
        iconUrl: chrome.runtime.getURL("/images/6.png")
    }];
    var options =  {
        type: "list",
        title: "惠惠购物助手-折扣订阅",
        message: "惠惠购物助手-折扣订阅",
        iconUrl: msg.img,
        items: items,
        buttons: buttons
    };
    chrome.notifications.create("push.Deprice." + id , options, function () {
        sendLog(["action=CHROMEPUSH_DEPRICE_POPUP", "type=ARMANI_EXTENSION_POPUP"]);
    });
}

function showDiscNotify(pubTime, isSignIn) {
    var thisMsg = JSON.parse(localStorage["push.Disc." + pubTime]);
    var temptDiv = $("<div class='tempt'/>");
    temptDiv.html(thisMsg.summary);
    $("body").append(temptDiv);
    var content = temptDiv.text().trim();
    $("body").remove(".tempt");
    var items = [{
        title: content,
        message: "" 
    }];
    var btnTitle = "马上去看看";
    if (isSignIn) {
        btnTitle = "去签到";
        items.unshift({
            title: " " + thisMsg.subTitle,
            message: ""
        });
    }
    var buttons = [{
        title: btnTitle,
        iconUrl: chrome.runtime.getURL("/images/6.png")
    }];
    var defaultImgUrl = chrome.runtime.getURL("/images/icon-huihui.png");
    var channelName = thisMsg.channel || "NOCHANNEL";
    var msgType = thisMsg.type || "NOTYPE";
    var options =  {
        type: "list",
        title: thisMsg.title,
        message: thisMsg.subTitle,
        iconUrl: thisMsg.imageUrl || defaultImgUrl,
        items: items,
        buttons: buttons
    };

    chrome.notifications.create("push.Disc." + pubTime, options, function () {
        sendLog(["action=CHROMEPUSH_DISC_POPUP",
                "channel=" + channelName,
                "msgType=" + msgType,
                "type=ARMANI_EXTENSION_POPUP"]);
    });
}

function getNotify(notifyMsgsFun, max, current) {
    if (max == undefined || (max >= notifyMsgsFun.length)) {
        max = notifyMsgsFun.length;
    }

    if (current == undefined) {
        current = 0;
    }
    
    if (max === current) {
        return;
    }

    notifyMsgsFun[current]();
    setTimeout(function () {
        getNotify(notifyMsgsFun, max, current + 1);
    }, 500);
}

/* 读取商家列表 */
var mre;
var bre;
(function updateConfig() {
   /*  每天从服务器更新一次 */
    var last = get('last_update_hour');
    var now = (new Date).getHours();
    if (!last || last != now) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', BASE_URL + 'extensions/config.xml', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                parseConfigXML(xhr.responseXML.documentElement);
                set('last_update_hour', now);
                mre = new RegExp(get('mre_txt'), 'i');
                bre = new RegExp(get('bre_txt'), 'i');
            }
        }
        xhr.send(null);
    }
    mre = new RegExp(get('mre_txt'), 'i');
    bre = new RegExp(get('bre_txt'), 'i');
})();


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case 'setOptions':
            set('youdaoGWZS_jsOptions', request.optionstr);
            break;
        case 'sendUpdateLog':
            sendLog(["action=" + request.logType, "type=ARMANI_EXTENSION_POPUP"]);
            break;
        case 'getOptions':
            var optstr = get('youdaoGWZS_jsOptions');
            optstr += ";hasFeeded=" + get('push.hasFeeded');
            var conf = get('parse_conf');
            var hasShowUpdateTipStr = localStorage['hasShowUpdateTip'];
            var isShowUpdateTip = false;
            if (!!!hasShowUpdateTipStr) {
                /*
                 *isShowUpdateTip = true;
                 *localStorage['hasShowUpdateTip'] = "3.2.2";
                 */
            }
            sendResponse({
                "optionstr": optstr, 
                "conf": conf, 
                "isShowUpdateTip": isShowUpdateTip,
                "like": localStorage['like.enable']
            });
            break;
        case 'getTodayMsgs':
            sendResponse({data: localStorage["push.msg"]});
        case 'refreshFeed':
            checkPushMsgs(true);
        case 'isshow':
            if (mre) {
                mre.lastIndex = 0;
                var show = mre.test(request.url);
                if (bre) show = show && !bre.test(request.url);
                sendResponse({isshow: show});
            } else {
                sendResponse({isshow: false});
            }
            break;
        default: break;
    }
});
/* functions */
function parseConfigXML(doc) {
    if (!doc) return;
    var b = doc.getElementsByTagName("blocked")[0];
    var m = doc.getElementsByTagName("matched")[0];
    var c = doc.getElementsByTagName("conf")[0];
    var bre = b.lastChild.nodeValue;
    if (bre) set('bre_txt', bre);
    var mre = m.lastChild.nodeValue;
    if (mre) set('mre_txt', mre);
    var conf = c.lastChild.nodeValue;
    if (conf) set('parse_conf', conf);
}


// Open introduction page when installed
function onInstalled() {
    var o = new StrOpt(get("youdaoGWZS_jsOptions"));
    o["state"] = "install";
    set("youdaoGWZS_jsOptions", o.toOptString());
    chrome.tabs.create({ selected: true, url: getURL('install') });

}

// Open introduction page when updated
function onUpdated() {
    var o = new StrOpt(get("youdaoGWZS_jsOptions"));
    o["state"] = "update";
    set("youdaoGWZS_jsOptions", o.toOptString());
    chrome.tabs.create({ selected: true, url: getURL('update') });
}


function getURL(type) {
    if (type === 'install') {
        return URL_INSTALL + '?browser=' + browser + '&version=' + get('version') +
            '&vendor=' + get('vendor');
    } else if (type === 'update') {
        return URL_UPDATE + '?browser=' + browser + '&version=' + get('version') +
            '&vendor=' + get('vendor');
    }
    return url;
}

function getVersionInManifest() {
    var version = 'NaN';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);
    return manifest.version;
}

function isFunction(obj) {
    var getType = {};
    return obj && getType.toString.call(obj) == '[object Function]';
}

function get(key) {
    return localStorage[key];
}

function set(key, val) {
    localStorage[key] = val;
}

function simpleAjax(url, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var msgs = unserialize(httpRequest.responseText);
                callback.call(this, msgs);
            } else {
                console.log(httpRequest.status);
            }
        }
    };
    httpRequest.open("get", url);
    httpRequest.send();
}

function serialize(obj) {
    if (typeof JSON === 'undefined') {
        throw new Error("serialize depends on JSON!");
    }
    return JSON.stringify(obj);
}

function unserialize(text) {
    if (typeof JSON === "undefined") {
        throw new Error("unserialize depends on JSON!");
    }

    try {
        var json = JSON.parse(text);
    } catch (e) {
        return false;
    }

    return json;
}

function getRandom(min, max) {
    return (Math.random() * (max - min) + min) | 0;
}


/*
 * Modified from http://xliar.com/checkBrowser.js
 * Thank the orginal author: webmaster@xliar.com, weibo.com/antiliar
 * See: http://xliar.com/thread-138-1-1.html
 */

/**
 * check if the current visitor using 360 browser
 * return "chrome" for 360 webkit browser 
 *        "ie"     for 360 ie browser
 *        ""       for non-360 broser
 */
function checkBrowser() {
    try {
        var ua = navigator.userAgent;
        if (/(firefox|opera|lbbrowser|qqbrowser|tencenttraveler|bidubrowser|alibrowser|maxthon|se [0-9]\.x|greenbrowser|myie2|theworld|avast|comodo|avant)/ig.test(ua)) return "";
        if (/(baidu|soso|sogou|youdao|jike|google|bing|msn|yahoo)/ig.test(ua)) return "";
        if (/(360|qihu)/ig.test(ua)) {
            return /MSIE/.test(ua) ? "ie" : "chrome";
        } // 360se|360ee|360spider
        if (/chrome/ig.test(ua)) {
            if (subtitleEnabled() && microdataEnabled() && scopedEnabled()) {
                return "chrome";
            }
        } else if (/safari/ig.test(ua)) {
            return "";
        }

        if (/msie/ig.test(ua) && !addSearchProviderEnabled()) {
            try {
                ("" + window.external) == "undefined";
            } catch (e) {
                return "ie";
            }
        }
        return "";
    } catch (e) {
    }

    // Subtitle support
    function subtitleEnabled() {
        return "track" in document.createElement("track");
    }

    // Scoped style element
    function scopedEnabled() {
        return "scoped" in document.createElement("style");
    }

    // Custom search providers
    function addSearchProviderEnabled() {
        return !!(window.external 
                && typeof window.external.AddSearchProvider != "undefined" 
                && typeof window.external.IsSearchProviderInstalled != "undefined");
    }

    // Microdata
    function microdataEnabled() {
        var div = document.createElement("div");
        div.innerHTML = '<div style="display:none;" id="microdataItem" itemscope itemtype="http://example.net/user"><p>My name is <span id="microdataProperty" itemprop="name">Jason</span>.</p></div>';
        document.body.appendChild(div);
        var item = document.getElementById("microdataItem");
        var property = document.getElementById("microdataProperty");
        var bEnabled = true;
        bEnabled = bEnabled 
            && !! ("itemValue" in property) 
            && property.itemValue == "Jason";
        bEnabled = bEnabled 
            && !! ("properties" in item) 
            && item.properties.name[0].itemValue == "Jason";
        if (!! document.getItems) {
            item = document.getItems("http://example.net/user")[0];
            bEnabled = (bEnabled && item.properties.name[0].itemValue == "Jason");
        }
        document.body.removeChild(div);
        return bEnabled;
    }
}

// 打开浏览器后，解析订单list页面
if (chrome.notifications) {
    var notifyBtnController = window.notifyBtnController;
    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonsIndex) {
        var notifyIdList = notificationId.split(".");
        var methodName = notifyIdList[0] + notifyIdList[1];
        notifyBtnController[methodName].call(this, notifyIdList[2], buttonsIndex);
    });
    chrome.notifications.onClicked.addListener(function (notificationId) {
        var notifyIdList = notificationId.split(".");
        var methodName = notifyIdList[0] + notifyIdList[1];
        notifyBtnController[methodName].call(this, notifyIdList[2]);
    });
    chrome.notifications.onClosed.addListener(function (notificationId) {
        var notifyIdList = notificationId.split(".");
        var methodName = notifyIdList[0] + notifyIdList[1] + "Close";
        if (notifyBtnController[methodName]) {
            notifyBtnController[methodName].call(this, notifyIdList[2]);
        }
    });
}
