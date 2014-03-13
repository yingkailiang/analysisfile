/// <reference path="../oauthbase.js" />
/// <reference path="../../../common.js" />

var renrenApi = inherit(oauthbase, 'renren', {
    URL: {
        api: "https://api.renren.com/restserver.do"
    },

    /*-------------------------------------<< 我是分割线 >>-----------------------------------------*/
    login: function () {
        return {
            width: 900,
            height: 600,
            url: this.urls().url,
            url2: this.urls().url2
        }
    },
    publish: function (origin, msg) {
        try {
            var _self = renrenApi;
            var params = this.getParams(origin, msg);

            _self.api(params, function (res) {
                if (res && res.error) {
                    console.log(res.error.message + '( renren.com )');
                } else { }
            });
        } catch (e) { console.error('<< renrenApi.publish >> error occored: ' + e.message); }
    },

    history: new Array(),
    checkMessage: function (msg) {
        var checker = { successed: true, message: '' };

        this.clearHistory();

        var utcNow = this.UTC(new Date());
        for (var i in this.history) {
            var m = this.history[i];

            if (m.message == msg.message) {
                checker.successed = false;
                checker.message = 'Just send same message!(Facebook)';
                return checker;
            }
            if (utcNow - m.time < 5000) {
                checker.successed = false;
                checker.message = 'You are send too fast!(Facebook)';
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
    api: function (params, callback) {
        var _self = renrenApi;
        if (this.isLogin()) {
            params['v'] = '1.0';
            params['access_token'] = this.oauth().token;
            params['format'] = 'json';

            callback = callback ? callback : function () { };
            $.post(_self.URL.api, params, callback);
        }
    },
    getParams: function (origin, msgBag) {
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
            var name = msgBag.links[0].title;
            var content = msgBag.links[0].content;
            var linkUrl = msgBag.links[0].url;
            if (name.length > 30) { name = name.substr(0, 26) + '...'; }

            params = {
                method: 'feed.publishFeed',
                name: name,
                description: content ? content : msgBag.links[0].title,
                url: linkUrl,
                message: substr(message, 200)
            };

            if (msgBag.links[0].picture) {
                params['image'] = msgBag.links[0].picture;
            }

            return params;
        }
        else if (msgBag.pictures && msgBag.pictures.length > 0) {
            var name = message.length > 10 ? (message.substr(0, 8) + '...') : message;
            var pictureUrl = msgBag.pictures[0];

            params = {
                method: 'feed.publishFeed',
                name: name,
                description: getHostname(pictureUrl),
                url: pictureUrl,
                image: pictureUrl,
                message: substr(message, 200)
            };

            return params;
        }

        return {
            method: 'status.set',
            status: substr(message, 140)
        };
    }
});