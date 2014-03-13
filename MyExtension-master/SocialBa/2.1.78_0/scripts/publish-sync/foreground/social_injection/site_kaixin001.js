/// <reference path="../social_helpers/siteHelper.js" />


var site_kaixin001 = {
    urlParttens: [
        /^https{0,1}:\/\/(www.)*kaixin001.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_kaixin001.urlParttens) {
            if (url.match(site_kaixin001.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#pubCnt .publishBtnBox'); },
    submitText: function () { return $('#pubCnt textarea#publishTextArea'); },
    submitButton: function () { return $('#pubCnt [rel=pubBtn]'); },

    getTarget: function () {
        if ($("#sync_container").length <= 0) {
            siteHelper.addStyle('sbcssgplus', '#sync_container table { height: 2em; } .imorse_pop_box td { height: 2em; text-align: left; } ');
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
        var _self = site_kaixin001;
        var msgBag = { message: _self.submitText().val(), links: [], pictures: [] };

        var pictureBoxs = $('#pubCnt .publishFuncPicture .publishUploadDonePic > img');
        for (var i = 0; i < pictureBoxs.length; i++) {
            var pictureUrl = pictureBoxs.eq(i).attr('src');
            if (pictureUrl) {
                pictureUrl = pictureUrl.replace('-p', '-m');
                msgBag.pictures.push(pictureUrl);
            }
        }

        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_kaixin001;

        if (this.pageTarget().length > 0) {
            if (_self.target().length <= 0) {
                if (callback) { callback(true); }
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_kaixin001;

        var target = _self.getTarget();
        siteHelper.bind('kaixin001', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_kaixin001;
        if (!_self.submitText().attr('bindpost')) {
            _self.submitText().keyup(function (event) {
                if (event.ctrlKey && event.keyCode == 13) {
                    var messageBag = _self.getFeedBag();
                    if (!messageBag.message.replace(/\s/g, '')) { return; }

                    siteHelper.submitFeed(messageBag, 'kaixin001');
                }
            });
            _self.submitText().attr('bindpost', true);
        }
        _self.submitButton().unbind('mouseup').mouseup(function () {
            var messageBag = _self.getFeedBag();
            if (!messageBag.message.replace(/\s/g, '')) { return; }

            siteHelper.submitFeed(messageBag, 'kaixin001');
        });
    }
};

if (site_kaixin001.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_kaixin001;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_kaixin001.render() : ' + e.message); }
    }, 2000);
}