/// <reference path="../publish-sync/foreground/socialClient.js" />


var shareGplus = {
    urls: [
        "http://plus.google.com",
        "https://plus.google.com"
    ],
    urlMatch: function (url) {
        var _self = shareGplus;
        for (var i in _self.urls) {
            if (url.indexOf(_self.urls[i]) > -1) return true;
        }
        return false;
    },

    parseURL: function (dom) {
        var parent = dom.parentNode;
        var link = parent.querySelector('a[target="_blank"]');
        var text = '';
        var title = '';
        if (link) {
            text = $(parent).find('.wm.VC"');
            if (text == null) { console.log('error'); }
            if (text) {
                text = text.text().replace(/\s+/g, ' ');
                text = text.substring(0, 150);
            }
            else {
                text = ''; // Empty for now till we figure out what to do.
            }
            link = link.href;
            // Support multiple accounts.
            link = link.replace(/plus\.google\.com\/u\/(\d*)/, 'plus.google.com');
        }

        return {
            status: link ? true : false,
            link: link,
            text: text,
            title: title
        };
    },

    getDom: function (bag) {
        var obj = document.createElement('s-shares');
        obj.setAttribute('style', 'margin: 10px 0 0; float: right;');
        obj.setAttribute('url', bag.link);
        obj.setAttribute('text', bag.text);

        return obj;
    },

    renderItem: function (actionBar) {
        var _self = shareGplus;

        var display = true;

        if (actionBar && display) {
            if (!actionBar.querySelector('s-shares')) {
                actionBar.children[actionBar.children.length - 1].setAttribute('style', 'float: right;');

                var shareBag = _self.parseURL(actionBar);
                actionBar.appendChild(_self.getDom(shareBag));

                sapi.s.render();
            }
        }
    },

    render: function () {
        var _self = shareGplus;

        socialClient.getOptions(function (options) {
            if (options.enableShare) {
                sapi.s.setIcons(getExtensionUrl('content/share-1.png'));
                var actionBars = document.querySelectorAll('.Sb .LI');
                for (var i = 0; i < actionBars.length; i++) {
                    _self.renderItem(actionBars[i]);
                }
            }
            else {
                $('s-shares').remove();
            }
        });
    }
}

/*
*
* 当页面发生改变的时候，重新绑定分享插件！
*/

/*
if (shareGplus.urlMatch(window.location.href)) {
    sapi.s.config.siteName = 'gplus';
    setInterval(function () { shareGplus.render(); }, 2000);
}
*/
