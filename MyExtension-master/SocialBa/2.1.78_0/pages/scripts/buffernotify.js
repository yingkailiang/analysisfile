/// <reference path="../../scripts/jquery-1.7.2.min.js" />
/// <reference path="../../scripts/publish-sync/foreground/social_helpers/siteHelper.js" />

var content = $('#content');
var time = $('#time');

var Request = {
    QueryString: function (item) {
        var svalue = location.href.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
        return svalue ? svalue[1] : svalue;
    }
}

var msg = decodeURIComponent(Request.QueryString('content'));
content.text(msg.length > 25 ? msg.substring(0, 20) + '...' : msg);
time.text(getDate(Request.QueryString('time')));

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