var UIIL = (function () {
    return {
        //程序暂停time毫秒
        pause:function (millis) {

            var date = new Date();
            var curDate = null;
            do {
                curDate = new Date();
            }
            while (curDate - date < millis);
        }
    }
})();