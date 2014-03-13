/// <reference path="../social_helpers/siteHelper.js" />

/*------------------------------- << 当前页面是否为目标页面 >> -------------------------------*/


/*------------------------------------ << 代码（以下） >> ------------------------------------*/

var site_weibo = {
    // << 必要属性 >> //
    editor: function () {
        return $("#publish_editor").length > 0 ? $("#publish_editor") : $('#pl_content_publisherTop textarea');
    },
    publishBtn: function () {
        return $('#publisher_submit').length > 0 ? $('#publisher_submit') : $('[node-type="publishBtn"]');
    },

    urlPartterns: [
        "http://weibo.com",
        "https://weibo.com",
        "http://www.weibo.com",
        "https://www.weibo.com",
    ],
    urlMatch: function (url) {
        for (var i in this.urlPartterns) {
            if (url.indexOf(this.urlPartterns[i]) > -1) return true;
        }

        return false;
    },
    validated: function () {
        var _self = site_weibo;
        return _self.editor().length > 0;
    },
    getTarget: function () {
        var _self = site_weibo;

        if ($("#sync_container").length <= 0) {
            var cnter = $('.connBg').length > 0 ? $('.connBg') : $('#pl_content_publisherTop');
            siteHelper.addStyle('sbcssgplus', '.imorse_pop_box td { padding: 2px 0; text-align: left; font-size: 12px; } ');
            if (cnter.length > 0) {
                cnter.append(
                    '<div id="sync_cnter">'
                  + '    <div id="sync_container"></div>'
                  + '    <div id="sync_videos_cnter"></div>'
                  + '    <div style="clear: both;"></div>'
                  + '</div>'
                );

                siteHelper.addStyle('saWeiboStyle', '#saSiteCheckBoxCenter { padding: 5px; } #saNoticeAdCnter { border-top: 1px solid #B4BBCD; }');
                siteHelper.addStyle('ps_weibo',
                      '#sync_cnter { display: block; margin: 0 20px; border: 1px solid #ccc; background: white; }'
                    + '#sync_cnter table.sbtsync input { margin: 0 5px 0 0; }');
            }
        }
        return $("#sync_container");
    },
    getFeedBag: function () {
        var _self = site_weibo;
        var msgBag = { links: [], pictures: [] };

        // Share Message...
        msgBag['message'] = _self.editor().val();

        // Share Picture...
        var picture = $('.layer_send_pic .laPic_Pic img').attr('src');
        if (picture) { msgBag.pictures.push(picture.replace('small', 'large')); }

        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_weibo;

        if ($('#sync_container').length <= 0) {
            var cnter = $('.connBg').length > 0 ? $('.connBg') : $('#pl_content_publisherTop');
            if (cnter.length > 0) {
                if (callback) { callback(true); }
            }
        }

        socialClient.checkChanged(callback);
    },
    render: function () {
        var _self = site_weibo;
        if (!_self.validated()) return;

        var target = _self.getTarget();
        siteHelper.bind('weibo', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_weibo;

        if (!_self.editor().attr('bindpost')) {
            _self.editor().keyup(function (event) {
                if (event.ctrlKey && event.keyCode == 13) {
                    var messageBag = _self.getFeedBag();
                    if (!messageBag.message.replace(/\s/g, '')) { return; }

                    siteHelper.submitFeed(messageBag, 'weibo');
                }
            });
            _self.editor().attr('bindpost', true);
        }
        _self.publishBtn().unbind('mouseup').mouseup(function () {
            var messageBag = _self.getFeedBag();
            if (!messageBag.message.replace(/\s/g, '')) { return; }

            siteHelper.submitFeed(messageBag, 'weibo');
        });
    }
};

if (site_weibo.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_weibo;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_weibo.render() : ' + e.message); }
    }, 2000);
}
