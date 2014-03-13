$(function() {
    // ドメインで判断して楽天用か楽天トラベル用かに分岐する。
    if (location.hostname.indexOf("travel.rakuten.co.jp") != -1) {
        // 楽天トラベル
        removeRakutenTravelMLCheck();
    } else {
        // その他はとりあえず楽天
        removeRakutenMLCheck();
    }
});

var removeRakutenMLCheck = function() {
    // ML購読チェックボックスを取得して、チェック状態をはずす。対象は以下。
    // <input id="newscheck_NNN" name="newsId" type="checkbox">
    // <input id="rmail_check" name="rmail_check" type="checkbox">
    // <input id="shop_rating_check" name="shop_rating_check" type="checkbox">
    var $targets = $("input");

    $.each($targets, function() {
        if ($(this).attr("type") == "checkbox" && $(this).attr("name") == "newsId") {
            $(this).removeAttr("checked");
        }
    });
    $("input#rmail_check").removeAttr("checked");
    $("input#shop_rating_check").removeAttr("checked");
};

var removeRakutenTravelMLCheck = function() {
    // ML購読チェックボックスを取得して、チェック状態をはずす。対象は以下。
    // <input id="f_rmail_flg" name="f_rmail_flg" type="checkbox">
    // <input id="f_rmail_mbl_flg" name="f_rmail_mbl_flg" type="checkbox">
    // <input id="f_tabiinfo_flg" name="f_tabiinfo_flg" type="checkbox">
    // <input id="f_mobile_flg" name="f_mobile_flg" type="checkbox">
    // ここまではidでひっぱれば行ける。以下はたぶん場合によってid内の数字部分が違うと思う。
    // <input id="f_send_flgNN" name="f_send_flgNN" type="checkbox">
    $("input#f_rmail_flg").removeAttr("checked");
    $("input#f_rmail_mbl_flg").removeAttr("checked");
    $("input#f_tabiinfo_flg").removeAttr("checked");
    $("input#f_mobile_flg").removeAttr("checked");

    var $targets = $("input");
    var regex = /^f_send_flg[0-9]+$/;
    $.each($targets, function() {
        if ($(this).attr("type") == "checkbox" && regex.exec($(this).attr("id"))) {
            $(this).removeAttr("checked");
        }
    });
};
