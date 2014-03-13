    param = function(name){
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href.replace("#","?"));
        if (!results) { return 0; }
        return results[1] || 0;
    }
    var weiboToken=decodeURIComponent(param('access_token'));
    var uid = decodeURIComponent(param('uid'));

    window.location.href="chrome-extension://ffohgikhmhmajmmbdickaldgmkgbjbej/options.html?access_token="+weiboToken+"&&uid="+uid;
