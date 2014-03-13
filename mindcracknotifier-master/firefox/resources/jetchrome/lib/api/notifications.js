const apiUtils=require("api-utils");const self=require("jetchrome/self");const timer=require("api-utils/timer");const Trait=require("traits").Trait;const Services=require("utils-sf/services");function _Notification(b){if(!(this instanceof arguments.callee)){return new arguments.callee(b)}for(var a in b){this[a]=b[a]}if("url" in b){this.type=_Notification.TYPE_HTML}this.__exposedProps__={cancel:"r",show:"r"}}_Notification.TYPE_HTML=1;_Notification.URL="content/notification.html";_Notification.MARGIN_LEFT=15;_Notification.MARGIN_TOP=25;_Notification.PADDING=15;_Notification.MAX_ON_SCREEN=6;_Notification.WIDTH_MIN=100;_Notification.WIDTH_MAX=316;_Notification.HEIGHT_MIN=40;_Notification.HEIGHT_MAX=152;_Notification.LOAD_TIMEOUT=100;_Notification.length=0;_Notification.active=[];_Notification.pending=[];_Notification.refresh=function(){var b=Services.appshell.hiddenDOMWindow.screen;var a=b.height-_Notification.MARGIN_TOP;_Notification.active.forEach(function(d){if(d.loaded){var c=d.window;c.moveTo(b.width-c.outerWidth-_Notification.MARGIN_LEFT,a=a-c.outerHeight-_Notification.PADDING)}})};_Notification.update=function(){while(_Notification.active.length<_Notification.MAX_ON_SCREEN&&_Notification.pending.length>0){var a=_Notification.pending.shift();a.createWindow();_Notification.active.push(a)}};_Notification.prototype={show:function(){_Notification.pending.push(this);_Notification.update()},cancel:function(){var a=this;if(this.window){this.window.close();_Notification.active=_Notification.active.filter(function(b){return b!=a})}else{_Notification.pending=_Notification.pending.filter(function(b){return b!=a})}_Notification.update()},createWindow:function(){var c=this;var a=[];const h=Services.appshell.hiddenDOMWindow.screen;var f={width:_Notification.WIDTH_MAX,height:_Notification.HEIGHT_MIN,top:h.height,left:h.width-_Notification.WIDTH_MAX-_Notification.MARGIN_LEFT,chrome:"yes",titlebar:"yes",close:"yes",popup:"yes",background:"white"};for(var i in f){a.push([i,f[i]].join("="))}const g=Services.ww.activeWindow||Services.wm.getMostRecentWindow("navigator:browser");var e=g.openDialog(this.type==_Notification.TYPE_HTML?this.url:self.data.url(_Notification.URL),null,a.join(","));e.moveTo(-1000,-1000);var b;function d(n){var j=n?n.target:e.document;if(!j.body){return}timer.clearInterval(b);j.title=c.name;j.body.style.overflow="hidden";j.body.style.display="inline-block";if(c.type!=_Notification.TYPE_HTML){if(c.icon){j.getElementById("icon").addEventListener("load",m,false);j.getElementById("icon").setAttribute("src",c.icon)}j.getElementById("title").innerHTML=c.title;j.getElementById("text").innerHTML=c.text;m()}var l=e.sizeToContent;function k(q,p){try{l()}catch(r){}if(e.innerWidth>_Notification.WIDTH_MAX){e.innerWidth=_Notification.WIDTH_MAX}else{if(e.innerWidth<_Notification.WIDTH_MIN){e.innerWidth=_Notification.WIDTH_MIN}}if(e.innerHeight>_Notification.HEIGHT_MAX){e.innerHeight=_Notification.HEIGHT_MAX}else{if(e.innerHeight<_Notification.HEIGHT_MIN){e.innerHeight=_Notification.HEIGHT_MIN}}}function m(){try{k(e.innerWidth,e.innerHeight);c.loaded=true;_Notification.refresh()}catch(p){console.error(p)}}var o=timer.setTimeout(m,_Notification.LOAD_TIMEOUT);e.sizeToContent=m;e.sizeTo=k;e.addEventListener("fittocontent",e.sizeToContent,false);e.addEventListener("sizetocontent",e.sizeToContent,false);e.addEventListener("unload",function(){timer.clearTimeout(o);_Notification.active=_Notification.active.filter(function(p){return p.window!=e});_Notification.update();_Notification.refresh()},false);j.addEventListener("DOMSubtreeModified",function(p){timer.clearTimeout(o);o=timer.setTimeout(m,100)},false);m()}e.addEventListener("load",d,false);b=timer.setInterval(d,_Notification.LOAD_TIMEOUT);this.window=e;return this}};exports.Notification=_Notification;