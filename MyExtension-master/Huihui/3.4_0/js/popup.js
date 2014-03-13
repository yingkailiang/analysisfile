window.addEventListener('load', function() {
    var feedHtml, wrapper, hasFeeded, feedsWrapper, figureRemind,
        todayFeeds, feedsHdHtml, listWrapper, scrollTimer;

    feedHtml = '';
    feedsHdHtml = '';
    wrapper = document.getElementById("feeds-wrapper");
    feedsHd = document.getElementById("feedsHd");
    feedItem = document.getElementById("feedsItem");

    get("push.todayFeeds", function(feedJson) {
        try { todayFeeds = JSON.parse(feedJson); } catch(e) {}
        todayFeeds = todayFeeds || [];
        hasFeeded = localStorage["push.hasFeeded"];
        figureRemind = localStorage["push.figureRemind"];

        feedsHdHtml = tmpl(feedsHd.innerHTML, {updateCount: todayFeeds.length});

        todayFeeds.forEach(function (feed) {
            var tmplStr;
            feed.link = (feed.link).indexOf("?") > 0 ?
                feed.link + "&keyfrom=chromepopup" :
                feed.link + "?keyfrom=chromepopup";
            tmplStr = tmpl(feedItem.innerHTML, {feed: feed});
            feedHtml += tmplStr ? tmplStr : '';
        });

        wrapper.innerHTML = feedsHdHtml + "<ul>" + feedHtml + "</ul>";
        
        var isshowOrderDetail = localStorage["order.isShowDetail"];
        if (isshowOrderDetail === "true") {
            var orderDetil = document.getElementById("order-detail");
            orderDetil.className += "showLink"
        }
        chrome.browserAction.getBadgeText({}, function (digit) {
            sendLog(["action=CHROMEPOPUP_CLICK",
                    "type=ARMANI_EXTENSION_ACTION", "digit="+(digit||0)]);
        });

        chrome.browserAction.setBadgeText({'text': ''});

        feedsWrapper = document.querySelector("#feeds-wrapper ul");
        feedsWrapper.onscroll = function () {
            if (scrollTimer) {
                return;
            }
            scrollTimer = setTimeout(function () {
                sendLog(["action=CHROMEPOPUP_SCROLL", "type=ARMANI_EXTENSION_ACTION"]);
                clearTimeout(scrollTimer);
                scrollTimer = false;
            }, 2000);
        }
    
    });

}, false);

function get(key, callback) {
    setTimeout(function() {
        callback(localStorage.getItem(key));
    }, 0);
}
