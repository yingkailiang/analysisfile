/// <reference path="../social_helpers/siteHelper.js" />


var site_renren = {
    urlParttens: [
        /^https{0,1}:\/\/\w*\.renren.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_renren.urlParttens) {
            if (url.match(site_renren.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#global-publisher-status .global-publisher-footer'); },
    submitText: function () { return $('#global-publisher-status .status-textarea textarea.status-content'); },
    submitButton: function () { return $('#global-publisher-status .global-publisher-actions .submit'); },

    getTarget: function () {
        if ($("#sync_container").length <= 0) {
            this.pageTarget().append(
                '<div style="padding: 0 10px 10px; clear: both">'
              + '    <div style="background: white; border: 1px solid #ccc; padding: 5px; clear: both">'
              + '        <span id="sync_container"></span>'
              + '        <div style="clear: both"></div>'
              + '    </div>'
              + '</div>');
        }

        return $("#sync_container");
    },
    getFeedBag: function () {
        var _self = site_renren;
        var msgBag = { links: [], pictures: [] };
        msgBag['message'] = _self.submitText().val();

        // Share Pictures...
        var pictureBoxs = $('#global-publisher-status #global-publisher-photo-box .photo-info [name="largeUrl"]');
        for (var i = 0; i < pictureBoxs.length; i++) {
            var pictureUrl = pictureBoxs.eq(i).val();
            if (pictureUrl) {
                msgBag.pictures.push(pictureUrl);
            }
        }

        // Share Links...
        var linkBoxs = $('#global-publisher-share-box .input-comment-box');
        if (linkBoxs.length > 0) {
            var nothumb = $('[name=nothumb]').val() == 'on';
            msgBag.links.push({
                url: linkBoxs.find('[name=url]').val(),
                title: linkBoxs.find('[name=title]').val(),
                content: linkBoxs.find('[name=summary]').val(),
                picture: nothumb ? null : linkBoxs.find('[name=thumbUrl]').val()
            });
        }

        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_renren;

        if (this.pageTarget().length > 0) {
            if (_self.target().length <= 0) {
                if (callback) { callback(true); }
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_renren;

        var target = _self.getTarget();
        siteHelper.bind('renren', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_renren;
        if (!_self.submitText().attr('bindpost')) {
            _self.submitText().keyup(function (event) {
                if (event.ctrlKey && event.keyCode == 13) {
                    var messageBag = _self.getFeedBag();
                    if (!messageBag.message.replace(/\s/g, '')) { return; }

                    siteHelper.submitFeed(messageBag, 'renren');
                }
            });
            _self.submitText().attr('bindpost', true);
        }
        _self.submitButton().unbind('mouseup').mouseup(function () {
            var messageBag = _self.getFeedBag();
            if (!messageBag.message.replace(/\s/g, '')) { return; }

            siteHelper.submitFeed(messageBag, 'renren');
        });
    }
};

if (site_renren.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_renren;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_renren.render() : ' + e.message); }
    }, 2000);
}