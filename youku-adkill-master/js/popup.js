//需要加载JQuery

$(document).ready(function() {
	$("input:checkbox").checkbox();	//加载仿苹果checkbox样式插件
	init_localstorage_switch();	//初始化localStorage和显示开关
	$("#notice").html('<iframe src="http://www.kxhaitao.com/youku/notice.html?r='+Math.random()+'" height="100" width="200" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes"></iframe>');	
});	
		
document.addEventListener('DOMContentLoaded', function () {
	//优酷开关
	document.getElementById("youku_switch").addEventListener('change', function(e){
		localStorage["youku_switch"] = $("#youku_switch").attr("checked");
	});
});

//初始化localStorage和显示开关
function init_localstorage_switch(){
	if (localStorage["youku_switch"] == null) localStorage["youku_switch"] = "true";
	$("#youku_switch").attr("checked", localStorage["youku_switch"] == "true");
}	