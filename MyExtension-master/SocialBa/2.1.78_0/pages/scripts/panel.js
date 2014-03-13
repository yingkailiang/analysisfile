/// <reference path="../../scripts/publish-sync/foreground/socialClient.js" />
/// <reference path="../../scripts/common.js" />

var language = {
    'zh-cn': {
        OldVersion: '较旧版本',
        LastVersion: '最新版本',
        CurrentVersion: '当前版本',
        SelectWebSite: '请勾选您要同步的网站。',
        EnableShare: 'Share 功能开关',
        TellFriends: '绑定成功后显示通知信息',
        SyncAccount: '同步您的账号信息？',
        EnableAds: '是否启用广告？',
        AdsOfVideo: '文字广告',
        AdsOfRight: '右侧广告',
        EnableWeather: '在以下网站显示气象预报',
        Enable: '启用',
        Disable: '禁用',
        SelectBinding: '请绑定您要同步发表的网站',
        ShareUrl: 'http://socialba.com/?lh=zh-cn',
        ShareText: '方便在Twitter、Facebook、Google+、VKontakte(VK)、新浪、腾讯、Plurk等网站一键发表内容的最佳扩展，并支援分享页面讯息至更多网站！',
        Notify: '版本：2.1.1，新加入了账号同步功能。在不同的地方使用Socialba插件，当您授权了相同的账号，我们自动为您同步已授权的账号信息，无需重复授权。如果您有任何意见或者建议，请联系我们：<b>service@socialba.com</b>。'
    },
    'zh-tw': {
        OldVersion: '較舊版本',
        LastVersion: '最新版本',
        CurrentVersion: '當前版本',
        SelectWebSite: '請勾選您要同步的網站。',
        EnableShare: 'Share 功能開關',
        TellFriends: '綁定成功后顯示通知信息',
        SyncAccount: '同步您的帳號信息？',
        EnableAds: '是否啟用廣告？',
        AdsOfVideo: '文字廣告',
        AdsOfRight: '右側廣告',
        EnableWeather: '在以下網站啟用氣象預報',
        Enable: '啟用',
        Disable: '禁用',
        SelectBinding: '請綁定您要同步發表的網站',
        ShareUrl: 'http://socialba.com/?lh=zh-tw',
        ShareText: '方便在Twitter、Facebook、Google＋、VKontakte(VK)、新浪、騰訊、Plurk等網站一鍵發表内容的最佳扩展，并支援分享页面讯息至更多网站！',
        Notify: '版本：2.1.1，新加入了賬號同步功能。在不同的地方使用Socialba插件，當您授權了相同的賬號，我們自動為您同步已授權的賬號信息，無需重複授權。如果您有任何意見或者建議，請聯繫我們：<b>service@socialba.com</b>。'
    },
    'en-us': {
        OldVersion: 'old version',
        LastVersion: 'last version',
        CurrentVersion: 'current version',
        SelectWebSite: 'Please select the website you want to synchronize.',
        EnableShare: 'Enable share function on Google plus and twitter.',
        EnableAds: 'Enable ads function',
        TellFriends: 'Show prompt message after successful binded.',
        SyncAccount: 'Synced your account data?',
        AdsOfVideo: 'Text Ads',
        AdsOfRight: 'Ad on Right',
        EnableWeather: 'Show weather on sns pages.',
        Enable: 'Enable',
        Disable: 'Disable',
        SelectBinding: 'Please bind the website you want to synchronize',
        ShareUrl: 'http://socialba.com/?lh=en-us',
        ShareText: 'Super extension, provide two-way syncs Google+, Facebook, Twitter, VKontakte(VK), Plurk, Weibo, Tencent and so on.',
        Notify: 'Version: 2.1.1, the new joined account synchronization capabilities. In different places to use Socialba plug-in, when you authorize the same account, we automatically for you synchronize account information has authorized, no need to repeat the authorization. If you have any comments or suggestions, please contact us: <b>service@socialba.com</b>.'
    }
};

var lang = (function (l) {
    if (l && l.match(/zh-TW/g)) {
        return language['zh-tw'];
    }
    if (l && l.match(/zh-CN/g)) {
        return language['zh-cn'];
    }

    return language['en-us'];
} (window.navigator.language));

var pannel = {
    last_time: null,
    getPortrait: function (imgUrl) {
        return imgUrl;
    },
    checkAccount: function () {
        socialClient.getOptions(function (options) {
            if (pannel.last_time != options.last_time) {
                pannel.last_time = options.last_time;

                $('#loginSites li').hide();
                $(options.siteNames).each(function (i, siteName) {
                    $('#loginSites #' + siteName).show();
                    socialClient.getAccount(siteName, function (account) {
                        pannel.render(account);
                        return false;
                    });
                });
            }
        });

        socialClient.getUser(function (user) {
            if (user && user.id) {
                if ($('.profile .avatar').attr('rel-data') != user.portraint) {
                    $('.profile .avatar').attr('rel-data', user.portraint);
                    $('.profile .avatar').attr('src', pannel.getPortrait(user.portraint));
                }
                $('.profile .accountName').text(user.name);
                $('.profile .accountDetail').text(user.bio);
                $('.logout_btn').css('display', '');
                $('#editProfile').parent().show();
            }
            else {
                $('.profile .avatar').attr('src', 'images/profile.gif');
                $('.profile .accountName').text('SocialBa!');
                $('.profile .accountDetail').text('No signin.');
                $('.logout_btn').css('display', 'none');
                $('#editProfile').parent().hide();
            }
        });
    },
    render: function (account) {
        var siteName = account.siteName;
        var link = $('#' + siteName + ' .logon');

        if (account.status) {
            link.unbind('click');
            link.find('.lg').attr('class', 'lk').attr('title', 'Logout');
            link.click(function () { socialClient.logout(siteName); });

            $('#' + siteName + ' em').text(account.name).css('color', '');
            if (account.expired) {
                var text = string.format("{{name}} ( {{expired}} )", { name: account.name, expired: hl.val('expired') });
                $('#' + siteName + ' em').text(text).css('color', 'red');
            }
        } else {
            link.unbind('click');
            link.find('.lk').attr('class', 'lg').attr('title', 'Login');
            link.click(function () {
                socialClient.login(siteName);
            });
            $('#' + siteName + ' em').text('');
        }
    },

    bind_events: function () {
        $('#menu a').click(function () {
            $('#menu a').removeClass('active');
            $(this).addClass('active');

            var _self = $(this);
            $('.layout').attr('class', 'layout lay_' + _self.attr('el'));

            switch (_self.attr('el')) {
                case 'home':
                    break;
                case 'options':
                    socialClient.getOptions(function (options) {
                        $('#siteOptions input:checkbox').removeAttr('checked');
                        for (var i in options.siteNames) {
                            $('#siteOptions [value=' + options.siteNames[i] + ']').attr('checked', true);
                        }

                        $('#esc_' + (options.enableShare ? '1' : '0')).attr('checked', true);  // :在Google Plus上显示分享控件
                        $('#erc_' + (options.broadcast ? '1' : '0')).attr('checked', true);    // :绑定时是否发文（Socialba！连接成功）

                        $('#ad_video').attr('checked', options.advertise.text.enable);
                        $('#ad_right').attr('checked', options.advertise.right.enable);
                    });
                    break;
                case 'notify':
                    {
                        localStorage['NotifyReaded'] = true;
                        chrome.browserAction.setBadgeText({ text: '', tabId: -1 });

                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', chrome.extension.getURL('pages/notify.html'), false);
                        xhr.send(null);

                        var hlocale = 'EN';
                        var l = window.navigator.language;
                        if (l && l.match(/zh-TW/g)) {
                            hlocale = 'TW'
                        }
                        if (l && l.match(/zh-CN/g)) {
                            hlocale = 'CN'
                        }

                        socialClient.getOptions(function (options) {
                            var nhtml = $(xhr.responseText).find('[hl="' + hlocale + '"]');

                            if (options.locale == 'CN') {
                                nhtml.find('[locale="US"]').remove();
                            }

                            $('#notifyInfo').html(nhtml);
                            $('#shareLink').click(function () {
                                var width = 500;
                                var height = 300;
                                var left = parseInt((screen.availWidth - width) / 2);
                                var top = parseInt((screen.availHeight - height) / 2);
                                window.open('share.html', 'shareWindow', 'height=' + height + ',width=' + width + ',top=' + top + ',left=' + left + ',toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no');
                            });
                        });
                        break;
                    }
                case "refresh":
                    return true;
                case "buffer":
                    {
                        $('#bufferlist').html('<div class="buffer-empty">Loading...<div>');
                        socialClient.getOptions(function (options) {
                            var selectSites = options.siteNames;
                            var selectSitesString = selectSites.join(' ');

                            chrome.extension.sendRequest({ from: 'socialbuffer', method: 'list' }, function (r) {
                                r = JSON.parse(r);
                                var datas = r.data;
                                var html = '';
                                if (datas.length > 0) {
                                    for (var i = 0; i < datas.length; i++) {
                                        var obj = datas[i];

                                        for (var j = 0; j < obj.sites.length; j++) {
                                            var ts = obj.sites[j];
                                            if (selectSitesString.indexOf(ts) < 0) {
                                                selectSitesString += ' ' + ts;
                                            }
                                        }
                                    }

                                    for (var i = 0; i < datas.length; i++) {
                                        var obj = datas[i];
                                        bufferItems[obj.threadId] = obj;
                                        html += createBufferItem(obj.threadId, obj.tweet.time, obj.tweet.message, obj.sites.join(' '), selectSitesString.split(' '));
                                    }
                                } else {
                                    html = '<div class="buffer-empty"><a href="#"><b>' + hl.val('error-bufferEmpty') + '</b><img src="images/writing.png"></a></div>';
                                }
                                $('#bufferlist').html(html);
                                $('.buffer-empty').click(function () { openBuffer('', 'later'); });
                                bindBufferListEvents();
                            });
                        });

                        break;
                    }
                case "writing":
                    openBuffer('');
                    break;
                default: break;
            }
            resize();

            return false;
        });

        $('#siteOptions input:checkbox').click(function () {
            var siteNames = [];
            $('#siteOptions input:checkbox').each(function (i, n) {
                if (n.checked) {
                    siteNames.push(n.value);
                }
            });
            socialClient.setOptions({ siteNames: siteNames });
        });

        $('[name=enableShareControl]').click(function () {
            socialClient.setOptions({ enableShare: this.value == '1' });
        });
        $('[name=enableRecommendControl]').click(function () {
            socialClient.setOptions({ broadcast: this.value == '1' });
        });
        $('[name=enableWeather]').click(function () {
            socialClient.setOptions({ enableWeather: this.value == '1' });
        });
        $('[name=adShowControl]').click(function () {
            socialClient.setOptions({
                advertise: {
                    text: { enable: $('#ad_video').attr('checked') },
                    right: { enable: $('#ad_right').attr('checked') }
                }
            });
        });

        // :用户信息设置
        $('#editProfile .detail #editAvatar').blur(function () {
            $('#editProfile .avatar img').attr('src', $(this).val());
        });
        $('#update_btn').click(function () { pannel.updateUserInfo(); });
    },
    updateUserInfo: function () {
        $('#update_btn').fadeOut(200);
        socialClient.updateUserInfo({
            name: $('#editProfile .detail #editName').val(),
            bio: $('#editProfile .detail #editBio').val(),
            portrait: $('#editProfile .detail #editAvatar').val()
        }, function () {
            pannel.checkAccount();
            $('#update_btn').fadeIn(500);
        });
    }
}

var bufferItems = {};
function openBuffer(content, sendLater) {
    content = content ? content : '';
    var width = 560;
    var height = 300;
    var left = parseInt((screen.availWidth - width) / 2);
    var top = parseInt((screen.availHeight - height) / 2);
    var url = chrome.extension.getURL('pages/buffer.html?content=' + decodeURIComponent(content) + "&model=page&style=pop&ref=options.html");

    if (sendLater)
        url = url.replace('&model=page', '');

    window.open(url, 'Buffer', 'height=' + height + 'px,width=' + width + 'px,top=' + top + ',left=' + left + ',toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no');
}
function getDate(time) {
    var now = new Date(time * 1000);
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    var hour = now.getHours();
    var min = now.getMinutes();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    if (hour < 10)
        hour = "0" + month;
    if (min < 10)
        min = "0" + min;

    return month + '-' + day + " " + hour + ":" + min
}
function createBufferItem(id, time, content, sites, selectSites) {
    var html = '<div id="' + id + '" class="buffer-item medium">'
             + '    <div class="timebar">'
             + '        <img class="image-icon" src="../content/images/buffer-item/clock.png" />'
             + getDate(time)
             + '    </div>'
             + '    <div  id="cmsg' + id + '" class="message">'
             + content
             + '    </div>'
             + '<textarea id="bmsg' + id + '" style="font-size: 12px; width: 100%;margin:10px 0px; padding: 1px 5px;height: auto;display:none">' + content + '</textarea>'
             + '    <div class="edit-bar">'
             + '        <div class="sns-selector">'
             + createSNS(sites, selectSites, id)
             + '        </div>'
             + '        <div class="edit-tool">'
             + '            <label class="delete-btn" item="' + id + '">'
             + '                <img class="image-icon" src="../content/images/buffer-item/delete.png" />Delete'
             + '            </label>'
             + '            <label class="edit-btn" item="' + id + '">'
             + '                <img class="image-icon" src="../content/images/buffer-item/edit.png" />Edit'
             + '            </label>'
             + '            <label class="post-btn" item="' + id + '">'
             + '                <img class="image-icon" src="../content/images/buffer-item/post.png" />Post Now'
             + '            </label>'
             + '        </div>'
             + '    </div>'
             + '    <div class="clear">'
             + '    </div>'
             + '</div>'
    return html;
}

function createSNS(sites, selectSites, id) {
    var html = '';
    for (var i = 0; i < selectSites.length; i++) {
        var site = selectSites[i];
        if (site == 'gplus' || site.length == 0)
            continue;
        html += '<img tl="sns" item="' + id + '" tag="' + site + '" class="image-icon' + (sites.indexOf(site) >= 0 ? '' : ' disabled') + '" src="../content/images/buffer-item/sns-' + site + '.png" />'
    }
    return html;
}

var editbuffer;
var editid;
var msgbuffer;
var lastClickTime;
function bindBufferListEvents() {
    $('#bufferlist').find('.post-btn').click(function () {
        // TODO post
        var id = $(event.target).attr('item');
        var item = bufferItems[id];
        socialClient.submitFeed(item.sites, {
            from: "",
            message: { message: item.tweet.message }
        }, function (res) {
            if (res && res.response && res.response.error) {
                alert('error: ' + res.response.error.message);
            } else {
                chrome.extension.sendRequest({ from: 'socialbuffer', method: 'delete', id: id }, function (r) {
                    r = JSON.parse(r);
                    if (r.successed)
                        $('#' + id).remove();
                });
            }
        });
    });
    $('#bufferlist').find('.delete-btn').click(function () {
        // TODO delete
        var id = $(event.target).attr('item');
        chrome.extension.sendRequest({ from: 'socialbuffer', method: 'delete', id: id }, function (r) {
            r = JSON.parse(r);
            if (r.successed)
                $('#' + id).remove();
        });

    });
    $('#bufferlist').find('.edit-btn').click(function () {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }

        var id = $(event.target).attr('item');
        var target = $('#' + id);

        hideEdit();

        editid = id;
        editbuffer = target.find('#bmsg' + id);
        msgbuffer = target.find('#cmsg' + id);

        msgbuffer.click(function () {
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
        });
        editbuffer.click(function () {
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
        });

        msgbuffer.hide();
        editbuffer.show();
    });
    $('#bufferlist').find('[tl=sns]').click(function () {
        if (lastClickTime) {
            var now = new Date().getTime();
            if (now - lastClickTime < 500) {
                lastClickTime = now;
                // TODO click too quick
                //alert('click too quick');
                return;
            } else {
                lastClickTime = now;
            }
        } else {
            lastClickTime = new Date().getTime();
        }

        var id = $(event.target).attr('item');
        var item = bufferItems[id];
        var tag = $(event.target).attr('tag');
        var style = $(event.target).attr('class');
        if (style.indexOf('disabled') > 0) {
            $(event.target).attr('class', 'image-icon');
            // TODO add sns
            socialClient.getAccount(tag, function (account) {
                var isLogin = account.status;
                if (isLogin) {
                    item.sites.push(tag);
                    chrome.extension.sendRequest({ from: 'socialbuffer', method: 'edit', item: bufferItems[id] }, function (r) {
                        r = JSON.parse(r);
                    });
                } else { socialClient.login(tag); }
            });

        } else {
            $(event.target).attr('class', 'image-icon disabled');
            // TODO remove sns
            var index = item.sites.indexOf(tag);
            item.sites.splice(index, 1)
            chrome.extension.sendRequest({ from: 'socialbuffer', method: 'edit', item: bufferItems[id] }, function (r) {
                r = JSON.parse(r);
            });
        }

    });

    $('body').click(function () {
        hideEdit();
    });
}

function hideEdit() {
    if (editbuffer && msgbuffer && editid) {
        bufferItems[editid].tweet.message = editbuffer.val();
        msgbuffer.text(editbuffer.val());
        editbuffer.hide();
        msgbuffer.show();
        editbuffer = null;
        msgbuffer = null;

        // TODO edit
        chrome.extension.sendRequest({ from: 'socialbuffer', method: 'edit', item: bufferItems[editid] }, function (r) {
            r = JSON.parse(r);
        });
    }
}

function getTimeString(date) {
    var month = date.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month.toString();

    var _date = date.getDate();
    _date = _date < 10 ? ('0' + _date) : _date.toString();

    var _hours = date.getHours();
    _hours = _hours < 10 ? ('0' + _hours) : _hours.toString();

    var _minutes = date.getMinutes();
    _minutes = _minutes < 10 ? ('0' + _minutes) : _minutes.toString();

    var _seconds = date.getSeconds();
    _seconds = _seconds < 10 ? ('0' + _seconds) : _seconds.toString();

    return date.getFullYear()
              + '-' + month
              + '-' + _date
              + ' ' + _hours
              + ':' + _minutes
              + ':' + _seconds
}

function resize() {
    if (parent) {
        parent.postMessage({ height: $('body').height() }, '*');
    }
}


var checkAccountInterval = null;

$().ready(function () {
    console.log('Panel page is load complete, excute bind code.');

    // 外部 IFRAME 重置高宽
    resize();
    bindLanguage();

    // 用户登出
    $('.logout_btn').click(function () {
        logout();
        return false;
    });

    socialClient.getVersion(function (version) {
        var v_user = version.user_version;
        var v_latest = version.latest_version;

        var innerText = 'V.' + v_user;
        $('#version').text(innerText);

        console.log('Get version: ' + v_user);
    });

    pannel.checkAccount();
    checkAccountInterval = setInterval(function () {
        pannel.checkAccount();
        resize();
    }, 2000);

    pannel.bind_events();

    // 
    if (localStorage['NotifyReaded'] == 'false') {
        $('.btn[el=notify]').click();
        localStorage['NotifyReaded'] = true;
    }

    socialClient.getOptions(function (conifg) {
        var locale = conifg ? conifg.locale : null;
        if (locale != 'CN') {
            $('#global').append(
                  '<div class="globalServ" style="width: 90px; margin: 1px 0 0 5px;">'
                + '    <iframe src="https://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fsocialba.com%2Fv&amp;send=false&amp;layout=standard&amp;width=80&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=24&amp;appId=371307449565953&amp;layout=button_count" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 250px; height: 25px; margin: 0;" allowtransparency="true"></iframe>'
                + '</div>'
                + '<div class="globalServ" style="width: 95px; margin: 1px 10px 0 0;">'
                + '    <iframe src="https://platform.twitter.com/widgets/tweet_button.html#_=1313636737601&amp;count=horizontal&amp;id=twitter_tweet_button_0&amp;lang=en&amp;original_referer=&amp;text=' + encodeURIComponent(lang.ShareText) + '&amp;url=http%3A%2F%2Fsocialba.com%2F" allowtransparency="true" frameborder="0" scrolling="no" class="twitter-share-button twitter-count-horizontal" style="width: 110px; height: 20px;" title="Twitter For Websites: Tweet Button">'
                + '    </iframe>'
                + '</div>'
                + '<div class="globalServ" style="width: 82px; margin: -3px 5px 0 0;overflow: hidden;">'
                + '    <iframe src="https://plusone.google.com/_/+1/fastbutton?bsv&size=small&url=http%3A%2F%2Fsocialba.com%2F&jsh=m%3B%2F_%2Fscs%2Fapps-static%2F_%2Fjs%2Fk%3Doz.gapi.zh_CN.1gGHvSg6kr0.O%2Fm%3D__features__%2Fam%3DQQ%2Frt%3Dj%2Fd%3D1%2Frs%3DAItRSTNOZkhfR0Fc9P3xi5lTR-_8QP0k2A#_methods=onPlusOne%2C_ready%2C_close%2C_open%2C_resizeMe%2C_renderstart%2Concircled&id=I2_1361267951731&rpctoken=11092867" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 250px; height: 25px; margin: 0;" allowtransparency="true"></iframe>'
                + '</div>');
        }
        console.log('Get locale and render the addon: ' + locale);
    });

    console.log('Panel page ready code is complete.');
});

function bindLanguage() {
    $('[text]').each(function (i, n) {
        n = $(n);
        n.html(lang[n.attr('text')]);
    });

    $('[hl]').each(function (i, n) {
        n = $(n);
        n.html(hl.val(n.attr('hl')));
    });

    $('#shareControl').append('<s-shares text="' + lang.ShareText + '" url="' + lang.ShareUrl + '"></s-shares>');
    sapi.s.setIcons(chrome.extension.getURL('content/share-0.png'));
    sapi.s.render();
}

function logout() {
    socialClient.logout();
    setTimeout(checkAccount, 10);
}