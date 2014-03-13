;(function (global) {
    var util = global.util;
    var $ = global.$;
    var _ = global._;

    //是否是登录页面
    function getLoginInfo(url, siteConfList) {
        var loginInfo = {};
        siteConfList.forEach(function (siteConf) {
            var loginUrlRegStr = siteConf.loginUrlReg;
            var loginUrlReg = new RegExp(loginUrlRegStr);
            if (loginUrlReg.test(url)) {
                loginInfo.loginBtnQ= siteConf.loginBtnQ;
                loginInfo.listUrl = siteConf.listUrl;
                loginInfo.siteName = siteConf.siteName;
                loginInfo.originUrl = url;
            }
        });
        return loginInfo;
    }

    //当点击登录后，对单个站点进行解析
    function parseSingleSiteAfterLogin(url, isAfterLogin) {
        var orderTools = new global.OrderTool();
        orderTools.getOrderListInfo(false, url);
        if (orderTools.defferdList.length) {
            //promise,先解析详情，然后分别再解析item.
            $.when.apply($, orderTools.defferdList).done(function () {
                var logisticsTool = new global.LogisticsTool();
                logisticsTool.parseAllOrders(orderTools.targetSite);

                $.when.apply($, logisticsTool.promiseArray).done(function () {
                    var notifications = new global.OrderNotification();
                    notifications.triggerNotify(orderTools.targetSite);
                    if (isAfterLogin) {
                        try {
                            //chrome28后才有runtime API
                            chrome.runtime.sendMessage({
                                type: "reRenderDetailPage"
                            }, function (response) {});
                        } catch (e) {
                            //console.log(e);
                        }
                    }
                });
                //当对物流页解析失败时，任然对detail页面进行重绘
                $.when.apply($, logisticsTool.promiseArray).fail(function () {
                    if (isAfterLogin) {
                        try {
                            chrome.runtime.sendRequest({
                                type: "reRenderDetailPage"
                            }, function (response) {});
                        } catch (e) {

                        }
                    }
                });
            });

            //当订单解析失败时，任然对detail页面进行重绘
            $.when.apply($, orderTools.defferdList).fail(function () {
                if (isAfterLogin) {
                    try {
                        chrome.runtime.sendRequest({
                            type: "reRenderDetailPage"
                        }, function (response) {});
                    } catch (e) {

                    }
                }
            });
        }
    }

    //对所有的站点进行解析，参数指定了是静默解析还是，有弹框的解析
    function parseAllSiteWithNotify(hasNotify, sendResponse) {
        var orderTools = new global.OrderTool();

        if (hasNotify) {
            orderTools.parserController();
        } else {
            orderTools.getOrderListInfo(true);
        }

        if (orderTools.defferdList.length) {
            $.when.apply($, orderTools.defferdList).done(function () {
                var logisticsTool = new global.LogisticsTool();

                logisticsTool.parseAllOrders();
                $.when.apply($, logisticsTool.promiseArray).done(function () {
                    if (hasNotify) {
                        var notifications = new global.OrderNotification();
                        notifications.triggerNotify();
                    } else {
                        sendResponse({isOver: true});
                    }
                });

                $.when.apply($, logisticsTool.promiseArray).fail(function () {
                    if (!hasNotify) {
                        sendResponse({isOver: true});
                    } else {

                    }
                });
            });

            $.when.apply($, orderTools.defferdList).fail(function () {
                if (!hasNotify) {
                    sendResponse({isOver: true});
                }
            });
        }
    }

    //"http://zhushou.huihui.cn/conf/orderparser2.json?version=" + 
    //首先得到配置文件
    var getConfigPromist = $.
        getJSON("http://zhushou.huihui.cn/conf/orderparser2.json" + "?timestamp="+ Date.now(),
                function (config) {
                    var configStr = util.serialize(config);
                    util.setStorage("order.configs", configStr);
                });

    //当配置文件解析完成
    $.when(getConfigPromist).done(function () {
        parseAllSiteWithNotify(true);
        chrome.extension.
            onRequest.addListener(function(request, sender, sendResponse) {
            switch (request.type) {
                //当点击了登录按钮后，开始抓取当前站点的相关信息
                case 'loginPage':
                    setTimeout(function () {
                        parseSingleSiteAfterLogin(request.url, true, request.siteName);
                    }, 3 * 1000);
                break;
                //当访问页面时，需要判断是否是登录页面。如果是登录页面就
                //需要对点击事件进行监听
                case 'visitUrl':
                    var configsStr = util.getStorage("order.configs");
                    var conf = util.unserialize(configsStr);
                    var siteConfList = conf.sitesConf;
                    var loginInfo = getLoginInfo(request.url, siteConfList);
                    if (loginInfo.loginBtnQ) {
                        sendResponse({loginInfo: loginInfo});
                        return;
                    }
                    var referrer = request.referrer;
                    //console.log("referrer: ", referrer);
                    var referrerLoginInfo = getLoginInfo(referrer, siteConfList);
                    if (referrerLoginInfo.loginBtnQ) {
                        return;
                    }
                    parseSingleSiteAfterLogin(request.url, false);
                   break;
                //访问详情页时
                case 'detailPage':
                    parseAllSiteWithNotify.call(this, false, sendResponse);
                   break;
                default: break;
            }
        });

    });
}(orderAssistant));
