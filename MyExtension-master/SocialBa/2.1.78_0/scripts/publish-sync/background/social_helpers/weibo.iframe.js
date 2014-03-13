
// 注入到 weibo.com 发文

function sendMessage(text, link, imgUrl) {
    var http = new XMLHttpRequest();
    http.open("POST", "http://www.weibo.com/aj/mblog/add?rnd=0." + (9999999999999999 / (Math.random() * 10)), true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.send("text=" + text + "&pic_id=&location=home&module=stissue&_t=0")
}

window.addEventListener("message", function (event) {
    var msgBag = event.data.msg;
    var origin = event.data.origin;

    if (origin == 'gplus') {
        msgBag.message = msgBag.message.replace(/<\/div>\s*<div>/g, ' ').replace(/<br>/g, ' ');
        msgBag.message = msgBag.message.replace(/<[^<>]*>/g, '');
        msgBag.message = $('<div></div>').html(message).text();
    }
    var weiboMessageText = msgBag.message.replace(/\s+/g, ' ');
    if (msgBag.link) { weiboMessageText += ' ' + msgBag.link; }
    if (msgBag.picture) { weiboMessageText += ' ' + msgBag.picture; }

    sendMessage(weiboMessageText);
}, false);

if (window.location.hash && window.location.hash.indexOf('txt')) {
    var text = window.location.hash.match('txt=.*')[0].replace('txt=', '');
    sendMessage(text);
}