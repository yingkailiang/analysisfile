param = function(name){
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href.replace("#","?"));
        if (!results) { return 0; }
        return results[1] || 0;
    }

    function OptionsController ($scope,$http) {
        var weiboToken = decodeURIComponent(param('access_token'))
        var weiboId=decodeURIComponent(param('uid'));
        if(weiboToken!=0){
            $http({method: 'GET', url: 'https://api.weibo.com/2/users/show.json?access_token='+weiboToken+'&uid='+weiboId}).
            success(function(data, status, headers, config) {
                user.weiboName=data.screen_name;
                user.weiboToken=weiboToken;
                user.weiboId=weiboId;
                user.weiboIcon=data.avatar_large;
                user.weiboIconSmall = data.profile_image_url
                localStorage["yueyueUser"]=JSON.stringify(user)
            }).
            error(function(data, status, headers, config) {
                alert("error");
            });
        }          

        var user=localStorage["yueyueUser"];
        if(user== undefined){
            user={"weiboName":"还没有授权哦","weiboIcon":"http://list.image.baidu.com/t/image/w_sheying.jpg"};
        }else{
            user = JSON.parse(user);
        }
        $scope.user=user;
        $scope.auth=function(){
            extension_id = chrome.i18n.getMessage("@@extension_id")
            window.location.href="https://api.weibo.com/oauth2/authorize?client_id=2424264567&redirect_uri=http://fuluchii.info/index.html&response_type=token&forcelogin=true";

        };
    }