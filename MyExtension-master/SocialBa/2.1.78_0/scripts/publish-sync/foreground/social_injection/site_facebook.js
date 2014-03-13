/// <reference path="../../jquery-1.4.1.min.js" />
/// <reference path="../../../common.js" />
/// <reference path="../social_helpers/siteHelper.js" />

var cookieHelper = {
    setCookie: function (name, value) {
        var Days = 90;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
    },
    getCookie: function (name) {
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) return unescape(arr[2]); return null;
    },
    delCookie: function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = cookie.getCookie(name);
        if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }
}

var site_facebook = {
    urlParttens: [
        /http[s]{0,1}:\/\/[^\.]*.facebook.com/g
    ],
    urlMatch: function (url) {
        for (var i in site_facebook.urlParttens) {
            if (url.match(site_facebook.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    editor: function () {
        return $('[name=xhpc_message_text]');
    },
    target: function () { return $('#sync_container:visible'); },
    pageTarget: function () {
        var target = $('[action*="/ajax/updatestatus.php"]:visible > div:visible:first');
        if (target.length <= 0) {
            target = $('[action*="/ajax/profile/composer.php"]:visible > div:visible:first');
        }
        if (target.length <= 0) {
            target = $('form[action*="media/upload/photos/composer/"] > div:visible:first');
        }

        return target;
    },

    checked: function () {
        if (this.pageTarget().length > 0) {
            if (this.target().length <= 0 || this.target().children().length <= 0) {
                $('[sb="center"]').remove();
                return true;
            }
        }

        return false;
    },

    getTarget: function () {
        var _self = site_facebook;

        if (this.target().length <= 0) {
            var container = this.pageTarget();
            if (container.length > 0) {
                container.append(
                      '<div id="sync_cnter" sb="center" style="border-top: 1px solid #B4BBCD;">'
                    + '    <div style="clear: both;" id="sync_container"></div>'
                    + '    <div style="clear: both;"></div>'
                    + '</div>');

                siteHelper.addStyle('saFacebookStyle', '#saSiteCheckBoxCenter { padding: 5px; } #saNoticeAdCnter { border-top: 1px solid #B4BBCD; }');
                socialClient.getOptions(function (options) {
                    var textAd = options.advertise.text;
                    if (textAd.enable && textAd.text) {
                        siteHelper.addStyle('ps_weibo',
                          '#sync_videos { padding: 0px 7px 5px; }'
                        + '#ps_changevideo { position: relative; }');

                        $('#sync_videos_cnter').append(textAd.text);
                    }
                });
            }
        }

        return _self.target();
    },
    getFeedBag: function () {
        var msgBag = { message: '', links: [], pictures: [] };

        // Share Message
        var textArea = $('[name=xhpc_message_text]');
        if (textArea.css('color') != 'rgb(119, 119, 119)') {
            msgBag.message = textArea.val();
        }

        // Share Links
        var form = textArea.parents('form');
        var link = form.find('[name="attachment[params][url]"]');
        if (link.length > 0) {
            msgBag.links.push({
                url: form.find('[name="attachment[params][url]"]').val(),
                title: form.find('[name="attachment[params][title]"]').val(),
                content: form.find('[name="attachment[params][summary]"]').val(),
                favicon: form.find('[name="attachment[params][favicon]"]').val(),
                picture: form.find('.UIShareStage_Image img:visible').eq(0).attr('src')
            });
        }

        // Share Pictures
        var pictureBoxs = form.find('.fbVaultGridItem img:visible');
        for (var i = 0; i < pictureBoxs.length; i++) {
            var pictureUrl = pictureBoxs.eq(i).attr('src');
            pictureUrl = pictureUrl.replace(/\w\d*x\d*\//g, '').replace(/_\w\./g, '_n.');
            msgBag.pictures.push(pictureUrl);
        }

        return msgBag;
    },
    checkChanged: function (callback) {
        var _self = site_facebook;

        if (this.pageTarget().length > 0) {
            if (this.checked()) {
                if (callback) callback(true);
            }

            socialClient.checkChanged(callback);
        }
    },
    render: function () {
        console.log('Facebook render. ( SocialBa! ).');

        var _self = site_facebook;
        _self.setMaxLength();
        $('[sb="center"]:hidden').remove();
        var target = _self.getTarget();
        siteHelper.bind('facebook', target, _self);

        _self.bindPostEvent();
    },
    addCountInfo: function () {
        var _self = site_facebook;

        var showDivSelector = '#enterMessageCount';
        var editableSelector = '[name=xhpc_message_text]';
        if (!_self.showDiv || !_self.showDiv.offset() || _self.showDiv.offset().top == 0) {
            $('ul.uiList.uiComposerAttachments').append(
                 '<li class="attachmentLoader plm uiListItem  uiListHorizontalItemBorder uiListHorizontalItem">'
               + '    <div id="enterMessageCount" style="float: right;"></div>'
               + '</li>'
            );
            _self.showDiv = $(showDivSelector);
        }
        if ($(editableSelector).length <= 0) { return; }
        else if (!$(editableSelector).attr('bind-enter-count')) {
            $(editableSelector).keyup(function () {
                _self.setMaxLength();
            });
            $(editableSelector).attr('bind-enter-count', 'true');
        }

        $(showDivSelector).text(_self.maxLength > 0 ? (_self.maxLength - $(editableSelector).val().length) : '');
    },
    setMaxLength: function () {
        var _self = site_facebook;
        _self.maxLength = 0;

        for (var siteName in socialClient.charLimited) {
            if (typeof socialClient.charLimited[siteName] != undefined
                && $('#c_' + siteName).attr('checked')) {
                var siteCount = socialClient.charLimited[siteName];
                if (_self.maxLength <= 0) { _self.maxLength = siteCount; }
                else if (siteCount > 0) { _self.maxLength = _self.maxLength < siteCount ? _self.maxLength : siteCount; }
            }
        }

        _self.addCountInfo();
    },
    bindPostEvent: function () {
        var _self = site_facebook;
        if (!_self.getTarget()) { return; }

        var share_submit = _self.getTarget().parent().parent().find("[type=submit]");
        share_submit.unbind('mouseup');
        share_submit.mouseup(function () {
            $('#publish_sync_ad_show').attr('checked', false);

            var msgBag = _self.getFeedBag();

            if (msgBag.link == '' && msgBag.message == '' && msgBag.picture == '') {
                return;
            }

            siteHelper.submitFeed(msgBag, 'facebook');
        });
    }
};

if (site_facebook.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_facebook;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                $('#sync_cnter:hidden').remove();
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_facebook.render() : ' + e.message); }
    }, 2000);
}
