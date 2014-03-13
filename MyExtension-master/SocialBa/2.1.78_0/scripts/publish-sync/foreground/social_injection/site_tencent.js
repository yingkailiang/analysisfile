/// <reference path="../social_helpers/siteHelper.js" />


var site_tencent = {
    urlParttens: [
        /^https{0,1}:\/\/t.qq.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_tencent.urlParttens) {
            if (url.match(site_tencent.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#talkBox'); },

    getTarget: function () {
        if ($("#sync_container").length <= 0) {
            this.pageTarget().append('<div class="sync_container"><div id="sync_container"></div><div style="clear: both;"></div></div>');

            siteHelper.addStyle('saTWeiboStyle', '#saSiteCheckBoxCenter { padding: 5px; } #saNoticeAdCnter { border-top: 1px solid #B4BBCD; }');
            siteHelper.addStyle('ps_weibo',
                      '.sync_container { margin: 10px 0; }'
                    + '.sync_container { border: 1px solid #ccc; background: white; margin: 10px 0 0; }'
                    + '.sync_container table.sbtsync input { margin: 0 5px 0 0; }'
                    + '.talkBox { padding-bottom: 0; }');
        }

        return $("#sync_container");
    },
    getFeedBag: function () {
        var msgBag = { links: [], pictures: [] };

        // Share Message...
        msgBag['message'] = $("#msgTxt").eq(0).val();

        // Share Pictures...
        var pictureBoxs = $('.sendStatus .uploadPicS .preview img');
        for (var i = 0; i < pictureBoxs.length; i++) {
            var pictureUrl = pictureBoxs.eq(i).attr('src');
            if (pictureUrl) {
                pictureUrl = pictureUrl.replace('/160', '/2000');
                msgBag.pictures.push(pictureUrl);
            }
        }

        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_tencent;

        if (this.pageTarget().length > 0) {
            if (_self.target().length <= 0) {
                if (callback) { callback(true); }
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_tencent;

        var target = _self.getTarget();
        siteHelper.bind('tencent', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_tencent;
        if (!$("#msgTxt").attr('bindpost')) {
            $("#msgTxt").keyup(function (event) {
                if (event.ctrlKey && event.keyCode == 13) {
                    var messageBag = _self.getFeedBag();
                    if (!messageBag.message.replace(/\s/g, '')) { return; }

                    siteHelper.submitFeed(messageBag, 'tencent');
                }
            });
            $("#msgTxt").attr('bindpost', true);
        }
        $('.sendBtn.btnHasStr').unbind('mouseup').mouseup(function () {
            var messageBag = _self.getFeedBag();
            if (!messageBag.message.replace(/\s/g, '')) { return; }

            siteHelper.submitFeed(messageBag, 'tencent');
        });
    }
};

if (site_tencent.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_tencent;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_tencent.render() : ' + e.message); }
    }, 2000);
}