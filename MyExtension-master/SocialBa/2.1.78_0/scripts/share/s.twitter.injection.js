/// <reference path="../publish-sync/foreground/socialClient.js" />

var twitterShare = {
    parseURL: function (dom) {
        var parent = dom.parentNode;
        var link = parent.querySelector('a.permalink-link');
        var text = '';
        var title = '';
        if (link) {
            text = $(parent).parents('.content');
            if (text == null) { console.log('error'); }
            if (text) {
                text = '(' + text.find('strong.fullname').text() + ')' + text.find('p').text().substring(0, 130);
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
        obj.setAttribute('style', 'display: inline-block; margin: 3px auto auto 5px; vertical-align: top;');
        obj.setAttribute('url', bag.link);
        obj.setAttribute('text', bag.text);

        return obj;
    },

    renderItem: function (actionBar) {
        var display = true;

        var _self = twitterShare;
        if (actionBar && display) {
            if (!actionBar.querySelector('s-shares')) {
                var shareBag = _self.parseURL(actionBar);
                actionBar.appendChild(_self.getDom(shareBag));

                sapi.s.render();
            }
        }
    },

    render: function () {
        var _self = twitterShare;
        socialClient.getOptions(function (options) {
            if (options.enableShare) {
                sapi.s.setIcons(getExtensionUrl('content/share-1.png'));

                var actionBars = document.querySelectorAll('.opened-tweet .client-and-actions');
                for (var i = 0; i < actionBars.length; i++) {
                    _self.renderItem(actionBars[i]);
                }
            }
            else {
                $('x-shares').remove();
            }
        });
    }
}

/*
*
* 当页面发生改变的时候，重新绑定分享插件！
*/
setInterval(function () {
    sapi.s.config.siteName = 'twitter';
    twitterShare.render();
}, 2000);
