SaveBtn = function(){

}

SaveBtn.prototype = {
	init: function(){
		//remove existing btn;

		//add savebtn
		var btn-radis = 10;
		var btn-width = 50;
		var btn-height = 30;
		var style = "
		#save_btn {\
			width: 140px;\
			height: 30px;\
			background-color: rgb(95,150,150);\
			-webkit-border-radius: 5px;\
			line-height: 30px;\
			text-align: center;\
			font-size: 14px;\
			color:rgb(220,220,220);\
			box-shadow: 0 0 3px rgb(100,100,100);\
			cursor: pointer;\
		}\
		#save_btn:hover {\
			background: black;\
		}\
		"；

		var btn_html = '
			<div id="save_btn">\
				save to dpyy\
			</div>\
			'

		var btnElement = document.createElement('div');
		btnElement.innerHtml = btn_html;
		var rightBar = document.getElementByClassName('side-right')[0];
		rightBar.appendChild(btnElement);
	}
}