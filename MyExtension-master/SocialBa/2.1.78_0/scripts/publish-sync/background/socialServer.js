/// <reference path="options.js" />
/// <reference path="social_helpers/youtubeHelper.js" />

var socialServer = {
    forgroundScript: function (scripts) {
        if (typeof scripts == 'undefined') {
            return localStorage['forgroundScript'];
        }

        localStorage['forgroundScript'] = scripts;
    },
    args: {
        socialHelpers: {
            "facebook": facebook_,
            "plurk": plurk_,
            "twitter": twitter_,
            "gplus": gplus_,
            "weibo": weiboApi,
            "tencent": tencent_,
            "linkedin": linkedin_,
            "vkontakte": vkontakteApi,
            "renren": renrenApi,
            "kaixin001": kaixin001Api,
            "qzone": qzoneApi
        },
        siteNames: ['facebook', 'gplus', 'twitter', 'linkedin', 'vkontakte', 'plurk', 'weibo', 'tencent', 'renren', 'kaixin001', 'qzone']
    },
    options: function (config) {
        if (config) {
            return options.config(config);
        }
        return options.config();
    },
    getUser: function (callback) {
        var user = oauthbase.user();
        if (!user) { user = { id: null }; }
        if (callback) { callback(user); }
        return user;
    },
    updateUserInfo: function (userInfo, callback) {
        oauthbase.updateUserInfo(userInfo, callback);
    },
    setSiteNames: function (siteNames) {
        try {
            if (siteNames.join(',').indexOf('gplus') == -1) {
                this.getHelper('gplus').clear();
            } else {
                this.getHelper('gplus').init();
            }
        } catch (ex) { }

        var argSiteNames = [];

        for (var i in socialServer.args.siteNames) {
            var n = socialServer.args.siteNames[i];
            for (var j in siteNames) {
                var s = siteNames[j];

                if (s == n) { argSiteNames.push(n); }
            }
        }

        localStorage['siteNames'] = argSiteNames.join(',');
        options.last_time(new Date());
    },
    init: function () {
        //try {
        var siteNames = this.options().siteNames;

        for (var i in siteNames) {
            var helper = this.getHelper(siteNames[i]);
            if (helper.init) { helper.init(); }
        }
        //} catch (e) { console.error('<< socialHelper.init() >> has errored: ' + e.message); }

        options.last_time(new Date());
    },
    login: function (siteName) {
        return this.getHelper(siteName).login();
    },
    logout: function (siteName) {
        if (typeof siteName == 'undefined') {
            oauthbase.log_out({});
        }
        else {
            this.getHelper(siteName).logout();
        }

        if (typeof siteName == 'undefined' || siteName == 'facebook') {
            this.getHelper('facebook').clear();
        }
    },
    signIn: function (request, callback) {
        var oauth = request.oauth;

        if (this.isFirstInstall()) {
            var siteNames = options.config().siteNames;
            for (var ositeName in oauth.user.oauth_list) {
                var auth = oauth.user.oauth_list[ositeName];
                if (auth && auth.length > 0 && siteNames.indexOf(ositeName) < 0) {
                    siteNames.push(ositeName);
                }
            }
            localStorage['firstInstall'] = '0';
            options.config({ siteNames: siteNames });
        }

        var helper = this.getHelper(oauth.siteName);
        if (helper) {
            // :是否已经发送广播（初次连接网站时，提示）
            var recommanded = true;
            var enableRecommand = false;
            try {
                recommanded = oauthbase.recommended(oauth.siteName, oauth.user.oauth_list[oauth.siteName][0].socialId);
                enableRecommand = options.config().broadcast;
            } catch (e) { }

            // :返回session关闭页面
            if (callback) { callback({ signed: helper.signIn(oauth), recommanded: recommanded, enableRecommand: enableRecommand, siteName: oauth.siteName }) };
        }

        if (callback) { callback({ signed: false, recommanded: true }) };
        socialServer.init();
    },
    isFirstInstall: function () {
        return localStorage['firstInstall'] == '1'
    },
    getAccount: function (siteName) {
        var helper = this.getHelper(siteName);
        try {
            return helper.getAccount();
        } catch (e) {
            console.error('[SocialServer.GetAccount] siteName: ' + siteName + '(' + e.message + ')');
        }
    },
    updateAccount: function (siteName, callback) {
        var helper = this.getHelper(siteName);
        try {
            return helper.updateAccount(callback);
        } catch (e) {
            console.error('[SocialServer.UpdateAccount] siteName: ' + siteName + '(' + e.message + ')');
        }
    },
    postMessage: function (siteName, origin, message) {
        var helper = this.getHelper(siteName);
        if (helper.isLogin()) {
            return helper.publish(origin, message);
        }
        else {
            return { response: { error: { message: 'please login! then you can share to ' + siteName + '!'} }, request: {} };
        }
    },
    submitFeed: function (siteNames, origin, message) {
        for (var i = 0; i < siteNames.length; i++) {
            var siteName = siteNames[i];
            var helper = this.getHelper(siteName);
            if (helper.isLogin()) {
                var msg = helper.publish(origin, message);
            }
        }
    },
    getHelper: function (siteName) {
        return socialServer.args.socialHelpers[siteName];
    },
    getFBFansPages: function (callback) {
        if (callback) {
            callback(this.getHelper('facebook').getFansPages());
        }
    },
    getAdvertise: function () {
        return localStorage._fbAdvertise;
    }
};

var socialHelper = {
    listen: function () {
        var _self = this;
        chrome.extension.onRequest.addListener(function (request, sender, callback) {
            _self.callMethod(request, sender, callback);
        });
    },
    callMethod: function (request, sender, callback) {
        if (request.isGetUser) {
            socialServer.getUser(callback);
        }
        if (request.isUpdateUserInfo) {
            socialServer.updateUserInfo(request.userInfo, callback);
        }
        //--** 登录成功设置！ **--//
        if (request.isSignIn == true) {
            try {
                socialServer.signIn(request, callback);
                // if (callback) { callback(true); }
            } catch (e) { }
        }
        //--** 登录！ **--//
        if (request.isLoginEx == true) {
            try {
                var bag = socialServer.login(request.siteName);
                if (callback) { callback(bag); }
            } catch (ex) { }
        }
        //--** 登出！ **--//
        if (request.isLogout == true) {
            try {
                socialServer.logout(request.siteName);
                if (callback) { callback({}); }
            } catch (ex) { }
        }
        //--** 获取网站账号信息！ **--//
        if (request.isGetAccount == true) {
            var account = socialServer.getAccount(request.siteName);
            if (callback) { callback(account); }
        }
        //--** 更新账号信息，仅用于Google+**--//
        if (request.isUpdateAccount) {
            socialServer.updateAccount(request.siteName, callback);
        }
        //--** 发文！ **--//
        if (request.isPostMessage) {
            try {
                socialServer.postMessage(request.siteName, request.from, request.message);
                if (callback) { callback({}); }
            } catch (e) { }
        }
        if (request.isSubmitFeed) {
            try {
                socialServer.submitFeed(request.siteNames, request.from, request.message);
                if (callback) { callback({}); }
            } catch (e) { }
        }
        //--** 获取当然页面链接！ **--//
        if (request.isGetCurrentUrl) {
            chrome.tabs.getCurrent(function (tab) {
                if (callback) { callback(tab); }
            });
        }
        //--** 获取用户登录状态！ **--//
        if (request.isGetLoginStatus) {
            var account = socialServer.getAccount(request.siteName);
            if (callback) { callback(account.status); }
        }
        //--** 邀请好友！ **--//
        if (request.isInviteFriends) {
            window.showModalDialog('http://socialba.com/ext/facebook/invite', window, 'dialogwidth:596px;dialogheight:560px;help:0;center:yes;resizable:0;status:0;scroll:off');
            if (callback) { callback({}); }
        }
        //--** 刷新用户状态！ **--//
        if (request.isRefreshStatus) {
            socialServer.validTokenStatus(request.siteName);
            if (callback) { callback({}); }
        }
        //--** 获取版本信息！ **--//
        if (request.isGetVersion) {
            update('aamklbolfkledofgpbdllkangemkfdnb', callback);
        }
        if (request.sendWeiboUid) {
            weiboApi.userId(request.uid);
        }

        if (request.isGetOptions) {
            var options = socialServer.options();
            if (callback) { callback(options); }
        }

        if (request.isSetOptions) {
            var options = socialServer.options(request.options);
            if (callback) { callback(options); }
        }

        if (request.getFBFansPages) {
            socialServer.getFBFansPages(callback);
        }

        if (request.checkFbPermissions) {
            facebook_.checkPermissions();
        }

        if (request.isGetAdvertise) {
            var advertises = socialServer.getAdvertise();
            if (callback) {
                callback(advertises);
            }
        }

        if (request.isGetOptionPageUrl) {
            if (callback) {
                callback(data.url('panel.html'));
            }
        }
        //--** 获取最后更改时间 **--//
        if (request.isGetChangedId) {
            chrome.tabs.getSelected(function (tab) {
                if (callback) {
                    if (tab.id == sender.tab.id) {
                        callback(socialServer.options().last_time);
                    } else { callback(-1); }
                }
            });
        }
        if (request.isGetJSON) {
            if (callback) {
                $.getJSON(request.url, request.data, callback);
            }
        }
        /****************************** << Get Videos ( youtube.com/apis ) >> ******************************/
        if (request.isGetVideos) {
            socialServer.getVideos(request.options, callback);
        }
        if (request.isGetAdRight) {
            socialServer.getAdRight(function (rightAd) {
                callback(rightAd);
                // if (rightAd) {
                //     socialServer.rightAdCount('2af4912a-df76-4883-9761-375070ffaf0d', socialServer.rightAdCount('2af4912a-df76-4883-9761-375070ffaf0d') + 1);
                // }
            });
        }
        if (request.isGetAdText) {
            socialServer.getAdText(function (rightAd) {
                callback(rightAd);
                // if (rightAd) {
                //     socialServer.rightAdCount('2af4912a-df76-4883-9761-375070ffaf0d', socialServer.rightAdCount('2af4912a-df76-4883-9761-375070ffaf0d') + 1);
                // }
            });
        }
        if (request.isGetForgroundScripts) {
            if (callback) {
                callback(socialServer.forgroundScript());
            }
        }
        if (request.isAjax) {
            request.options.success = callback;
            $.ajax(request.options);
        }
        return {};
    }
};