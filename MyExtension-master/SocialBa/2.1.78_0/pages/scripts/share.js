/// <reference path="../../scripts/jquery-1.7.2.min.js" />
/// <reference path="../../scripts/publish-sync/foreground/socialClient.js" />

$(function () {
    bind();

    $('#btnClose').click(function () { window.close(); });
    $('#btnShare').click(function () {
        var messageBags = { message: '', links: [], pictures: [] };
        messageBags.message = $('[name="message_text"]').val();
        messageBags.gplus = { ranges: [] }

        if ($('#sharedLink').attr('checked')) {
            messageBags.links.push({
                url: 'http://socialba.com',
                title: 'SocialBa！ - The extension sync publish for social network!',
                content: 'Socialba！- Best extension sync publish for social network! Support: Google+, Facebook, Twitter, Linkedin, VK.com, Plurk and more!',
                picture: 'http://socialba.com/r/img/80.png'
            });
        }

        var siteNames = socialClient.getAllSiteNames();
        socialClient.submitFeed(siteNames, {
            from: 'SocialBa!',
            message: messageBags
        }, function (res) {
            console.log(res);
        });

        setTimeout(function () {
            window.close();
        }, 200);

        $(this).removeClass('uiButtonConfirm');
    });
});

function bind() {
    var hl = language['EN'];
    var l = window.navigator.language;
    if (l && l.match(/zh-TW/g)) {
        hl = language['TW']
    }
    if (l && l.match(/zh-CN/g)) {
        hl = language['CN']
    }

    $('[hl]').each(function (i, n) {
        $(n).text(hl[$(n).attr('hl')]);
    });
    $('[name="message_text"]').val(hl['shareText']);
}

var language = {
    'EN': {
        title: 'Share SocialBa! to friends.',
        caption: 'Share the SocialBa! of lastest version to your friends!',
        withLink: 'With link?',
        shareToSns: 'Share to SNS',
        close: 'Close',
        shareText: 'SocialBa! has been updated to 2.1.45, support 11 sites sync. added support of post timing. http://socialba.com'
    },
    'TW': {
        title: '將 SocialBa! 分享給朋友。',
        caption: '將最新版的SocialBa!推薦給您的朋友吧！',
        withLink: '分享連接?',
        shareToSns: '分享到SNS',
        close: '取消',
        shareText: 'SocialBa!瀏覽器插件已更新至2.1.45, 增加了預約發送功能, 修正了部分bug, 同時優化了性能。 http://socialba.com'
    },
    'CN': {
        title: '将 SocialBa! 分享给朋友。',
        caption: '将最新版的SocialBa!推荐给您的朋友吧！',
        withLink: '分享连接?',
        shareToSns: '分享到SNS',
        close: '取消',
        shareText: 'SocialBa!浏览器插件已更新至2.1.45, 增加了预约发送功能, 修正了部分bug, 同时优化了性能。 http://socialba.com'
    }
}