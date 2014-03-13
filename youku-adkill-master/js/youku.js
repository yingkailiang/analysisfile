//获取LocalStorage配置信息
chrome.extension.sendRequest({'method': 'getLocalStorage'}, function(response) {
	//如果插件开启
		function_area = '<div style="text-align:center"><a href="http://www.youkuchajian.com" style="color:blue" target="_blank">海外用户如果仍然访问失败，请尝试安装优酷海外版插件(国内用户无视)</a></div><div id="ad" style="float:right; width:468px; height:60px"><iframe src="http://youku.5ihaitao.com/youku/468.html?r='+Math.random()+'" width="468" height="60" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes"></iframe></div><div style="clear:both"></div></div>';
		document.getElementById("vpaction_wrap").insertAdjacentHTML("beforeBegin", function_area);
		
	
});