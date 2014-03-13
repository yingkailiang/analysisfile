/// <reference path="../oauthbase.js" />
/// <reference path="../../../common.js" />

var facebook_ = inherit(oauthbase, 'facebook', {
    // << Data I/O >>
    data: function (cdata) {
        var socialId = this.oauth().socialId;
        if (!socialId) { return {}; }

        var data = localStorage['facebook.data'];
        if (!data) { data = { socialId: this.oauth().socialId }; }
        else { data = JSON.parse(data); }

        if (data.socialId != socialId) {
            delete data.pages;
            delete data.friendLists;

            data.socialId = socialId;
            localStorage['facebook.data'] = JSON.stringify(data);
        }

        if (typeof cdata == 'undefined') {
            return data;
        }

        if (cdata.pages) { data.pages = cdata.pages; }
        if (cdata.friendLists) { data.friendLists = cdata.friendLists; }
        localStorage['facebook.data'] = JSON.stringify(data);
    },
    URL: {
        graph: "https://graph.facebook.com/",
        api: "https://api.facebook.com/restserver.php"
    },

    // << Core Method... >>
    init: function () {
        var _self = facebook_;

        if (!_self.isLogin()) {
            _self.clear();
        }
        else if (!_self.updateFansPagesInterval) {
            try { _self.updateFansPages(); } catch (ex) { }
            try { _self.updateFriendLists(); } catch (ex) { }

            _self.updateFansPagesInterval = setInterval(function () {
                try { _self.updateFansPages(); } catch (ex) { }
                try { _self.updateFriendLists(); } catch (ex) { }
            }, 30000);
        }
    },
    clear: function () {
        var _self = facebook_;

        if (_self.updateFansPagesInterval) {
            try {
                clearInterval(_self.updateFansPagesInterval);
                _self.updateFansPagesInterval = null;
            } catch (ex) { }
        }

        delete localStorage['facebook.data'];
        delete localStorage['facebook.pages'];
        delete localStorage['facebook.friendLists'];
        delete localStorage['facebook.permissions.manage_pages'];
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
    getAccount: function () {
        return {
            name: this.oauth().name,
            status: this.oauth().status,
            expired: this.oauth().expired,
            siteName: this.siteName,
            fansPages: this.data().pages,
            friendLists: this.data().friendLists
        };
    },
    publish: function (origin, msg) {
        try {
            var _self = facebook_;
            var params = this.getParams(origin, msg);

            if (_self.checkMessage(params)) {
                _self.api("me/feed/", params, function (res) {
                    if (res && res.error) {
                        console.log(res.error.message + '( facebook )');
                    } else { }
                });

                if (msg.facebook && msg.facebook.fanspageIds) {
                    delete params.privacy;

                    var pages = this.data().pages;
                    var fanspageIds = msg.facebook.fanspageIds;
                    for (var i in fanspageIds) {
                        for (var k in pages) {
                            var page = pages[k];

                            if (page.id == fanspageIds[i]) {
                                var url = _self.URL.graph + page.id + '/feed/?access_token=' + page.access_token;
                                $.getJSON(url, params, function (res) { });
                            }
                        }
                    }
                }
            }
        } catch (e) { console.error('<< facebook_.publish >> error occored: ' + e.message); }
    },
    expired: function (callback) {
        var _self = facebook_;
        _self.api("/me", {}, function (res, failed) {
            try {
                if (typeof failed != 'undefined' && JSON.parse(res).error.code == 190) {
                    callback(_self.siteName, true);
                    return;
                }
            } catch (e) { };

            callback(_self.siteName, false);
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
    updateFansPages: function () {
        var _self = facebook_;

        // When the pages is not null or undefined for
        // current user, not get the fans page.
        var pages = _self.data().pages;
        if (typeof pages != 'undefined' && pages) { return; }

        // Get fans page & groups page by facebook api.
        _self.api('me/accounts', {}, function (fanPages) {
            _self.api('me/groups', {}, function (groupsPages) {
                var pages = [];
                if (fanPages && fanPages.data && fanPages.data.length > 0) {
                    for (var i in fanPages.data) {
                        var fanPage = fanPages.data[i];
                        pages.push({
                            name: fanPage.name,
                            id: fanPage.id,
                            access_token: fanPage.access_token
                        });
                    }
                }
                if (groupsPages && groupsPages.data && groupsPages.data.length > 0) {
                    for (var i in groupsPages.data) {
                        var groupsPage = groupsPages.data[i];
                        if (groupsPage.administrator) {
                            pages.push({
                                name: groupsPage.name,
                                id: groupsPage.id,
                                access_token: _self.token(),
                                is_groups: true
                            });
                        }
                    }
                }

                _self.data({ pages: pages });
            });
        });
    },
    updateFriendLists: function () {
        var _self = facebook_;

        // When the pages is not null or undefined for
        // current user, not get the fans page.
        var friendLists = _self.data().friendLists;
        if (typeof friendLists != 'undefined' && friendLists) { return; }

        // Get fans page & groups page by facebook api.
        _self.api('me/friendLists', {}, function (response) {
            var friendLists = [];
            if (response && response.data && response.data.length > 0) {
                for (var i in response.data) {
                    var friendList = response.data[i];
                    friendLists.push({
                        id: friendList.id,
                        name: friendList.name
                    });
                }
            }

            _self.data({ friendLists: friendLists });
        });

    },
    checkPermissions: function () {
        var _self = facebook_;

        if (!localStorage['facebook.permissions.manage_pages']) {
            _self.api('me/permissions', {}, function (res) {
                try {
                    if (!res || !res.data[0].manage_pages) {
                        _self.login();
                    }
                    else {
                        localStorage['facebook.permissions.manage_pages'] = "true";
                    }
                } catch (e) { }
            });
        }
    },
    UTC: function (now) {
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    },
    api: function (method, params, callback) {
        if (this.isLogin()) {
            callback = callback ? callback : function () { };
            $.getJSON('https://graph.facebook.com/' + method + '?&access_token=' + this.oauth().token, params, callback).fail(function (r) {
                callback(r.responseText, true);
            });
        }
    },
    getParams: function (origin, msgBag) {
        var params = {};

        var message = msgBag.message;
        switch (origin) {
            case 'gplus':
                message = message.replace(/<\/div>\s*<div>/g, '\n').replace(/<br>/g, '\n');
                message = message.replace(/<[^<>]*>/g, '');
                message = message.trimLeft();
                break;
            default: break;
        }

        var privacy = (msgBag.facebook && msgBag.facebook.privacy) ? msgBag.facebook.privacy : 'EVERYONE';
        if (privacy == 'CUSTOM') {
            var friendListIds = msgBag.facebook.friendListIds;
            privacy = '{"value":"CUSTOM","allow":"' + friendListIds.join(',') + '"}';
        } else {
            privacy = '{"value":"' + privacy + '"}';
        }

        params['message'] = message;
        params['privacy'] = privacy;

        if (msgBag.links && msgBag.links.length > 0) {
            var link = msgBag.links[0];
            params['link'] = link.url;
            params['name'] = link.title;
            params['description'] = link.content;
            if (link.picture) {
                params['picture'] = link.picture;
            }
        }

        else if (msgBag.pictures && msgBag.pictures.length > 0) {
            params['picture'] = msgBag.pictures[0];
        }

        params['method'] = "post";
        if (!params.picture) {
            delete params.picture;
        }

        return params;
    }
});