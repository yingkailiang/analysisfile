/*
* 
* 
*
*/
var siteGplusHelper = {
    circles: function (circles) {
        if (typeof circles == 'undefined') {
            circles = localStorage['gplus.sel_ranges'];
            return circles ? circles.split(',') : [];
        }

        localStorage['gplus.sel_ranges'] = circles.join(',');
    },

    clearCircles: function () {
        var _self = siteGplusHelper;

        $('[site=gplus]').unbind('mouseover');
        $("#g_circles").remove();
        _self.circles([]);
    },
    checkRanges: function (circles) {
        var _self = siteGplusHelper;

        if (_self.circles().length > 0) {
            $(_self.circles()).each(function (i, range) {
                if (!_self.isContains(range, circles)) {
                    _self.clearCircles();
                    return;
                }
            });
        }
    },
    isContains: function (range, circles) {
        for (j in circles) {
            var circle = circles[j];
            if (circle.value == range)
                return true;
        }
        return false;
    },
    showCirclesTable: function (sender, event, callback) {
        var _self = siteGplusHelper;

        event = event ? event : window.event;
        event.stopPropagation();

        $('.imorse_pop_box').hide();

        var target = $(sender).find('label');
        var left = target.offset().left + 20;
        var top = target.offset().top + target.height() - 1;

        if ($("#g_circles").length <= 0) {
            console.log('++ Gplus Circles!!!');
            socialClient.getAccount('gplus', function (account) {
                var circles = account.circles;

                _self.checkRanges(circles);
                if ($("#g_circles").length <= 0 && circles && circles.length > 0) {
                    var html = '';
                    var index = -1;
                    $(circles).each(function (ix, circle) {
                        if (circle.name.match(/^[a-f,0-9]{16}$/)) { return; }

                        index++;
                        if (circle.name == 'Public') {
                            switch (navigator.language.toLowerCase()) {
                                case 'zh-cn':
                                    circle.name = '公开';
                                    break;
                                case 'zh-tw':
                                    circle.name = '公開';
                                    break;
                                default:
                                    circle.name = 'Public';
                                    break;
                            }
                        }

                        if (index % 2 == 0)
                            html += '<tr>';
                        html += '<td><input id="' + circle.value + '" type="checkbox" style="vertical-align: middle;margin-right: 5px;"/><label for="' + circle.value + '">' + circle.name + '</label></td>';
                        if (index % 2 != 0)
                            html += '</tr>';
                    });
                    $("body").append('<table id="g_circles" class="imorse_pop_box" style="border: 1px solid #E9E9E9;background: white;position:absolute;display:none;z-index:9999;white-space: nowrap;">' + html + '</table>');
                    $("#g_circles").css("top", top).css("left", left).show().mouseover(function (event) { event.stopPropagation(); });
                    $("body").mouseover(function () { $("#g_circles").hide(); });

                    if (_self.circles().length > 0) {
                        $(_self.circles()).each(function (i, range) {
                            $("#" + range).attr("checked", "checked");
                        });
                    }

                    $("#g_circles [type=checkbox]").click(function () {
                        var rangs = _self.circles();

                        var ids = [];
                        $("#g_circles [type=checkbox]").each(function (i, checkbox) {
                            if ($(checkbox).attr('checked')) {
                                ids.push($(checkbox).attr('id'));
                            }
                        });
                        _self.circles(ids);
                    });

                    if (callback) {
                        callback();
                    }
                }
            });
        }
        else {
            $("#g_circles").css("top", top).css("left", left).show();
        }
    }
}