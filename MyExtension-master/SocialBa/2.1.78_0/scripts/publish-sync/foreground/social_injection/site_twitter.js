/// <reference path="../social_helpers/siteHelper.js" />

var site_twitter = {
    urlParttens: [
        /^http[s]{0,1}:\/\/www.twitter.com\/{0,1}$/g,
        /^http[s]{0,1}:\/\/twitter.com\/{0,1}$/g,
        /^http[s]{0,1}:\/\/twitter.com\/#!\/$/g
    ],
    urlMatch: function (url) {
        for (var i in site_twitter.urlParttens) {
            if (url.match(site_twitter.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    style: '<style id="sbextcss">'
         + '    .sbtsync { float: left; margin: 0 10px 0 0; height: 1.5em; }'
         + '    .sbtsync input[type=checkbox] { margin: 0 5px 0 0; }'
         + '</style>',

    normalText: function () { return $('.home-tweet-box form textarea[name=status]'); },
    normalButton: function () { return $('.home-tweet-box form .tweet-button'); },
    normalTarget: function () { return $('.home-tweet-box form #sync_container'); },
    normalContainer: function () { return $('.home-tweet-box form'); },

    globalText: function () { return $('#global-tweet-dialog textarea[name=status]'); },
    globalButton: function () { return $('#global-tweet-dialog .tweet-button'); },
    globalTarget: function () { return $('#global-tweet-dialog #sync_container'); },
    globalContainer: function () { return $('#global-tweet-dialog'); },

    getTarget: function (isGlobal) {
        var _self = site_twitter;
        if (isGlobal && _self.globalTarget().length <= 0) {
            _self.globalContainer().find('.modal-body').append(
                  '<style>#g_circles label { display: inline; }</style>'
                + '<div id="sync_container" style="position: relative; line-height: 20px; clear: both; padding: 7px 0 1em;"></div>'
                + '<div style="clear: both;"></div>')
            .append(_self.style);

            return _self.globalTarget();
        }

        if (!isGlobal && _self.normalTarget().length <= 0) {
            _self.normalContainer().append(
                  '<style>#g_circles label { display: inline; }</style>'
                + '<div id="sync_container" style="position: relative; line-height: 20px; clear: both; padding: 7px 0 1em;"></div>'
                + '<div style="clear: both;"></div>')
            .append(_self.style);

            $('#share_ .share_more').css('padding-top', '1px');
            $('#share_ xjshares').css('width', '100%').css('margin', '5px 0 0');

            return _self.normalTarget();
        }

        return isGlobal ? _self.globalTarget() : _self.normalTarget();
    },
    getFeedBag: function (item) {
        var _self = site_twitter;

        if ($(item).parents('.home-tweet-box form').length > 0) {
            return { message: _self.normalText().val() };
        }
        if ($(item).parents('#global-tweet-dialog').length > 0) {
            return { message: _self.globalText().val() };
        }

        return { message: "" };
    },
    checkChanged: function (callback) {
        var _self = site_twitter;

        if (_self.globalContainer().length > 0 && _self.globalTarget().length <= 0) {
            callback(true, true);
        }
        if (_self.normalContainer().length > 0 && _self.normalTarget().length <= 0) {
            callback(true, false);
        }

        if (_self.globalContainer().length > 0 || _self.normalContainer().length) {
            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_twitter;

        if (_self.globalContainer().length > 0) { siteHelper.bind('twitter', _self.getTarget(true), _self); }
        if (_self.normalContainer().length > 0) { siteHelper.bind('twitter', _self.getTarget(false), _self); }

        _self.globalButton().unbind('mousedown').mousedown(function () {
            if ($(this).find('button').attr('class').indexOf('disabled') < 0) {
                var messageBag = _self.getFeedBag(_self.globalText());
                siteHelper.submitFeed(messageBag, 'twitter');
            }
        });
        _self.normalButton().unbind('mousedown').mousedown(function () {
            if ($(this).find('button').attr('class').indexOf('disabled') < 0) {
                var messageBag = _self.getFeedBag(_self.normalText());
                siteHelper.submitFeed(messageBag, 'twitter');
            }
        });
    }
};

if (site_twitter.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_twitter;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) {
                        var _self = site_twitter;
                        _self.render();
                    }
                });
            }
        } catch (e) { console.error('site_twitter.render() : ' + e.message); }
    }, 2000);
}