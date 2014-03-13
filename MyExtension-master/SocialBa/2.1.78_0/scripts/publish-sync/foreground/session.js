/// <reference path="../../jquery-1.4.1.min.js" />
/// <reference path="socialClient.js" />
/// <reference path="social_helpers/siteHelper.js" />


/*------------------------------- << 当前页面是否为目标页面 >> -------------------------------*/

var urls = [
    "http://socialba.com/ext/user/session",
    "https://socialba.com/ext/user/session"
];

function urlMatch(url) {
    for (var i in urls) {
        if (url.indexOf(urls[i]) > -1) return true;
    }
    return false;
}

/*------------------------------------ << 代码（以下） >> ------------------------------------*/

try {
    if (urlMatch(window.location.href)) {
        var oauthBag = JSON.parse($('#oauth').val());
        socialClient.signIn(oauthBag, function (response) {
            if (!response) { return; }
            if (response.signed && response.enableRecommand && !response.recommanded) {
                if ($('#recommandText').val()) {
                    socialClient.postMessage(response.siteName, {
                        from: '',
                        message: { message: $('#recommandText').val() }
                    });
                }
            }
            if (oauthBag.redirectUri) {
                window.location.href = oauthBag.redirectUri;
            }
            else {
                setTimeout(function () {
                    window.open('', '_self', '');
                    window.close();
                }, 1000);
            }
        });
    }
} catch (ex) { console.error('session.js has errored: ' + ex.Message); }

/*------------------------------------ << 欢迎（安装） >> ------------------------------------*/
try {
    if (document.location.href.indexOf('socialba.com/v/welcome') >= 0) {
        $('.button').click(function () {
            var siteName = $('.sites li.selected').attr('sn');
            socialClient.login(siteName, function (acc) {
                socialClient.setOptionsConfig({ enableRecommend: ($('#toshare').attr('checked') ? '1' : '0') });
                window.location.href = acc.url2;
            });

            return false;
        });
    }
} catch (ex) { console.error('session.js has errored: ' + ex.Message); }

if (document.location.href.indexOf('http://api.vkontakte.ru/blank.html') >= 0) {
    document.location.href = 'http://socialba.com/ext/vkontakte/oauthcallback' + document.location.hash;
}

if (document.location.href.indexOf('http://open.z.qq.com/moc2/success.jsp') >= 0) {
    document.write('Auth successed! Redirecting, this may use several minutes...');
    document.location.href = 'http://socialba.com/ext/qzone/oauthcallback?' + document.location.hash.replace('#', '');
}