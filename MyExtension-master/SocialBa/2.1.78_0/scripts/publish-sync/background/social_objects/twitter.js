/// <reference path="../../tools/jquery-1.4.1.min.js" />
/// <reference path="../../tools/shortUrlService.js" />


var twitter_ = inherit(oauthbase, 'twitter', {
    login: function () {
        return {
            width: 900,
            height: 600,
            url: this.urls().url,
            url2: this.urls().url2
        }
    },
    publish: function (origin, msgBag) {
        var _oauth = this.oauth();
        var message = msgBag.message;

        switch (origin) {
            case 'gplus':
                message = message.replace(/<\/div>\s*<div>/g, '\n').replace(/<br[^<>]*>/g, '\n');
                message = message.replace(/<[^<>]*>/g, '');
                break;
            default: break;
        }

        var linkUrl = null;
        if (msgBag.links && msgBag.links.length > 0) {
            linkUrl = msgBag.links[0].url;
        } else if (msgBag.pictures && msgBag.pictures.length > 0) {
            linkUrl = msgBag.pictures[0];
        }
        if (linkUrl) {
            // shortUrl: ggshortUrl, twshortUrl, tqshortUrl, wbshortUrl
            var shortUrl = msgBag['twshortUrl'];
            if (!shortUrl) {
                try { shortUrl = urlShorten.getShortUrl({ longUrl: linkUrl }, 'twitter'); } catch (ex) { }
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

                msgBag['twshortUrl'] = shortUrl;
            }
        }

        $.post('http://socialba.com/ext/twitter/post', {
            postData: message,
            access_token: _oauth.token,
            access_secret: _oauth.secret
        }, function (res) {
            if (res && res.json && !res.json.successed) {
                console.error('<< twitter_.publish >> ' + res.json.message);
            }
        });
    },
    /* just for facebook! */
    history: new Array(),
    checkMessage: function (msg) {
        var checker = { successed: true, message: '' };

        this.clearHistory();

        var utcNow = this.UTC(new Date());
        for (var i in this.history) {
            var m = this.history[i];

            if (m.message == msg.message) {
                checker.successed = false;
                checker.message = 'Just send same message!(twitter)';
                return checker;
            }
            if (utcNow - m.time < 5000) {
                checker.successed = false;
                checker.message = 'You are send too fast!(twitter)';
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
    }
});