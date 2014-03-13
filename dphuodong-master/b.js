var SaveBtn = function(){
	inited: false;
}

SaveBtn.prototype = {
	init: function(){
		//remove existing btn;

		//add savebtn
		var btn_radis = 10;
		var btn_width = 50;
		var btn_height = 30;
		var btn_style = '\
		#save_btn {\
			margin: 10px;\
			width: 240px;\
			height: 30px;\
			border-color: #F96;\
			-webkit-border-radius: 5px;\
			line-height: 30px;\
			text-align: center;\
			font-size: 14px;\
			color:rgb(220,220,220);\
			box-shadow: 0 0 3px #F96;\
			cursor: pointer;\
			-webkit-transition: background 400ms ease;\
		}\
		#save_btn:hover {\
			background: rgba(0,0,0,0.5);\
		}\
		';

		var btn_html = '\
			<div id="save_btn">\
				+ qr image\
			</div>\
			';


		//change dom.
		var qr = new QtImage();
		var btnElement = document.createElement('div');
		btnElement.innerHTML = '<style>' + btn_style + '</style>' + btn_html;
		var rightBar = document.getElementsByClassName('aside-right')[0];
		rightBar.insertBefore(btnElement,rightBar.firstChild);

		btnElement.onclick = function(){
			var qrt = document.getElementById('qr');
			if(qrt){
				qr.hide();
			}else{
				qr.init();
				qr.show();
			}
		}

	}

}

var  QtImage = function(){

}

QtImage.prototype = {
	init : function(){
		var shop = this.shopInfo();
		var qrElement = document.createElement('div');
		var qr_style = '\
		#qr\
		{margin: 0 auto;\
		 visibility: hidden;}\
		';
		qrElement.innerHTML = "<img id='qr' src='https://chart.googleapis.com/chart?cht=qr&&chs=240x200&&chl="+JSON.stringify(shop)+"' /><style>"+qr_style+"</style>";
		var rightBar = document.getElementsByClassName('aside-right')[0];
		rightBar.insertBefore(qrElement,rightBar.childNodes[1]);

	},
	shopInfo: function(){
		var f=function (a){
		var b=-1,
			settings={digi:16,add:10,plus:7,cha:36,center:{lat:34.957995,lng:107.050781,isDef:!0}},
			c=0,
			d="",
			e=a.length,
			f=a.charCodeAt(e-1),
			a=a.substring(0,e-1);
			e--;
			for(var j=0;j<e;j++){
				var g=parseInt(a.charAt(j),settings.cha)-settings.add;g>=settings.add&&(g-=settings.plus);
				d+=g.toString(settings.cha);g>c&&(b=j,c=g)
			}
			a=parseInt(d.substring(0,b),settings.digi);
			b=parseInt(d.substring(b+1),settings.digi);
			f=(a+b-parseInt(f))/2;b=(b-f)/1E5;return{lat:b,lng:f/1E5}
		}

		var body=$('body').html();
		var results = new RegExp('poi: \'(.+)\'').exec(body);
		var poi=poi=f(results[1]);

		var shop={};
		shop.shopName=$('.shop-title').text();
		shop.address=$('span[class="region"]').text()+$('span[itemprop="street-address"]').text();
		shop.phoneNo=$('strong[itemprop="tel"]').text();
		shop.url = window.location.href;
		shop.latitude=poi.lat;
		shop.longtitude=poi.lng;
		return shop;
	},
	show : function(){
		var qr_image = document.getElementById('qr');
		qr_image.style['opacity'] = '0';
		qr_image.style.visibility = 'visible';
		setTimeout(function(){
			qr_image.style.opacity = '1';
			qr_image.style['webkitTransition'] = 'opacity 0.4s ease-out';
		},400)
	},
	hide : function(){
		var qr_image = document.getElementById('qr');
		qr_image.style['opacity'] = '0';
			setTimeout(function(){
				qr_image.parentNode.parentNode.removeChild(qr_image.parentNode);
			},700)
				
	}


}

window.setTimeout(function(){
		if(!window.saveBtn){
			var saveBtn = new SaveBtn();
			window.saveBtn = saveBtn;
			saveBtn.init();
		}

}, 1);