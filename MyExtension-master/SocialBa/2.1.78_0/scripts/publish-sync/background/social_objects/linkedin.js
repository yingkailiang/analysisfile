/// <reference path="../../tools/jquery-1.4.1.min.js" />
/// <reference path="../../tools/shortUrlService.js" />
/// <reference path="../oauthbase.js" />
/// <reference path="../../../common.js" />

var linkedin_ = inherit(oauthbase, 'linkedin', {
    login: function () {
        return {
            width: 900,
            height: 600,
            url: this.urls().url,
            url2: this.urls().url2
        }
    },
    publish: function (origin, msgBag) {
        var message = msgBag.message;
        switch (origin) {
            case 'gplus':
                message = message.replace(/<\/div>\s*<div>/g, '\n').replace(/<br[^<>]*>/g, '\n');
                message = message.replace(/<[^<>]*>/g, '');
                break;
            default: break;
        }

        var params = {
            text: message,
            token: this.oauth().token,
            secret: this.oauth().secret
        };

        if (msgBag.links && msgBag.links.length > 0) {
            params.link_u = msgBag.links[0].url;
            params.link_t = msgBag.links[0].title;
            params.link_d = msgBag.links[0].content;

            params.link_d = params.link_d ? params.link_d : params.link_t;
            if (msgBag.links[0].picture) { params.link_i = msgBag.links[0].picture; }
        }
        if (msgBag.pictures && msgBag.pictures.length > 0) {
            params['picture'] = msgBag.pictures[0];
        }

        $.post('http://socialba.com/ext/linkedin/post', params, function (res) {
            if (res && res.json && !res.json.successed) {
                console.error('<< linkedin_.publish >> ' + res.json.message);
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
                checker.message = 'Just send same message!(linkedin)';
                return checker;
            }
            if (utcNow - m.time < 5000) {
                checker.successed = false;
                checker.message = 'You are send too fast!(linkedin)';
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