
var options = {
    siteNames: 'facebook,gplus,twitter,linkedin,vkontakte,plurk,weibo,tencent,renren,kaixin001,qzone',
    is_debug: function (is_debug) {
        if (typeof is_debug == 'undefined') {
            return this.config().isDebug;
        }

        this.config({ isDebug: is_debug });
    },
    config: function (config) {
        if (typeof config === 'undefined') {
            var json = localStorage['options'];
            if (!json) {
                localStorage['options'] = '{}';
                this.config(this.getResetConfig());   // :获取已经旧的设置
                return this.config();                 // :重新获取使用者设置
            }
            return JSON.parse(json ? json : '{}');
        }

        if (this.validate(config)) {
            if (config.siteNames) {
                config.last_time = UTC(new Date());
            }
            localStorage['options'] = JSON.stringify(copy(config, this.config()));
        }
    },
    validate: function (_options) {
        if (!_options) { return false; }
        if (_options.siteNames) {
            var siteNames = [];
            var sortSiteNames = options.siteNames.split(',');
            for (var i = 0; i < sortSiteNames.length; i++) {
                var sortSiteName = sortSiteNames[i];
                if (_options.siteNames.indexOf(sortSiteName) >= 0) {
                    siteNames.push(sortSiteName);
                }
            }
            _options.siteNames = siteNames;
        }
        return true;
    },
    getResetConfig: function () {
        var cast = localStorage['options.eBroadcast'];
        cast = (typeof cast == 'undefined') ? true : (cast != '0');

        var ad_right = localStorage['options.eRightAd'];
        ad_right = (typeof ad_right == 'undefined') ? true : (ad_right != '0');

        var ad_text = localStorage['options.eVideoAd'];
        ad_text = (typeof ad_text == 'undefined') ? true : (ad_text != '0');

        // :获取已经启用的网站
        var siteNames = [];
        if (typeof localStorage['siteNames'] == 'undefined') {
            switch (window.navigator.language) {
                case 'zh-CN':
                    siteNames = ['facebook', 'twitter', 'gplus', 'tencent'];
                    break;
                case 'zh-TW':
                    siteNames = ['facebook', 'twitter', 'gplus', 'plurk'];
                    break;
                default:
                    siteNames = ['facebook', 'twitter', 'gplus', 'linkedin'];
                    break;
            }
        }
        else {
            siteNames = localStorage['siteNames'].split(',');
        }

        return {
            isDebug: localStorage['options.is_debug'] == '1',
            siteNames: siteNames,
            enableShare: localStorage._enable_shareControl != '0',
            broadcast: cast,
            advertise: {
                text: { text: localStorage['right.adstext'], enable: ad_text },
                right: { text: localStorage['right.ads'], enable: ad_right }
            },
            last_time: localStorage['lastModifyTime']
        }
    },
    last_time: function (lastModifyTime) {
        if (typeof lastModifyTime == 'undefined') {
            return this.config().last_time;
        }

        var config = this.config();
        config.last_time = UTC(lastModifyTime);
        this.config(config);
    }
};