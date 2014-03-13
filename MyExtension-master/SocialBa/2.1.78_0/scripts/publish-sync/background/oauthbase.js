/// <reference path="options.js" />

var oauthbase = {

    // /** :Common Mehod By SubClass Context **/

    init: function () { },
    clear: function () { },

    signIn: function (oauth_bag) {
        if (oauth_bag.user) {
            this.user(oauth_bag.user, true);
        }
        return true;
    },
    logout: function () {
        var _self = this;
        $.get(this.urls().logout, { userId: this.userId(), verify: this.userVerifyCode(), siteName: this.siteName }, function (u) {
            u = u.id ? u : JSON.parse(u);
            _self.user(u);
        });
        this.oauth({ status: false });
    },
    isLogin: function () {
        return this.oauth().status;
    },
    getAccount: function () {
        return {
            name: this.oauth().name,
            status: this.oauth().status,
            expired: this.oauth().expired,
            siteName: this.siteName
        };
    },
    expired: function (callback) {
        if (callback) { callback(this.siteName, false); }
    },

    // /** :Helper Method And Params **/

    siteName: 'super__',
    user: function (user, checked) {
        var _self = oauthbase;
        if (typeof user === 'undefined') {
            var json = localStorage['user'];
            return JSON.parse(json ? json : '{}');
        }

        _self.userId(user.id);
        _self.userVerifyCode(user.verify);
        localStorage['user'] = JSON.stringify(user);
        if (events.onUserChange) { events.onUserChange(); }

        if (checked) {
            console.log('update user & update the oauth expired.');
            for (var siteName in user.oauth_list) {
                var auth = user.oauth_list[siteName];
                for (var i in auth) {
                    var helper = socialServer.getHelper(siteName);
                    helper.expired(function (nsiteName, expired) {
                        var nhelper = socialServer.getHelper(nsiteName);
                        var oauth = nhelper.oauth();
                        oauth.expired = expired;
                        nhelper.oauth(oauth);
                    });
                }
            }
        }
    },
    userId: function (userId) {
        if (typeof userId === 'undefined') {
            return localStorage['user.id'];
        }
        localStorage['user.id'] = userId;
    },
    userVerifyCode: function (userVerifyCode) {
        if (typeof userVerifyCode === 'undefined') {
            return localStorage['user.verify_code'];
        }
        localStorage['user.verify_code'] = userVerifyCode;
    },
    log_out: function () {
        this.user({});
        this.userId('');
        this.userVerifyCode('');
    },
    oauth: function (oauth) {
        var _user = this.user();
        if (typeof _user.id == 'undefined') {
            _user = { id: '', name: '', bio: '', portraint: '', update_time: '', oauth_list: {} };
        }
        if (!_user.oauth_list) {
            _user.oauth_list = {};
        }
        if (typeof _user.oauth_list[this.siteName] == 'undefined') {
            _user.oauth_list[this.siteName] = [{ siteName: this.siteName, status: false, token: '', secret: '', socialId: '', name: '', description: '', portraint: ''}]
        }
        if (typeof oauth != 'undefined') {
            _user.oauth_list[this.siteName] = [oauth];
            this.user(_user);
        }

        var _oauth = _user.oauth_list[this.siteName];
        return _oauth ? _oauth[0] : { status: false };
    },

    // /** :Core Mehod **/

    urls: function () {
        return {
            updateUser: 'http://socialba.com/ext/apis/updateuser',
            updateUserInfo: 'http://socialba.com/ext/apis/updateuserinfo',
            logout: 'http://socialba.com/ext/apis/logout',
            saveUserOAuth: 'http://socialba.com/ext/apis/saveuseroauth',
            url: 'https://socialba.com/ext/' + this.siteName + '/oauth?v=2.0&userId=' + this.userId(),
            url2: 'https://socialba.com/ext/' + this.siteName + '/oauth?v=2.0&userId=' + this.userId() + '&redirect_uri=' + encodeURI('http://www.facebook.com/')
        }
    },
    saveUserOAuth: function (site, token, secret, callback) {
        _self = this;
        $.get(_self.urls.saveUserOAuth, {
            site: site,
            token: token,
            secret: secret,
            userId: _self.userId()
        }, function (user) {
            if (typeof user !== 'undefined' && user.id) {
                _self.user(user);
                if (callback) {
                    callback(user);
                }
            }
        });
    },
    updateUser: function () {
        var _self = this;
        $.get(_self.urls().updateUser, { userId: _self.userId(), verify: _self.userVerifyCode() }, function (user) {
            user = user.id ? user : JSON.parse(user);
            _self.user(user, true);
        });
    },
    updateUserInfo: function (userInfo, callback) {
        var _self = this;
        $.get(_self.urls().updateUserInfo, {
            userId: _self.userId(),
            verify: _self.userVerifyCode(),
            name: userInfo.name,
            bio: userInfo.bio,
            portrait: userInfo.portrait
        }, function (user) {
            user = user.id ? user : JSON.parse(user);

            _self.user(user);
            if (callback) { callback(user); }
        });
    },
    recommended: function (siteName, id) {
        if (!localStorage.recommended) {
            localStorage.recommended = '{}';
        }

        var recommended = JSON.parse(localStorage.recommended);
        if (!recommended[siteName]) {
            recommended[siteName] = {};
        }
        if (!recommended[siteName][id]) {
            recommended[siteName][id] = true;
            localStorage.recommended = JSON.stringify(recommended);
            return false;
        }

        return true;
    }
}

var events = {

    // /** :Event Method **/

    onUserChange: function () { options.last_time(new Date()); }

}