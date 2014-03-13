/// <reference path="../../common.js" />
/// <reference path="video.youtube.js" />

var siteHelper = {
    // << 辅助方法： >>
    addStyle: function (id, css) {
        if ($('#' + id).length == 0) {
            $(document.body).append('<style id=' + id + '>' + css + '</style>');
        }
    },

    normalCss:
           '.sbtsync { float: left; margin: 0 10px 0 0; height: 1.8em; }'
         + '.sbtsync label { font-weight: normal; color: #000; }'
         + '.sbtsync input[type=checkbox] { margin: 0 5px 0 0; }',

    // << 同步讯息： >>
    submitFeed: function (messageBags, originSiteName) {
        var _self = siteHelper;

        switch (originSiteName) {
            case 'gplus':
                messageBags.message = messageBags.message.replace(/<\/div>\s*<div>/g, '\r\n').replace(/<br>/g, '\r\n');
                messageBags.message = messageBags.message.replace(/<[^<>]*>/g, '');
                messageBags.message = $('<div></div>').html(messageBags.message).text();
                break;
            default: break;
        }

        messageBags.facebook = {
            privacy: siteFacebookHelper.privacyId(),
            fanspageIds: siteFacebookHelper.fanspageIds(),
            friendListIds: siteFacebookHelper.friendListIds()
        }

        messageBags.gplus = {
            ranges: siteGplusHelper.circles()
        }

        socialClient.getOptions(function (options) {
            var siteNames = [];
            for (var i in options.siteNames) {
                var siteName = options.siteNames[i];
                if ($('[site=' + siteName + '] :checkbox').attr('checked')) {
                    siteNames.push(siteName);
                }
            }

            if (siteNames.length > 0) {
                socialClient.submitFeed(siteNames, {
                    from: originSiteName,
                    message: messageBags
                }, function (res) {
                    if (res && res.response && res.response.error) {
                        alert('error: ' + res.response.error.message);
                    }
                });
            }
        });
    },
    postMessage: function (msgBag, siteName, from) {
        var message = msgBag.message;

        switch (from) {
            case 'gplus':
                message = message.replace(/<\/div>\s*<div>/g, ' ').replace(/<br>/g, ' ');
                message = message.replace(/<[^<>]*>/g, '');
                message = $('<div></div>').html(message).text();
                break;
            default: break;
        }
    },

    /*------------------------------------- << 我是分隔线 >> ---------------------------------------------*/

    bind: function (webSiteName, cntr, helper) {
        if (!cntr || cntr.length <= 0) { return; }

        if (cntr.find('#saSiteCheckBoxCenter').length <= 0) { cntr.append('<div id="saSiteCheckBoxCenter"></div>'); }
        var container = cntr.find('#saSiteCheckBoxCenter');
        var target = container;
        if (helper != null) {
            target = container.find('#sb_bbag');
            if (target.length <= 0) {
                container.append('<table id="sb_bbag"><tr><td style="width: 100%;"></td><td><img style="cursor: pointer; margin: 0 0 0 5px; opacity: 0.5;" src="' + getExtensionUrl('content/images/publish-sync/icons/clock.png') + '" /></td></tr></table>');
                container.find('td:last img').click(function () {
                    var message = helper.getFeedBag(container).message;
                    if (typeof message == 'undefined' || !message || message == 'undefined') { message = ''; }
                    showBufferFrame(message);
                });
            }
            target = container.find('td:first');
        }

        if (target.find('[sb=caption]').length <= 0) {
            target.append('<table sb="caption" class="sbtsync" cellpadding="0" cellspacing="0"><tr><td><label sb="caption">' + hl.val('Publish Sync:') + '</label><td></tr></table>');
        }

        this.addStyle('sbncss', this.normalCss);
        var allSiteNames = socialClient.getAllSiteNames();
        socialClient.getOptions(function (options) {
            var siteNames = options.siteNames;
            var ss = siteNames.join(',');
            for (var i in allSiteNames) {
                var tSiteName = allSiteNames[i];
                if (ss.indexOf(tSiteName) == -1) {
                    $('[site=' + tSiteName + ']').remove();
                }
            }

            for (var i in siteNames) {
                var siteName = siteNames[i];
                if (siteName == webSiteName) { continue; }

                if (target.find('[site=' + siteName + ']').length <= 0) {
                    siteHelper.append(target, siteName);
                }

                socialClient.getAccount(siteName, function (account) {
                    var isLogin = account.status;
                    var siteName = account.siteName;

                    var label = $('[site=' + siteName + '] label');
                    var checkbox = $('[site=' + siteName + '] :checkbox');
                    if (isLogin) {
                        checkbox.removeAttr('disabled');
                        label.unbind('click')
                            .css('color', (account.expired ? 'red' : ''))
                            .attr('title', (account.expired ? hl.val('expired') : ''));
                    } else {
                        checkbox.attr('disabled', 'disabled');
                        label.unbind('click')
                            .click(function () {
                                var site_name = $(this).parents('table[site]').attr('site');
                                socialClient.login(site_name);
                            });
                    }
                });
            }

            siteHelper.bindAll();
        });

        // Bind notice text ad
        this.bindTextAd(webSiteName, cntr, helper);
    },

    bindTextAd: function (siteName, container, helper) {
        if (container.find('#saNoticeAdCnter').length > 0) { return; }

        var id = parseInt(Math.random() * 10000000);
        switch (siteName) {
            case 'facebook':
            case 'twitter':
            case 'gplus':
            case 'linkedin':
            case 'plurk':
            case 'tencent':
            case 'weibo':
                socialClient.getOptions(function (options) {
                    var ntextAd = options.advertise.ntext;
                    if (!ntextAd || !ntextAd.noticed) {
                        if (container.find('#saNoticeAdCnter').length > 0) { return; }
                    }
                });
                break;
            default: break;
        }
    },

    getLabelText: function (siteName) {
        switch (siteName) {
            case 'facebook':
                return hl.val('facebook');
            case 'gplus':
                return 'Google+';
            case 'twitter':
                return 'Twitter';
            case 'linkedin':
                return 'Linkedin';
            case 'vkontakte':
                return 'VKontakte';
            case 'plurk':
                return hl.val('plurk');
            case 'weibo':
                return hl.val('weibo');
            case 'tencent':
                return hl.val('tqqcom');
            case 'renren':
                return hl.val('renren');
            case 'kaixin001':
                return hl.val('kaixin001');
            case 'qzone':
                return hl.val('qzone');
            default:
                return siteName;
        }
    },

    getTipsTitle: function (siteName) {
        if (siteName == 'gplus') {
            return 'Currently only supports text and links,and will sync message to google+ as public default. This features will be enhanced soon.';
        }
        if (siteName == 'twitter') {
            return 'Twitter currently can only publish chars message.';
        }

        return '';
    },

    getCheckBoxTable: function (siteName) {
        var _self = siteHelper;

        var imgTag = _self.getTipsTitle(siteName);
        return '<table id="t_' + siteName + '">'
             + '    <tr>'
             + '        <td><input id="c_' + siteName + '" type="checkbox" /></td>'
             + '        <td><label style="-webkit-user-select: none;cursor:default;display: block;margin-left: -19px;position: relative;padding-left: 20px;" for="c_' + siteName + '" >' + _self.getLabelText(siteName) + '</label></td>'
             + (imgTag ? ('        <td><img src="' + getExtensionUrl('content/images/publish-sync/icons/question.png') + '" title="' + imgTag + '" style="margin: 5px 0 0;" /></td>') : '')
             + (siteName == 'facebook' ? (
               '        <td>'
             + '            <img id="fb_privacy_img" style="display: inline-block; margin: 0 3px -2px 0;" src="' + getExtensionUrl('content/images/publish-sync/icons/locked.png') + '" />'
             + '            <img id="fb_page_img" style="display: inline-block; margin-bottom: -2px;" src="' + getExtensionUrl('content/images/publish-sync/icons/page.png') + '" />'
             + '            <span id="slt_fanspage_count"></span>'
             + '        </td>'
               ) : '')
             + '    </tr>'
             + '</table>';
    },

    append: function (container, siteName) {
        var html = '';
        if (siteName == 'facebook') {
            html = '<td>'
                 + '    <img fb="pvcy" src="' + getExtensionUrl('content/images/publish-sync/icons/locked.png') + '" />'
                 + '    <img fb="page" src="' + getExtensionUrl('content/images/publish-sync/icons/page.png') + '" />'
                 + '    <span fb="selectCount"></span>'
                 + '</td>'
        }

        var labelcss = '-webkit-user-select: none; cursor: default; display: block; margin-left: -20px; position: relative; padding-left: 20px;';
        var checkBoxId = siteName + (Math.random() + '').replace('0.', '');
        container.append(
               '<table class="sbtsync" site="' + siteName + '" cellpadding="0" cellspacing="0">'
             + '    <tr>'
             + '        <td><input id="' + checkBoxId + '" type="checkbox" /></td>'
             + '        <td><label for="' + checkBoxId + '" style="' + labelcss + '">' + this.getLabelText(siteName) + '</label></td>'
             + '        ' + html
             + '    </tr>'
             + '</table>');

        var checked = localStorage['sbchecked.' + siteName] == '1';
        $('[site=' + siteName + '] input')
            .attr('checked', checked)
            .unbind('click')
            .click(function (e) {
                var site_name = $(this).parents('table').attr('site');
                var stchecked = $(this).attr('checked');

                localStorage['sbchecked.' + siteName] = (stchecked ? '1' : '0');
                $('[site=' + site_name + '] input').attr('checked', stchecked);
            });
    },

    bindAll: function () {
        socialClient.getAccount('facebook', function (account) {
            if (!siteFacebookHelper) { return; }

            if (account.status) {
                if (account.fansPages && account.fansPages.length > 0) {
                    $('[fb=page]').show();
                    $('[fb=pvcy]').show();
                    $('[fb=selectCount]').show();

                    siteFacebookHelper.bindPrivacyBox('[fb=pvcy]', account.friendLists);
                    siteFacebookHelper.bindFanspageBox('[fb=page]', account.fansPages);
                } else {
                    $('[fb=page]').hide();
                    $('[fb=pvcy]').hide();
                    $('[fb=selectCount]').hide();

                    siteFacebookHelper.bindPrivacyBox('[site=facebook] label', account.friendLists);
                }
            } else {
                siteFacebookHelper.clearPrivacyBox('[fb=pvcy]');

                siteFacebookHelper.clearFanspageBox('[fb=page]');
                siteFacebookHelper.clearFanspageBox('[site="facebook"] label');

                $('[fb=page]').hide();
                $('[fb=pvcy]').hide();
                $('[fb=selectCount]').hide();
            }
        });
        socialClient.getAccount('gplus', function (account) {
            if (account.status) {
                $('[site=gplus]').mouseover(function (event) {
                    siteGplusHelper.showCirclesTable(this, event, function () {
                        $("#g_circles [type=checkbox]").css("margin", "-4px 5px 0px 3px");
                    });
                });
            } else {
                siteGplusHelper.clearCircles();
            }
        });
    },
    bindVideos: function (cntr) { youtubeHelper.render(cntr); },
    socialbaAdvertise: function () {
        return '<div style="font-family: verdana \'微软雅黑\';margin: 2px 0 7px 6px;clear:both;">'
             + '    <img style="float: left; margin: -3px 5px auto 0;" src="' + getExtensionUrl('content/images/publish-sync/icons/19.png') + '" />'
             + '    <div style="float: left;"><a target="_blank" href="http://socialba.com/" title="http://socialba.com/"><b>Socialba !</b></a> - Online! Share it: </div>'
             + '    <xjshares style="float: left;margin:-5px 0 0;" url="http://socialba.com/#v" txt="Socialba！- Best extension sync publish for social network! Support: Google+, Facebook, Twitter and more!" />'
             + '</div>';
    }
};