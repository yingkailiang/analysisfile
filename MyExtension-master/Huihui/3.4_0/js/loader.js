/**
 * Copyright 2011 NetEase Youdao
 */
var docElement = document.documentElement;
//var SCRIPT_URL = "http://zhushou.huihui.cn/script/extension_3_0.js";
//var SCRIPT_URL_B = "http://zhushou.huihui.cn/script/extension_3_0.js";
var SCRIPT_URL = "http://shared.ydstatic.com/gouwuex/ext/script/extension_3_0.js?browser=chrome&version=3.0";
var SCRIPT_URL_B = "http://shared.ydstatic.com/gouwuex/ext/script/extension_3_0.js?browser=chrome&version=3.0";
chrome.extension.sendRequest(
    {type: "isshow", url: location.href}, 
    function(response) {
        if (response.isshow) {
            extension_load();
        }
    }
);
// 用户访问的页面是否触发订单list页面解析

chrome.extension.sendRequest(
    {type: "visitUrl", url: location.href, referrer: document.referrer},
    function(response) {
        if (response.loginInfo) {
            var loginInfo = response.loginInfo;
            var loginBtnQ = loginInfo.loginBtnQ;
            var listUrl = loginInfo.listUrl;
            var loginBtn = document.querySelector(loginBtnQ);
            if (!!!loginBtn) {
                return;
            }
            loginBtn.onclick = function () {
                setTimeout(function () {
                    chrome.extension.sendRequest({
                        type: "loginPage",
                        siteName: loginInfo.siteName, 
                        url: listUrl
                    }, function (response) {});
                }, 0);
            }
        }
    }
);

function extension_load() {

chrome.extension.sendRequest(
    {type: "getOptions"},
    function(response) {
        var os = response.optionstr;
        var on = document.getElementById('youdaoGWZS_options');
        if (!on) {
            var wr = document.createElement("span");
            wr.id = "youdao_gouwu";
            wr.style.display = 'none';

            var conf = document.createElement("span");
            conf.id = "youdaoGWZS_config";
            conf.innerText = encodeURIComponent(response.conf);
            wr.appendChild(conf);

            on = document.createElement('span');
            on.id = 'youdaoGWZS_options';
            on.innerText = os;
            wr.appendChild(on);
            docElement.appendChild(wr);
            on.firstChild.addEventListener(
                'DOMCharacterDataModified', function() {
                    var opts = this.parentElement.innerText;
                    chrome.extension.sendRequest({
                        type: 'setOptions',optionstr: opts
                    });
                },
                false
            );
            if (response.isShowUpdateTip) {
                showUpdateTip();
            }
            loadJS(response.like === "true" ? SCRIPT_URL_B : SCRIPT_URL);
        }
    }
);

}

function showUpdateTip() {
    var image_url = "http://shared.ydstatic.com/gouwuex/images/plugin/tips_bg.png";
    var tipsTemplate = '<div class="huihuigwzs-extension-tip"' +
                            'style="position:absolute;' +
                            'background-image:url(' + image_url + ');' +
                            'width: 304px; height: 231px;' +
                            'z-index:99999; top:0px; right: 0px;">' +
                            '<div style="position: absolute; bottom: 10px; left: 10px;">' +
                                '<input type="checkbox" class="-close" ' +
                                    'data-log="CHROME_ORDER_POPUP_UPDATE_KNOWN_CLICK" ' +
                                    'name="known" id="have-known"/>' +
                                '<label for="have-known" style="vertical-align:text-bottom">' +
                                '我知道了</label>' +
                            '</div>' +
                            '<a class="-close"'+
                                'style="position: absolute; bottom: 119px; right: 0;' +
                                'width: 15px;height: 15px; text-indent: -9999em;cursor:pointer;" ' +
                                'data-log="CHROME_ORDER_POPUP_UPDATE_CLOSE_CLICK" ' +
                            'href="#extend"></a>' +
                            '<a class="-close"' +
                                'style="position: absolute; bottom: 10px; right: 10px;' +
                                'width: 86px;height: 27px; text-indent: -9999em;' +
                                'id="huihuigwzs-extension-tosee" ' +
                                'data-log="CHROME_ORDER_POPUP_UPDATE_TOSEE_CLICK" ' +
                                'href="chrome-extension://ohjkicjidmohhfcjjlahfppkdblibkkb/orderDetail.html" target="_blank" >去看看</a>'+
                       '</div>';
    var tipTag = document.createElement('div');
    tipTag.innerHTML = tipsTemplate;
    tipTag.id = "huihuigwzs-extension-tip";
    document.getElementsByTagName('body')[0].appendChild(tipTag);
    document.body.addEventListener('click', function (e) {
        var target = e.target || e.srcElement;
        if (target.className.match(/-close/)) {
            var tips = document.getElementById("huihuigwzs-extension-tip");
            tips.style.display = "none";
            var logAttribute = target.getAttribute("data-log");
            chrome.extension.sendRequest({
                type: "sendUpdateLog",
                logType: logAttribute
            }, function (response) {

            });
        }
    });
}
function loadJS(url, onload) {
    var domscript = document.createElement('script');
    domscript.src = url;
    domscript.charset = 'utf-8';
    if (onload) {
        domscript.onloadDone = false;
        domscript.onload = onload;
        domscript.onreadystatechange = function () {
            if ("loaded" === domscript.readyState && domscript.onloadDone) {
                domscript.onloadDone = true;
                domscript.onload();
                domscript.removeNode(true);
            }
        };

  }
  document.getElementsByTagName('head')[0].appendChild(domscript);
}


