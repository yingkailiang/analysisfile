
var shop;
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if(request.sender=="contentscript"){
			shop=request.body;
		}else if(request.sender=="popup"){
			sendResponse(shop);
		}

	});
var socket = io.connect('50.116.7.37:3000');
    // first register with weiboId
    socket.emit('register',JSON.parse(localStorage["yueyueUser"]).weiboId);
    // then listent on this topic
    socket.on('news', function (data) {
        // data is an array,the element is like this:
        // {type:'status|reply',body:{the corresponding body}};
        // if(data.invitor.user.weiboId != JSON.parse(localStorage["yueyueUser"]).weiboId){
        // 	chrome.browserAction.setBadgeText({text:'new'});
        // }else if(){

        // }


    });