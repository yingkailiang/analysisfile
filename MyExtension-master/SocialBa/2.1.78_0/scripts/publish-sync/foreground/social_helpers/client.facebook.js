/// <reference path="../../tools/jquery-1.4.1.min.js" />

/*
* 
* 
*
*/
/* Privacy 多语言 */

var privacyForFBObjects = { 'zh-cn': [{ text: '所有网民', value: 'EVERYONE' }, { text: '朋友', value: 'ALL_FRIENDS' }, { text: '仅限自己', value: 'SELF' }, { text: '自定义', value: 'CUSTOM'}], 'zh-tw': [{ text: '所有人', value: 'EVERYONE' }, { text: '朋友', value: 'ALL_FRIENDS' }, { text: '僅限自己', value: 'SELF' }, { text: '自定義', value: 'CUSTOM'}], 'en-us': [{ text: 'Public', value: 'EVERYONE' }, { text: 'Friends', value: 'ALL_FRIENDS' }, { text: 'Only Me', value: 'SELF' }, { text: 'Custom', value: 'CUSTOM'}] }; var langPrivacy = (function (l) { if (l && l.match(/zh-TW/g)) { return privacyForFBObjects['zh-tw'] } if (l && l.match(/zh-CN/g)) { return privacyForFBObjects['zh-cn'] } return privacyForFBObjects['en-us'] } (window.navigator.language));

var siteFacebookHelper = {
    privacys: langPrivacy,
    addStyle: function () {
        siteHelper.addStyle('s_privacy',
              '#fb_privacy.imorse_pop_box { padding: 0 0 5px; }'
            + '.imorse_pop_box { border: 1px solid #E9E9E9; white-space: nowrap; background: white; position: absolute; display: none; z-index: 9999; padding-right: 5px; }'
            + '.imorse_pop_box table { padding: 5px; }'
            + '.imorse_pop_box td { padding: 1px 5px; }'
            + '.imorse_pop_box input[type=checkbox] { margin: 0; }'
            + '.imorse_pop_box label { display: inline; }'
            + '.imorse_pop_box ul, .imorse_pop_box li { list-style: none; margin: 0; padding: 0; color: black; }'
            + '.imorse_pop_box > ul { width: 300px; }'
            + '.imorse_pop_box > ul > li { width: 140px; padding: 5px 5px 0; float: left; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }'
            + '.imorse_pop_box #sbFbFriendLists { width: 290px; }'
            + '.imorse_pop_box #sbFbFriendLists > ul { }'
            + '.imorse_pop_box #sbFbFriendLists > ul > li { width: 135px; padding: 5px; float: left; background: #DDD; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }');
    },

    // << 辅助方法： >>
    fanspageIds: function (fanspageIds) {
        if (typeof fanspageIds == 'undefined') {
            var pages = localStorage._fb_fanspages;
            return pages ? pages.split(',') : [];
        }

        localStorage._fb_fanspages = fanspageIds.join(',');
    },
    privacyId: function (privacyId) {
        if (typeof privacyId == 'undefined') {
            privacyId = localStorage._fb_privacyId;
            return privacyId ? privacyId : 'EVERYONE';
        }

        localStorage._fb_privacyId = privacyId;
    },
    friendListIds: function (friendListIds) {
        if (typeof friendListIds == 'undefined') {
            friendListIds = localStorage['sb.facebook.data.friendListIds'];
            return friendListIds ? JSON.parse(friendListIds) : [];
        }

        localStorage['sb.facebook.data.friendListIds'] = JSON.stringify(friendListIds);
    },

    // << 绑定方法： >>
    bindPrivacyBox: function (target, friendLists) {
        var _self = siteFacebookHelper;
        _self.addStyle();

        target = $(target).attr('src', getExtensionUrl('content/images/publish-sync/icons/locked.png'));
        target.unbind('mouseover').mouseover(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            $('.imorse_pop_box').hide();

            /* ---------------------------------<< 计算 "box" 应该出现的位置 >>------------------------------ */
            var offsetLeftValue = 0;
            try { offsetLeftValue = ($(target)[0].nodeName.toLowerCase() == 'label' ? 20 : 0); } catch (ex) { }

            var target = $(this);
            var left = target.offset().left + offsetLeftValue;
            var top = target.offset().top + target.height();

            if ($("#fb_privacy").length <= 0) {
                var innerHTML = '<ul>';
                $(_self.privacys).each(function (i, privacy) {
                    innerHTML +=
                              '<li>'
                            + '    <input id="fbprivacy_' + privacy.value + '" name="privacy_fb" value="' + privacy.value + '" type="radio" />'
                            + '    <label for="fbprivacy_' + privacy.value + '">' + privacy.text + '</label>'
                            + '</li>';
                });

                innerHTML += '<li id="sbFbFriendLists" style="display: ' + (_self.privacyId() == 'CUSTOM' ? 'block' : 'none') + '"><ul>';
                for (var i = 0; i < friendLists.length; i++) {
                    var friendList = friendLists[i];
                    innerHTML +=
                              '<li>'
                            + '    <input id="fbfriendlists_' + friendList.id + '" name="sbFriendLists" value="' + friendList.id + '" type="checkbox" />'
                            + '    <label for="fbfriendlists_' + friendList.id + '">' + friendList.name + '</label>'
                            + '</li>';
                }
                innerHTML += '</ul></li>';
                innerHTML += '</ul>'

                $("body").append('<div class="imorse_pop_box" id="fb_privacy" cellpadding="0" cellspacing="0">' + innerHTML + '</div>');
                $("body").mouseover(function () { $("#fb_privacy").hide(); });

                $("#fb_privacy").css("top", top).css("left", left).show().mouseover(function (event) { event = event ? event : window.event; event.stopPropagation(); });

                $("#fbprivacy_" + _self.privacyId()).attr("checked", "checked");
                $("#fb_privacy [type=radio]").click(function () {
                    _self.privacyId(this.value);

                    if (this.value == 'CUSTOM') { $('#sbFbFriendLists').fadeIn(); }
                    else { $('#sbFbFriendLists').fadeOut(); }
                });

                $('[name="sbFriendLists"][type=checkbox]').click(function () {
                    var friendLists = []
                    $('[name="sbFriendLists"][type=checkbox]').each(function (i, box) {
                        if ($(box).attr('checked')) {
                            friendLists.push(box.value);
                        }
                    });
                    _self.friendListIds(friendLists);
                });
                $(_self.friendListIds()).each(function (i, n) {
                    $("#fbfriendlists_" + n).attr("checked", "checked");
                });
            }
            else {
                $("#fb_privacy").css("top", top).css("left", left).show();
            }
        });
    },
    clearPrivacyBox: function (target) {
        $(target).unbind('mouseover').attr('src', getExtensionUrl('content/images/publish-sync/icons/locked_.png'));
    },
    bindFanspageBox: function (target, fansPages) {
        var _self = siteFacebookHelper;

        target = $(target).attr('src', getExtensionUrl('content/images/publish-sync/icons/page.png'));

        $('[fb=selectCount]').text(_self.fanspageIds().length);

        target.unbind('mouseover').mouseover(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            var target = $(this);
            $('.imorse_pop_box').hide();

            var left = target.offset().left;
            var top = target.offset().top + target.height();

            if ($("#fb_fanspage").length <= 0) {
                $("body").append('<table class="imorse_pop_box" id="fb_fanspage" cellpadding="0" cellspacing="0"></table>');
                $("body").mouseover(function () { $("#fb_fanspage").hide(); });
            }

            var table = $('#fb_fanspage');
            var innerHTML = '';
            $(fansPages).each(function (i, fansPage) {
                var groupsImg = fansPage.is_groups ? '<img style="float: left; margin: 0 5px 0 -2px;" src="' + getExtensionUrl('content/images/publish-sync/icons/icons.png') + '" />' : '';
                innerHTML +=
                              '<tr><td>'
                            + '    <input id="fbfanspage_' + fansPage.id + '" name="fanspage_fb" value="' + fansPage.id + '" type="checkbox" />'
                            + '    ' + groupsImg + '<label for="fbfanspage_' + fansPage.id + '">' + fansPage.name + '</label>'
                            + '</td></tr>';
            });

            table.html('<tr><td><div>Total: <b>' + fansPages.length + '</b> pages</div></td></tr>' + innerHTML);
            table.css("top", top).css("left", left).show().mouseover(function (event) { event = event ? event : window.event; event.stopPropagation(); });

            $('[name="fanspage_fb"]').click(function () {
                var ids = [];
                $('[name="fanspage_fb"]:checked').each(function (i, n) {
                    ids.push($(n).val());
                });

                _self.fanspageIds(ids);
                $('[fb=selectCount]').text(ids.length);
            });

            // 选中已经选中的
            var fanspageIds = _self.fanspageIds();
            if (fanspageIds.length > 0) {
                $(fanspageIds).each(function (i, n) {
                    $('[name=fanspage_fb][value=' + n + ']').attr('checked', true);
                });

                $('[fb=selectCount]').text(fanspageIds.length);
            }
        });
    },
    clearFanspageBox: function (target) {
        var _self = siteFacebookHelper;

        _self.fanspageIds([]);
        $('[fb=selectCount]').text(_self.fanspageIds().length);
        $(target).unbind('mouseover').attr('src', getExtensionUrl('content/images/publish-sync/icons/page_.png'));
    }
}