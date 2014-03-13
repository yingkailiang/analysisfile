/// <reference path="../common.js" />
/// <reference path="../jquery-1.7.2.min.js" />

var sapi = {};
sapi.s = {
    config: {
        tagName: "s-shares",
        icons: chrome.extension.getURL('content/share-1.png'),
        connectUrl: "https://socialba.com/share",
        showCount: 4,
        siteName: 'default',
        vias: function (vias) {
            if (typeof vias == 'undefined') {
                var json = localStorage['xj_shares_showVias'];
                if (typeof json == 'undefined') {
                    switch (sapi.s.config.siteName) {
                        case 'gplus':
                            return ['facebook', 'twitter', 'linkedin', 'tumblr'];
                        case 'twitter':
                            return ['gplus', 'facebook', 'linkedin', 'tumblr'];
                        case 'facebook':
                            return ['gplus', 'twitter', 'linkedin', 'tumblr'];
                    }
                    return ['facebook', 'twitter', 'linkedin', 'tumblr'];
                }
                return json.split(',');
            }
            localStorage['xj_shares_showVias'] = vias.join(',');
        }
    },
    share: function (v, u, t) {
        window.open(sapi.s.config.connectUrl + "?u=" + encodeURIComponent(u) + "&v=" + encodeURIComponent(v) + "&t=" + encodeURIComponent(t ? t : document.title), "share", "width=700px,height=500px,top=150px,left=350px");
    },
    render: function () {
        var v = null;
        sapi.s.addPopup(v = sapi.s.config.vias());

        var controls = $(sapi.s.config.tagName);
        for (var i = 0; i < controls.length; i++) {
            var c = controls[i];
            sapi.s.renderControl(c, v);
        }
    },

    getOffset: function (el) {
        var ua = navigator.userAgent.toLowerCase();
        var isOpera = (ua.indexOf('opera') != -1);
        var isIE = (ua.indexOf('msie') != -1 && !isOpera);
        if (el.parentNode === null || el.style.display == 'none') {
            return false;
        }
        var parent = null;
        var pos = [];
        var box;
        if (el.getBoundingClientRect) {
            box = el.getBoundingClientRect();
            var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            return { x: box.left + scrollLeft, y: box.top + scrollTop };
        }
        else if (document.getBoxObjectFor) {
            box = document.getBoxObjectFor(el);
            var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
            var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
            pos = [box.x - borderLeft, box.y - borderTop];
        }
        else {
            pos = [el.offsetLeft, el.offsetTop];
            parent = el.offsetParent;
            if (parent != el) {
                while (parent) {
                    pos[0] += parent.offsetLeft;
                    pos[1] += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }
            if (ua.indexOf('opera') != -1
            || (ua.indexOf('safari') != -1 && el.style.position == 'absolute')) {
                pos[0] -= document.body.offsetLeft;
                pos[1] -= document.body.offsetTop;
            }
        }
        if (el.parentNode) { parent = el.parentNode; }
        else { parent = null; }
        while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
            pos[0] -= parent.scrollLeft;
            pos[1] -= parent.scrollTop;
            if (parent.parentNode) { parent = parent.parentNode; }
            else { parent = null; }
        }
        return { x: pos[0], y: pos[1] };
    },
    addPopup: function (v) {
        if ($('.__spopup').length <= 0) {
            $('body').append(
              '<div class="__sshare" id="__spopup">'
            + '    <div class="__spopup">'
            + '        <ul>'
            + '            <li><a href="#"><i for="fb" class="ico"></i></a><a class="text" data-site="fb" href="#"><i class="fb"></i><span>Facebook</span></a></li>'
            + '            <li><a href="#"><i for="ggp" class="ico"></i></a><a class="text" data-site="ggp" href="#"><i class="ggp"></i><span>Google+</span></a></li>'
            + '            <li><a href="#"><i for="tw" class="ico"></i></a><a class="text" data-site="tw" href="#"><i class="tw"></i><span>Twitter</span></a></li>'
            + '            <li><a href="#"><i for="li" class="ico"></i></a><a class="text" data-site="li" href="#"><i class="li"></i><span>Linkedin</span></a></li>'
            + '            <li><a href="#"><i for="dg" class="ico"></i></a><a class="text" data-site="dg" href="#"><i class="dg"></i><span>Digg</span></a></li>'
            + '            <li><a href="#"><i for="my" class="ico"></i></a><a class="text" data-site="my" href="#"><i class="my"></i><span>Myspace</span></a></li>'
            + '            <li><a href="#"><i for="tm" class="ico"></i></a><a class="text" data-site="tm" href="#"><i class="tm"></i><span>Tumblr</span></a></li>'
            + '            <li><a href="#"><i for="pk" class="ico"></i></a><a class="text" data-site="pk" href="#"><i class="pk"></i><span>Plurk</span></a></li>'
            + '            <li><a href="#"><i for="wb" class="ico"></i></a><a class="text" data-site="wb" href="#"><i class="wb"></i><span>Weibo</span></a></li>'
            + '        </ul>'
            + '        <div class="__info">'
            + '            2 more can be selected.'
            + '        </div>'
            + '    </div>'
            + '</div>');

            sapi.s.bindVias();

            $('.__spopup').mouseleave(function (event) {
                if (!event.relatedTarget || event.relatedTarget.className != 'mr') {
                    $('.__spopup').hide();
                }
            });

            $('.__spopup [data-site]').click(function () {
                var s = this.getAttribute('data-site');
                var p = $('.__spopup');

                if (s = sapi.s.classNames[s]) {
                    sapi.s.share(s, p.attr('url'), p.attr('text'));
                }

                return false;
            });

            $('.__spopup .ico').click(function () {
                var li = this.parentElement.parentElement;
                var sn = sapi.s.classNames[this.getAttribute('for')];
                var vs = sapi.s.config.vias();

                if (li.getAttribute('class') == '__selected') {
                    for (var iv = 0; iv < vs.length; iv++) {
                        if (vs[iv] == sn) {
                            vs.splice(iv, 1);
                            sapi.s.config.vias(vs);
                            break;
                        }
                    }
                } else {
                    // 增加网站
                    if (vs.length >= sapi.s.config.showCount) {
                        return;
                    }

                    if (vs.join(',').indexOf(sn) == -1) {
                        vs.push(sn);

                        // 排序
                        var vv = [];
                        var sa = ['ggp', 'fb', 'tw', 'li', 'dg', 'my', 'tm', 'pk', 'wb'];

                        for (var is = 0; is < sa.length; is++) {
                            for (var iv = 0; iv < vs.length; iv++) {
                                if (sa[is] == sapi.s.classNames[vs[iv]]) {
                                    vv.push(vs[iv]);
                                }
                            }
                        }

                        sapi.s.config.vias(vv);
                    }
                }

                sapi.s.bindVias();
                return false;
            });
        }
    },
    renderControl: function (c, v) {
        if (!c.getAttribute('complete')) {

            // 添加SNS网站图标  &&  绑定事件
            c.setAttribute('complete', 'true');
            c.innerHTML = '<div class="__sshare __control"><ul></ul></div>';
            c = $(c).find('ul');

            for (var iv = 0; iv < v.length; iv++) {
                if (sapi.s.classNames[v[iv]]) {
                    $(c).append(sapi.s.createElement(sapi.s.classNames[v[iv]]));
                }
            }

            $(c).find('[data-site]').bind('click', function () {
                var s = this.getAttribute('data-site');
                var p = $(this).parents('s-shares');

                if (s = sapi.s.classNames[s]) {
                    sapi.s.share(s, p.attr('url'), p.attr('text'));
                }

                return false;
            });

            // 添加更多图标  &&  绑定事件
            $(c).append(sapi.s.createElement('mr'));
            $(c).find('.mr').mouseover(function () {
                var ofs = sapi.s.getOffset($(this)[0]);
                var p = $(this).parents('s-shares');

                var spopup = $('.__spopup')
                    .attr('url', p.attr('url'))
                    .attr('text', p.attr('text'))
                    .fadeIn(100);
                sapi.s.setPosition(ofs, spopup[0]);
            }).mouseleave(function (event) {
                var targ = event.relatedTarget;
                if (targ && $(targ).parents('#__spopup').length > 0) {
                    return;
                }

                $('.__spopup').hide();
            });
        }
    },
    bindVias: function () {
        var v = sapi.s.config.vias();

        var controls = $(sapi.s.config.tagName);
        for (var i = 0; i < controls.length; i++) {
            var c = controls[i];
            c.removeAttribute('complete');

            sapi.s.renderControl(c, v);
        }

        vstr = v.join(',');
        var lies = $('.__spopup li').removeAttr('class');
        $(lies).each(function (i, li) {
            li = $(li);
            var sn = li.find('.ico').attr('for');
            sn = sapi.s.classNames[sn];

            if (vstr.indexOf(sn) > -1) {
                li.addClass('__selected');
            }
        });

        $('.__spopup .__info').text((sapi.s.config.showCount - v.length) + ' more can be selected.');
    },
    createElement: function (className) {
        return '<li><a data-site="' + className + '" href="#"><i class="' + className + '"></i></a></li>';
    },
    setIcons: function (vicons) {
        var style = document.getElementById('__sstyle');
        if (style) { document.head.removeChild(style); }

        style = document.createElement('style');
        style.id = '__sstyle';
        style.innerHTML = '.__sshare i { background-image: url(\'' + vicons + '\'); }';
        document.head.appendChild(style);
    },
    setPosition: function (oft, tag) {
        var sw = $(document).width();
        var sh = $(document).height();
        var ww = $(window).width();
        var wh = $(window).height();
        var sl = $(window).scrollLeft();
        var st = $(window).scrollTop();

        var x = oft.x - sl + 8;
        var y = oft.y - st + 8;

        $(tag).css({ left: 'auto', right: 'auto', top: 'auto', bottom: 'auto' });
        if (x < (ww / 2) || (ww - x) > $(tag).width()) {
            tag.style.left = (oft.x + 11) + 'px';
        } else {
            tag.style.left = (oft.x + 5 - $(tag).width()) + 'px';
        }
        if (y < (wh / 2) || (wh - y) > $(tag).height()) {
            tag.style.top = (oft.y + 11) + 'px';
        } else {
            tag.style.top = (oft.y + 5 - $(tag).height()) + 'px';
        }
    },
    classNames: { 'twitter': 'tw', 'facebook': 'fb', 'gplus': 'ggp', 'linkedin': 'li', 'digg': 'dg', 'myspace': 'my', 'tumblr': 'tm', 'plurk': 'pk', 'weibo': 'wb', 'sina': 'wb', 'tw': 'twitter', 'fb': 'facebook', 'ggp': 'gplus', 'li': 'linkedin', 'dg': 'digg', 'my': 'myspace', 'tm': 'tumblr', 'pk': 'plurk', 'wb': 'weibo' }
}
