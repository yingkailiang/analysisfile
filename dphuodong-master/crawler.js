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
shop.picUrlList=[$('img[itemprop="photo"]').attr('src')];
shop.shopId=new RegExp('shopID:(.+),').exec(body)[1].trim();

var request={};
request.sender="contentscript";
request.body=shop;
chrome.extension.sendRequest(request);


