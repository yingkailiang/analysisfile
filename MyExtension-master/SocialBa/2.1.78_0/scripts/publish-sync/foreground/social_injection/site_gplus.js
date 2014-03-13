
var site_gplus = {
    urlParttens: [
        /^https{0,1}:\/\/plus.google.com\/{0,1}$/g,
        /^https{0,1}:\/\/plus.google.com\/stream/g,
        /^https{0,1}:\/\/plus.google.com\/\d*\//g,
        /^https{0,1}:\/\/plus.google.com\/u\//g,
        /^https{0,1}:\/\/plus.google.com\/\?/g,
        /^https{0,1}:\/\/plus.google.com\/photos\/fromphone/g
    ],
    urlMatch: function (url) {
        var _self = site_gplus;
        for (var i in _self.urlParttens) {
            if (url.match(_self.urlParttens[i])) {
                return true;
            }
        }
        return false;
    },

    normalText: function () { return $('#contentPane [guidedhelpid="sharebox"] .editable') },
    normalPicture: function () { return $('#contentPane [guidedhelpid="sharebox"] a img') },
    normalButton: function () { return $('#contentPane [guidedhelpid="sharebox"] [guidedhelpid="sharebutton"]') },
    normalTarget: function () { return $('#contentPane [guidedhelpid="sharebox"] #sync_container'); },
    normalContainer: function () { return $('#contentPane [guidedhelpid="sharebox"] [guidedhelpid="shareboxcontrols"]'); },

    maxLength: 0,
    getTarget: function () {
        var _self = site_gplus;
        if (_self.normalContainer().length > 0 && _self.normalTarget().length <= 0) {
            siteHelper.addStyle('saGooglePlusStyle', '#saSiteCheckBoxCenter { padding: 5px; } #saNoticeAdCnter { border-top: 1px solid #B4BBCD; }');
            _self.normalContainer().append('<div id="sync_container" style="margin-top: 10px; background: white; border: 1px solid #ccc;"></div><div style="clear: both;"></div>');
        }
        return _self.normalTarget();
    },
    checkChanged: function (callback) {
        var _self = site_gplus;

        var submit = $('#contentPane [valign="top"] [role="button"]').eq(0);
        if (this.isFromPhone()) {
            submit = $('.P-t[role="dialog"] [role="button"]').eq(0);
        }
        if (submit.length > 0 && $("#sync_container").length <= 0) {
            if (callback) callback(true);
        }

        socialClient.checkChanged(callback);
    },
    render: function () {
        if (!this.urlMatch(document.location.href)) { return; }
        var _self = site_gplus;

        var target = _self.getTarget();
        siteHelper.bind('gplus', target, _self);

        _self.normalButton().unbind('mouseup').mouseup(function () {
            siteHelper.submitFeed(_self.getFeedBag(), 'gplus');
        });

        if (_self.normalButton().length > 0) {
            _self.setMaxLength(_self.normalContainer());
        }
    },
    addCountInfo: function (tdShow) {
        var _self = site_gplus;

        var showDivSelector = '#enterMessageCount';
        var editableSelector = _self.isFromPhone() ? '.P-t[role="dialog"] .editable' : '#contentPane .editable';
        if (!_self.showDiv || !_self.showDiv.offset() || _self.showDiv.offset().top == 0) {
            if (_self.isFromPhone()) {
                $('.P-t[role="dialog"] .ga-V-ba').eq(0).append('<div id="enterMessageCount" style="position: absolute;"></div>');
            }
            else {
                tdShow.append('<div id="enterMessageCount" style="position: absolute;bottom: 10px;right: 10px;font-weight: bold;"></div>');
            }
            _self.showDiv = $(showDivSelector);
        }
        if ($(editableSelector).length >= 0 && !$(editableSelector).attr('bind-enter-count')) {
            $(editableSelector).keyup(function () {
                _self.setMaxLength();
            });
            $(editableSelector).attr('bind-enter-count', 'true');
        }

        $(showDivSelector).text(_self.maxLength > 0 ? (_self.maxLength - $(editableSelector).text().length) : '');
    },
    setMaxLength: function (tdShow) {
        var _self = site_gplus;
        _self.maxLength = 0;

        for (var siteName in socialClient.charLimited) {
            if (typeof socialClient.charLimited[siteName] != undefined
                && $('#c_' + siteName).attr('checked')) {
                var siteCount = socialClient.charLimited[siteName];
                if (_self.maxLength <= 0) { _self.maxLength = siteCount; }
                else { _self.maxLength = _self.maxLength < siteCount ? _self.maxLength : siteCount; }
            }
        }

        _self.addCountInfo(tdShow);
    },
    getFeedBag: function () {
        var _self = site_gplus;

        var shareBox = $('#contentPane [guidedhelpid="sharebox"]');
        var msgBag = { message: '', links: [], pictures: [] };

        // Share Message
        msgBag.message = _self.normalText().html();

        // Share Links
        var link = shareBox.find('a.ot-anchor').attr('href');
        if (link) {
            msgBag.links.push({
                url: shareBox.find('a.ot-anchor').last().attr('href'),
                title: shareBox.find('a.ot-anchor').last().text(),
                content: shareBox.find('a.ot-anchor').last().next().text(),
                favicon: 'http:' + shareBox.find('a.ot-anchor').last().prev().attr('src'),
                picture: 'http:' + shareBox.find('a.ot-anchor').first().find('img').eq(0).attr('src')
            });
        }

        // Upload Pictures
        else {
            var pictureBoxs = shareBox.find('div>img[src*="//lh"]');
            for (var i = 0; i < pictureBoxs.length; i++) {
                var pictureUrl = pictureBoxs.eq(i).attr('src');
                pictureUrl = pictureUrl.replace(/\/w\d*-h\d*-p\//g, '/s1000/').replace(/\/w\d*-h\d*\//g, '/s1000/');
                msgBag.pictures.push('http:' + pictureUrl);
            }
        }

        return msgBag;
    },
    isFromPhone: function () {
        return document.location.href.match(/https{0,1}:\/\/plus.google.com\/photos\/fromphone/g);
    }
};

if (site_gplus.urlMatch(window.location.href)) {
    var renderInterval = setInterval(function () {
        var _self = site_gplus;
        try {
            if (window.closed) { delete _self; clearInterval(renderInterval); }
            else {
                _self.checkChanged(function (isChanged) {
                    if (isChanged) _self.render();
                });
            }
        } catch (e) { console.error('site_gplus.render() : ' + e.message); }
    }, 2000);

    socialClient.updateAccount('gplus');
}