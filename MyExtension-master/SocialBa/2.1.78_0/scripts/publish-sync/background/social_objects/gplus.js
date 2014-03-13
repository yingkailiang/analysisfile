/// <reference path="../../common.js" />
/// <reference path="../../browserHelper.js" />

var gplus_ = {
    init: function () {
        var _self = gplus_;

        _self.clear();
        _self.getCurrent();
        _self.checkAccountInterval = setInterval(function () {
            try { if (options.config().siteNames.join(',').indexOf('plus') == -1) { return; } } catch (e) { }
            _self.getCurrent()
        }, 10000);
    },
    clear: function () {
        var _self = gplus_;

        if (_self.checkAccountInterval) {
            clearInterval(_self.checkAccountInterval);
            _self.checkAccountInterval = null;
        }
    },
    login: function () {
        this.log_acc();

        var uname = gplusHelper.userName();
        if (uname && uname != 'undefined') {
            return;
        }

        return {
            width: 800,
            height: 600,
            url: 'https://www.google.com/accounts/ServiceLogin?continue=' + encodeURIComponent('http://plus.google.com')
        };
    },
    log_acc: function (request, sender) {
        localStorage['log_gplus'] = '1';

        var _self = gplus_;
        _self.init();

        options.last_time(new Date());
    },
    logout: function () { },
    isLogin: function () {
        if (localStorage.log_gplus == '0') {
            return false;
        }

        var uname = gplusHelper.userName();
        return uname && uname != 'undefined' ? true : false;
    },
    getAccount: function () {
        var uname = gplusHelper.userName();
        return {
            status: this.isLogin(),
            name: uname && uname != 'undefined' ? uname : '',
            siteName: 'gplus',
            expired: false,
            circles: gplusHelper.circles()
        };
    },
    updateAccount: function (callback) {
        var _self = gplus_;
        _self.getCurrent(callback);
    },
    validTokenStatus: function (callback) {
        // 客户端实时更新，无需检测
    },
    publish: function (origin, msgBag) {
        try {
            var message = msgBag.message;
            if (msgBag.links && msgBag.links.length > 0) {
                message = this.getMessage(message, msgBag.links[0].url);
            }
            if (msgBag.pictures && msgBag.pictures.length > 0) {
                message = this.getMessage(message, msgBag.pictures[0]);
            }

            // 换行无法发送。。。
            var message = message.replace(/\n|\r/g, ' ');
            var circles = msgBag.gplus && msgBag.gplus.ranges ? msgBag.gplus.ranges : null;
            gplusHelper.postMessage(circles, message, {}, null);
        } catch (e) { console.error('gplus_.publish has errored: ' + e.message); }
    },
    getMessage: function (message, linkUrl) {
        // Message has no contains this link.
        if (!containsUrl(message, linkUrl)) {
            message += ' ' + linkUrl;
        }

        // shortUrl: ggshortUrl, twshortUrl, tqshortUrl, wbshortUrl
        var shortUrl = null;
        if (!shortUrl) {
            try { shortUrl = urlShorten.getShortUrl({ longUrl: linkUrl }, 'gplus'); } catch (ex) { }
        }
        if (shortUrl) {
            message = replaceUrl(message, linkUrl, shortUrl);
        }

        return message;
    },
    /* just for facebook! */
    history: new Array(),
    checkMessage: function (msg) {
        var checker = { successed: true, message: '' };

        this.clearHistory();

        var utcNow = UTC(new Date());
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

        this.history.push({ message: msg.message, time: UTC(new Date()) });
        return checker;
    },
    clearHistory: function () {
        var utcNow = UTC(new Date());

        var i = this.history.length - 1;
        while (i >= 0) {
            if (utcNow - this.history[i].time > 5 * 60 * 1000) {
                this.history.splice(i, 1);
            }

            i--;
        }
    },
    getCurrent: function (callback) {
        gplusHelper.getCurrent(callback);
    }
}