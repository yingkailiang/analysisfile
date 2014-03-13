/// <reference path="../social_helpers/siteHelper.js" />


var site_qzone = {
    urlParttens: [
        /^https{0,1}:\/\/(\w*\.)*qzone.qq.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_qzone.urlParttens) {
            if (url.match(site_qzone.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#QM_Mood_Poster_Container'); },
    submitText: function () { return $('#QM_Mood_Poster_Container .textinput.textarea'); },
    submitButton: function () { return $('#QM_Mood_Poster_Container button.btn.gb_bt'); },

    getTarget: function () {
        if ($("#sync_container").length <= 0) {
            this.pageTarget().css({ 'height': 'auto' }).append(
                '<div style="padding: 5px 10px 10px; clear: both">'
              + '    <div style="background: white; border: 1px solid #ccc; padding: 5px; clear: both">'
              + '        <span id="sync_container"></span>'
              + '        <div style="clear: both"></div>'
              + '    </div>'
              + '</div>');
        }

        return $("#sync_container");
    },
    getFeedBag: function () {
        var _self = site_qzone;
        var msgBag = { message: _self.submitText().text(), pictures: [], links: [] };

        // Share Pictures...
        var pictureBoxs = _self.pageTarget().find('.qz_poster_status .mu_items_list img');
        for (var i = 0; i < pictureBoxs.length; i++) {
            var pictureUrl = pictureBoxs.eq(i).attr('src');
            pictureUrl = pictureUrl.replace(/^.*\?/g, 'http://a.qpic.cn/psb?');
            pictureUrl = pictureUrl.replace('/a/', '/b/');
            msgBag.pictures.push(pictureUrl);
        }

        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_qzone;

        if (this.pageTarget().length > 0) {
            if (_self.target().length <= 0) {
                if (callback) { callback(true); }
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_qzone;

        var target = _self.getTarget();
        siteHelper.bind('qzone', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_qzone;
        _self.submitText().unbind('keyup').keyup(function (event) {
            if (event.ctrlKey && event.keyCode == 13) {
                var messageBag = _self.getFeedBag();
                if (!messageBag.message.replace(/\s/g, '')) { return; }

                siteHelper.submitFeed(messageBag, 'qzone');
            }
        });

        _self.submitButton().unbind('mouseup').mouseup(function () {
            var messageBag = _self.getFeedBag();
            if (!messageBag.message.replace(/\s/g, '')) { return; }

            siteHelper.submitFeed(messageBag, 'qzone');
        });
    }
};

if (site_qzone.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_qzone;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_qzone.render() : ' + e.message); }
    }, 2000);
}