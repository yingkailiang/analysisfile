/// <reference path="../publish-sync/foreground/socialClient.js" />


var shareFacebook = {
    urls: [
        "http://www.facebook.com",
        "https://www.facebook.com"
    ],
    urlMatch: function (url) {
        var _self = shareFacebook;
        for (var i in _self.urls) {
            if (url.indexOf(_self.urls[i]) > -1) return true;
        }
        return false;
    },

    parseURL: function (dom) {
        var parent = dom.parentNode;
        var link = parent.querySelector('.uiStreamSource a');
        var text = '';
        var title = '';
        if (link) {
            text = parent.parentNode.querySelector('.messageBody');
            if (text == null) { text = ''; }
            else { text = text.innerText; }
            link = link.href;
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
        obj.setAttribute('style', 'margin: -2px 15px 0 0; float: right;');
        obj.setAttribute('url', bag.link);
        obj.setAttribute('text', bag.text);

        return obj;
    },

    renderItem: function (actionBar) {
        var _self = shareFacebook;

        var display = true;

        if (actionBar && display) {
            if (!actionBar.querySelector('s-shares')) {
                var shareBag = _self.parseURL(actionBar);
                actionBar.appendChild(_self.getDom(shareBag));

                sapi.s.render();
            }
        }
    },

    render: function () {
        var _self = shareFacebook;

        socialClient.getOptions(function (options) {
            if (options.enableShare) {
                sapi.s.setIcons(getExtensionUrl('content/share-1.png'));
                var actionBars = document.querySelectorAll('.uiStreamFooter');

                for (var i = 0; i < actionBars.length; i++) {
                    var actionBar = actionBars[i];
                    if (actionBar.nodeName == 'DIV') {
                        actionBar = actionBar.querySelectorAll('div')[0];
                    }
                    _self.renderItem(actionBar);
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

if (shareFacebook.urlMatch(window.location.href)) {
    sapi.s.config.siteName = 'facebook';
    setInterval(function () { shareFacebook.render(); }, 2000);
}
