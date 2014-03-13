/// <reference path="../../browserHelper.js" />

var gplusHelper = {
    // << 静态变量： >>
    urls: {
        postMessage: 'https://plus.google.com/_/sharebox/post/?spam=20&_reqid=1154694&rt=j',
        homeUrl: 'https://plus.google.com/',
        circles: 'https://plus.google.com/_/socialgraph/lookup/circles/?ct=2&m=true&_reqid=556276&rt=j',
        userId: 'https://plus.google.com/u/0/_/notifications/frame'
    },

    // << 辅助方法： >>
    userId: function (userId) {
        if (typeof userId == 'undefined') {
            return localStorage['gplus.userId'];
        }

        if (localStorage['gplus.userId'] != userId) { options.last_time(new Date()); }

        if (!userId) { localStorage.removeItem('gplus.userId'); }
        else { localStorage['gplus.userId'] = userId; }
    },
    userName: function (userName) {
        if (typeof userName == 'undefined') {
            return localStorage['gplus.userName'];
        }

        if (!userName) { localStorage.removeItem('gplus.userName'); }
        else { localStorage['gplus.userName'] = userName; }
    },
    userAt: function (userAt) {
        if (typeof userAt == 'undefined') {
            return localStorage['gplus.userAt'];
        }

        if (!userAt) { localStorage.removeItem('gplus.userAt'); }
        else { localStorage['gplus.userAt'] = userAt; }
    },
    circles: function (circles) {
        var _self = gplusHelper;

        if (typeof circles == 'undefined') {
            return _self.acircles;
        }

        _self.acircles = circles;
    },

    // << 核心发送： >>
    /*--------------------------------------- 我是分割线 ---------------------------------------------*/
    getUserId: function (callback) {
        var _self = this;

        bh.ajax({
            url: _self.urls.userId,
            data: null,
            success: function (text) {
                try {
                    var userId = _self.userId();

                    _self.userId(text.match(/,,\["(.*?)"\]/)[1]);
                    if (callback) callback(_self.userId());

                    if (!userId && _self.userId()) {
                        if (events && events.onUserChange) { events.onUserChange(); }
                    }
                }
                catch (ex) {
                    _self.userId(null);
                    _self.userAt(null);
                    _self.userName(null);
                }
            },
            error: function (x, t, e) {
                _self.userId(null);
                _self.userAt(null);
                _self.userName(null);
            },
            dataType: 'text'
        });
    },
    getUserName: function (callback) {
        var _self = this;

        bh.ajax({
            url: _self.urls.homeUrl,
            data: null,
            success: function (text) {
                if (text && (text.match(/\[\["\w*"\]\s*,\["[^"]*/g)[0] != '[["gbkc"],["gbf') || true) {
                    try {
                        _self.userAt(text.match(/\"([a-z,A-Z,\d,\-,_]{6,100}:\d{6,100}?)\"/)[1]);
                        _self.userName(text.match(/{\\"scope\\":{\\"name\\":\\"([^\\^"]*)\\",\\"/)[1]);

                        if (callback) callback(_self.userName());
                    } catch (e) { console.error('gplus_.getCurrent(): ' + e.message); }
                }
            },
            dataType: 'text'
        });
    },
    getCircles: function (callback) {
        var _self = this;

        bh.ajax({
            url: _self.urls.circles,
            data: 'at=' + encodeURIComponent(_self.userAt()) + '&',
            success: function (text) {
                text = text.replace(/\n/g, '').match(/\[\[\["f.ri".*?\]\]\]/g)[0];

                var circles = [];
                var matchs = text.match(/\[\["\w{16}"\]\s*,\["[^"]*",(([^,\]].)*,)*\d,\d,\d]\s*]/g);
                for (i in matchs) {
                    var circle = {
                        name: matchs[i].match(/"[^"]*?"/g)[1].replace(/"/g, ''),
                        value: matchs[i].match(/"[^"]*?"/g)[0].replace(/"/g, '')
                    };
                    circles.push(circle);
                }
                var plublic = 'Public'; // navigator.language.toLowerCase() == 'zh-cn' ? '公开' : (navigator.language.toLowerCase() == 'zh-tw' ? '公開' : 'Public');
                circles.push({
                    name: plublic,
                    value: "anyone"
                });

                _self.circles(circles);
                if (callback) callback(_self.circles())
            },
            dataType: 'text',
            type: 'POST'
        });
    },

    /*--------------------------------------- 我是分割线 ---------------------------------------------*/
    getCurrent: function (callback) {
        var _self = this;

        _self.getUserId(function (userId) {   // 确认登录成功 再获取用户资料！
            if (!_self.userAt()) {
                _self.getUserName();
            }
            if (_self.userAt()) {
                _self.getCircles();
            }

            if (callback) { callback(true); }
        });
    },
    postMessage: function (ranges, messageText, link, video) {
        var _self = this;

        var postData = _self.getPostData(ranges, messageText, link, video);

        bh.ajax({
            url: _self.urls.postMessage,
            data: postData,
            success: function (response) { },
            type: 'POST'
        });
    },

    /*--------------------------------------- 我是分割线 ---------------------------------------------*/
    getPostData: function (circles, text, link, video) {
        var _self = this;

        var postData = '';
        circles = (!circles || circles.length <= 0) ? ['anyone'] : circles;

        // << 同步链接地址 >>
        if (link.url) {
            console.log('<< gplus >> ( Url ) Circles Selected: ' + circles.length);
            postData = _self.getPostLinkData(circles, text, link);
        }
        // << 同步视频！ >>
        else if (video) {
            console.log('<< gplus >> ( Video ) Circles Selected: ' + circles.length);
            postData = _self.getPostVideoData(circles, text, video);
        }
        // << 纯文本同步 >>
        else {
            text = JSON.stringify(text).replace(/(^")|("$)/g, '');
            postData = _self.getPostTextData(circles, text);
        }

        postData += _self.getPostRanges(circles) + '&at=' + encodeURIComponent(_self.userAt()) + '&';
        return postData;
    },
    getPostTextData: function (ranges, text) {
        var _self = this;

        var postData = 'spar=%5B%22' + encodeURIComponent(text) + '%22%2C%22oz%3A' + _self.userId() + '.' + _self.tools.getRandom() + '.0%22%2Cnull%2Cnull%2Cnull%2Cnull%2C%22%5B%5D%22%2Cnull%2C';
        return postData
    },
    getPostLinkData: function (ranges, txt, link) {
        var _self = this;

        link.img = encodeURIComponent(link.img);
        link.url = encodeURIComponent(link.url);
        link.size = encodeURIComponent(link.size);
        link.favicon = encodeURIComponent(link.favicon);
        var content = '.0%22%2Cnull%2Cnull%2Cnull%2Cnull%2C%22%5B%5C%22%5Bnull%2Cnull%2Cnull%2C%5C%5C%5C%22%5C%5C%5C%5Cu6807%5C%5C%5C%5Cu9898%5C%5C%5C%22%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5C%5C%5C%22%5C%5C%5C%5Cu5185%5C%5C%5C%5Cu5BB9%5C%5C%5C%22%2Cnull%2Cnull%2C%5Bnull%2C%5C%5C%5C%22' + link.url + '%5C%5C%5C%22%2Cnull%2C%5C%5C%5C%22text%2Fhtml%5C%5C%5C%22%2C%5C%5C%5C%22document%5C%5C%5C%22%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5Bnull%2C%5C%5C%5C%22';
        content = gplusHelper.tools.unascii(decodeURIComponent(content));
        content = content.replace(/\\\\\\标\\\\\\题\\\\\\/g, _self.tools.processContent(link.title)).replace(/\\\\\\内\\\\\\容\\\\\\/g, gplusHelper.tools.processContent(link.content));
        content = encodeURIComponent(gplusHelper.tools.ascii(content));
        var postData = 'f.req=%5B%22' + encodeURIComponent(_self.tools.ascii(txt)) + '%22%2C%22oz%3A' + _self.userId() + '.' + _self.tools.getRandom() + content + link.favicon + '%5C%5C%5C%22%2Cnull%2Cnull%5D%2C%5Bnull%2C%5C%5C%5C%22' + link.favicon + '%5C%5C%5C%22%2Cnull%2Cnull%5D%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5Bnull%2C%5C%5C%5C%22%5C%5C%5C%22%2C%5C%5C%5C%22http%3A%2F%2Fgoogle.com%2Fprofiles%2Fmedia%2Fprovider%5C%5C%5C%22%5D%5D%5D%';
        if (link.img) {
            postData += '5C%22%2C%5C%22%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5Bnull%2C%5C%5C%5C%22' + link.img + '%5C%5C%5C%22%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5Bnull%2C%5C%5C%5C%22' + link.url + '%5C%5C%5C%22%2Cnull%2C%5C%5C%5C%22image%2Fjpeg%5C%5C%5C%22%2C%5C%5C%5C%22photo%5C%5C%5C%22%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C' + link.size + '%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5Bnull%2C%5C%5C%5C%22' + link.img + '%5C%5C%5C%22%2Cnull%2Cnull%5D%2C%5Bnull%2C%5C%5C%5C%22' + link.img + '%5C%5C%5C%22%2Cnull%2Cnull%5D%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5Bnull%2C%5C%5C%5C%22images%5C%5C%5C%22%2C%5C%5C%5C%22http%3A%2F%2Fgoogle.com%2Fprofiles%2Fmedia%2Fprovider%5C%5C%'
        }
        postData += '5C%22%5D%5D%5D%5C%22%5D%22%2Cnull%2C';
        return postData
    },
    getPostVideoData: function (ranges, txt, video) {
        var _self = this;

        video.title = encodeURIComponent(_self.tools.ascii(_self.tools.processContent(video.title)));
        video.content = encodeURIComponent(_self.tools.ascii(_self.tools.processContent(video.content)));
        var postData = 'spar=%5B%22' + encodeURIComponent(txt) + '%22%2C%22oz%3A' + _self.userId() + '.' + _self.tools.getRandom() + '.0%22%2Cnull%2Cnull%2Cnull%2Cnull%2C%22%5B%5C%22%5Bnull%2Cnull%2Cnull%2C%5C%5C%5C%22' + video.title + '%22%2Cnull%2C%5Bnull%2C%5C%5C%5C%22http%3A%2F%2Fwww.youtube.com%2Fv%2F' + video.id + '%26hl%3Den%26fs%3D1%26autoplay%3D1%5C%5C%5C%22%5D%2Cnull%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5C%5C%5C%22' + video.content + '%22%2Cnull%2Cnull%2C%5Bnull%2C%5C%5C%5C%22http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D' + video.id + '%5C%5C%5C%22%2Cnull%2C%5C%5C%5C%22application%2Fx-shockwave-flash%5C%5C%5C%22%2C%5C%5C%5C%22video%5C%5C%5C%22%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5Bnull%2C%5C%5C%5C%22https%3A%2F%2Fytimg.googleusercontent.com%2Fvi%2F' + video.id + '%2Fhqdefault.jpg%5C%5C%5C%22%2C120%2C160%5D%2C%5Bnull%2C%5C%5C%5C%22https%3A%2F%2Fytimg.googleusercontent.com%2Fvi%2F' + video.id + '%2Fhqdefault.jpg%5C%5C%5C%22%2C120%2C160%5D%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5Bnull%2C%5C%5C%5C%22youtube%5C%5C%5C%22%2C%5C%5C%5C%22http%3A%2F%2Fgoogle.com%2Fprofiles%2Fmedia%2Fprovider%5C%5C%5C%22%5D%5D%5D%5C%22%5D%22%2Cnull%2C';
        return postData
    },
    postLink: function (ranges, txt, url) {
        var _self = this;

        var postUrl = 'https://plus.google.com/_/sharebox/linkpreview/?t=1&_reqid=938501&rt=j&c=' + encodeURIComponent(url);
        var postData = 'at=' + encodeURIComponent(_self.userAt()) + '&';
        gplusHelper.tools.post(postUrl, postData,
        function (response) {
            var link = {};
            link.url = url;
            link.img = response.match(/,\[,"(http[^"]*?)"]/) ? response.match(/,\[,"(http[^"]*?)"]/)[1] : '';
            link.favicon = response.match(/,\[,"(\/\/.*?)"/) ? response.match(/,\[,"(\/\/.*?)"/)[1] : '';
            link.title = response.match(/\[,,,"(.*?)"/) ? response.match(/\[,,,"(.*?)"/)[1] : '';
            link.content = response.match(/,,,,,"(.*?)",,,/) ? response.match(/,,,,,"(.*?)",,,/)[1] : '';
            link.size = response.match(/"photo",,,,,,,,(.*?)]/) ? response.match(/"photo",,,,,,,,(.*?)]/)[1] : '';
            gplusHelper.postMessage(ranges, txt, link)
        })
    },
    getPostRanges: function (ranges) {
        var _self = this;

        var item = '{\\"scope\\":{\\"scopeType\\":\\"focusGroup\\",\\"name\\":\\"\\\\u4efb\\\\u4f55\\\\u4eba\\",\\"id\\":\\"{range}\\",\\"me\\":true,\\"requiresKey\\":false},\\"role\\":20},{\\"scope\\":{\\"scopeType\\":\\"focusGroup\\",\\"name\\":\\"\\\\u4efb\\\\u4f55\\\\u4eba\\",\\"id\\":\\"{range}\\",\\"me\\":true,\\"requiresKey\\":false},\\"role\\":60}';
        var postRanges = '"{\\"aclEntries\\":[';
        for (index in ranges) {
            var range = item.replace(/{range}/g, _self.userId() + '.' + ranges[index]) + (index == ranges.length - 1 ? '' : ',');
            if (ranges[index] == 'anyone') range = item.replace(/focusGroup/g, 'anyone').replace(/{range}/g, ranges[index]) + (index == ranges.length - 1 ? '' : ',');
            postRanges += range
        }
        postRanges += ']}",true,[],false,false,null,[],false,false]';
        return encodeURIComponent(postRanges)
    }
}

gplusHelper.tools = {
    getHttp: function () {
        if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP")
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest()
        } else {
            return undefined
        }
    },
    post: function (url, postData, callback) {
        var http = gplusHelper.tools.getHttp();
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        console.log('post use httpRequest...');
        http.onreadystatechange = function () {
            console.log(http.readyState + ' : ' + http.status);
            if (http.readyState == 4 && http.status == 200) {
                console.log('reback from google!');
                if (callback) callback(http.responseText)
            }
        };
        http.send(postData)
    },
    get: function (url, callback) {
        var http = gplusHelper.tools.getHttp();
        http.open("GET", url, false);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                if (callback) callback(http.responseText)
            }
        };
        http.send(null)
    },
    datas: '123456789abcdefghijklmnopqrstuvwxyz',
    getRandom: function () {
        var _self = gplusHelper;

        var oz = "";
        for (var i = 0; i < 11; i++) {
            var random = Math.floor(1 + Math.random() * 33);
            oz += _self.tools.datas[random]
        }
        return oz
    },
    ascii: function (str) {
        return str.replace(/[^\u0000-\u00FF]/g,
        function ($0) {
            return escape($0).replace(/(%u)(\w{4})/gi, "\\u$2")
        })
    },
    unascii: function (str) {
        return unescape(str.replace(/\\u/g, "%u"))
    },
    processContent: function (txt) {
        var _self = gplusHelper;

        var result = '';
        for (i in txt) {
            result += (txt[i].match(/[^\u4e00-\u9fa5]/) ? '' : '\\\\\\') + _self.tools.ascii(txt[i])
        }
        result += '\\\\\\';
        return result
    }
};

gplusHelper.userAt(''); //每次打开浏览器重新获取