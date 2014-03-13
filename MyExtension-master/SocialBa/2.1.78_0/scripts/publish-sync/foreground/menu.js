/**************************************************************************
*
*    版权所有:  成都询价科技有限公司
*    站点地址:  https://socialba.com
*    服务邮箱:  service@socialba.com
*
**************************************************************************/

var pageUrl = getExtensionUrl('pages/options.html');

function addMenu_gPlus() {
    if ($('#syncIFrame').length > 0) return;
    if ($('.gb_mb.gb_ub.gb_f>div:eq(2)').length <= 0) return;

    var tabs = $('.gb_mb.gb_ub.gb_f>div:eq(2)');
    tabs.after(
          '<style>'
        + '</style>'
        + '<div id="sbsbasc" class="gb_sociaba gb_ta gb_f">'
        + '    <div class="gb_ra">'
        + '        <a id="sbsbas" class="gb_n" href="/" aria-haspopup="true" aria-expanded="false" title="SocialBa!">'
        + '            <div class="gb_sa gb_c" style="background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_blue2.png") + ') no-repeat center center;"></div>'
        + '            <div class="gb_ka"><div class="gb_ma"></div></div>'
        + '        </a>'
        + '        <div class="gb_E"></div><div class="gb_D"></div>'
        + '    </div>'
        + '</div>');

    $('.gb_mb.gb_ub.gb_f').append(
          '<div class="gb_o gb_7" id="gbsbas" style="width: 470px;">'
        + '    <iframe id="optionIframe" frameborder="0" hspace="0" marginheight="0" marginwidth="0" scrolling="no" style="width: 470px; height: 450px;" tabindex="0" vspace="0" width="100%" id="gbsf" allowtransparency="true" aria-hidden="false" src="' + pageUrl + '#no_like"></iframe>'
        + '</div>');

    $('#sbsbas').click(function (event) {
        event.stopPropagation();

        $('#sbsbasc').addClass('gb_7');
        $('#gbsbas').show();
        return false;
    });
    $(document).click(function () {
        $('#sbsbasc').removeClass('gb_7');
        $('#gbsbas').hide();
    });

    menu.listen($('#optionIframe'));
};

function addMenu_facebook() {
    if ($('#syncIFrame').length > 0) return;
    if ($('#pageNav li').length <= 0) return;

    var jewelDiv = $('#pageNav #navJewels #jewelContainer div').eq(0);
    if (jewelDiv.length > 0) {
        jewelDiv.before(
              '<style>'
            + '    .notifNegativeBase #fbSocialBaSettingJewel.openToggler a.jewelButton { background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + ') no-repeat center center; }'
            + '    .notifNegativeBase #fbSocialBaSettingJewel a.jewelButton { background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_blue2.png") + ') no-repeat center center; }'
            + '</style>'
            + '<div class="uiToggle fbJewel west" id="fbSocialBaSettingJewel">'
            + '    <button class="hideToggler" type="button">'
            + '    </button>'
            + '    <a class="jewelButton" rel="toggle" href="#" role="button" aria-labelledby="SocialBaSettingCountWrapper" name="SocialBaSetting" onclick="return run_with(this, [&quot;min-SocialBaSetting-jewel&quot;], function() {MinSocialBaSetting.bootstrap(this)});" data-gt="{&quot;ua_id&quot;:&quot;jewel:SocialBaSetting&quot;}" data-target="fbSocialBaSettingFlyout" aria-haspopup="true" aria-owns="fbSocialBaSettingFlyout">'
            + '        <span class="jewelCount" id="SocialBaSettingCountWrapper"><span id="SocialBaSettingCountValue">0</span><i class="accessible_elem"> SocialBaSetting</i></span></a>'
            + '        <div class="jewelFlyout fbJewelFlyout uiToggleFlyout" style="width: 470px; left: -105px;" id="fbSocialBaSettingFlyout">'
            + '            <div class="jewelBeeperHeader" style="margin-left: 110px;">'
            + '                <div class="beeperNubWrapper">'
            + '                    <div class="beeperNub">'
            + '                    </div>'
            + '                </div>'
            + '            </div>'
            + '            <div class="uiHeader uiHeaderBottomBorder jewelHeader" style="padding: 0;">'
            + '                <iframe id="optionIframe" class="topNavLink" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px; height: 450px;" allowtransparency="true"></iframe>'
            + '            </div>'
            + '            <div class="jewelNotice" id="jewelNotice">'
            + '            </div>'
            + '        </div>'
            + '    <button class="hideToggler" type="button">'
            + '    </button>'
            + '</div>'
        );
    }

    else {
        $('#pageNav li').eq(0).before(
            '<li id="syncIFrame" class="navItem">'
            + '    <style>'
            + '        #img_fgs { display: block; margin: 6px 0 0 6px; width: 19px; height: 19px; background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + ') no-repeat; }'
            + '        .openToggler #img_fgs { background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_blue.png") + ') no-repeat; }'
            + '        #syncIFrame { position: relative; }'
            + '        #syncIFrame ul { display: none; background: white; border: 1px solid #3b5998; border-top: 0 none; border-bottom: 2px solid #2D4486; margin-right: -1px; margin-top: 0px; min-width: 200px; padding: 10px 0 5px; position: absolute; right: -' + $('#pageNav').width() + 'px; top: 100%; z-index: 3; }'
            + '        #syncIFrame.openToggler ul { display: block; }'
            + '        #syncIFrame.openToggler a, #pageNav #syncIFrame.navItem a::after { background: transparent; }'
            + '        #syncIFrame .menuPulldown { width: 31px; height: 31px; float: left; }'
            + '        #syncIFrame.openToggler .menuPulldown, #syncIFrame.openToggler a.menuPulldown:hover { background-color: white; }'
            + '    </style>'
            + '    <a style="z-index: 4;" href="javascript:void(0);" rel="toggle" role="button" aria-haspopup="1">'
            + '        <div class="menuPulldown"><span id="img_fgs" alt=""><span></div>'
            + '    </a>'
            + '    <ul class="syncIFrameDiv" role="navigation">'
            + '        <li>'
            + '            <iframe id="optionIframe" class="topNavLink" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
            + '        </li>'
            + '    </ul>'
            + '</li>'
        );
    }

    menu.listen($('#optionIframe'));
};

function addMenu_twitter() {
    if ($('#syncIFrame').length > 0) return;

    var cntr = $('.global-nav .pull-right');
    if (cntr.length <= 0) return;

    cntr.append(
          '<a id="imorse-litter-tree">'
        + '    <style>'
        + '         #imorse-litter-tree { display: inline-block; z-index: 2000; width: 21px; height: 14px; padding: 13px 6px; margin-right: 10px; vertical-align: top; cursor: pointer; position: relative; }'
        + '         #img_fgs { display: block; margin: -3px 0 0; width: 19px; height: 19px; background-image: url(' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + ') !important; }'
        + '         #optionIframeDiv { position: absolute; right: -10px; top: 100%; margin-top: -1px; z-index: 1999; display: none; }'
        + '         .show_optionIframe { background: #fff; }'
        + '         .show_optionIframe #img_fgs { background-image: url(' + getExtensionUrl("content/images/publish-sync/menu/l_blue.png") + ') !important; }'
        + '         .show_optionIframe #optionIframeDiv { display: block; }'
        + '         #optionIframeDiv { padding: 2px; border: 1px solid #ccc; border-top: 0 none; background: #fff; -webkit-border-bottom-right-radius:7px; -webkit-border-bottom-left-radius:7px; }'
        + '    </style>'
        + '    <i id="img_fgs" />'
        + '    <div id="optionIframeDiv">'
        + '         <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
        + '    </div>'
        + '</a>');

    if (cntr.length > 0) {
        $('#img_fgs').click(function (event) {
            event.stopPropagation();

            $('#imorse-litter-tree').addClass('show_optionIframe');
        });
        $(document).click(function () {
            $('#imorse-litter-tree').removeClass('show_optionIframe');
        });

        menu.listen($('#optionIframe'));
    }
}

function addMenu_vkontakte() {
    if ($('#syncIFrame').length > 0) return;

    if ($('#top_nav #top_links').length > 0) {
        $('#top_nav #top_links #top_search').parents('td').eq(0).before(
              '<td id="ps_menu_link_li">'
            + '    <style>.current { background: white; }</style>'
            + '    <a id="ps_menu_link" onclick="return false;" class="top_nav_link" style="z-index: 9999; outline: 0 none;" tabindex="4" href="javascript:void(0)" class="link W_no_outline">'
            + '        <img src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '" />'
            + '    </a>'
            + '    <div id="ps_menu_link_iframe" class="layer_topmenu_list" style="position: absolute; width: 469px; right: 20px; z-index: 9998; display: none;">'
            + '        <div id="optionIframeDiv">'
            + '             <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: 1px solid #ccc; border-top: 0 none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
            + '        </div>'
            + '    </div>'
            + '</td>');

        $('#ps_menu_link').click(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            $('#ps_menu_link_li').addClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_blue.png"));

            $('#optionIframe').attr('src', $('#optionIframe').attr('src'));
            $('#ps_menu_link_iframe').show();
        });
        $(document).click(function () {
            $('#ps_menu_link_iframe').hide();
            $('#ps_menu_link_li').removeClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_white.png"));
        });

        menu.listen($('#optionIframe'), function (height) {
            $('#ps_menu_link_iframe').css('height', height + 'px');
        });

        $('.global_header .person').css('margin-right', '-30px');
    }
}

function addMenu_renren() {
    if ($('#syncIFrame').length > 0) return;

    if ($('#navMessage').length > 0) {
        $('#navMessage').append(
              '<span id="ps_menu_link_li">'
            + '    <style>.current { background: white; }</style>'
            + '    <a id="ps_menu_link" onclick="return false;" class="top_nav_link" style="z-index: 9999; background: none; outline: 0 none;" tabindex="4" href="javascript:void(0)" class="link W_no_outline">'
            + '        <img src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '" />'
            + '    </a>'
            + '</span>');

        $('#navigation-for-buddylist .nav-other').css('position', 'relative').append(
              '<div id="ps_menu_link_iframe" class="layer_topmenu_list" style="position: absolute; width: 469px; right: 0; top: 100%; z-index: 9998; display: none;">'
            + '    <div id="optionIframeDiv">'
            + '         <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: 1px solid #ccc; border-top: 0 none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
            + '    </div>'
            + '</div>');

        $('#ps_menu_link').click(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            $('#ps_menu_link_li').addClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_blue.png"));

            $('#optionIframe').attr('src', $('#optionIframe').attr('src'));
            $('#ps_menu_link_iframe').show();
        });
        $(document).click(function () {
            $('#ps_menu_link_iframe').hide();
            $('#ps_menu_link_li').removeClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_white.png"));
        });

        menu.listen($('#optionIframe'), function (height) {
            $('#ps_menu_link_iframe').css('height', height + 'px');
        });

        $('.global_header .person').css('margin-right', '-30px');
    }
}

function addMenu_kaixin001() {
    if ($('#syncIFrame').length > 0) return;

    if ($('#head .hd').length > 0) {
        $('#head .hd .headMoreAction').after(
              '<div id="ps_menu_link_li" style="float: right;width:30px;height:41px;text-align: center;">'
            + '    <style>.current { background: white; }</style>'
            + '    <a id="ps_menu_link" onclick="return false;" class="top_nav_link" style="z-index: 9999; display: block; margin-top: 10px; background: none; outline: 0 none;" tabindex="4" href="javascript:void(0)" class="link W_no_outline">'
            + '        <img src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '" />'
            + '    </a>'
            + '</div>');

        $('#head .hd').css('position', 'relative').append(
              '<div id="ps_menu_link_iframe" class="layer_topmenu_list" style="position: absolute; width: 469px; right: 0; top: 100%; z-index: 9998; display: none;">'
            + '    <div id="optionIframeDiv">'
            + '         <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: 1px solid #ccc; border-top: 0 none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
            + '    </div>'
            + '</div>');

        $('#ps_menu_link').click(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            $('#ps_menu_link_li').addClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_blue.png"));

            $('#optionIframe').attr('src', $('#optionIframe').attr('src'));
            $('#ps_menu_link_iframe').show();
        });
        $(document).click(function () {
            $('#ps_menu_link_iframe').hide();
            $('#ps_menu_link_li').removeClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_white.png"));
        });

        menu.listen($('#optionIframe'), function (height) {
            $('#ps_menu_link_iframe').css('height', height + 'px');
        });

        $('.global_header .person').css('margin-right', '-30px');
    }
}

function addMenu_qzone() {
    if ($('#syncIFrame').length > 0) return;

    if ($('#QZ_Toolbar_Container .wrap.clearfix').length > 0) {
        $('#QZ_Toolbar_Container #divUserManage').after(
              '<div id="ps_menu_link_li" style="float: right;width:30px;height:41px;text-align: center;">'
            + '    <style>.current { background: white; }</style>'
            + '    <a id="ps_menu_link" onclick="return false;" class="top_nav_link" style="z-index: 9999; display: block; margin-top: 8px; background: none; outline: 0 none;" tabindex="4" href="javascript:void(0)" class="link W_no_outline">'
            + '        <img src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '" />'
            + '    </a>'
            + '</div>');

        $('#QZ_Toolbar_Container .wrap.clearfix').css('position', 'relative').append(
              '<div id="ps_menu_link_iframe" class="layer_topmenu_list" style="position: absolute; width: 469px; right: 0; top: 100%; z-index: 9998; display: none;">'
            + '    <div id="optionIframeDiv">'
            + '         <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: 1px solid #ccc; border-top: 0 none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
            + '    </div>'
            + '</div>');

        $('#ps_menu_link').click(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            $('#ps_menu_link_li').addClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_blue.png"));

            $('#optionIframe').attr('src', $('#optionIframe').attr('src'));
            $('#ps_menu_link_iframe').show();
        });
        $(document).click(function () {
            $('#ps_menu_link_iframe').hide();
            $('#ps_menu_link_li').removeClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_white.png"));
        });

        menu.listen($('#optionIframe'), function (height) {
            $('#ps_menu_link_iframe').css('height', height + 'px');
        });

        $('.global_header .person').css('margin-right', '-30px');
    }
}

function addMenu_weibo() {
    if ($('#syncIFrame').length > 0) return;

    if ($('.global_header .person').length > 0) {
        $('.global_header .person').append(
              '<li id="ps_menu_link_li">'
            + '    <a id="ps_menu_link" style="z-index: 9999; outline: 0 none;" tabindex="4" href="javascript:void(0)" class="link W_no_outline">'
            + '        <img src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '" />'
            + '    </a>'
            + '    <div id="ps_menu_link_iframe" class="layer_topmenu_list" style="width: 469px; right: -200px; z-index: 9998; display: none;">'
            + '        <div id="optionIframeDiv">'
            + '             <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
            + '        </div>'
            + '    </div>'
            + '</li>');

        $('#ps_menu_link').click(function (event) {
            event = event ? event : window.event;
            event.stopPropagation();

            $('#ps_menu_link_li').addClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_blue.png"));

            $('#optionIframe').attr('src', $('#optionIframe').attr('src'));
            $('#ps_menu_link_iframe').show();
        });
        $(document).click(function () {
            $('#ps_menu_link_iframe').hide();
            $('#ps_menu_link_li').removeClass('current');
            $('#ps_menu_link img').attr('src', getExtensionUrl("content/images/publish-sync/menu/l_white.png"));
        });

        menu.listen($('#optionIframe'), function (height) {
            $('#ps_menu_link_iframe').css('height', height + 'px');
        });

        $('.global_header .person').css('margin-right', '-30px');
    }

    if ($('.menu_c ul').length > 0) {
        $('.menu_c ul').append(
          '<li class="line">|</li>'
        + '<li>'
        + '    <span id="imorse-litter-tree">'
        + '        <style>'
        + '             #imorse-litter-tree { display: inline-block; z-index: 2000; width: 16px; height: 14px; padding: 10px 6px; vertical-align: top; cursor: pointer; position: relative; }'
        + '             #img_fgs { display: block; margin: -3px 0 0; width: 14px; height: 18px; background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '); }'
        + '             #optionIframeDiv { position: absolute; margin-top: -1px; z-index: 1999; display: none; }'
        + '             .show_optionIframe { background: #fff; }'
        + '             .show_optionIframe #img_fgs { background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_blue.png") + '); }'
        + '             .show_optionIframe #optionIframeDiv { display: block; }'
        + '             #optionIframeDiv { padding: 2px; border: 1px solid #ccc; border-top: 0 none; background: #fff; -webkit-border-bottom-right-radius:7px; -webkit-border-bottom-left-radius:7px; }'
        + '        </style>'
        + '        <i id="img_fgs" />'
        + '    </span>'
        + '</li>');

        $('body').append(
          '<div id="optionIframeDiv">'
        + '     <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
        + '</div>');

        if ($('.menu_c ul').length > 0) {
            $(window).resize(function () {
                var right = ($(document).width() - $('.menu_r').offset().left - 2) + 'px';
                var top = ($('#imorse-litter-tree').offset().top + 34) + 'px';

                $('#optionIframeDiv').css('top', top).css('right', right);
            });

            $('#img_fgs').click(function (event) {
                event = event ? event : window.event;
                event.stopPropagation();

                $('#optionIframe').attr('src', $('#optionIframe').attr('src'));

                $('#imorse-litter-tree').addClass('show_optionIframe');

                var right = ($(document).width() - $('.menu_r').offset().left - 2) + 'px';
                var top = ($('#imorse-litter-tree').offset().top + 34) + 'px';

                $('#optionIframeDiv').css('top', top).css('right', right).show();
            });
            $(document).click(function () {
                $('#imorse-litter-tree').removeClass('show_optionIframe');
                $('#optionIframeDiv').hide();
            });

            menu.listen($('#optionIframe'));
        }
    }
}

function addMenu_plurk() {
    if ($('#syncIFrame').length > 0) return;
    if ($('#top_bar td.content').length <= 0) return;

    $('#top_bar td.content').append(
          '<a class="item" id="show-ps-tree" href="javascript:void(0);">'
        + '    <span><img style="margin-bottom: -4px;" src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '"</span>'
        + '</a>');

    $('body').append(
          '<div id="optionIframeDiv" class="GB_window GB_Window" style="z-index: 10100; left: 372px; top: 30px; display: none;">'
        + '    <div>'
        + '        <table class="header" style="background-image: url(http://www.plurk.com/static/greybox/header_bg.gif); width: 472px; ">'
        + '            <tbody>'
        + '                <tr>'
        + '                    <td class="caption">Publis Sync</td>'
        + '                    <td class="close"><div><span>.</span></div></td>'
        + '                </tr>'
        + '            </tbody>'
        + '        </table>'
        + '    </div>'
        + '    <div class="content">'
        + '        <div class="iframe_holder">'
        + '            <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
        + '        </div>'
        + '    </div>'
        + '    <div></div>'
        + '</div>');

    $('#show-ps-tree').click(function (event) {
        event.stopPropagation();

        $('#optionIframeDiv').show();
    });

    $('#optionIframeDiv .close').click(function () {
        $('#optionIframeDiv').hide();
    });

    menu.listen($('#optionIframe'));
}

function addMenu_tencent() {
    if ($('#syncIFrame').length > 0) return;
    if ($('.qk_nav').length <= 0) return;

    $('.qk_nav').children().eq(0).before(
          '<li class="topNavItem qk_nav_item sba">'
        + '    <a href="javascript:void(0);" name="sba" title="Socialba!" onclick="return false;" class="">'
        + '        <style>'
        + '             #img_fgs { display: block; margin: 3px 0 0; width: 19px; height: 19px; background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '); }'
        + '             .active #img_fgs { background: url(' + getExtensionUrl("content/images/publish-sync/menu/l_blue.png") + '); }'
        + '             #optionIframeDiv { box-shadow: 1px 3px 3px #333; display: none; left: -60px; position: absolute; border: 1px solid #D9D9D9; border-top: 0 none; }'
        + '        </style>'
        + '        <span class="t" id="img_fgs"></span>'
        + '        <i></i>'
        + '    </a>'
        + '    <div id="optionIframeDiv"><iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe></div>'
        + '</li>');

    $('#img_fgs').parent().click(function (event) {
        event.stopPropagation();

        var link = $(this).addClass('active');
        $('#optionIframeDiv').show();
    });
    $(document).click(function () {
        $('.sba [name=sba]').removeClass('active');
        $('#optionIframeDiv').hide();
    });

    menu.listen($('#optionIframe'));
}

function addMenu_linkedin() {
    if ($('#syncIFrame').length > 0) return;
    if ($('#header .top-nav .util').length <= 0) return;

    $('#header .top-nav .util').children().eq(0).before(
          '<li id="img_fgs" class="tab">'
        + '    <style>#img_fgs:hover #optionIframeDiv { display: block; } #optionIframeDiv { display: none; }</style>'
        + '    <a style="display: relative;display: block;padding: 0 15px; height: 38px;" href="/">'
        + '        <img style="float: left; margin-top: 11px;" src="' + getExtensionUrl("content/images/publish-sync/menu/l_white.png") + '" />'
        + '    </a>'
        + '</li>');

    $('#img_fgs').append(
          '<div id="optionIframeDiv" style="left:-200px;top:100%;position: absolute;z-index: 9999999;background: white;border: 1px solid #016799;padding: 5px 0;-moz-box-shadow: 0 6px 10px #888;-webkit-box-shadow: 0 6px 10px #888;box-shadow: 0 6px 10px #888;">'
        + '    <iframe id="optionIframe" src="' + pageUrl + '#no_like" scrolling="no" frameborder="0" style="border: none;z-index: 999; overflow: hidden; width: 470px;height: 450px;" allowtransparency="true"></iframe>'
        + '</div>');

    menu.listen($('#optionIframe'));
}

var menu = {
    listen: function (target, callback) {
        window.addEventListener("message", function (event) {
            if (event.origin.indexOf('chrome-extension') != -1) {
                $('#optionIframe').height(event.data.height);

                if (callback) { callback(event.data.height); }
            }
        }, false);
    }
};

function contains(str) {
    return window.location.href.indexOf(str) != -1;
}

if (contains('plus.google.com')) {
    addMenu_gPlus();
}
if (contains('facebook.com')) {
    addMenu_facebook();
}
if (contains('twitter.com')) {
    addMenu_twitter();
}
if (contains('weibo.com')) {
    addMenu_weibo();
}
if (contains('plurk.com')) {
    addMenu_plurk();
}
if (contains('t.qq.com')) {
    addMenu_tencent();
}
if (contains('linkedin.com')) {
    addMenu_linkedin();
}
if (contains('vk.com')) {
    addMenu_vkontakte();
}
if (contains('renren.com')) {
    addMenu_renren();
}
if (contains('kaixin001.com')) {
    addMenu_kaixin001();
}
// if (contains('qzone.qq.com')) {
//     addMenu_qzone();
// }
