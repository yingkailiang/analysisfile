var S = KISSY, Event = S.Event, DOM = S.DOM;

var isOld;
var boxCls;
var widgetId;


var cssText = '#tata-button {   border-top: 1px solid #36393b;   background: #2f3133;   background: -webkit-gradient(linear, left top, left bottom, from(#0f0808), to(#2f3133));   background: -webkit-linear-gradient(top, #0f0808, #2f3133);   background: -moz-linear-gradient(top, #0f0808, #2f3133);   background: -ms-linear-gradient(top, #0f0808, #2f3133);   background: -o-linear-gradient(top, #0f0808, #2f3133);   padding: 7.5px 15px;   -webkit-box-shadow: rgba(0,0,0,1) 0 1px 0;    box-shadow: rgba(0,0,0,1) 0 1px 0;   text-shadow: rgba(0,0,0,.4) 0 1px 0;   color: #cf7696;   font-size: 17px;   font-family: Helvetica, Arial, Sans-Serif;   text-decoration: none;   vertical-align: middle;   }#tata-button:hover {   border-top-color: #08131a;   background: #08131a;   color: #706a70;   }#tata-button:active {   border-top-color: #000000;   background: #000000;   }@-webkit-keyframes flipOutX {0% {   -webkit-transform: perspective(400px) rotateX(0deg);opacity: 1;}100% {    -webkit-transform: perspective(400px) rotateX(90deg);opacity: 0;}}.flipOutX {    -webkit-animation-duration: 1s;    -webkit-animation-delay: .2s;    -webkit-animation-timing-function: ease;   -webkit-animation-fill-mode: both;    -webkit-mask-image: -webkit-linear-gradient(#000, rgba(0,0,0,.9));    -webkit-animation-name: flipOutX;    -webkit-backface-visibility: visible !important;   animation-name: flipOutX;   backface-visibility: visible !important;}';
DOM.addStyleSheet(cssText);

/**
 * 进行检测
 * @param sysEl
 * @return {boolean}
 */
function checkAgain(sysEl) {
    document.body.scrollTop = DOM.offset(sysEl).top;
    if (!sysEl) {
        return false;
    }
    var sysH = DOM.innerHeight(sysEl),
        sysW = DOM.innerWidth(sysEl);

    var flag = false;
    var step = 10;
    var dirtyEl = null;
    var dirtyModule = null;
    var id = -1;

    var offsetLeft = DOM.offset(sysEl).left;

    for (var t = 1; t < sysH; t = t + step) {
        for (var l = offsetLeft; l < sysW + offsetLeft; l = l + step) {
            dirtyEl = document.elementFromPoint(l, t);
            if (dirtyEl && !(sysEl == dirtyEl || DOM.contains(sysEl, dirtyEl)) && (dirtyModule = DOM.parent(dirtyEl, boxCls))) {
                flag = true;
                t = 1000000;
                l = 1000000;
                id = DOM.attr(dirtyModule, widgetId).split('-')[1] ? DOM.attr(dirtyModule, widgetId).split('-')[1] : DOM.attr(dirtyModule, widgetId);
            }
        }
    }

    if (flag) {
        renderConsole({
            ele: getSelector(sysEl),
            content: " <span data-sel='" + getSelector(sysEl) + "'>被污染，装修模块id为 " + id + "</span><a style='padding-left:6px;color:red;' href='http://tbmodule.taobao.com' target='_blank'>进行处理</a>"
        });

    } else {
        renderConsole({
            ele: getSelector(sysEl),
            content: " 检测正常."
        });
    }
    return flag;
}

/**
 * 根据元素获取selector
 * @param sysEl
 * @return {*|String|String|string|string}
 */
function getSelector(sysEl) {
    return (sysEl.id && '#' + sysEl.id) || '.' + sysEl.className.split(' ').join('.');
}

//来吧，开始检测吧
function checkIt() {
    var needEl = ['#site-nav', '#shop-head', '#detail', '#attributes', '.tb-tabbar-wrap'];
    needEl.forEach(function (e, i) {
        needEl[i] = e = DOM.get(e);
        setTimeout(function () {
            checkAgain(e);
        }, 5 * i);
    });


}


function renderConsole(context) {
    var str = '<p style="padding-bottom:5px;">检测元素: <span style="cursor: pointer;font-weight: bold;color: #0FA;" data-sel="{ele}">{ele}</span><label style="float:right;">{content}</label> </p>';
    str = S.substitute(str, context);

    var console;
    if (console = DOM.get('.tata-mask')) {

    } else {
        console = DOM.create('<div class="tata-mask" style="z-index:1000000000000;position:fixed;left:0;top:0;width:380px;border:1px solid black;background-color:rgba(0,0,0, 0.8);color:white;padding:12px;"></div>');
        DOM.append(console, 'body');
        Event.delegate(console, 'click', "span", function (e) {
            letAnim(document.querySelector(DOM.text(e.target)));
        })
    }

    console.appendChild(DOM.create(str));
}

function letAnim(el) {
    document.body.scrollTop = DOM.offset(el).top;
    DOM.addClass(el, 'flipOutX');
    setTimeout(function () {
        DOM.removeClass(el, 'flipOutX');
    }, 1000);
}

function renderCheckButton() {
    var btn = DOM.create('<a id="tata-button" style="cursor:pointer;position:fixed;z-index:1000000000;right:0px;top:0px;" class="check_btnl">污染检测</a>');
    DOM.append(btn, 'body');
    Event.on(btn, 'click', function () {
        DOM.remove('.tata-mask');
        checkIt();
    })
}

KISSY.ready(function (S) {
    isOld = !DOM.get('.J_TModule');
    boxCls = isOld ? ".J_TBox" : ".J_TModule";
    widgetId = isOld ? "microscope-data" : "data-widgetid";

    var cssText = '#tata-button {   border-top: 1px solid #36393b;   background: #2f3133;   background: -webkit-gradient(linear, left top, left bottom, from(#0f0808), to(#2f3133));   background: -webkit-linear-gradient(top, #0f0808, #2f3133);   background: -moz-linear-gradient(top, #0f0808, #2f3133);   background: -ms-linear-gradient(top, #0f0808, #2f3133);   background: -o-linear-gradient(top, #0f0808, #2f3133);   padding: 7.5px 15px;   -webkit-box-shadow: rgba(0,0,0,1) 0 1px 0;    box-shadow: rgba(0,0,0,1) 0 1px 0;   text-shadow: rgba(0,0,0,.4) 0 1px 0;   color: #cf7696;   font-size: 17px;   font-family: Helvetica, Arial, Sans-Serif;   text-decoration: none;   vertical-align: middle;   }#tata-button:hover {   border-top-color: #08131a;   background: #08131a;   color: #706a70;   }#tata-button:active {   border-top-color: #000000;   background: #000000;   }@-webkit-keyframes flipOutX {0% {   -webkit-transform: perspective(400px) rotateX(0deg);opacity: 1;}100% {    -webkit-transform: perspective(400px) rotateX(90deg);opacity: 0;}}.flipOutX {    -webkit-animation-duration: 1s;    -webkit-animation-delay: .2s;    -webkit-animation-timing-function: ease;   -webkit-animation-fill-mode: both;    -webkit-mask-image: -webkit-linear-gradient(#000, rgba(0,0,0,.9));    -webkit-animation-name: flipOutX;    -webkit-backface-visibility: visible !important;   animation-name: flipOutX;   backface-visibility: visible !important;}';
    DOM.addStyleSheet(cssText);

    renderCheckButton();
});
