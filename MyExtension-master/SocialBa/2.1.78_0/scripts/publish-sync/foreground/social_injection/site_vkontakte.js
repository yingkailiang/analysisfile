/// <reference path="../social_helpers/siteHelper.js" />


var site_vkontakte = {
    urlParttens: [
        /^https{0,1}:\/\/vk.com\/{0,1}/g
    ],
    urlMatch: function (url) {
        for (var i in site_vkontakte.urlParttens) {
            if (url.match(site_vkontakte.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    target: function () { return $('#sync_container'); },
    pageTarget: function () { return $('#submit_post_box'); },

    getTarget: function () {
        if ($("#sync_container").length <= 0) {
            siteHelper.addStyle('sbcssgplus', '#sync_container table td { vertical-align: middle; } #sync_container table.sbtsync { height: 1.8em; float: left; width: auto; margin-top: 0; } #sync_container table img { margin: 0; } .imorse_pop_box td { text-align: left; color: #333; } ');
            this.pageTarget().append(
                '<div style="padding: 10px 0 0; clear: both">'
              + '    <div style="background: white; border: 1px solid #ccc; clear: both; padding: 5px 10px 0;">'
              + '        <span id="sync_container"></span>'
              + '        <div style="clear: both"></div>'
              + '    </div>'
              + '</div>');
        }

        return $("#sync_container");
    },
    getFeedBag: function () {
        var msgBag = {};

        // Share Text ...

        msgBag['message'] = $("#submit_post_box #post_field").eq(0).val();

        // Share Links ...

        msgBag['links'] = [];
        var linkBox = $('#submit_post_box .medadd_c.medadd_c_link');
        if (linkBox.length > 0) {
            msgBag['links'].push({
                url: decodeURIComponent($('a.medadd_h_link').attr('href')).replace('/away.php?to=', ''),
                title: linkBox.find('h4.medadd_c_linkhead').text(),
                content: linkBox.find('div.medadd_c_linkdsc').text(),
                picture: linkBox.find('img.medadd_c_linkimg').attr('src')
            });
        }

        // Share Photos ...

        msgBag['pictures'] = [];
        var pictureBoxs = $('#submit_post_box #media_preview img.page_preview_photo');
        for (var i = 0; i < pictureBoxs.length; i++) {
            msgBag['pictures'].push(this.getOriginUrl(pictureBoxs.eq(i)));
        }

        return msgBag;
    },
    getOriginUrl: function (pictureBox) {
        try {
            var div = pictureBox.parent();
            var xhr = new XMLHttpRequest();
            xhr.open('post', 'http://vk.com/al_photos.php', false);

            var content = 'act=show&al=1&list=' + div.attr('onclick').toString().match(/ '.*?'/g)[0].replace(/ |'/g, '')
            + '&module=profile'
            + '&photo=' + div.attr('onclick').toString().match(/\('.*?'/g)[0].replace(/\(|'/g, '');

            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(content);

            return JSON.parse(xhr.responseText.match(/<\!json>(.*)<\!><\!json>/g)[0].replace(/(<\!>)|(<\!json>)/g, ''))[0].x_src;
        } catch (ex) { }
        return pictureBox.attr('src');
    },
    checkChanged: function (callback) {
        var _self = site_vkontakte;

        if (this.pageTarget().length > 0) {
            if (_self.target().length <= 0) {
                if (callback) { callback(true); }
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        var _self = site_vkontakte;

        var target = _self.getTarget();
        siteHelper.bind('vkontakte', target, _self);

        _self.bindPostEvent();
    },
    bindPostEvent: function () {
        var _self = site_vkontakte;
        if (!$("#submit_post_box #post_field").attr('bindpost')) {
            $("#submit_post_box #post_field").keyup(function (event) {
                if (event.ctrlKey && event.keyCode == 13) {
                    var messageBag = _self.getFeedBag();
                    if (!messageBag.message.replace(/\s/g, '')) { return; }

                    siteHelper.submitFeed(messageBag, 'vkontakte');
                }
            });
            $("#submit_post_box #post_field").attr('bindpost', true);
        }
        $('#submit_post_box #send_post').unbind('mouseup').mouseup(function () {
            var messageBag = _self.getFeedBag();
            if (!messageBag.message.replace(/\s/g, '')) { return; }

            siteHelper.submitFeed(messageBag, 'vkontakte');
        });
    }
};

if (site_vkontakte.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_vkontakte;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_vkontakte.render() : ' + e.message); }
    }, 2000);
}