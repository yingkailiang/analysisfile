$(document).ready(function () {
    var cfg, channel, channelArray, category, isFromUpdate,
        hasShownSetTip, hasFeeded, hasModify, originChannel, originCategory,
        searchQuery;

    hasModify = false;
    searchQuery = window.location.search;
    cfg = JSON.parse(localStorage.getItem("push.config")) || {};
    hasFeeded = localStorage["push.hasFeeded"];
    hasShownSetTip = localStorage.getItem("push.hasShownSetTip");
    channel = cfg.channel;
    category = cfg.category;
    originChannel = channel;
    originCategory = category;

    var $orderSetting = $(".order-setting");
    var orderIsSwitchOn = localStorage["order.isSwitchON"];
    if (orderIsSwitchOn === "true") {
        $orderSetting.css({"display": "block"});
    }
    if (/^\?fromUpdate\=1/.test(searchQuery)) {
        localStorage["push.showSetting"] = 1;
        openMasker();
    }

    if (channel) {
        channelArray = channel.split("~");
        channelArray.forEach(function (element) {
            var activeQ = '.channel li[data-value="' + element +'"]'
            $(activeQ).addClass("active");
        });
    } else {
        channelArray = [];
    }

    if (hasShownSetTip === "false") {
        $(".category-list .setting-tip").show();
        $(document).delegate(".setting-tip b", "click", function () {
            $(".category-list .setting-tip").hide();
            localStorage.setItem("push.hasShownSetTip", true);
        });
    }

    $(".category li").each(function () {
        var $target, value;

        $target = $(this);
        value = $target.attr("data-value");
        if (parseInt(value, 10) & parseInt(category, 10)) {
            $target.addClass("active");
        }
    });

    $(".btn-group").each(function () {
        var $target, type, defaultValue;

        $target = $(this);
        type = $target.attr("data-type");
        defaultValue = $target.attr("data-default");

        if (localStorage[type]) {
            $target.find('button[value="' + localStorage[type] + '"]').addClass("active");
        } else {
            localStorage[type] = defaultValue;
            $target.find('button[value="' + defaultValue + '"]').addClass("active");
        }
    });


    $(".btn-group button").click(function () {
        var $target, $parent, val, type;

        $target = $(this);
        $parent = $target.parent();
        type = $parent.attr("data-type");
        val = $target.val();
        localStorage[type] = val;

        if (type === "push.figureRemind") {
            if (localStorage["push.figureRemind"] !== "true") {
                chrome.browserAction.setBadgeText({'text': ''});
            }
        }
    });

    var testNotifyId = 0;
    $(".try-switcher").click(function () {
        var url = chrome.extension.getURL("test-notify.html");
        var $target;
        $target = $(this);
        setTimeout(function () {
            $target.removeClass("active");
        }, 100);
        if (webkitNotifications.createHTMLNotification) {
            var testNotification= webkitNotifications.createHTMLNotification(url);
            testNotification.dir = "rtl";
            testNotification.show();
        } else {
            var items = [{
                title: "",
                message: "实时推送惠惠网的精选折扣" 
            }, {
                title: "",
                message: "您可以订阅自己感兴趣的分类，尝鲜体验" 
            },{
                title: "每日白菜价、晒物园",
                message: ""
            }];
            var buttons = [{
                title: "去看看",
                iconUrl: chrome.runtime.getURL("/images/6.png")
            }, {
                title: "订阅设置",
                iconUrl: chrome.runtime.getURL("/images/1.png")
            }];

            var options =  {
                type: "list",
                title: "惠惠购物助手 —折扣推送",
                message: "惠惠网",
                iconUrl: "images/icon-huihui.png",
                items: items,
                buttons: buttons
            };
            try {
                chrome.notifications.create("push.Disc.test." + testNotifyId++, options, function () {});
            } catch(e) {
            }
        }
   });

    $(document).delegate(".category-list a", "click", function (e) {
        e.stopPropagation();
    });

    $(document).delegate(".masker", "click", function () {
        removeMasker();
    });
    $(document).delegate(".fragement .close, .fragement .setting", "click", function () {
        removeMasker();
    });

    $(document).delegate(".category-list li", "click", function (e) {
        var isSelected, $target, $parent,
            value, index, isCategory;

        $target = $(this);
        $parent = $target.parent();
        isCategory = $parent.hasClass("category");
        value = $target.attr("data-value");
        isSelected = $target.hasClass("active");

        if (isCategory) {
            category = parseInt(category, 10) ^ parseInt(value, 10);
        }

        if (isSelected) {
            $target.removeClass("active");
            $target.attr("log-action", "OPTPAGE_FEEDITEM_UNCHECK");

            if (!isCategory) {
                index = channelArray.indexOf(value);
                channelArray.splice(index, 1);
            }
        } else {
            $target.addClass("active");
            $target.attr("log-action", "OPTPAGE_FEEDITEM_CHECK");

            if (!isCategory) {
                channelArray.push(value);
            }
        }

        channel = channelArray.join("~");
        cfg.channel = channel;
        cfg.category = category;
        localStorage["push.customize"] = 'true';
        localStorage.setItem("push.config", JSON.stringify(cfg));
        });

        function removeMasker() {
            var $masker, $fragement;

            $masker = $(".masker");
            $fragement = $(".fragement.fade");
            $fragement.removeClass("in");
            $masker.removeClass("in");
            $masker.remove();
            setTimeout(function () {
                $fragement.remove();
            }, 2000);
        }
        function openMasker() {
            var fadeDiv, $masker, $fragement;

            $fragement = $(".fragement.fade");
            fadeDiv = $('<div class="masker"/>');
            $fragement.after(fadeDiv);
            $masker = $(".masker");

            $fragement.addClass("in");
            $masker.addClass("in");
        }
        (function refreshFeed() {
            var isRefresh;
            isRefresh = false;
            if (originChannel !== channel) {
                isRefresh = true;
                originChannel = channel;
            }
            if (originCategory !== category) {
                isRefresh = true;
                originCategory = category;
            }

            if (isRefresh) {
                chrome.extension.sendRequest({type: "refreshFeed"}, function (response) {});
            }

            setTimeout(function () {
                refreshFeed();
            }, 3000);
        }());

        sendLog(["action=CHROME_OPTION_SHOW", "type=ARMANI_EXTENSION_ACTION"]);
});

