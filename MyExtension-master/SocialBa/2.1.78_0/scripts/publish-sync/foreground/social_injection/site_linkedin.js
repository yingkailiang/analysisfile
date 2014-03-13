/// <reference path="../social_helpers/siteHelper.js" />

var site_linkedin = {
    urlParttens: [
        /^http[s]{0,1}:\/\/www.linkedin.com\/{0,1}/g,
        /^http[s]{0,1}:\/\/linkedin.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_linkedin.urlParttens) {
            if (url.match(site_linkedin.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#slick-sharing-cont [name="postModuleForm"]'); },

    getTarget: function () {
        var _self = site_linkedin;

        if ($("#sync_container").length <= 0) {
            siteHelper.addStyle('saLinkedinStyle', '#saSiteCheckBoxCenter { padding: 5px; } #saNoticeAdCnter { border-top: 1px solid #B4BBCD; }');
            siteHelper.addStyle('sbcssgplus', '#sync_container table td { vertical-align: middle; } #sync_container table.sbtsync { height: 2em; } .imorse_pop_box td { height: 2em; text-align: left; font-size: 12px; } ');
            _self.pageTarget().css({ 'overflow': 'auto' });
            _self.pageTarget().append('<div id="sync_container" style="margin-bottom: 10px; background: white; border: 1px solid #ccc;"></div>');
        }
        return $("#sync_container");
    },
    getFeedBag: function () {
        return { message: $("textarea#postText-postModuleForm").eq(0).val() };
    },
    checkChanged: function (callback) {
        var _self = site_linkedin;

        if (this.pageTarget().length > 0) {
            if (this.target().length <= 0) {
                callback(true);
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        console.log('<< site_linkedin.render >> has been invoked~!');

        var _self = site_linkedin;

        var target = _self.getTarget();
        siteHelper.bind('linkedin', target, _self);

        $('input#share-submit').unbind('click').click(function () {
            var messageBag = _self.getFeedBag();
            siteHelper.submitFeed(messageBag, 'linkedin');
        });
    }
};

if (site_linkedin.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_linkedin;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_linkedin.render() : ' + e.message); }
    }, 2000);
}