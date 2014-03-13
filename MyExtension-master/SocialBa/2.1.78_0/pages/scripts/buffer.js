/// <reference path="../../scripts/jquery-1.7.2.min.js" />
/// <reference path="../../scripts/publish-sync/foreground/social_helpers/siteHelper.js" />

var msg_error_siteEmpty = "You have not select social networks.";
var msg_error_time = "Selected time is earlier than now!";
var msg_error_time_out = "Selected time can not be afert [[count]] days!";
var msg_error_threadOutSize = "You can just add [[count]] buffer message!";

var ad_frame_url = "http://socialba.com/ad/show?page=buffer";

var content = $('#content');
var btnclose = $('#close');
var sbody = $('#socialbabody');
var msg = $('#msg');
var counter = $('#couter');
var sns = $('#sns');
var sendnow = $('#sendNow');
var sendlater = $('#sendLater');
var notify = $('#notify');
var error = $('#error');
var error_close = $('#error_close');
var b2 = $('#b2');
var b1 = $('#b1');
var done = $('#done');
var cancel = $('#cancel');
var ad = $('#ad');
var ad_cover = $('#ad_cover');
var ad_iframe = $('#ad_iframe')
var ad_close = $('#ad_close');

var Request = {
    QueryString: function (item) {
        var svalue = location.href.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
        return svalue ? svalue[1] : svalue;
    },
    Query: function (input, item) {
        var svalue = input.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
        return svalue ? svalue[1] : '';
    }
}

done.click(function () { sendLater(); });
cancel.click(function () { b2.hide(); b1.show(); $('[site=gplus]').show(); setTimeout(function () { window.resizeTo(content.width() + 20, content.height() + 70); }, 150); })
sendnow.click(function () { sendNow(); });
sendlater.click(function () { b1.hide(); b2.show(); $('[site=gplus]').hide(); setTimeout(function () { window.resizeTo(content.width() + 20, content.height() + 70); }, 150); });
btnclose.click(function () { hide(); });
error_close.click(function () { error_close.fadeOut(188); error.fadeOut(188); });
ad_close.click(function () { closeAds(); });
ad_cover.click(function () { showAds(1); ad_cover.hide(); });

msg.keyup(function (e) {
    var c = msg.val();
    counter.text(140 - c.length);
});

var model;
var ref;

function show() {
    bindLanguage();

    var model = Request.QueryString('model')
    model = model ? model : '';
    ref = decodeURIComponent(Request.QueryString('ref'));

    if (Request.QueryString('style') == 'pop') {
        content.css({ top: 0, opacity: 1 });
        btnclose.hide();
    }
    else {
        content.animate({ top: 120, opacity: 1 }, 388, function () { setTimeout(showAds, 100); });
    }

    siteHelper.bind('', sns);
    setTime();

    if (model == 'page') {
        cancel.click();
    } else {
        setTimeout(function () { sendlater.click(); }, 10);
    }

    var c = decodeURIComponent(Request.QueryString('content'));
    msg.text(c);
    counter.text(140 - c.length);
}

function showAds(close) {
    if ($(window).width() < 1000)
        return;
    if (ref.indexOf('https://') >= 0)
        return;

    var left = ($(window).width() - 560) / 2 + 560 - 8;
    var top = -161 - (content.height() - 273) / 1.8;

    if (Request.Query(ref, 'saip'))
        ad_frame_url += '&userip=' + Request.Query(ref, 'saip');
    ad_frame_url += '&locale=' + Request.Query(ref, 'salocale');

    ad.css({ top: top });
    ad.css({ 'opacity': 1 });

    if (ad_iframe.attr('src') == 'about:blank') {
        ad_iframe.attr('src', ad_frame_url);
        ad_iframe.load(function () {
            ad.show();
            ad.css({ 'margin-left': left - 350 });
            ad.animate({ 'margin-left': left }, 388);
            if (!close)
                setTimeout(function () { hideAds(); content.click(function () { hideAds(); }); }, 3 * 1000);
        });
    } else {
        ad.animate({ 'margin-left': left }, 388);
        if (!close)
            setTimeout(hideAds, 3 * 1000);
    }
}

function hideAds() {
    if (ad.is(':visible')) {
        var left = ($(window).width() - 560) / 2 + 560 - 8;
        ad.animate({ 'margin-left': left - (ad_iframe.width() - 35) }, 188, function () { ad_cover.show(); ad.css({ 'opacity': 0.7 }); });
    }
}

function closeAds() {
    var left = ($(window).width() - 560) / 2 + 560 - 8;
    ad.animate({ 'margin-left': left - ad_iframe.width() - 30 }, 188, function () { ad.hide(); });
}

function hide() {
    if (btnclose.is(':visible'))
        parent.postMessage('social_closebuffer', '*');
    else {
        window.open('', '_self', ''); //bug fix
        window.close();
    }
}

function bindLanguage() {
    $('#sendLater').text(hl.val("timing-send"));
    $('#sendNow').text(hl.val("now-send"));
}

function setTime() {
    socialClient.getOptions(function (option) {
        var delayM = 30;
        var maxBufferDays = 15;
        if (option.bufferConfig && option.bufferConfig.maxBufferDays) {
            maxBufferDays = option.bufferConfig.maxBufferDays;
        }

        var now = new Date();
        now.setMinutes(now.getMinutes() + delayM);
        var max = new Date();
        max.setDate(max.getDate() + maxBufferDays);

        var nowDate = getDate(now);
        var maxDate = getDate(max);

        $('#datePicker').val(nowDate.date).attr('min', nowDate.date).attr('max', maxDate.date);
    });
}

function getDate(now) {
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

    return { date: now.getFullYear() + '-' + month + '-' + day + "T" + hour + ":" + min + ":00" }
}

function getSelectSNS(callback) {
    socialClient.getOptions(function (options) {
        var siteNames = [];
        for (var i in options.siteNames) {
            var siteName = options.siteNames[i];
            if ($('[site=' + siteName + '] :checkbox').attr('checked')) {
                siteNames.push(siteName);
            }
        }
        callback(siteNames);
    });
}

function getSelectTime() {
    return new Date($('#datePicker').val().replace('T', ' ')).getTime() / 1000;
}

function sendNow() {
    getSelectSNS(function (sites) {
        if (sites && sites.length > 0) {
            socialClient.submitFeed(sites, {
                from: "",
                message: { message: msg.val() }
            }, function (res) {
                if (res && res.response && res.response.error) {
                    showError('error: ' + res.response.error.message);
                }
                showNotice(hl.val("successed"));
                setTimeout(function () { hide(); }, 388);
            });
        }
        else {
            showError(hl.val("error-siteEmpty"));
        }
    });

}

function sendLater() {
    socialClient.getOptions(function (option) {
        socialClient.getUser(function (user) {
            $.get("http://socialba.com/apis/buffer/count", {
                userId: user.id,
                verify: user.verify
            }, function (res) {
                var count = parseInt(res);
                if (option.bufferConfig.maxWaitBufferCount <= count) {
                    showError(hl.val("error-threadOutSize").replace("[[count]]", option.bufferConfig.maxWaitBufferCount));
                }
                else {
                    addInBuffer(option, user);
                }
            });
        });
    });
}

function addInBuffer(option, user) {
    var smsg = msg.val();
    var selectedTime = getSelectTime();

    if (!selectedTime)
        return showError(hl.val("error-invalidTime"));

    var timestamp = new Date().getTimestamp();
    var expiresIn = 60 * 60 * 24 * option.bufferConfig.maxBufferDays;

    if (selectedTime < timestamp + 10) {
        return showError(hl.val("error-timeEarlier"));
    }
    if (selectedTime > timestamp + expiresIn) {
        return showError(hl.val("error-timeOut").replace("[[count]]", option.bufferConfig.maxBufferDays));
    }
    if (smsg.length == 0) {
        return showError(hl.val("error-contentEmpty"));
    }

    getSelectSNS(function (sites) {
        if (sites && sites.length > 0) {
            var siteString = '';
            for (var i = 0; i < sites.length; i++) {
                siteString += (i == 0 ? '' : ',') + sites[i];
            }
            console.log(smsg + "--" + selectedTime + "--" + siteString);
            showNotice(hl.val("buffer-adding"));
            chrome.extension.sendRequest({ from: 'socialbuffer', method: 'add', msg: smsg, time: selectedTime, sites: siteString }, function (r) {
                if (r.error) {
                    showError(r.error);
                    return;
                }

                r = JSON.parse(r);
                if (r.successed) {
                    setTimeout(function () { showNotice(hl.val("successed")); hide(); }, 488);
                } else {
                    showError(r.message);
                    return;
                }
            });
        }
        else {
            showError(hl.val("error-siteEmpty"));
        }
    });
}

function showNotice(msg) {
    error.hide();
    error_close.hide();
    notify.children().eq(0).text(msg);
    notify.fadeIn(188);
}

function showError(msg) {
    notify.hide();
    error.children().eq(0).text(msg);
    error.fadeIn(188);
    error_close.fadeIn(188);
}


window.addEventListener('message', receiveMessage, false);

function receiveMessage(evt) {
    console.log(evt);
    if (evt.origin == 'http://socialba.com') {
        if (evt.data.width) {
            ad.width(evt.data.width);
            ad_iframe.width(evt.data.width);
        }
    }
}

show();

