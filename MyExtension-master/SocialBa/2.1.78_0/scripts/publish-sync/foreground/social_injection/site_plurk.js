/// <reference path="../../../jquery-1.7.2.min.js" />

var site_plurk = {
    urlParttens: [
        /^https{0,1}:\/\/www.plurk.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_plurk.urlParttens) {
            if (url.match(site_plurk.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#main_poster td.icon_holder .icons_holder'); },

    getTarget: function () {
        var _self = site_plurk;
        if ($("#sync_container").length <= 0) {
            siteHelper.addStyle('saPlurkStyle', '#saSiteCheckBoxCenter { padding: 5px; } #saNoticeAdCnter { border-top: 1px solid #B4BBCD; }');
            siteHelper.addStyle('sbcssgplus', '.sync_container { background: white; border: 1px solid #ccc; color: black; padding: 5px; clear: both; } .sync_container table { margin: 0; } #sync_container td { vertical-align: middle!important; } #sync_container table.sbtsync { height: 2em; float: left; width: auto; margin-right: 5px; } #sync_container table img { margin: 0; } .imorse_pop_box td { height: 2em; text-align: left; font-size: 12px; color: #333; } ');
            _self.pageTarget().css({ 'position': 'relative', 'overflow': 'initial' });
            _self.pageTarget().append($('<div class="sync_container"><div id="sync_container"></div><div style="clear: both;"></div></div>'));
        }
        return $("#sync_container");
    },
    getFeedBag: function () {
        var msgBag = { links: [], pictures: [] };

        // Share Message
        msgBag['message'] = $("#input_big").val();

        // Share Pictures...
        var pictureBoxs = $('#preview .meta img');
        for (var i = 0; i < pictureBoxs.length; i++) {
            var pictureUrl = pictureBoxs.eq(i).attr('src');
            if (pictureUrl) {
                msgBag.pictures.push(pictureUrl);
            }
        }
        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_plurk;

        if (this.pageTarget().length > 0) {
            if (_self.target().length <= 0) {
                if (callback) { callback(true); }
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_plurk;

        var target = _self.getTarget();
        siteHelper.bind('plurk', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_plurk;

        var share_input = $("#input_big");
        var share_submit = $('#main_poster .click.submit_img.cmp_plurk');

        share_submit.unbind('mouseup').mouseup(function () {
            siteHelper.submitFeed(_self.getFeedBag(), 'plurk');
        });

        if (!share_input.attr('syncbind')) {
            share_input.keydown(function (event) {
                if (event.keyCode == 13 && !event.shiftKey) {
                    siteHelper.submitFeed(_self.getFeedBag(), 'plurk');
                }
            });
            share_input.attr('syncbind', 1);
        }
    }
};

if (site_plurk.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_plurk;

        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) {
                        _self.render();
                    }
                });
            }
        } catch (e) { console.error('site_plurk.render() : ' + e.message); }
    }, 2000);
}