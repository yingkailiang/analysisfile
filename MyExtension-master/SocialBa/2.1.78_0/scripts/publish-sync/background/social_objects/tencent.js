/// <reference path="../../tools/jquery-1.4.1.min.js" />
/// <reference path="../../tools/common.js" />

var tencent_ = inherit(oauthbase, 'tencent', {
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
        message = message.replace(/\s+/g, ' ');

        var params = {
            postData: message,
            access_token: _oauth.token,
            access_secret: _oauth.secret
        };

        // Share Links...
        if (msgBag.links && msgBag.links.length > 0) {
            params['linkUrl'] = msgBag.links[0].url;
        }

        // Share Picture...
        if (msgBag.pictures && msgBag.pictures.length > 0) {
            params['picPath'] = msgBag.pictures[0];
        }

        $.post('http://socialba.com/ext/tencent/post', params, function (res) {
            if (res && res.json && !res.json.successed) {
                console.error('<< tencent_.publish >> ' + res.json.message);
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
                checker.message = 'Just send same message!(QQ)';
                return checker;
            }
            if (utcNow - m.time < 5000) {
                checker.successed = false;
                checker.message = 'You are send too fast!(QQ)';
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