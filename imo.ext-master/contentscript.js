var check = {
	o_style: false,
	o_video: false,
	o_offline: false,
	o_bug1: false
};

var visualChange_once = true;
var alertOffline_once = true;
var regex = /a/;

var bellstate = 1;
var off_once_list = [];
var off_perm_list = [];

var broadcast_text='';

$(window).ready(function (){


	getLocalVar('o_style','check');	
	getLocalVar('o_video','check');	
	getLocalVar('o_offline','check');	
	getLocalVar('o_bug1','check');	
	
	console.log(check.o_style);
	console.log(check.o_video);
	console.log(check.o_offline);
	console.log(check.o_bug1);
});

if (regex.test(document.body.innerText)) {
  
  chrome.extension.sendRequest({}, function(response) {});
} else {

} 

function requestCS(details) {
	alert('request');
};


chrome.extension.sendMessage({greeting: "hello"}, function(response) {
});

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
	routineXHR();
  });
});


window.onresize=function(){
	if(check.o_bug1){
	
		var temp = $(".floatingwindowholder");
		for (var i = 0, item; item = temp[i]; i++) {
				if(parseInt(item.style.top) < 0)
				{
					item.style.top=0;
				}
		}
	
	}
}

//-----------------------------------------------------------------fb stuff---------------------------------------------------------
/*		

		function fbInit(){
			$('body').append('<div id="fb-root"></div>');		
			var link = document.location.protocol + '//connect.facebook.net/en_US/all.js';
			
			//$.getScript(link);
			
			$.get(link, $(this).serialize(), function(data){
			   //script = $(data).text();
			   //eval(script);
			});			
			
            window.fbAsyncInit = function() {
                FB.init({appId: '251199818331265', status: true, cookie: true, xfbml: true, oauth: true});
 
                FB.getLoginStatus(function(response) {
					console.log(response);
                    if (response.session) {
                        // logged in and connected user, someone you know
                    }
                });
            };
            (function() {
                var e = document.createElement('script');
                e.type = 'text/javascript';
                e.src = document.location.protocol +
                    '//connect.facebook.net/en_US/all.js';
                e.async = true;
				$('#fb-root').html(e.outerHTML);
            }());
		}

			function fbLogin(){
				var res = true;
				FB.login(function(response) {
				console.log(response);
				   if (response.authResponse) {					     
					 //alert('Welcome!  Fetching your information.... ');
					 //FB.api('/me', function(response) {
					 //  alert('Good to see you, ' + response.name + '.');
					 //});
					 res=true;
					 console.log(res);
					 $(window).trigger('fbplusclick');
				   } else {
					 alert('User cancelled login or did not fully authorize. You need to login to Facebook to post!');
					 res=false;
					 console.log(res);
				   }
				});
				
				console.log(res);				
				return res;				
			}		
*/		
//-----------------------------------------------------------------fb stuff---------------------------------------------------------

function getLocalVar(id,scope){
	var res;
	chrome.extension.sendMessage({command: 'get', 'id': id },function(response){
		res = response.value;
		if(scope != undefined){
			window[scope][id]=res;
		}else{
			window[id]=res;
		}
			
	});
	//console.log(res);
	//console.log(res == undefined);
	//while(res == undefined){console.log('waiting')}; // dangerous
	//return res;
}

function routineXHR(){
	//console.log("LOG:routineXHR");
	if(check.o_video){
		extendYoutube();
	}
	if(check.o_style){
		if(visualChange_once){
			visualChange();
			slideArrows();			
			//jarShare();
		};
	}
	
	if(check.o_offline)
	{
		if(alertOffline_once){
			alertOffline();
		}else{
			alertOffline_repeat()
		}
	}
	
	zoomPicture();
	
	//dragFilesOut();	
}

function zoomPicture(){
	var container = $('.meet-card-image');
	//console.log(container);
	if (container.length != 0)
	{
		for (var i = 0, item; item = container[i]; i++)
		{
		item=$(item);
			if(item.find('#zoomBtn').length == 0)
			{
				var img = item.find('img');
				var link = 'https://imo.im' + img.attr('src');
				var zoom_imgurl = chrome.extension.getURL("images/zoom.png");
				link = link.substring(0,link.length-7);
				//console.log(link);			
				
				var clickSensor = $('<a id="zoomLink" class="lightbox" href="'+link+'" style="opacity:0"><div id="zoomBtn" style="border: 0px solid rgb(255,0,0); top: '+ (img.height()-15) +'px; left:0px; position: absolute; width:'+img.width()+'px; height: 15px; background: rgb(236,244,249); text-align: center;"><img src="'+zoom_imgurl+'" alt="zoomPicBtn" style="max-width:100%; max-height:100%;"></div></a>');			
				
				clickSensor.hover(
					function(){
						$(this).animate(
							{
								opacity:0.90
							}
						,300);
					},
					function(){
						$(this).animate(
							{
								opacity:0.32
							}
						,300);
					}
				);
				
				item.mouseenter(
					function(){
						$(this).find('#zoomLink').animate(
							{
								opacity:0.32
							}
						,300);
					});
				item.mouseleave(
					function(){
						$(this).find('#zoomLink').animate(
							{
								opacity:0
							}
						,300);
					}
				);			
				
				var ximageBtnClose = chrome.extension.getURL('images/closelabel.gif');			
				
				item.append(clickSensor);
				$('#zoomLink').lightbox(
				{
					fitToScreen: true,	
					displayDownloadLink: true,
					fileBottomNavCloseImage:ximageBtnClose				
				}
				);
			}
		}
	}
}

function slideArrows(){
	
}

function jarShare(){	// this is for sharing content on facebook, while still sharing on imo, but because imo added this feature, this is going to be deprecated
	var doc = $(document).find('html')
	doc.attr('xmlns','http://www.w3.org/1999/xhtml');
	doc.attr('xmlns:fb','http://www.facebook.com/2008/fbml');
	console.log(document);

	var box = $('#mnp-broadcast-actions');
	if(box.length != 0)
	{
		fbInit();
	
		$('#mnp-broadcast-input').blur(function(){
			broadcast_text=($(this).val());
		})		
	
		var facebook_imgurl = chrome.extension.getURL("images/facebook.png");
		var add_imgurl = chrome.extension.getURL("images/add.png");
		var facebook = $('<div style="float:left; padding-top:5px; margin-left:3px; margin-right:3px;"><img id="add_fb" width="13px" height="13px" style="margin-bottom:2px" src='+add_imgurl+'><img width="16px" height="16px" style="margin-left:3px;" src='+facebook_imgurl+'></div>');
		var add_fb = $(facebook).find('#add_fb');
		add_fb.click(function(){

			if(fbLogin())
			{
				if($(window).data("events").fbplusclick == undefined){
				$(window).bind('fbplusclick',function(){
					facebook.prepend('<input type="checkbox" name="send_fb" id="send_fb" value="facebook" style="bottom:2px; position:relative" />');			
					console.log('click');
					console.log(facebook);
					$(add_fb).remove();
				})
				}
			}
		});

		$('#post_broadcast').click(function(){
			console.log('beeeeeeeeeeeeeeeep');
			
            FB.api('/me/feed', 'post', { message: broadcast_text}, function(response) {
			console.log(response);
                if (!response || response.error) {
                    console.log('Error occured');
                } else {
                    console.log('Post ID: ' + response.id);
                }
            });			
			
		});

		box.prepend(facebook);
	}	
}

function dragFilesOut(){ // this function should work for draging files out of imo, unfortunatelly, they stop propagation on drag out, probably small icon will be needed, which will be on drag-out
	console.log('dragout');

	var temp = $(".ms");
	console.log(temp);
	for (var i = 0, item; item = temp[i]; i++) {
			//console.log(item.innerHTML);
			console.log(item);
			console.log($(item));
			var links = $(item).find('a[href^="https://imo.im/fd/"]');
			console.log(item);
			//console.log(links);
			if(links !== null){
				for (var j = 0, link; link = links[j]; j++) {
				console.log(link);
					link.addEventListener("dragstart",function(evt){ evt.dataTransfer.setData(link.attr('href'),fileDetails); },false);
					//console.log("link");
					//console.log(link);
					//var start = inner.indexOf(link.toString());
					//console.log(start);
					//var length = link.length;
					//console.log(length);
					//var textInd = start+length;
					//console.log(textInd);
					//console.log(link);
					//console.log((link+"").match(patt_getPath));
					//var path = (link+"").match(patt_getPath);
					//console.log(path);
				}
			}
	}	
}

function extendYoutube(){

	var temp = $(".ms");
	for (var i = 0, item; item = temp[i]; i++) {
			var inner = item.innerHTML;
			var patt=new RegExp("<a.*youtube.com/watch.*/a>(?=[^|])","g");
			var patt_getPath = RegExp('watch.v=[^&<"]*');
			var links = inner.match(patt);

			if(links !== null){
				for (var j = 0, link; link = links[j]; j++) {

					var start = inner.indexOf(link.toString());
					var length = link.length;
					var textInd = start+length;
					var path = (link+"").match(patt_getPath);

					path = 'http://www.youtube.com/embed/' + path.toString().substring("watch?v=".length);

					var d = document;
					var img = d.createElement("img");
					var imgURL = chrome.extension.getURL("images/watch.png");
					var imgURL_over = chrome.extension.getURL("images/watch_over.png");
					img.src = imgURL;
					img.height=12;
					var newText = inner.slice(0, textInd) + "|"+ img.outerHTML + "" + inner.slice(textInd); //TODO namiesto booo tam dat extended odkaz					

					item.innerHTML=newText;
					var toChange = $('img',item);
					toChange.hover(function(){this.src=imgURL_over},function(){this.src=imgURL});
					var container = ($(item).closest(".convlog-msgs"));
					var iframe = $(d.createElement('iframe'));
					iframe.width("316px");
					iframe.height("0px");
					iframe.attr("src",path);					

					toChange.toggle(
						function(){
							$(toChange).after(iframe);
							iframe.width("316px");
							iframe.height("0px");							
							iframe.animate({height: 177},500)
						},function(){
							iframe.animate({height: 0,opacity: 0.5},500,function(){iframe.remove()})							
						});

				}
			}
	}
}

function visualChange(){
	//TODO aby sa to robilo len raz - done
	//-----------------footer------------------------
	var footer = $("#footer");

	footer.height(0);
	
	var body = $("#body");
	body.css("bottom","0px");
	body.css("border-bottom","5px solid #C8C8C8");
	
	//-----------------bottom buttons----------------
	$("#mnp-panel-footer").remove();
	$("#mnp-panel-results").css("bottom","0px");
	if(footer.length) visualChange_once=false;
	
}

function bellclick(imgURL,imgURL_over,imgURL_active,img){
	
	if(bellstate == 1){
		img.src=imgURL_over;
		if(off_perm_list.indexOf(img.id) != -1){
		off_perm_list.splice(off_perm_list.indexOf(img.id),1);
		}							
		off_once_list.push(img.id);							

		bellstate = 2;

	}else if(bellstate == 2){
		img.src=imgURL_active;
		if(off_once_list.indexOf(img.id) != -1){
		off_once_list.splice(off_once_list.indexOf(img.id),1);
		}
		off_perm_list.push(img.id);							

		bellstate = 3;
	}else if(bellstate == 3){
		img.src=imgURL;
		if(off_perm_list.indexOf(img.id) != -1){
			off_perm_list.splice(off_perm_list.indexOf(img.id),1);
		}							
		if(off_once_list.indexOf(img.id) != -1){
			off_once_list.splice(off_once_list.indexOf(img.id),1);
		}							

		bellstate = 1;
	}
	
	/*
	console.log('---over---');
			console.log(off_once_list);
			console.log(off_perm_list);	
	console.log('----------');	
	*/
	
}

function getOfflineList(){
	
	chrome.extension.sendMessage({command: 'getlists'},function(response){
		off_once_list=(response.once);
		off_perm_list=(response.perm);
		/*
		console.log(response);
		console.log('----------------===============');
		console.log(off_once_list);
		console.log(off_perm_list);
		console.log('----------------===============');
		*/
		if(off_once_list==null)off_once_list=[];
		if(off_perm_list==null)off_perm_list=[];
	});	
	
}

function alertOffline(){	//bug, if you search before appending bells

	var temp = $('.buddyitem');

	if(temp.length){

		$(window).bind("beforeunload",function(){
			chrome.extension.sendMessage({command:'setlists',once : off_once_list, perm: off_perm_list});	
			chrome.extension.sendMessage({command:'close'});					
			/*
			console.log('--beforeunload--');
			console.log(off_once_list);
			console.log(off_perm_list);
			*/
		});
		
		getOfflineList();

		alertOffline_once=false;	
		setTimeout(function(){

			temp = $('.buddyitem');

			for (var i = 0, item; item = temp[i]; i++) {			
				$(item).mouseenter(function(){
					//console.log("--over--");
					$('.text_details_bell').remove();
					var patt = RegExp('.*_');

					var img = document.createElement("img");
					var imgURL = chrome.extension.getURL("images/bell.png");
					var imgURL_over = chrome.extension.getURL("images/bell_over.png");
					var imgURL_active = chrome.extension.getURL("images/bell_active.png");					

					img.height=20;
					$(img).attr('class','text_details_bell');
					img.id=this.id.match(patt);
					$('.text_details').append(img);

					if(off_perm_list.indexOf(img.id) != -1){
						img.src = imgURL_active;
						bellstate=3;
					}else if(off_once_list.indexOf(img.id) != -1){
						img.src = imgURL_over;	
						bellstate=2;
					}else{
						img.src = imgURL;
						bellstate=1;
					}
					
					$(img).toggle(
						function(){bellclick(imgURL,imgURL_over,imgURL_active,this)},
						function(){bellclick(imgURL,imgURL_over,imgURL_active,this)}
					);
				});
			}			
		},500);
	}
}

function notify(arg){
	chrome.extension.sendMessage({notification: arg});	
	//console.log('notify');
}

function alertOffline_repeat(){
	// cize, z jedneho listu checkovat, ci je online, ak ano, dat notifikaciu, z druheho listu checkovat, ci je offline, ako ano, pridat do prveho listu
	if(off_once_list != null){
	for (var i = 0, item; item = off_once_list[i]; i++) {
		var item_div=$('div[id*='+item+']');
		var item_class = item_div.attr('class');
		if(item_class.search('offline') == -1){
				off_once_list.splice(off_once_list.indexOf(item),1);
				notify(item_div.find('.display').html() + ' is online!');
		}		
	}
	
	for (var i = 0, item; item = off_perm_list[i]; i++) {
		var item_class = ($('div[id*='+item+']').attr('class'));
		if(item_class.search('offline') != -1){
			if(off_once_list.indexOf(item) == -1)
			{off_once_list.push(item);};
		}
	}
	}
	
}