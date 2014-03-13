/// <reference path="../oauthbase.js" />
/// <reference path="../../../common.js" />

var vkontakteApi = inherit(oauthbase, 'vkontakte', {
    URL: {
        api: "https://api.vkontakte.ru/method"
    },

    // << 核心方法： >>
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
            var _self = vkontakteApi;
            var params = this.getParams(origin, msg);

            if (_self.checkMessage(params)) {
                _self.api("/wall.post", params, function (res) {
                    if (res && res.error) {
                        console.log(res.error.message + '( vk.com )');
                    } else { }
                });
            }
        } catch (e) { console.error('<< vkontakteApi.publish >> error occored: ' + e.message); }
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
    api: function (method, params, callback) {
        var _self = vkontakteApi;
        if (this.isLogin()) {
            callback = callback ? callback : function () { };
            $.getJSON(_self.URL.api + method + '?&access_token=' + this.oauth().token, params, callback);
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

        var params = { "message": message };
        if (msgBag.links && msgBag.links.length > 0) {
            var linkUrl = msgBag.links[0].url;
            params['attachments'] = linkUrl;
        }
        else if (msgBag.pictures && msgBag.pictures.length > 0) {
            params['attachments'] = msgBag.pictures[0];
        }

        return params;
    }
});