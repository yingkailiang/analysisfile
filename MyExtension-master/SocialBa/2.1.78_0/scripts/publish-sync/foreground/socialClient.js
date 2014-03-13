
var socialClient = {
    // << 最后更改时间 >>
    authWin: null,

    changeId: 0,
    userId: null,

    init: function () {
        var _self = this;
        this.getUser(function (user) {
            _self.userId = user.id;
        });
    },

    /*------------------------------------<< 我是可爱的分割线 >>------------------------------*/
    charLimited: {
        "facebook": 255,
        "plurk": 140,
        "twitter": 140,
        "gplus": -1,
        "weibo": 140,
        "tencent": 140,
        "vkontakte": -1,
        "renren": -1,
        "kaixin001": -1,
        "qzone": -1
    },
    getUser: function (callback) {
        var _self = this;
        socialHelper.call({ isGetUser: true }, function (user) {
            if (user) { _self.userId = user.id; }
            if (callback) { callback(user); }
        });
    },
    updateUserInfo: function (userInfo, callback) {
        socialHelper.call({ isUpdateUserInfo: true, userInfo: userInfo }, callback);
    },
    getSiteNames: function (callback) {
        var language = window.navigator.language.toLowerCase();

        socialHelper.call({ isGetSiteNames: true, language: language }, callback);
    },
    setSiteNames: function (siteNames) {
        socialHelper.call({ isSetSiteNames: true, siteNames: siteNames }, null);
    },
    getAllSiteNames: function () {
        // 直接获取！
        return ['facebook', 'gplus', 'twitter', 'linkedin', 'vkontakte', 'plurk', 'weibo', 'tencent', 'renren', 'kaixin001', 'qzone'];
    },
    login: function (siteName, callback) {
        var _self = socialClient;

        var width = 800;
        var height = 600;
        var url = 'http://socialba.com/ext/' + siteName + '/oauth?v=2.0&userId=' + _self.userId;

        if (siteName == 'gplus') {
            url = 'https://www.google.com/accounts/ServiceLogin?continue=' + encodeURIComponent('http://plus.google.com');
            window.open(url);
            return;
        }

        var left = parseInt((screen.availWidth - width) / 2);
        var top = parseInt((screen.availHeight - height) / 2);
        _self.authWin = window.open(url, 'LogIn', 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no');
    },
    logout: function (siteName) {
        socialHelper.call({ isLogout: true, siteName: siteName }, function () { });
    },
    signIn: function (oauthBag, callback) {
        socialHelper.call({ isSignIn: true, oauth: oauthBag }, callback);
    },
    getAccount: function (siteName, callback) {
        socialHelper.call({ isGetAccount: true, siteName: siteName }, callback);
    },
    updateAccount: function (siteName, callback) {
        socialHelper.call({ isUpdateAccount: true, siteName: siteName }, callback);
    },
    getVersion: function (callback) {
        socialHelper.call({ isGetVersion: true }, callback);
    },
    postMessage: function (siteName, feedBag, callback) {
        socialHelper.call({
            isPostMessage: true,
            message: feedBag.message,
            siteName: siteName,
            from: feedBag.from
        }, function (response) {
            if (response.response && response.response.error) {
                alert('error(' + siteName + '): ' + response.response.error.message);
            }

            if (callback) {
                callback(response);
            }
        });
    },
    submitFeed: function (siteNames, feedBag, callback) {
        socialHelper.call({
            isSubmitFeed: true,
            siteNames: siteNames,
            from: feedBag.from,
            message: feedBag.message
        }, function (response) {
            if (callback) {
                callback(response);
            }
        });
    },
    getOptions: function (callback) {
        socialHelper.call({ isGetOptions: true }, callback);
    },
    setOptions: function (options, callback) {
        socialHelper.call({ isSetOptions: true, options: options }, callback);
    },
    getFBFansPages: function (callback) {
        try {
            socialHelper.call({ getFBFansPages: true }, callback);
        } catch (e) { }
    },
    checkFbPermissions: function (callback) {
        try {
            socialHelper.call({ checkFbPermissions: true }, callback);
        } catch (e) { }
    },

    // << 更新检测： >>
    /*------------------------------------<< 我是可爱的分割线 >>------------------------------*/
    checkChanged: function (callback) {
        var _self = socialClient;

        socialHelper.call({ isGetChangedId: true }, function (changeId) {
            if (changeId != _self.changeId && changeId > 0) {
                _self.changeId = changeId;
                if (callback) { callback(true); }
            }
            else { callback(false); }
        });
    },
    getForgroundScripts: function (callback) {
        socialHelper.call({ isGetForgroundScripts: true }, callback);
    },
    ajax: function (options, callback) {
        socialHelper.call({ isAjax: true, options: options }, callback);
    }
};

var socialHelper = {
    call: function (message, callback) {
        callback = callback ? callback : (function () { });
        chrome.extension.sendRequest(message, callback);
    }
};

socialClient.init();