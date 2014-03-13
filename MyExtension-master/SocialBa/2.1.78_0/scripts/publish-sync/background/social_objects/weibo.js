/// <reference path="../../jquery-1.4.1.min.js" />

/************************************************
*
*   新浪微博: weibo.com
*   copyright socialba.com
*
************************************************/

var weiboApi = inherit(oauthbase, 'weibo', {
    apiBaseUrl: "https://api.weibo.com/2",

    //
    // Public Method ...

    publish: function (origin, msg) {
        try {
            var _self = weiboApi;
            var params = this.getParams(origin, msg);

            if (_self.checkMessage(params)) {
                var apiUrl = params.url ? '/statuses/upload_url_text.json' : '/statuses/update.json';
                _self.api(apiUrl, params, function (succ, res) {
                    console.log(res);
                });
            }
        } catch (e) { console.error('<< weiboApi.publish >> error occored: ' + e.message); }
    },
    expired: function (callback) {
        this.api("/oauth2/get_token_info", {}, function (succ, res) {
            var expired = !(succ && JSON.parse(res).expire_in >= 100);
            if (callback) { callback(weiboApi.siteName, expired); }
        });
    },

    // Private Method

    history: new Array(),
    checkMessage: function (msg) {
        var checker = { successed: true, message: '' };

        this.clearHistory();

        var utcNow = this.UTC(new Date());
        for (var i in this.history) {
            var m = this.history[i];

            if (m.message == msg.message) {
                checker.successed = false;
                checker.message = 'Just send same message!(weibo)';
                return checker;
            }
            if (utcNow - m.time < 5000) {
                checker.successed = false;
                checker.message = 'You are send too fast!(weibo)';
                return checker;
            }
        }

        this.history.push({ message: msg.message, time: this.UTC(new Date()) });
        return checker;
    },
    clearHistory: function () {
        var utcNow = this.UTC(new Date());

        var i = this.history.length - 1;
        while (i >= 0) {
            if (utcNow - this.history[i].time > 5 * 60 * 1000) {
                this.history.splice(i, 1);
            }
            i--;
        }
    },
    UTC: function (now) {
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    },
    api: function (method, params, callback) {
        var _self = weiboApi;
        if (this.isLogin()) {
            params['access_token'] = this.oauth().token;
            callback = callback ? callback : function () { };
            $.post(_self.apiBaseUrl + method, params, function (data) {
                callback(true, data);
            }).fail(function () {
                callback(false);
            });
        }
    },
    getParams: function (origin, msgBag) {
        var params = {};

        var _self = this;
        var message = msgBag.message;

        switch (origin) {
            case 'gplus':
                message = message.replace(/<\/div>\s*<div>/g, '\n').replace(/<br>/g, '\n');
                message = message.replace(/<[^<>]*>/g, '');
                message = message.trimLeft();
                break;
            default: break;
        }

        if (msgBag.links && msgBag.links.length > 0) {
            var linkUrl = msgBag.links[0].url;
            // shortUrl: ggshortUrl, twshortUrl, tqshortUrl, wbshortUrl
            var shortUrl = msgBag['ggshortUrl'];
            if (!shortUrl) {
                try { shortUrl = urlShorten.getShortUrl({ longUrl: linkUrl }, 'gplus'); } catch (ex) { }
            }
            if (shortUrl) {
                // Message has no contains this link.
                if (!containsUrl(message, linkUrl)) {
                    var length = 140 - shortUrl.length;
                    if (message.length >= length) { message = message.substr(0, length - 5) + '...' }
                    message += ' ' + shortUrl;
                }
                else {
                    message = replaceUrl(message, linkUrl, shortUrl);
                }

                msgBag['ggshortUrl'] = shortUrl;
            }
        }

        if (msgBag.pictures && msgBag.pictures.length > 0) {
            var pictureUrl = msgBag.pictures[0];
            if (origin == 'facebook' || origin == 'twitter') {
                try {
                    var shortUrl = urlShorten.getShortUrl({ longUrl: pictureUrl }, 'gplus');
                    if (shortUrl) {
                        // Message has no contains this link.
                        if (!containsUrl(message, pictureUrl)) {
                            var length = 140 - shortUrl.length;
                            if (message.length >= length) { message = message.substr(0, length - 5) + '...' }
                            message += ' ' + shortUrl;
                        }
                        else {
                            message = replaceUrl(message, pictureUrl, shortUrl);
                        }

                        msgBag['ggshortUrl'] = shortUrl;
                    }
                } catch (ex) { }
            }
            else {
                params['url'] = pictureUrl;
            }
        }

        params['status'] = message;
        return params;
    },
    getShortUrl: function (longUrl) {
        var url = 'https://api.weibo.com/2/short_url/shorten.json'
            + '?access_token=' + this.oauth().token
            + '&url_long=' + encodeURI(longUrl);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);

        var data = JSON.parse(xhr.responseText);
        return data.urls[0].url_short;
    }
});