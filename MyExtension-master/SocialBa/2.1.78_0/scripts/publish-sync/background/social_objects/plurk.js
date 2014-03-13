/// <reference path="../../tools/jquery-1.4.1.min.js" />

var plurk_ = inherit(oauthbase, 'plurk', {
    login: function () {
        return {
            width: 900,
            height: 600,
            url: this.urls().url,
            url2: this.urls().url2
        }
    },
    validTokenStatus: function (callback) {
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

        // share Links
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
                    message = substr(message, 130 - shortUrl.length) + ' ' + shortUrl;
                }
                else {
                    message = replaceUrl(message, linkUrl, shortUrl);
                }
                msgBag['ggshortUrl'] = shortUrl;
            }
        }

        // share Pictures
        if (msgBag.pictures && msgBag.pictures.length > 0) {
            var pictureUrl = msgBag.pictures[0];

            // shortUrl: ggshortUrl, twshortUrl, tqshortUrl, wbshortUrl
            var shortUrl = pictureUrl;
            try { shortUrl = urlShorten.getShortUrl({ longUrl: pictureUrl }, 'gplus'); } catch (ex) { }

            if (shortUrl) {
                if (!containsUrl(message, pictureUrl)) {
                    message = substr(message, 130 - shortUrl.length) + ' ' + shortUrl;
                }
                else {
                    message = replaceUrl(message, pictureUrl, shortUrl);
                }
            }
        }

        $.post('http://socialba.com/ext/plurk/post', {
            postData: message,
            access_token: _oauth.token,
            access_secret: _oauth.secret
        }, function (res) {
            if (res && res.json && !res.json.successed) {
                console.error('<< plurk_.publish >> ' + res.json.message);
            }
        });
    }
});