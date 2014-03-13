
// Multi-hl
var hl = {
    json: function () {
        return hl._json;
    },
    bag: function () {
        try {
            var l = window.navigator.language;
            if (l && l.match(/zh-TW/g)) {
                return hl.json()['TW'];
            }
            if (l && l.match(/zh-CN/g)) {
                return hl.json()['CN'];
            }
        } catch (e) { }

        return hl.json()['EN'];
    },
    val: function (name) {
        return this.bag()[name];
    },
    _json: {
        "TW": {
            "facebook": "臉書",
            "plurk": "噗浪",
            "tqqcom": "騰訊微博",
            "weibo": "新浪微博",
            "renren": "人人網",
            "kaixin001": "開心網",
            "qzone": "QQ空間",
            "Publish Sync:": "同步發表至：",
            "timing-send": "預約發表",
            "now-send": "發表",
            "buffer-adding": "正在添加到預約發送列表...",
            "buffer-notice": "SocialBa! 推出全新氣象服務拓展，歡迎使用！",
            "buffer-readed": "我知道了",
            "successed": "成功！",
            "expired": "授權已過期",
            "error-contentEmpty": "發送內容不能為空!",
            "error-siteEmpty": "您還沒有選擇預約發送的網站。",
            "error-bufferEmpty": "您還沒有添加預約發送，現在就試用吧！",
            "error-timeEarlier": "您預約發送的時間不能比現在早!",
            "error-timeOut": "您預約發送的時間只能在[[count]]天以內!",
            "error-threadOutSize": "您最多只能添加[[count]]條預約!",
            "error-invalidTime": "無效的時間!"
        },
        "CN": {
            "facebook": "Facebook",
            "plurk": "Plurk",
            "tqqcom": "腾讯微博",
            "weibo": "新浪微博",
            "renren": "人人网",
            "kaixin001": "开心网",
            "qzone": "QQ空间",
            "Publish Sync:": "同步发表至：",
            "timing-send": "预约发送",
            "now-send": "发送",
            "buffer-adding": "正在添加到预约发送列表...",
            "buffer-notice": "SocialBa! 推出全新气象服务插件，欢迎使用！",
            "buffer-readed": "我知道了",
            "successed": "成功！",
            "expired": "授权已过期",
            "error-contentEmpty": "发送内容不能为空!",
            "error-siteEmpty": "您还没有选择预约发送的网站。",
            "error-bufferEmpty": "您还没有添加预约发送。现在就试用吧！",
            "error-timeEarlier": "您预约发送的时间不能比现在早!",
            "error-timeOut": "您预约发送的时间只能在[[count]]天以内!",
            "error-threadOutSize": "您最多可以添加[[count]]条预约!",
            "error-invalidTime": "无效的时间!"
        },
        "EN": {
            "facebook": "Facebook",
            "plurk": "Plurk",
            "tqqcom": "QQWeibo",
            "weibo": "Weibo",
            "renren": "Renren",
            "kaixin001": "Kaixin001",
            "qzone": "QZone",
            "Publish Sync:": "Sync:",
            "timing-send": "Send Timing",
            "now-send": "Send Now",
            "buffer-adding": "Adding to send list...",
            "buffer-notice": "SocialBa! released a new weather service app, welcome to use!",
            "buffer-readed": "Read",
            "successed": "Successed",
            "expired": "Expired",
            "error-contentEmpty": "Content can not be empty!",
            "error-siteEmpty": "You have not select social networks.",
            "error-bufferEmpty": "You have no timed posts in the queue. Try it!",
            "error-timeEarlier": "Selected time is earlier than now!",
            "error-timeOut": "Selected time can not be afert [[count]] days!",
            "error-threadOutSize": "You can just add [[count]] buffer message!",
            "error-invalidTime": "Invalid Time!"
        }
    }
}