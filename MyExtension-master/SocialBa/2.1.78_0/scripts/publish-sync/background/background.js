/// <reference path="options.js" />

var currVersion = getVersion();
var prevVersion = localStorage['GooglePlus-VS'];

// :When the first install, open the auth url check the ipaddress.

localStorage['firstInstall'] = '0';
if (currVersion != prevVersion) {
    if (typeof prevVersion == 'undefined') {
        // :the user first install chrome extension
        localStorage['firstInstall'] = '1';
        try {
            var startUrl = 'http://socialba.com/ext/user/oauth?v=2.0';
            chrome.tabs.create({ selected: true, url: startUrl });
        } catch (e) { }
    }
    localStorage['GooglePlus-VS'] = currVersion;
}

var conifg = options.config();
var locale = conifg ? conifg.locale : null;
if (locale == 'TW' || options.is_debug()) {
    getAds();
}
else {
    $.get('http://socialba.com/ext/apis/getgeoip', null, function (res) {
        try {

            if (res.locale) { options.config({ locale: res.locale }); }

            if (res.locale == 'TW') { getAds(); }
            else { options.config({ advertise: { text: { text: '' }, right: { text: ''}} }); }

        } catch (e) { }
    }, 'json');
}

// Get buffer config
options.config({ bufferConfig: { maxBufferDays: 10, maxWaitBufferCount: 7} });
$.get('http://socialba.com/apis/buffer/config', null, function (res) {
    if (res) {
        res = JSON.parse(res);
        options.config({
            bufferConfig: {
                maxBufferDays: res.maxBufferDays,
                maxWaitBufferCount: res.maxWaitBufferCount
            }
        });
    }
});

// Initilize All

socialServer.args.socialHelpers = {
    "facebook": facebook_,
    "plurk": plurk_,
    "twitter": twitter_,
    "gplus": gplus_,
    "weibo": weiboApi,
    "tencent": tencent_,
    "linkedin": linkedin_,
    "vkontakte": vkontakteApi,
    "renren": renrenApi,
    "kaixin001": kaixin001Api,
    "qzone": qzoneApi
};

socialHelper.listen();

//------ Core Init()
socialServer.init();
oauthbase.updateUser();

//------ Fetch JavaScript ...

//try {
//    i_b.listen(function (request, sender, sendResponse) { /* console.log(request); */ });
//} catch (e) { }

//------ Google Analysis ...

setUpStats();