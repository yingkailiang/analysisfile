/**
 * @fileOverview 主脚本文件
 * @author angelscat@vip.qq.com
 * 
 */

/**
 * @namespace
 */

var Sbox = {
    /**
     * 定义各种数据
     * @class Models
     * @static
     */
	Models:{},
    /** 
     * 定义各种界面
     * @class Views
     * @static
     */
	Views:{},
    /**
     * 控制入口
     * @class Controllers
     * @static
     */
	Controllers:{},
    /**
     * 定义数据集
     * @class Collections
     * @static
     */
	Collections:{},
    /**
     * 常用方法集合
     * @class Util
     * @static
     */
	Util:{}
};

//初始化一些常量
var MY_DISK_NAME = '我的文件',
	PUBLIC_DISK_NAME = '企业共享',
	SHARE_DISK_NAME = '共享文件',
	OUT_CHAIN = '外链管理',
	RECYCLE_BIN = '回收站',
	WEBSITE_NAME = '搜狐企业网盘',
	STATIC_DOMAIN = 'pan.cdn.sohusce.com', //网盘静态路径
	PREVIEW_URL = 'pan.sohu.net/img/'; //预览服务地址 //10.11.5.188/wangpan/

if(location.href.match(/^https/i)){
	STATIC_DOMAIN = 'https://' + STATIC_DOMAIN;
	PREVIEW_URL = 'https://' + PREVIEW_URL;
}else{
	STATIC_DOMAIN = 'http://' + STATIC_DOMAIN;
	PREVIEW_URL = 'http://' + PREVIEW_URL;
}

//模板标签设置
_.templateSettings = {
	escape: /<#-([\s\S]+?)#>/g,
	evaluate: /<#([\s\S]+?)#>/g,
	interpolate: /<#=([\s\S]+?)#>/g
};

//部分常用正则
var mailReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})$/,//邮箱
	notAllow = /[\\\/\:\*\?\"\<\>\|]/,//不允许的文件名
	zhReg = /[^\x00-\xff]/g,//中文
	nameReg = /^[\u4E00-\u9FA5a-z0-9_]+$/i, //名字规则，中英文、数字、下划线
	imgType = /\.(jpg|jpeg|png|bmp|gif)$/i, //图片预览格式
	previewFileType = /^(jpg|jpeg|png|bmp|gif|pdf|txt|css|csv|java|c|cpp|jsp|asp|php|py|as|sh|doc|docx|xls|xlsx|ppt|pps|pptx|wps|mp3|avi|swf|flv)$/;//可预览文件

//是否支持placeholder
var isPlaceholderSupport = "placeholder" in document.createElement("input");
//是否支持HTML5上传
var supportHtml5 = window.File && window.FileReader && window.FileList && window.Blob
if(navigator.userAgent.split('Chrome/')[1]){ 
	if(navigator.userAgent.indexOf('SE 2.X') > 0){//搜狗3.x版本不支持 send(blob).
		supportHtml5 = supportHtml5 && navigator.userAgent.split('Chrome/')[1].substring(0,2)*1 > 14 
	}else{ //chrome 11.0版本以下 send(blob) 上传文件损坏.
		supportHtml5 = supportHtml5 && navigator.userAgent.split('Chrome/')[1].substring(0,2)*1 >= 11 
	}
}
/**
 * @description 格式化文件大小，将字节转换为KB,MB,GB等
 * @param {Number} size 字节大小
 * @return {String} 返回格式好的文件大小
 */
function formatbytes(size) { //格式化文件大小
	if(size >=1024 && size < 1024 * 1024){
		return Math.round(size / 1024 * 100) / 100 + ' KB';
	}else if(size >= 1024 * 1024 && size < 1024 * 1024 * 1024){
		return Math.round(size / 1024 / 1024 * 100) / 100 + " MB";
	}else if(size >= 0 && size < 1024){
		return size + ' B';
	}else if(size >= 1024 * 1024 * 1024){
		return Math.round(size / 1024 / 1024 / 1024 * 100) / 100 + " GB"
	}
}
/**
 * @description 通过文件名，获取文件内型
 * @param {String} name 文件名
 * @return {String} 返回文件类型
 */
function getFileType(name){ //获取文件类型
	var dotAt = name.lastIndexOf('.');
	if(dotAt < 0){
		return 'unknow';
	}
	var type = name.substring(dotAt+1),
		r = /[^a-zA-Z0-9]/g;
	if(r.test(type)){
		return 'unknow';
	}
	if(type.length > 4){
		return 'unknow';
	}
	return type.toLowerCase();
}
/**
 * @description 将json数据转换为string格式
 * @param {Object} obj json object
 * @return {String} 返回转换后的字符串
 */
function jsonToString (obj){ //json to string
	var THIS = this;    
	switch(typeof(obj)){   
	    case 'string':   
	        return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';   
	    case 'array':
	        return '[' + obj.map(THIS.jsonToString).join(',') + ']';
	    case 'object':
	         if(obj instanceof Array){
	            var strArr = [];
	            var len = obj.length;
	            for(var i=0; i<len; i++){
	                strArr.push(THIS.jsonToString(obj[i]));
	            }
	            return '[' + strArr.join(',') + ']';
	        }else if(obj==null){
	            return 'null';
	        }else{
	            var string = [];
	            for (var property in obj) string.push(THIS.jsonToString(property) + ':' + THIS.jsonToString(obj[property]));
	            return '{' + string.join(',') + '}'; 
	        }
	    case 'number':
	        return obj;
	    case false:
	        return obj;
	}
}

//替换html标签
function replaceHtml(str){
	return str.replace('<','&lt;').replace('>','&gt;');
}
/**
 * @description 检测是否安装了flash
 * @return {Boolean} 返回true 或false
 */
function checkFlash(){ //检测是否安装了flash
	var hasFlash = true;
	if($.browser.msie){
		try{ 
			var objFlash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"); 
		}catch(e){ 
			hasFlash = false; 
		} 
	}else{
		if(!navigator.plugins["Shockwave Flash"]){
			hasFlash = false;
		}
	}
	return hasFlash;
}
/**
 * @description 获取字节长度，中文算两个字节
 * @param {String} str 要计算的字符串
 * @return {Number} 返回字节长度
 */
function getStrSize(str){ //获取字节长度
	return str.replace(zhReg,'**').length;
}
/**
 * @description 按照字节长度截取
 * @param {String} str 原字符串
 * @param {Number} len 截取字节长度
 * @return {String} 返回截取后的字符串
 */
function cutStr(str,len){ //按照字节长度截取
	if(getStrSize(str) <= len) return str;

	var strLen = str.length,
		n = Math.floor(len/2);
	for(var i = n; i < strLen; i++){
		if(getStrSize(str.substr(0,i)) >= len){
			return str.substr(0, i);
		}
	}
	return str;
}
function isPreviewImgFile(name,size){
	return imgType.test(name) && size < 10 * 1024 * 1024
}

// (function($){//定义统一的ajax错误，如果出错，那么就提示服务器错误。
// 	$(document).ajaxError(function(ev,jqXHR,ajaxSettings,thrownError){
// 		//console.log(ev,jqXHR,ajaxSettings,thrownError);
// 		Sbox.Loading().remove();
// 		Sbox.Error('服务器错误，请稍候重试');
// 	})
// })(jQuery);

(function($){ //如果有console.log(),那么打印log，否则将console.log至为空函数
	if(!window.console) window.console = {log:function(){}};
})(jQuery);

// 遮罩,弹层,分页,提示etc
(function($){
	var _z = 1000,
		_overlay = null,
		//_dialogs = [],
		_currentAlert = null,
		_currentConfirm = null,
		_currentProgress = null,
		_currentError = null,
		_currentWarning = null,
		_currentSuccess = null,
		_currentFail = null,
		isStrictMode = (document.compatMode != "BackCompat"),
		tpl_overlay = '<iframe width="100%" height="100%" frameBorder="0" src="javascript:false" style="position:absolute;top:0;left:0;z-index:1;"></iframe><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;"></div>',
		tpl_dialog = ($.browser.msie ? '<iframe width="100%" height="100%" frameBorder="0" src="javascript:false" style="position:absolute;top:0;left:0;z-index:1;"></iframe>' : '') +
					'<table id="ui_dialog_container" style="width: 100%; height: 100%; position:relative; z-index:2;" class="pop_dialog_table">' +
		                '<tbody>' + 
		                    // '<tr>' + 
		                    //    '<td class="pop_tl"></td>' + 
		                    //    '<td class="pop_tc"></td>' + 
		                    //    '<td class="pop_tr"></td>' + 
		                    // '</tr>' + 
		                    '<tr>' + 
		                        //'<td class="pop_cl"></td>' + 
		                        '<td class="pop_content" colspan="3">' + 
		                            '<div class="dialog_header" id="ui_dialog_header">' +
										'<div id="ui_dialog_title" class="dialog_title"><#= title #></div>' +
										'<a id="ui_dialog_minimize" class="dialog_minimize" href="javascript:;" >最小化</a>' +
										'<a id="ui_dialog_close" class="dialog_close" href="javascript:;" >关闭</a>' +
									'</div>' +
		                            '<div id="ui_dialog_body" class="dialog_body"><#= body #></div>' + 
		                            '<div id="ui_dialog_footer" class="dialog_footer"><#= footer #></div>' + 
		                        '</td>' + 
		                        //'<td class="pop_cr"></td>' + 
		                    '</tr>' + 
		                    // '<tr>' + 
		                    //     '<td class="pop_bl"></td>' + 
		                    //     '<td class="pop_bc"></td>' + 
		                    //     '<td class="pop_br"></td>' + 
		                    // '</tr>' + 
		                '</tbody>' + 
		            '</table>',
		tpl_button = '<a href="javascript:;" class="btn btn24 btn24-gray <#= className #>"><#= text #></a>',
		tpl_pager = '' + 
				'<# ' + 
                '    var pageCount = Math.ceil(total / pagesize);' + 
                '#>' + 
                '<# if(pageCount <= 1){ #>' + 
                '' + 
                '<#} else{ #>' +
                '<ul>' + 
                '    <# if(curpage == 1) {#>' + 
                '    <li class="prev-page" style="display:none;"><span>上一页</span></li>' + 
                '    <#} else {#>' + 
                '    <li class="prev-page"><a href="javascript:;">上一页</a></li>' + 
                '    <#}#>' + 
                '    <# if(curpage == 1) {#>' + 
                '    <li  class="cur-page" _page="1"><a href="javascript:;">1</a></li>' + 
                '    <#} else {#>' + 
                '    <li _page="1"><a href="javascript:;">1</a></li>' + 
                '    <#}#>' + 
                '    <# if( curpage - (middleCount - 1) / 2 >= 4 ){ #>' + 
                '    <li><span>...</span></li>' + 
                '    <# } #>' + 
                '    <#' +  
                '        var start=2,end=pageCount-1,left = Math.floor((middleCount-1) / 2),right = (middleCount%2)? (middleCount-1)/2 : middleCount / 2;' + 
                '        if(curpage - left > start + 1){' + 
                '                start = curpage - left;' + 
                '        }' + 
                '        if(curpage + right < end - 1){' + 
                '                end = curpage + right' + 
                '        }' + 
                '     #>' + 
                '    <# for(;start<=end;start++){ #>' + 
                '    <li<# if(start===curpage){ #> class="cur-page"<# } #> _page="<#= start #>"><a href="javascript:;"><#= start #></a></li>' + 
                '    <# } #>' + 
                '    <# if( curpage + (middleCount - 1) / 2 <= pageCount - 3 ){ #>' + 
                '    <li><span>...</span></li>' + 
                '    <# } #>' + 
                '    <# if(curpage == pageCount) {#>' + 
                '    <li  class="cur-page" _page="<#= pageCount #>"><a href="javascript:;"><#= pageCount #></a></li>' + 
                '    <#} else {#>' + 
                '    <li _page="<#= pageCount #>"><a href="javascript:;"><#= pageCount #></a></li>' + 
                '    <#}#>' + 
                '    <# if(curpage === pageCount){ #>' + 
                '    <li class="next-page" style="display:none;"><span>下一页</span></li>' + 
                '    <# }else{ #>' + 
                '    <li class="next-page"><a href="javascript:;">下一页</a></li>' + 
                '    <# } #>' + 
                '</ul>' +
                '<# } #>',
		tpl_tip = '';
    /**
     * 生成一个遮罩层，该遮罩层根据窗口大小变化。
     * @class Overlay
     * @extends Backbone.View
     * @constructor
     * @param {Object} [opt]
     * @example new Sbox.Views.Overlay()
     * @example 
     * new Sbox.Views.Overlay({
     *      zIndex:999, //z轴
     *      modal:true //是否可以滚动
     * })
     */
	Sbox.Views.Overlay = Backbone.View.extend({ //统一的遮罩层
		className:'overlay',
		template:_.template(tpl_overlay),
		//zIndex: _z++,
		opacity:0.3,
		//modal:false,
		initialize:function(){
			//this.zIndex = _z++;
			_.bindAll(this,'resize')
			$(window).bind('resize',this.resize);
			this.render();
		},
		render:function(){
			$(this.el)
				.html(this.template())
				.css({
		            'position': 'absolute',
		            'top': 0,
		            'left': 0,
		            'background': this.options.bgcolor || '#000',
		            'opacity': this.options.opacity || this.opacity,
		            'z-index': this.options.zIndex || _z++
				}).appendTo($('body'));
			$(this.el).find('div').css({
				background:this.options.bgcolor || '#000'
			})

			if(this.options.modal) $('html,body').css('overflow','hidden');
			this.resize();
		},
		/** @lends Sbox.Views.Overlay*/
		/**
		 * 
		 * @description 重设遮罩大小，默认绑定在body.onresize上，无需手动调用
		 * @function resize
		 */
		resize:function(){
			var	el = $(this.el);
			setTimeout(function(){
				el.hide();
	            var pageWidth = isStrictMode ? Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth) : Math.max(document.body.scrollWidth, document.body.clientWidth),
					pageHeight = isStrictMode ? Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight) : Math.max(document.body.scrollHeight, document.body.clientHeight);
				el.css({
					width:pageWidth,
					height:pageHeight
				})
				el.show();
			},0);
		},
		/**
		 * @description 手动将遮罩层移除
		 * @function enable
		 */
		enable:function(){
			this.remove();
			$(window).unbind('resize',this.resize);
			$(document.body).css('overflow','');
		}
	})
    /**
     * 统一的弹层
     * @class Window
     * @extends Backbone.View
     * @constructor
     * @param {Object} [opt]
     * @example 
     * new Sbox.Views.Window({
     *      title:'标题',
     *      body:'内容',
     *      zIndex:999, //一般不用
     *      width:500, //宽度，默认400
     *      height:'auto', //高度，默认auto
     *      minimize:true, //是否显示最小化，默认不显示
     *      closeButton:true, //是否显示关闭按钮，默认显示
     *      esc:true, //是否可以按ESC关闭，默认可关闭
     *      dragable:true, //是否可以拖动，默认可拖动
     *      left:0,
     *      top:0, //手动设置显示位置，一般不需要，默认上下居中显示
     *      overlay:true, //是否显示遮罩，默认显示
     *      onClose:function(){}, //关闭按钮时的回调
     *      onMinimize:function(){}, //最小化按钮的回调
     *      onShow:function(){}, //显示时的回调
     *      onHide:function(){}, //隐藏时的回调
     *      onRemove:function(){} //移除时的回调
     *      
     * })
     */
	Sbox.Views.Window = Backbone.View.extend({ //统一的弹层
		/** @lends Sbox.Views.Window*/
		className:'dialog',
		template:_.template(tpl_dialog),
		/**
		 * @private
		*/
		initialize:function(){
			this._buttons = [];
			this.render();
		},
		/**
		 * @private
		*/
		render:function(){
			var _this = this

			this.zIndex = this.options.zIndex || _z++;
			_.bindAll(this,'show','hide','remove','_escHide','_clickHide');

			$(this.el)
				.html(this.template({
					title:this.options.title || '',
					body:this.options.body || '',
					footer:this.options.footer || ''
				}))
				.css({
					'position':'absolute',
					'top':-9999,
					'left':-9999,
					'z-index': this.zIndex,
					'width':this.options.width || 400,
					'height':this.options.height || 'auto'
				})
				.appendTo($('body'));

			//生成DOM引用
			/** dialog容器的引用*/
			this.dialogContainer = $('#ui_dialog_container').removeAttr('id');
			/** header的引用，可以调用header.hide()隐藏头部*/
	        this.header = $('#ui_dialog_header').removeAttr('id');
	        /** title的引用 */
	        this.title = $("#ui_dialog_title").removeAttr('id');
	        /** body的引用*/
	        this.body = $('#ui_dialog_body').removeAttr('id');
	        /** footer的引用,可以调用footer.hide()隐藏footer */
	        this.footer = $('#ui_dialog_footer').removeAttr('id');
	        /** minimizeButton的引用 */
	        this.minimizeButton = $('#ui_dialog_minimize').removeAttr('id');
	        /** closeButton的引用 */
	        this.closeButton = $('#ui_dialog_close').removeAttr('id');

	        //wrap使能链式调用
	        this.header.hide = function(){
	        	$(this).hide();
	        	return _this;
	        }
	        this.footer.hide = function(){
	        	$(this).hide();
	        	return _this;
	        }
	        //右上角最小化按钮
	        if(this.options.minimize){
	        	if(this.options.onMinimize){
	        		$(this.minimizeButton).bind('click',this.options.onMinimize);	
	        	}else{
	        		$(this.minimizeButton).bind('click',this.hide);
	        	}
	        	
	        }else{
	        	$(this.minimizeButton).hide();
	        }

	        //右上角关闭按钮，如果需要，传入参数closeButton:true
	        if(this.options.closeButton){
	        	if(this.options.onClose){
	        		$(this.closeButton).bind('click',this.options.onClose);
	        	}else{
	        		$(this.closeButton).bind('click',this.hide)
	        	}
	        }else{
	        	$(this.closeButton).hide();
	        }
	        //按ESC隐藏dialog
	        if(this.options.esc !== false){
	        	$(document).bind('keyup',this._escHide);
	        }
	        //点击隐藏dialog
	        // if(!this.options.dragable && this.options.clickHide !== false){
	        // 	$(document).bind('click',this._clickHide);
	        // }
	        //如果是在dialog里点击的，那么阻止冒泡到document
	        // $(this.el).bind('click',function(e){
	        // 	e.stopPropagation();
	        // })

	        //可拖放
	        if(this.options.dragable || true){
	        	$(this.el).drag('start',function(){
	        		$(_this.el).find('input').trigger('blur');
	        	})
	        	.drag(function( ev, dd ){
					$( this ).css({
						top: dd.offsetY,
						left: dd.offsetX
					});
			   },{ handle:this.header,drop:false});
	        }

			this.show();
		},
		/**
		 * 显示弹层，默认实例化后自动调用，也可以在实例化之后手动调用。
		 * 显示之后调用onShow回调
		 * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
		 */
		show:function(){
			var x,y,winWidth,winHeight;
			var _this = this;
			this.$el.css({
				left:-9999,
				top:-9999
			}).show();

			winWidth = isStrictMode ? document.documentElement.clientWidth : document.body.clientWidth;
			winHeight = isStrictMode ? document.documentElement.clientHeight : document.body.clientHeight;
			x = this.options.left || Math.max(parseInt((winWidth - $(this.el).width())/2),0) + $(document).scrollLeft();
			y = this.options.top || Math.max(parseInt((winHeight - $(this.el).height())/2),0) + $(document).scrollTop();
			//console.log(x,y)

	        if(this.options.overlay !== false){
	        	/** overlay的引用，一般不需要手动操作该遮罩 */
	        	this.overlay = new Sbox.Views.Overlay({zIndex:this.zIndex-1,modal:this.options.modal}); //不管什么时候创建,都显示在dialog之下
	        }

	        setTimeout(function(){
	        	_this.moveTo(x,y);
	        },20)
			

			this.options.onShow && this.options.onShow();
			return this;
		},
		/**
		 * 隐藏弹层，可以将弹层移出到屏幕之外，但是并没有销毁弹层，之后还可以调用show()显示出来。
		 * 隐藏之后调用onHide回调
		 * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
		 */
		hide:function(){
			if(!$(this.el).is(':visible')) return;
			this.options.onHide && this.options.onHide();
			this.$el.hide();
			this.overlay && this.overlay.enable();
			return this;
		},
		/**
		 * 移除弹层，将弹层从文档流中移除，不再有该元素
		 * 移除之后调用onRemove回调
		 * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
		 */
		remove:function(){
			this.options.onRemove && this.options.onRemove();
			$(this.el).remove();
			this.overlay && this.overlay.enable();
			$(document).unbind('keyup',this._escHide);
			$(document).unbind('click',this._clickHide);
			return this;
		},
		_escHide:function(e){
			if(e.keyCode == 27) this.hide();
		},
		_clickHide:function(e){
			if(e.button == 0) this.hide();
		},
		/**
		 * 将dialog移动到指定的x,y
		 * @param {Number} x left
		 * @param {Number} y top
		 * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
		 */
		moveTo:function(x,y){
			var el = $(this.el)
			if(x || x===0){
				el.css('left',x)
			}
			if(y || y===0){
				el.css('top',y)
			}
			return this;
		},
        /**
         * 将dialog的大小重新设置
         * @param {Number} w 宽度
         * @param {Number} h 高度
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         */
		resizeTo:function(w,h){
			var el = $(this.el)
			if(w){
				el.css('width',w)
			}
			if(h){
				el.css('height',h)
			}
			return this;
		},
        /**
         * 添加额外的样式
         * @param {String} s 样式名
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         */
		addStyle:function(s){
			$(this.el).addClass(s);
			return this;
		},

        /**
         * 设置title内容
         * @param {String} str title内容，可以是html
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         */
		setTitle:function(str){
			this.title.html(str);
			return this;
		},
        /**
         * 设置body内容
         * @param {String} str body内容，可以是html
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         */
		setBody:function(str){
			this.body.html(str);
			return this;
		},
        /**
         * 设置footer内容
         * @param {String} str footer内容，可以是html
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         */
		setFooter:function(str){
			this.footer.html(str);
			this._buttons = []; 
			return this;
		},
        /**
         * 在footer增加一个button
         * @param {Object} b button的一些属性
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         * @example 
         * var d = new Sbox.Views.Window();
         * d.addButton({
         *      className:'cls', //button的额外class
         *      text:'确定', //button上的文字
         *      onclick:function(){alert('click')} //点击button的事件
         * })
         */
		addButton:function(b){
			var template = _.template(tpl_button),
				button = $(template({
					className:b.className || '',
					text:b.text || '确定'
				}));
			button.bind('click',b.onclick);
			this.footer.append(button);
			this._buttons.push(button);
			return this;
		},
        /**
         * 通过text获取button集合
         * @param {String} text button上的文字内容
         * @return {Array} 返回符合条件的button数组，一般情况下只有一个，则使用result[0]使用
         */
		getButton:function(text){
			var buttons = this._buttons,
				result = [];
			_(buttons).each(function(button){
				//console.log(button.val())
				if(button.text() == text) result.push(button);
			})
			return result;
		},
        /**
         * 通过text删除button集合
         * @param {String} text button上的文字内容
         * @return {Sbox.Views.Window} 返回弹层的实例，支持链式调用。
         */
		delButton:function(text){
			this._buttons = _(this.getButton(text)).chain()
			.each(function(button){
				button.remove();
			})
			.reject(function(button){
				return button.text() == text;
			})
			.value()

			return this;
		}

	})

    /**
     * 通过{Sbox.Views.Window}模拟系统的alert
     * @static
     * @param {Object||String} message 需要显示的内容，如果是字符串，那么直接提示该信息，如果是object，那么按照{Sbox.Views.Window}构建具体的dialog
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Alert('提示内容');
     * @example 
     * Sbox.ALert({
     *      message:'提示内容',
     *      title:'提示',
     *      ... //所有其他{Sbox.Views.Window}支持的参数
     * })
     */
	Sbox.Alert = function(message){ //统一的alert
		if(_currentAlert) _currentAlert.remove();

		var options = {};
		if(typeof message === 'string'){
			_.extend(options,{message:message});
		}else{
			_.extend(options,message)
		}

		var dialog = new Sbox.Views.Window({
			title:options.title||'提示',
			body:options.message||'',
			overlay:options.overlay,
			width:options.width||300,
			clickHide:false,
			esc:false,
			closeButton:true,
			onHide:options.onHide,
			onShow:options.onShow,
			onRemove:options.onRemove
		}).addButton({
			text:options.yes||'确定',
			className:'confirm',
			onclick:function(){
				options.callback && options.callback();
				dialog.hide();
			}
		}).addStyle('dialog-alert');

		setTimeout(function(){
			dialog.getButton(options.yes || '确定')[0].focus();
		},20)
		_currentAlert = dialog;
		return dialog;

	}

    /**
     * 通过{Sbox.Views.Window}模拟系统的confirm
     * @static
     * @param {Object||String} message 需要显示的内容，如果是字符串，那么直接提示该信息，如果是object，那么按照{Sbox.Views.Window}构建具体的dialog
     * @param {Function} [callback] 回调函数，接受一个参数，来判断点击的是确定还是取消
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Confirm('提示内容');
     * @example 
     * Sbox.Confirm('提示内容',function(f){
     *     alert(f);
     * })
     * @example 
     * Sbox.Confirm({
     *      message:'提示内容',
     *      callback:function(f){
     *          alert(f);
     *      },
     *      title:'提示',
     *      ... //所有其他{Sbox.Views.Window}支持的参数
     * })
     */
	Sbox.Confirm = function(message,callback){ //统一的confirm
		if(_currentConfirm) _currentConfirm.remove();

		var options = {};
		if(typeof message === 'string'){
			_.extend(options,{
				message:message,
				callback:callback
			})
		}else{
			_.extend(options,message)
		}

		var dialog = new Sbox.Views.Window({
			title:options.title||'提示',
			body:options.message||'',
			width:options.width || 300,
			height:options.height || 'auto',
			overlay:options.overlay,
			clickHide:false,
			closeButton:options.closeButton || true,
			onHide:options.onHide,
			onShow:options.onShow,
			onRemove:options.onRemove
		}).addButton({
			text:options.yes || '确定',
			className:'confirm',
			onclick:function(){
				options.callback && options.callback(true);
				dialog.hide();
			}
		}).addButton({
			text:options.no || '取消',
			className:'cancle',
			onclick:function(){
				options.callback && options.callback(false);
				dialog.hide();
			}
		}).addStyle('dialog-confirm');

		_currentConfirm = dialog;

		setTimeout(function(){
			dialog.getButton(options.yes || '确定')[0].focus();
		},20)

		return dialog;
	}
    /**
     * 通过{Sbox.Views.Window}显示同一的错误提示弹框
     * @static
     * @param {Object||String} message 需要显示的内容，如果是字符串，那么直接提示该信息，如果是object，那么按照{Sbox.Views.Window}构建具体的dialog
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Error('错误信息');
     * @example 
     * Sbox.ALert({
     *      message:'错误信息',
     *      title:'提示',
     *      ... //所有其他{Sbox.Views.Window}支持的参数
     * })
     */
	Sbox.Error = function(message){
		if(_currentError) _currentError.remove();

		var options = {};
		if(typeof message === 'string'){
			_.extend(options,{message:message});
		}else{
			_.extend(options,message)
		}

		options.message = '<div class="er-msg">' + options.message + '</div>';
		var dialog = new Sbox.Views.Window({
			title:options.title||'提示',
			body:options.message||'',
			overlay:options.overlay,
			width:options.width || 440,
			height:options.height || 'auto',
			overlay:options.overlay,
			clickHide:false,
			closeButton:options.closeButton || true,
			onHide:options.onHide,
			onShow:options.onShow,
			onRemove:options.onRemove
		}).addButton({
			text:options.yes||'确定',
			className:'confirm',
			onclick:function(){
				options.callback && options.callback();
				dialog.hide();
				return false;
			}
		}).addStyle('dialog-error');

		setTimeout(function(){
			dialog.getButton(options.yes || '确定')[0].focus();
		},20)
		_currentError = dialog;
		return dialog;
	}
    /**
     * 通过{Sbox.Views.Window}显示同一的警告弹框
     * @static
     * @param {Object||String} message 需要显示的内容，如果是字符串，那么直接提示该信息，如果是object，那么按照{Sbox.Views.Window}构建具体的dialog
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Error('警告信息');
     * @example 
     * Sbox.ALert({
     *      message:'警告信息',
     *      title:'提示',
     *      ... //所有其他{Sbox.Views.Window}支持的参数
     * })
     */
	Sbox.Warning = function(message,callback){
		if(_currentWarning) _currentWarning.remove();

		var options = {};
		if(typeof message === 'string'){
			_.extend(options,{
				message:message,
				callback:callback
			})
		}else{
			_.extend(options,message)
		}

		options.message = '<div class="wn-msg">' + options.message + '</div>';
		var dialog = new Sbox.Views.Window({
			title:options.title||'提示',
			body:options.message||'',
			width:options.width || 560,
			height:options.height || 'auto',
			overlay:options.overlay,
			clickHide:false,
			closeButton:options.closeButton || true,
			onHide:options.onHide,
			onShow:options.onShow,
			onRemove:options.onRemove
		}).addButton({
			text:options.yes || '确定',
			className:'confirm',
			onclick:function(){
				options.callback && options.callback(true);
				if(!options.preventHide) dialog.hide();
			}
		}).addButton({
			text:options.no || '取消',
			className:'cancle',
			onclick:function(){
				options.callback && options.callback(false);
				dialog.hide();
			}
		}).addStyle('dialog-warning');

		setTimeout(function(){
			dialog.getButton(options.yes || '确定')[0].focus();
		},20)

		_currentWarning = dialog;

		return dialog;
	}

    /**
     * 通过{Sbox.Views.Window}显示同一的loading对话框
     * @static
     * @param {String} message 需要显示的内容
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Error('正在操作请等待');
     */
	Sbox.Loading = function(message){ //统一的loading
		if(_currentProgress) _currentProgress.remove();

		var dialog = new Sbox.Views.Window({
			body:'<p class="progress"><span class="icon icon-loading"></span> '+ message +'</p>',
			width:300,
			clickHide:false,
			esc:false,
			closeButton:false
		}).header.hide()
		.footer.hide()
		.addStyle('dialog_loading');

		_currentProgress = dialog;

		return dialog;
	}

    /**
     * 通过{Sbox.Views.Window}显示同一的成功提示
     * @static
     * @param {String} message 需要显示的内容
     * @param {Number} [time] 多长时间后隐藏，默认2s
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Error('成功');
     */
	Sbox.Success = function(message,time){ //统一的成功提示
		if(_currentSuccess) _currentSuccess.remove();

		time = time || (message.length > 10 ? 2 : 1);

		var dialog = new Sbox.Views.Window({
			body:'<p class="success"><span></span> '+ message +'</p>',
			width:message.length > 10 ? 350 : 300,
			clickHide:false,
			closeButton:false
		}).header.hide()
		.footer.hide()
		.addStyle('dialog_success');

		_currentSuccess = dialog;

		setTimeout(function(){
			dialog.remove();
		},time * 1000)

		return dialog;
	}
    /**
     * 通过{Sbox.Views.Window}显示同一的失败提示
     * @static
     * @param {String} message 需要显示的内容
     * @param {Number} [time] 多长时间后隐藏，默认2s
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     * @example 
     * Sbox.Error('失败');
     */
	Sbox.Fail = function(message,time){ //统一的失败提示
		if(_currentFail) _currentFail.remove();

		time = time || (message.length > 10 ? 2 : 1);

		var dialog = new Sbox.Views.Window({
			body:'<p class="fail"><span></span> '+ message +'</p>',
			width:message.length > 10 ? 350 : 300,
			clickHide:false,
			closeButton:false
		}).header.hide()
		.footer.hide()
		.addStyle('dialog_fail');

		_currentFail = dialog;

		setTimeout(function(){
			dialog.remove();
		},time * 1000)

		return dialog;
	}

	Sbox.Views.Tips = Backbone.View.extend({ // TODO tips
		className:'tips',
		template:_.template(tpl_tip),
		initialize:function(){

		},
		render:function(){

		},
		show:function(){

		}
	});


    /**
     * 构建ajax分页，必须提供分页显示的容器，以及点击分页后的回调。
     * @class Pager
     * @extends Backbone.View
     * @constructor
     * @param {Object} opt
     * @example 
     * new Sbox.Views.Pager({
     		container:'pager', //如果是字符串，表示容器的id，是容器本身如$('#pager') or document.getElementById('#pager') etc.
     		curpage:5, //当前页码，默认为1
     		total:1000, //总条数，默认为1000
     		pagesize:10, //每页显示多少条，默认为20
     		middleCount:5,//中间显示多少页码，默认为5，推荐使用奇数
     		callback:function(p){ //点击页面后的回调，参数是{Sbox.Modle.Pager}的一个实例
				console.log(p)
     		}
     * })
     */
	//分页
	//options参数：container,curPage,total,pagesize,middleCount
	Sbox.Views.Pager = Backbone.View.extend({
		/** @lends Sbox.Views.Pager*/
		className:'page',
		template:_.template(tpl_pager),
		events:{
			'click li':'go'
		},
		/**
		 * @private
		*/
		initialize:function(){
			//新建一个pager的model
			var page = new Sbox.Models.Pager();
			//设置初始化数据
			this.options.curpage && page.set({curpage:this.options.curpage},{silent:true});
			this.options.total && page.set({total:this.options.total},{silent: true});
			this.options.pagesize && page.set({pagesize:this.options.pagesize},{silent:true});
			this.options.middleCount && page.set({middleCount:this.options.middleCount},{silent:true});
			//设置该view的模型
			this.model = page;

			//为该model绑定事件
			_.bindAll(this,'render');
			this.model.bind('change',this.render)

			this.container = typeof this.options.container === 'string' ? $('#' + this.options.container) : $(this.options.container);
			this.container.append(this.render().el);
		},
		/**
		 * @private
		*/
		render:function(){
			$(this.el).html(this.template(this.model.toJSON()))
			return this;
		},
		/**
		 * @private
		*/
		go:function(e){
			var target = $(e.currentTarget);

			if(target.hasClass('prev-page') && target.find('a')[0]){ //上一页
				curpage = this.model.get('curpage') - 1;
			}else if(target.hasClass('next-page') && target.find('a')[0]){ //下一页
				curpage = this.model.get('curpage') + 1;
			}else{//否则，不管点击的哪一页，都获取记录上的页码数。
				curpage = parseInt(target.attr('_page'));
			}
			
			this.goToPage(curpage)
		},
		/**
		 * 跳转到哪一页
		 * dom更新后回调callback以供处理
		 * @param {Number} curpage 跳转的页码
		 */
		goToPage:function(curpage){
			var pageCount = this.model.getPapeCount(),
				curpage = parseInt(curpage);
			if(curpage === this.model.get('curpage') || isNaN(curpage)) return; //如果不是数字或者当前页，不做处理
			if(curpage > pageCount) curpage = pageCount; //如果超过总页数那么跳到最后页
			if(curpage <= 0) curpage = 1; //如果小于0则跳到第一页

			this.model.set({curpage:curpage}); //设置也可以交给回调处理
			this.options.callback(this.model);//跳转页面交给回调处理

			//或者可以 trigger?
		},
		/**
		 * 更新总条数，更新后分页dom会实时更新
		 * @param {Number} total 总条数
		 */
		resetTotal:function(total){ //重置整个分页大小
			this.model.set({total:total});
		},
		resetCurpage:function(page){
			this.model.set({curpage:page})
		}
	});

    /**
     * 将select改造成设计样式
     * @static
     * @param {String|Object} el 需要改造的select
     * @example 
     * Sbox.makeSelector('testSelect');
     * @return {Object} 返回新生成的控件的DOM引用
     */
	Sbox.makeSelector = function(el){
		el = typeof el === 'string' ? $('#'+el) : el;
		var tml = '<div class="selector"><span class="value"></span><span class="handle arrow-down"></span><ul class="values"></ul></div>';
        var divSelector = $(tml),
            value = divSelector.find('.value'),
            handle = divSelector.find('.handle'),
            ul = divSelector.find('.values');
        var options = el.find('option');
        _(options).each(function(option){
            option = $(option);
            var li = $('<li data-value="'+option.val()+'">'+ option.text() +'</li>');
            ul.append(li);
        })
        divSelector.width(el.width())
        el.after(divSelector).hide();
        value.text(el.find('option:selected').text())
        divSelector.on('click','.value,.handle',function(){
            if(ul.is(':hidden')){
            	if(ul.height() > 200){
            		ul.height(200);
            		ul.css('overflow','auto');
            	}
                ul.show();
            }else{
                ul.hide();
            }
        })
        ul.on('click','li',function(){
            var li = $(this),
                val = li.attr('data-value'),
                txt = li.text();
            value.text(txt);
            el.find('option:[value="'+val+'"]').attr('selected',true);
            el.trigger('change');
            ul.hide();
        }).on('mouseenter','li',function(){
        	$(this).addClass('hover');
        }).on('mouseleave','li',function(){
        	$(this).removeClass('hover');
        })

        $(document).on('click',function(e){
        	var target = $(e.target);
        	if(!target.is(value) && !target.is(handle) && !target.is(ul))
 		       	ul.hide();
        })
        return divSelector;
	}

	Sbox.Util.makeSelector = Sbox.makeSelector;//patch
    /**
     * 对不支持placeholder属性的浏览器进行处理
     * @static
     * @param {String|Object} el 需要改造的input etc.
     * @example 
     * Sbox.placeholder('testInput');
     */
	Sbox.placeholder = function(el){
		el = typeof el === 'string' ? $('#' + el) : el;
		var plv = el.attr('placeholder');
		if(!isPlaceholderSupport){
			if(el.val() === ''){
				el.css('color','#A9A9A9');
				el.val(plv);
			}
			el.on('focus',function(){
				if(el.val() === plv){
					el.val('');
					el.css('color','#333');
				}
			}).on('blur',function(){
				if(el.val() === ''){
					el.val(plv);
					el.css('color','#A9A9A9');
				}
			})
		}
	}
	Sbox.Util.placeholder = Sbox.placeholder; //patch

	Sbox.Util.selectUser = function(el){
		el = typeof el === 'string' ? $('#' + el) : el;
		var key = {
				KEY_UP : 38,
				KEY_DOWN : 40,
				KEY_ENTER : 13
			},
			st,
			tryTime = 0, time = 10,
			allUsers = null;

		if(!el.is('input')) return;
		var searchList = $('<div class="select-users-search" style="display:none;"></div>'),
			ul = $('<ul></ul>');
		searchList.append(ul).appendTo($('body'));

		getAllUsers(); //获取用户列表

		el.on('keydown',function(e){
			if(!allUsers) return;
			var val = this.value,
				users = searchUser(val);

			var lst = '',
				regexp = new RegExp('(' + val + ')','gi');

			if(e.keyCode === key.KEY_UP){
				var cur = searchList.find('li.hover')
				if(cur[0]){
					if(cur.eq(0).prev()[0]){
						cur.removeClass('hover');
						cur.eq(0).prev().addClass('hover');
						//计算高度，滚动
						var index = searchList.find('li').index(searchList.find('li.hover')),
							scrollTop = searchList.scrollTop();
						if(users.length > 10 && index * 24 < scrollTop){
							setTimeout(function(){
								searchList.scrollTop(24 * (index));
							},20)
							
						}
					}else{
						cur.removeClass('hover');
						searchList.find('li:last').addClass('hover');
						setTimeout(function(){
							searchList.scrollTop(24 * (users.length - 9));
						},20)
					}
				}else{
					searchList.find('li:last').addClass('hover');
				}
				e.preventDefault();
			}else if(e.keyCode === key.KEY_DOWN){
				var cur = searchList.find('li.hover')
				if(cur[0]){
					if(cur.eq(0).next()[0]){
						cur.removeClass('hover');
						cur.eq(0).next().addClass('hover');
						//计算高度，滚动
						var index = searchList.find('li').index(searchList.find('li.hover')),
							scrollTop = searchList.scrollTop();
						if(users.length > 10 && (index - 10) * 24 >= scrollTop){
							setTimeout(function(){
								searchList.scrollTop(24 * (index - 9));
							},20)
						}
					}else{
						cur.removeClass('hover');
						searchList.find('li:first').addClass('hover');
						setTimeout(function(){
							searchList.scrollTop(0);
						},20)
						
					}
				}else{
					searchList.find('li:first').addClass('hover');
				}


				e.preventDefault();
			}else if(e.keyCode === key.KEY_ENTER){
				var cur = searchList.find('li.hover');
				if(cur[0]){
					cur.trigger('click');
					$(this).trigger('blur');
				}

				e.preventDefault();
			}

		}).on('focus',function(){
			$(this).trigger('keyup');
		}).on('blur',function(){
			st = setTimeout(function(){
				searchList.hide();
			},150)
		}).on('keyup',function(e){
			if(!allUsers) return;

			var offset = el.offset(),
				h = el.outerHeight(),
				w = el.outerWidth();
				
			var val = this.value,
				users = searchUser(val);

			var lst = '',
				regexp = new RegExp('(' + val + ')','gi');

			if(e.keyCode === key.KEY_UP || e.keyCode === key.KEY_DOWN || e.keyCode === key.KEY_ENTER) return;

			if(users.length === 0){
				ul.empty();
				searchList.hide();
				return;
			}
			_(users).each(function(u,i){
				lst += '<li class="'+ (i === 0 ? 'hover' : '') +'" data-id="'+ u.id +'" data-email="'+ u.loginName +'">'+ replaceHtml(u.nickName).replace(regexp,'<b>$1</b>') +'<span>&lt;'+ u.loginName.replace(regexp,'<b>$1</b>') +'&gt;</span></li>'
			});
			ul.html(lst);
			if(users.length > 10){
				searchList.height(240);
			}else{
				searchList.height('auto');
			}
			searchList.scrollTop(0)
			//TODO 计算显示位置
			searchList.css({
				top:offset.top + h,
				left:offset.left,
				width:w - 8
			})
			searchList.show();
		})

		searchList.on('click','li',function(e){
			var target = $(e.currentTarget)
			el.val(target.attr('data-email'));
			searchList.hide();
		}).on('mouseenter','li',function(){
			searchList.find('li').removeClass('hover');
			$(this).addClass('hover');
		}).on('mouseleave','li',function(){

		}).on('focus',function(e){
			clearTimeout(st);
			searchList.show();
		}).on('blur',function(e){
			searchList.hide();
		})


		function getAllUsers(){
			$.get('/ShareManager!getVisitors.action?_t='+Math.random(),function(r){
    			if(r.code === 701 || r.code === 403){
    				allUsers = []
    			}else{
	    			allUsers = r;
    			}
    		},'json').error(function(){ //重试
    			etime ++;
				if(etime > time) return;
				setTimeout(function(){
					getAllUsers();
				},500);
			});
		}

		function searchUser(str){
			var filterUsers = [];
			if(str === ''){
				filterUsers = _.filter(allUsers,function(u){
					return u.type !== 'g';// && u.id !== userId
				});
				return filterUsers
			}
			_(allUsers).each(function(u){
				if(u.type === 'p'){
					if(u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
						// if(u.id !== userId)
						filterUsers.push(u);
					}
				}
			})
			return filterUsers;
		}
		
	}
})(jQuery);

// (function($){
// 	Sbox.Util.post = function(url,data,success,dataType){
// 		var data = data || {},
// 			dataType = dataType || 'text';
// 		console.log('nima')
// 		$.post(url,data,function(r,status,jqXHR){
// 			if(r.code === 'nima'){
// 				alert('尼玛登录');
// 			}else{
// 				success(r,status,jqXHR);
// 			}
// 		},dataType)
// 	}
// })(jQuery);

(function($){//删除文件
	/**
     * 删除文件，可以批量删除，
     * @static
     * @param {Sbox.Collections.FileList} fileList 文件列表
     * @param {Arrar} files {Sbox.Models.File} 的一个数组，这些文件都属于fileList
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.DeleteFile = function(fileList,files){

		var dialog = Sbox.Warning({
			title:'删除文件',
			message:'<p>您确定要删除所选文件吗？</p><p class="tip">文件删除后会移动到回收站。</p>',
			closeButton:true,
			callback:function(f){
				if(f) fileList.deleteFiles(files);
			}
		})
		return dialog;
	}
})(jQuery);

(function($){//删除文件

	/**
     * 清空回收站
     * @static
     * @param {Sbox.Collections.FileList} fileList 文件列表
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.EmptyRecyclebin = function(fileList){

		var dialog = Sbox.Warning({
			title:'清空回收站',
			message:'<p>您确定要清空回收站吗?</p><p class="tip">清空后文件将无法找回！</p>',
			closeButton:true,
			callback:function(f){
				if(f) fileList.empty();
			}
		})
		return dialog;
	}
})(jQuery);

(function($){//设置文件夹大小
	
	var tpl_setsize = '<div class="setsize-dialog"> \
				    		<div class="field"> \
				    			<div class="label">共享文件夹空间分配：</div> \
				    			<div class="ipt"> \
				    				<input type="text" class="ipt-text" /> MB \
				    			</div> \
				    			<div class="tips"></div> \
				    		</div> \
				    		<div class="field" style="margin-bottom:0; color:gray; line-height:1.5;"> \
				    			<div class="label"></div> \
				    			<div class="ipt">该文件夹大小：<em id="usedSpace"></em> <br />剩余可分配空间：<em id="freeSpace"></em></div> \
				    		</div> \
				    	</div>';

	/**
     * 设置文件夹大小
     * @static
     * @param {Sbox.Models.File} file 需要设置的文件夹
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.SetSize = function(file){
		var dialog = new Sbox.Views.Window({
			title:'空间分配',
			body:tpl_setsize,
			closeButton:true,
			width:500,
			onHide:function(){
				dialog.remove();
			}
		})
		
		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				ipt.trigger('blur');
				if(flag){
					dialog.remove();
					file.trigger('setsize.begin');
					file.setsize($.trim(ipt.val()));
				}
				else{
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			},
			className:'cancle'
		})
		var bd = dialog.body,
			ipt = bd.find('input'),	
			tips = bd.find('.tips'),
			usedSpace = bd.find('#usedSpace'),
			freeSpace = bd.find('#freeSpace');
		var flag = true;
		var used = file.get('usedSpace'),
			free;
		if(file.get('size') > 0){
			ipt.val(parseInt(file.get('size')) / 1024 / 1024);
		}
		ipt.focus();

		usedSpace.html(formatbytes(used));
		function getFreeSpace(){
			$.get('/User!freeSpace.action?_t='+Math.random(),function(r){
				if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200){
					free = r.freeSpace;
					if(file.get('size') > 0){
						free = free + file.get('size');
					}
					freeSpace.html(formatbytes(free));
				}else{
					freeSpace.html('<span class="error">获取失败，<a href="javascript:;">重新获取</a></span>');
					freeSpace.find('a').click(function(){
						freeSpace.html('<span class="icon icon-loading"></span>');
						getFreeSpace();
					})
				}
			},'json').error(function(){
				freeSpace.html('<span class="error">获取失败，<a href="javascript:;">重新获取</a></span>');
				freeSpace.find('a').click(function(){
					freeSpace.html('<span class="icon icon-loading"></span>');
					getFreeSpace();
				})
			})
		}
		getFreeSpace();



		ipt.on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		}).on('focus',function(){
			tips.empty();
		}).on('blur',function(){
			var size = $.trim(ipt.val());
			if(!($.isNumeric(size) && size * 1 > 0) || (size + '').indexOf('.') >= 0){
				tips.html('<span class="error">必须是大于0的整数</span>');
				flag = false;
			}else if(size * 1024 * 1024 < used){
				tips.html('<span class="error">小于文件夹实际大小</span>');
				flag = false;
			}else if(free && size * 1024 * 1024 > free){
				tips.html('<span class="error">剩余可分配空间不足</span>');
				flag = false;
			}
		})
		return dialog;
	}
})(jQuery);

(function($){//文件夹共享
	
	// var tpl_share = '<div class="share-dialog clearfix"> \
	//     		<div class="choose-user"> \
	//     			<div class="search"> \
	//     				<input type="text" placeholder="输入群组名、用户名或邮箱搜索" /> \
	//     				<span class="label icon icon-search" id="searchBtn" style="cursor:pointer;"></span> \
	//     			</div> \
	//     			<div class="user-list"> \
	//     				<div class="legend">用户列表</div> \
	//     				<div class="u-list"> \
	//     					<ul> \
	//     						<li style="padding:20px 0; text-align:center; cursor:default; background:#FFF!important; border:0;"><span class="icon icon-loading"></span>正在加载...</li> \
	//     					</ul> \
	//     				</div> \
	//     			</div> \
	//     		</div> \
	//     		<div class="sharelist"> \
	//     			<div class="clearlist"> \
	//     				<a href="javascript:;" class="btn btn24 btn24-blue clear"><span>清空列表</span></a> \
	//     			</div> \
	// 	    		<div class="shared"> \
	// 	    			<div class="shared-head"> \
	// 	    				<div class="to">共享给</div> \
	// 	    				<div class="readable">可查看</div> \
	// 	    				<div class="writable">可上传</div> \
	// 	    				<div class="all">可编辑</div> \
	// 	    				<div class="share-tip"> \
	// 	    					<span class="icon icon-tip"></span> \
	// 	    					<div class="tip-content"></div> \
	// 	    				</div> \
	// 	    			</div> \
	// 	    			<div class="shared-body"> \
	// 	    				<ul> \
	// 	    					<li style="padding:20px 0; text-align:center; cursor:default; background:#FFF!important; border:0;"><span class="icon icon-loading"></span>正在加载...</li> \
	// 	    				</ul> \
	// 	    			</div> \
	// 	    		</div> \
	//     		</div> \
 //    		</div>',
 	var tpl_share = '<div class="share-dialog clearfix"> \
		                <div class="choose-user"> \
		                    <div class="user-list"> \
		                        <div class="legend">域内用户共享</div> \
		                        <div class="search"> \
		                            <input type="text" placeholder="输入群组名、用户名或邮箱搜索" /> \
		                            <span class="label icon icon-search" id="searchBtn" style="cursor:pointer;"> </span> \
		                        </div> \
		                        <div class="u-list"> \
		                            <ul> \
		                                <li style="padding:20px 0; text-align:center; cursor:default; background:#FFF!important; border:0;"><span class="icon icon-loading"></span>正在加载...</li> \
		                            </ul> \
		                        </div> \
		                    </div> \
		                    <div class="add-user"> \
		                        <div class="legend">域外用户共享</div> \
		                        <div class="add-field"> \
		                            <input type="text" id="addUserIpt" class="ipt-text" placeholder="请输入帐号邮箱" /> \
		                            <a class="btn btn24 btn24-blue" id="addUserBtn" href="javascript:;">添加</a> \
		                        </div> \
		                        <div class="tips" id="addUserTip"></div> \
		                    </div> \
		                </div> \
		                <div class="sharelist"> \
		                    <div class="shared"> \
		                        <div class="shared-head"> \
		                            <div class="to">共享给</div> \
		                            <div class="clearlist"> \
		                                <a href="javascript:;" class="clear"><span>清空列表</span></a> \
		                            </div> \
		                            <div class="share-tip"> \
		                                <span class="icon icon-tip"> </span> \
		                                <div class="tip-content"> </div> \
		                            </div> \
		                        </div> \
		                        <div class="shared-body"> \
		                        	<ul> \
		                        		<li style="padding:20px 0; text-align:center; cursor:default; background:#FFF!important; border:0;"><span class="icon icon-loading"></span>正在加载...</li> \
		                        	</ul> \
		                        </div> \
		                    </div> \
		                </div> \
		            </div>',
    	tpl_member = '<div class="sharemember-dialog"> \
		                <div class="member-hd"> \
		                    <span class="member-user">共享者</span> \
		                    <span class="member-power">权限 \
			    				<div class="share-tip"> \
			    					<span class="icon icon-tip"></span> \
			    					<div class="tip-content"></div> \
			    				</div> \
		                    </span> \
		                </div> \
		                <div class="member-list"> \
		                    <ul> \
		                    	<li style="text-align:center; padding:20px; border-bottom:0;"><span class="icon icon-loading"></span>正在获取列表...</li> \
		                    </ul> \
		                </div> \
		            </div>'
    var users = null; //缓存获取到的企业内部人员列表

	/**
     * 文件夹共享
     * @static
     * @param {Sbox.Models.File} file 需要共享的文件夹
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
    /*
    Sbox.Share = function(file){

    	var sharedUsers = [];
    	var loading = null;

    	var dialog = new Sbox.Views.Window({
			title:'共享文件夹',
			body:tpl_share,
			width:692,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		});
		dialog.addStyle('dialog-share')
		.addButton({
			text:'确定',
			onclick:function(){
				loading = Sbox.Loading('正在设置请稍候...');
				$.post('/ShareDir!share.action',{
					dirId:file.get('id'),
					acl:jsonToString(sharedUsers)
				},function(r){
					if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){
						loading.remove();
						Sbox.Success('共享设置成功');
						if(sharedUsers.length !== 0){
							file.set({
								shareFlag:1
							})	
						}else{
							file.set({
								shareFlag:0,
								size:-1
							})
						}
					}else{
						//error
					}
				},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				})
				//console.log(jsonToString(sharedUsers));
				dialog.remove();
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			},
			className:'cancle'
		})

		var	bd = dialog.body,
			ulist = bd.find('.u-list ul'),
			shareBody = bd.find('.shared-body'),
			sharedList = bd.find('.shared-body ul'),
			search = bd.find('.search input'),
			searchBtn = bd.find('#searchBtn'),
			clear = bd.find('.clear'),
			tip = bd.find('.share-tip');

		//placeholder
		Sbox.placeholder(search);

		function initUsers(){
			var list = '';
			_(users).each(function(u){
				if(u.type === 'g'){
					list += '<li _id="'+u.id+'" title="'+u.group_name+'"  class="share-group"><span class="icon icon-group"></span><span class="name">'+ replaceHtml(u.group_name) +'</span></li>'
				}else if(u.type === 'p' && u.id !== userId){
					list += '<li _id="'+ u.id +'" title="' + u.nickName  + '<' + u.loginName + '>" class="share-user"><span class="icon icon-user"></span><span class="name">'+ replaceHtml(u.nickName) + '<span class="u-mail">&lt;' + u.loginName + '&gt;</span>' + '</span></li>';
				}
			})
			ulist.html(list);
		}


    	if(users === null){
    		$.get('/ShareManager!getVisitors.action?_t='+Math.random(),function(r){
    			if(r.code === 701 || r.code === 403){
    				dialog.hide();
    				Sbox.Login();
    				users = []
    			}else{
	    			users = r;
	    			initUsers();
    			}
    		},'json').error(function(){
				Sbox.Loading().remove();
				dialog.remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
    	}else{
    		initUsers();
    	}

		function initSharedUsers(){
			var list = ''
			_(sharedUsers).each(function(u){
				var name,fullName;
				if(u.type === 'g'){
					fullName = u.group_name;
					name = getStrSize(u.group_name) > 20 ? cutStr(u.group_name,20) + '...' : u.group_name;
				}else{
					fullName = u.nickName;
					name = getStrSize(u.nickName) > 20 ? cutStr(u.nickName,20) + '...' : u.nickName;
				}
				list +='<li _id="'+ u.id +'" class="'+ (u.type === "g" ? "share-group" : "share-user") +'"> \
						<div class="to"> \
							<span class="icon '+ (u.type === "g" ? "icon-group" : "icon-user") +'"></span><span class="user" title="'+fullName+'">' + replaceHtml(name) + '</span><a class="delete" href="javascript:;"><span class="icon icon-deletex"></span></a> \
	    				</div> \
	    				<div class="readable"> \
	    					<a href="javascript:;"><span class="icon icon-radiobox '+ (u.aclCode === 1 ? 'icon-radiobox-checked' : 'icon-radiobox-unchecked') +'"></span></a>  \
	    				</div> \
	    				<div class="writable"> \
	    					<a href="javascript:;"><span class="icon icon-radiobox '+ (u.aclCode === 2 ? 'icon-radiobox-checked' : 'icon-radiobox-unchecked') +'"></span></a>  \
	    				</div> \
	    				<div class="all"> \
	    					<a href="javascript:;"><span class="icon icon-radiobox '+ (u.aclCode === 3 ? 'icon-radiobox-checked' : 'icon-radiobox-unchecked') +'"></span></a>  \
	    				</div> \
    				</li>'
			});
			sharedList.empty().html(list);
		}

		$.get('/GetShareUserList!getService.action?resourceId=' + file.get('id') + '&_t=' + Math.random(),function(r){
			sharedUsers = r;
			initSharedUsers();
		},'json').error(function(){
			Sbox.Loading().remove();
			dialog.remove();
			Sbox.Error('服务器错误，请稍候重试');
		})

		ulist.on('click','li',function(){
			var target = $(this),
				id = parseInt(target.attr('_id')),
				type = target.hasClass("share-group") ? "g" : 'p';
			if(!id) return;
			if(!hasShared(id,type)){
				//ulist.find('li[_id='+ id +']').addClass('disabled');
				var u = getUser(id,type);
				sharedUsers.push(_.extend(u,{
					aclCode:1
				}))
				var name,fullName;
				if(u.type === 'g'){
					fullName = u.group_name;
					name = getStrSize(u.group_name) > 20 ? cutStr(u.group_name,20) + '...' : u.group_name;
				}else{
					fullName = u.nickName;
					name = getStrSize(u.nickName) > 20 ? cutStr(u.nickName,20) + '...' : u.nickName;
				}
				var li = '<li _id="'+ u.id +'" class="'+ (u.type === "g" ? "share-group" : "share-user") +'"> \
							<div class="to"> \
								<span class="icon '+ (u.type === "g" ? "icon-group" : "icon-user") +'"></span> \
		    					<span class="user" title="'+fullName+'">' + replaceHtml(name) + '</span> \
		    					<a class="delete" href="javascript:;"> <span class="icon icon-deletex"></span></a> \
		    				</div> \
		    				<div class="readable"> \
		    					<a href="javascript:;"><span class="icon icon-radiobox icon-radiobox-checked"></span></a> \
		    				</div> \
		    				<div class="writable"> \
		    					<a href="javascript:;"><span class="icon icon-radiobox icon-radiobox-unchecked"></span></a>  \
		    				</div> \
		    				<div class="all"> \
		    					<a href="javascript:;"><span class="icon icon-radiobox icon-radiobox-unchecked"></span></a>  \
		    				</div> \
	    				</li>';
	    		sharedList.append(li);
	    		shareBody.scrollTop(9999);
			}
		}).on('mouseenter','li',function(){
			$(this).addClass('hover');
		}).on('mouseleave','li',function(){
			$(this).removeClass('hover');
		})
		sharedList.on('click','li',function(e){
			var target = $(this),
				id = parseInt(target.attr('_id')),
				type = target.hasClass('share-group') ? 'g' :'p',
				curTarget = $(e.target || e.srcElement);
			if(curTarget.hasClass('icon-deletex')){
				target.remove();
				delShare(id,type);
			}

			if(curTarget.hasClass('icon-radiobox')){
				target.find('.icon-radiobox-checked').removeClass("icon-radiobox-checked").addClass('icon-radiobox-unchecked');
				curTarget.addClass('icon-radiobox-checked').removeClass('icon-radiobox-unchecked');
				var acl = curTarget.parent().parent().attr('class');
				setPower(id,type,acl);
			}
		});

		clear.on('click',function(){
			sharedList.find('li .icon-deletex').trigger('click');
		});

		search.on('keyup',function(){
			var str = $(this).val() === $(this).attr('placeholder') ? '' : $(this).val(),
				filterUsers = searchUser(str),
				regexp = new RegExp('(' + str + ')','gi'),
				lst = '';
			ulist.empty();
			_(filterUsers).each(function(u){
				if(u.id === userId) return;
				if(u.type === 'g'){
					lst += '<li _id="'+ u.id +'" class="share-group" title="'+ u.group_name +'"><span class="icon icon-group"></span><span class="name">'+ replaceHtml(u.group_name).replace(regexp,'<b>$1</b>') + '</span></li>'
				}else if(u.type === 'p'){
					lst += '<li _id="'+ u.id +'" class="share-user" title="'+ u.nickName +'<'+ u.loginName +'>"><span class="icon icon-user"></span><span class="name">'+ replaceHtml(u.nickName).replace(regexp,'<b>$1</b>') + '<span class="u-mail">&lt;' + u.loginName.replace(regexp,'<b style="color:#333;">$1</b>') + '&gt;</span>' +'</span></li>'
				}			
			});
			ulist.append($(lst));
		}).on('keypress',function(e){
			if(e.keyCode === 13) $(this).trigger('keyup');
		})

		searchBtn.on('click',function(){
			search.trigger('keyup');
		})

		tip.on('mouseenter','.icon-tip',function(){
			tip.find('.tip-content').css('opacity',0.8).show();
		}).on('mouseleave','.icon-tip',function(){
			tip.find('.tip-content').hide();
		})

		//根据id判断是否已经共享了
		function hasShared(id,type){
			var flag = false;
			_(sharedUsers).each(function(u){
				if(u.type === type && u.id === id){
					flag = true;
					return;
				}
			})
			return flag;
		}
		//删除共享
		function delShare(id,type){
			var flag = false;
			//ulist.find('li[_id='+ id +']').removeClass('disabled');
			_(sharedUsers).each(function(u,i){
				if(u.type === type && u.id === id){
					sharedUsers.splice(i,1);
					flag = true;
					return;
				}
			})
			return flag;
		}
		//通过id查找用户
		function getUser(id,type){
			var user;
			_(users).each(function(u){
				if(u.type === type && u.id === id){
					user = u;
					return;
				}
			});
			return user;
		}
		//设置权限
		function setPower(id,type,acl){
			_(sharedUsers).each(function(u){
				if(u.type === type && u.id === id){
					if(acl === 'readable'){
						u.aclCode = 1;
					}else if(acl === 'writable'){
						u.aclCode = 2;
					}else{
						u.aclCode = 3;
					}
				}
			})
		}
		//搜索用户
		function searchUser(str){
			var filterUsers = [];
			if(str === ''){
				return users;
			}
			_(users).each(function(u){
				if(u.type === 'g'){
					if(u.group_name.toLowerCase().indexOf(str.toLowerCase()) >= 0){
						filterUsers.push(u);
					}
				}else if(u.type === 'p'){
					if(u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
						if(u.id !== userId)
							filterUsers.push(u);
					}
				}
			})
			return filterUsers;
		}


		return dialog;
    }
	*/
    Sbox.Share = function(file){

    	var sharedUsers = [];
    	var loading = null;

    	var dialog = new Sbox.Views.Window({
			title:'共享文件夹',
			body:tpl_share,
			width:692,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		});
		dialog.addStyle('dialog-share')
		.addButton({
			text:'确定',
			onclick:function(){
				loading = Sbox.Loading('正在设置请稍候...');
				$.post('/ShareDir!share.action',{
					dirId:file.get('id'),
					acl:jsonToString(sharedUsers)
				},function(r){
					if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){
						loading.remove();
						Sbox.Success('共享设置成功');
						if(sharedUsers.length !== 0){
							file.set({
								shareFlag:1
							})	
						}else{
							file.set({
								shareFlag:0,
								size:-1
							})
						}
					}else{
						//error
					}
				},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				})
				//console.log(jsonToString(sharedUsers));
				dialog.remove();
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			},
			className:'cancle'
		})

		var	bd = dialog.body,
			ulist = bd.find('.u-list ul'),
			shareBody = bd.find('.shared-body'),
			sharedList = bd.find('.shared-body ul'),
			search = bd.find('.search input'),
			searchBtn = bd.find('#searchBtn'),
			clear = bd.find('.clear'),
			tip = bd.find('.share-tip'),
			addUserIpt = bd.find('#addUserIpt'),
			addUserBtn = bd.find('#addUserBtn'),
			addUserTip = bd.find('#addUserTip');

		//http://pan.sohu.net/User!isExists.action?email=yongpingxu@sohu-inc.com

		//placeholder
		Sbox.placeholder(search);
		Sbox.placeholder(addUserIpt);

		function initUsers(){
			var list = '';
			_(users).each(function(u){
				if(u.type === 'g'){
					list += '<li _id="'+u.id+'" title="'+u.group_name+'"  class="share-group"><span class="icon icon-group"></span><span class="name">'+ replaceHtml(u.group_name) +'</span></li>'
				}else if(u.type === 'p' && u.id !== userId){
					list += '<li _id="'+ u.id +'" title="' + u.nickName  + '<' + u.loginName + '>" class="share-user"><span class="icon icon-user"></span><span class="name">'+ replaceHtml(u.nickName) + '<span class="u-mail">&lt;' + u.loginName + '&gt;</span>' + '</span></li>';
				}
			})
			ulist.html(list);
		}


    	if(users === null){
    		$.get('/ShareManager!getVisitors.action?_t='+Math.random(),function(r){
    			if(r.code === 701 || r.code === 403){
    				dialog.hide();
    				Sbox.Login();
    				users = []
    			}else{
	    			users = r;
	    			initUsers();
    			}
    		},'json').error(function(){
				Sbox.Loading().remove();
				dialog.remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
    	}else{
    		initUsers();
    	}

		function initSharedUsers(){
			// var list = ''
			sharedList.empty();
			_(sharedUsers).each(function(u){
				var li = buildShareUser(u);

				sharedList.append(li);
			});
			// sharedList.empty().html(list);
		}

		$.get('/GetShareUserList!getService.action?resourceId=' + file.get('id') + '&_t=' + Math.random(),function(r){
			sharedUsers = r;
			initSharedUsers();
		},'json').error(function(){
			Sbox.Loading().remove();
			dialog.remove();
			Sbox.Error('服务器错误，请稍候重试');
		})

		ulist.on('click','li',function(){
			var target = $(this),
				id = parseInt(target.attr('_id')),
				type = target.hasClass("share-group") ? "g" : 'p';
			if(!id) return;
			if(!hasShared(id,type)){
				//ulist.find('li[_id='+ id +']').addClass('disabled');
				var u = getUser(id,type);
				sharedUsers.push(_.extend(u,{
					aclCode:4,
					isOutDomain:0,
					effective:-1
				}))
				var li = buildShareUser(u);
	    		sharedList.append(li);
	    		shareBody.scrollTop(9999);
			}
		}).on('mouseenter','li',function(){
			$(this).addClass('hover');
		}).on('mouseleave','li',function(){
			$(this).removeClass('hover');
		})
		sharedList.on('click','li',function(e){
			var target = $(this),
				id = parseInt(target.attr('_id')),
				type = target.hasClass('share-group') ? 'g' :'p',
				curTarget = $(e.target || e.srcElement);
			if(curTarget.hasClass('icon-deletex')){
				target.remove();
				delShare(id,type);
			}

			// if(curTarget.hasClass('icon-radiobox')){
			// 	target.find('.icon-radiobox-checked').removeClass("icon-radiobox-checked").addClass('icon-radiobox-unchecked');
			// 	curTarget.addClass('icon-radiobox-checked').removeClass('icon-radiobox-unchecked');
			// 	var acl = curTarget.parent().parent().attr('class');
			// 	setPower(id,type,acl);
			// }
		});

		clear.on('click',function(){
			sharedList.find('li .icon-deletex').trigger('click');
		});

		search.on('keyup',function(){
			var str = $(this).val() === $(this).attr('placeholder') ? '' : $(this).val(),
				filterUsers = searchUser(str),
				regexp = new RegExp('(' + str + ')','gi'),
				lst = '';
			ulist.empty();
			_(filterUsers).each(function(u){
				if(u.id === userId) return;
				if(u.type === 'g'){
					lst += '<li _id="'+ u.id +'" class="share-group" title="'+ u.group_name +'"><span class="icon icon-group"></span><span class="name">'+ replaceHtml(u.group_name).replace(regexp,'<b>$1</b>') + '</span></li>'
				}else if(u.type === 'p'){
					lst += '<li _id="'+ u.id +'" class="share-user" title="'+ u.nickName +'<'+ u.loginName +'>"><span class="icon icon-user"></span><span class="name">'+ replaceHtml(u.nickName).replace(regexp,'<b>$1</b>') + '<span class="u-mail">&lt;' + u.loginName.replace(regexp,'<b style="color:#333;">$1</b>') + '&gt;</span>' +'</span></li>'
				}			
			});
			ulist.append($(lst));
		}).on('keypress',function(e){
			if(e.keyCode === 13) $(this).trigger('keyup');
		})

		searchBtn.on('click',function(){
			search.trigger('keyup');
		})

		addUserIpt.on('keypress',function(e){
			if(e.keyCode === 13) addUserBtn.trigger('click');
		}).on('keyup',function(e){
			addUserTip.empty();
		})

		addUserBtn.on('click',function(){
			var val = $.trim(addUserIpt.val());
			if(val === ''){
				addUserTip.html('<span class="error">请输入帐号邮箱</span>');
				return;
			}else if(!mailReg.test(val)){
				addUserTip.html('<span class="error">邮箱格式不正确</span>');
				return;
			}else if(searchUser(val).length !== 0){
				addUserTip.html('<span class="error">该用户为域内用户</span>');
				return;
			}else{
				addUserTip.html('<span class="icon icon-loading"></span>');
				$.post('/User!isExists.action',{
					email:val
				},function(r){
					addUserTip.empty();
					if(r.code === 200){
						var userInfo = r.userInfo;
						var u = {
							id:userInfo.id,
							aclCode:4,
							email:userInfo.email,
							nickName:userInfo.nickName,
							isOutDomain:1,
							effective:-1,
							type:'p'
						};
						if(hasShared(u.id,u.type)){
							addUserTip.html('<span class="error">已添加该用户</span>');
							return;
						}
						if(u.id === userId){
							addUserTip.html('<span class="error">不能共享给自己</span>');
							return;	
						}
						sharedUsers.push(u);
						var li = buildShareUser(u);
			    		sharedList.append(li);
			    		shareBody.scrollTop(9999);
					}else if(r.code === 303){
						addUserTip.html('<span class="error">不能共享给自己</span>');
					}else if(r.code === 404){
						addUserTip.html('<span class="error">该用户不存在</span>');
					}else{
						addUserTip.html('<span class="error">添加出错</span>');
					}
				},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				});
			}
		})

		tip.on('mouseenter','.icon-tip',function(){
			tip.find('.tip-content').css('opacity',0.8).show();
		}).on('mouseleave','.icon-tip',function(){
			tip.find('.tip-content').hide();
		})

		//生成每一条共享用户
		function buildShareUser(u){
			var name,fullName;
			if(u.isOutDomain !== 1){
				if(u.type === 'g'){
					fullName = u.group_name;
					name = getStrSize(u.group_name) > 20 ? cutStr(u.group_name,20) + '...' : u.group_name;
				}else{
					fullName = u.nickName;
					name = getStrSize(u.nickName) > 20 ? cutStr(u.nickName,20) + '...' : u.nickName;
				}
			}else{
				fullName = u.nickName + '(' + u.email + ')';
				name = getStrSize(fullName) > 16 ? cutStr(fullName,16) + '...' : fullName;
			}
			var li = '<li _id="'+ u.id +'" class="'+ (u.type === "g" ? "share-group" : "share-user") +'"> \
						<div class="to"> \
							<span class="icon '+ (u.type === "g" ? "icon-group" : (u.isOutDomain === 1 && u.effective === 1 ? "icon-user-unaccepted" : "icon-user")) +'"></span> \
	    					<span class="user" title="'+fullName+'">' + name + '</span> \
	    					<a class="delete" href="javascript:;"> <span class="icon icon-deletex"></span></a> \
	    					'+ (u.isOutDomain === 1 && u.effective === 1 ? '<a href="javascript:;" class="invite">重新邀请</a><span></span>' : '') +' \
	    				</div> \
		                <div class="power-select"> \
		                    <select style="width:100px;"> \
								<option value="4" '+ (u.aclCode === 4 ? 'selected="selected"' : '') +'>仅预览</option> \
								<option value="5" '+ (u.aclCode === 5 ? 'selected="selected"' : '') +'>仅上传</option> \
								<option value="6" '+ (u.aclCode === 6 ? 'selected="selected"' : '') +'>可预览上传</option> \
								<option value="1" '+ (u.aclCode === 1 ? 'selected="selected"' : '') +'>可查看</option> \
								<option value="2" '+ (u.aclCode === 2 ? 'selected="selected"' : '') +'>可查看上传</option> \
								<option value="3" '+ (u.aclCode === 3 ? 'selected="selected"' : '') +'>可编辑</option> \
		                    </select> \
		                </div>\
					</li>';
			li = $(li);

			var s = Sbox.makeSelector(li.find('select'));
            s.on('mouseenter',function(){
                var sbody = $('.shared-body'),
                    scrollTop = sbody.scrollTop(),
                    lst = sbody.find('li.share-group,li.share-user'),
                    li = s.parent().parent(),
                    liH = li.outerHeight(),
                    index = lst.index(li);
                if(scrollTop + sbody.height() - index * liH < 180){
                    s.find('.values').addClass('up');
                }
                s.addClass('selector-hover');
            }).on('mouseleave',function(){
                s.find('.values').removeClass('up').hide();
                s.removeClass('selector-hover');
            })

            li.on('change','select',function(){
            	setPower(u.id,u.type,$(this).val());
            	li.find('.invite').remove();
            })

            li.on('click','.invite',function(){
            	var a = $(this),
            		tip = a.next();
            	a.hide();
            	tip.html('<span class="icon icon-loading"></span>');
            	$.post('/OutDomainShare!reSendEmail.action',{
            		userId:u.id,
            		dirId:file.get('id')
            	},function(r){
            		if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){
						Sbox.Success('邀请已重新发送');
					}else{
						Sbox.Fail('发送失败');
					}
					a.show();
					tip.empty();
            	},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				});
            })

            return li;
		}

		//根据id判断是否已经共享了
		function hasShared(id,type){
			var flag = false;
			_(sharedUsers).each(function(u){
				if(u.type === type && u.id === id){
					flag = true;
					return;
				}
			})
			return flag;
		}
		//删除共享
		function delShare(id,type){
			var flag = false;
			//ulist.find('li[_id='+ id +']').removeClass('disabled');
			_(sharedUsers).each(function(u,i){
				if(u.type === type && u.id === id){
					sharedUsers.splice(i,1);
					flag = true;
					return;
				}
			})
			return flag;
		}
		//通过id查找用户
		function getUser(id,type){
			var user;
			_(users).each(function(u){
				if(u.type === type && u.id === id){
					user = u;
					return;
				}
			});
			return user;
		}
		//设置权限
		function setPower(id,type,acl){
			_(sharedUsers).each(function(u){
				if(u.type === type && u.id === id){
					u.aclCode = acl * 1;
				}
			})
		}
		//搜索用户
		function searchUser(str){
			var filterUsers = [];
			if(str === ''){
				return users;
			}
			_(users).each(function(u){
				if(u.type === 'g'){
					if(u.group_name.toLowerCase().indexOf(str.toLowerCase()) >= 0){
						filterUsers.push(u);
					}
				}else if(u.type === 'p'){
					if(u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
						if(u.id !== userId)
							filterUsers.push(u);
					}
				}
			})
			return filterUsers;
		}


		return dialog;
    }

	/**
     * 取消共享
     * @static
     * @param {Sbox.Models.File} file 需要取消共享的文件夹
     */
    Sbox.CancleShare = function(file){
    	if(file.get('shareFlag')){
			Sbox.Warning({
				title:'解除共享',
				message:'<p>您确定要解除所选文件夹共享吗？</p><p class="tip">解除后所有共享成员将退出共享该文件夹！</p>',
				callback:function(f){
					if(f){
						loading = Sbox.Loading('正在取消请稍候...');
						$.post('/ShareDir!share.action',{
							dirId:file.get('id'),
							acl:'[]'
						},function(r){
							if(r.code === 701 || r.code === 403){
								Sbox.Login();
							}else if(r.code === 200){
								loading.remove();
								Sbox.Success('取消共享成功');
								file.set({
									shareFlag:0,
									size:-1
								})
							}else{
								//error
							}
						},'json').error(function(){
							Sbox.Loading().remove();
							Sbox.Error('服务器错误，请稍候重试');
						})
					}
				}
			})
		}
    }

	/**
     * 显示共享成员
     * @static
     * @param {Sbox.Models.File} file 需要显示共享成员的文件夹
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
    Sbox.ViewShareMember = function(file){
    	var dialog = new Sbox.Views.Window({
	        title:'查看共享成员',
	        body:tpl_member,
	        width:560,
	        closeButton:true
	    }).addStyle('dialog-sharemember');
	    dialog.addButton({
            text:'关闭',
            onclick:function(){
                dialog.remove();
            },
            className:'cancle'
        })

	    var bd = dialog.body,
	    	ul = bd.find('ul'),
	    	tip = bd.find('.share-tip');

	    $.get('/GetShareUserList!getService.action?resourceId=' + file.get('id') + '&_t=' + Math.random(),function(r){
			//if(r.code === 200){
				sharedUsers = r;
				var list = '';
				list += '<li> \
                            <div class="member-user"><span class="member-sign"><span class="icon icon-user"></span></span><span class="member-name">' + file.get('shareUserName') + '</span><span class="member-mail">&lt;' + file.get('shareMail') + '&gt;</span></div> \
                            <div class="member-power"><span class="power-info">所有者</span></div> \
                        </li>'
	            var power = ['可查看','可查看上传','可编辑','仅预览','仅上传','可预览上传'];
				_(sharedUsers).each(function(u){
					if(u.type === 'g'){
						list += '<li> \
		                            <div class="member-user"><span class="member-sign"><span class="icon icon-group"></span></span><span class="member-name">' + replaceHtml(u.group_name) + '</span></div> \
		                            <div class="member-power"><span class="power-info">' + power[u.aclCode-1] + '</span></div> \
		                        </li>'
					}else if(u.type === 'p'){
						if(u.isOutDomain === 0 || (u.isOutDomain === 1 && u.effective === 0)){
							list += '<li> \
			                            <div class="member-user"><span class="member-sign"><span class="icon icon-user"></span></span><span class="member-name">' + replaceHtml(u.nickName) + '</span><span class="member-mail">&lt;' + u.email + '&gt;</span></div> \
			                            <div class="member-power"><span class="power-info">' + power[u.aclCode-1] + '</span></div> \
			                        </li>'
						}
					}
				})
				ul.empty().append(list);
			//}
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})

		tip.on('mouseenter','.icon-tip',function(){
			tip.find('.tip-content').css('opacity',0.8).show();
		}).on('mouseleave','.icon-tip',function(){
			tip.find('.tip-content').hide();
		})
    }
})(jQuery);

(function($){//外链相关操作
	
	var tpl_createoutchain = '<div class="outchain-dialog"> \
								<div id="fileInfo" class="file-info"></div> \
					    		<div class="field"> \
					    			<div class="label">访问权限：</div> \
					    			<div class="ipt "> \
					    				<input type="radio" name="sharePrivilege" value="1" id="sharePrivilege1" /><label for="sharePrivilege1">仅预览</label> \
					    				<input type="radio" checked="checked" name="sharePrivilege" value="2" id="sharePrivilege2" /><label for="sharePrivilege2">可预览下载</label>  \
					    			</div> \
					    			<div class="tips"></div> \
					    		</div> \
					    		<div class="field"> \
					    			<div class="label">语言设置：</div> \
					    			<div class="ipt "> \
					    				<input type="radio" checked="checked" name="language" value="0" id="language0" /><label for="language0">中文</label>  \
					    				<input type="radio" name="language" value="1" id="language1" /><label for="language1">英文</label>  \
					    			</div> \
					    			<div class="tips"></div> \
					    		</div> \
					    		<div class="field"> \
					    			<div class="label">访问密码：</div> \
					    			<div class="ipt"> \
					    				<div class="switch"> \
					    					<a href="javascript:;" class="off" hidefocus="true"><span>开/关</span></a> \
					    					<input id="needPass" type="hidden" value="0" /> \
					    				</div> \
					    				<div class="pass" id="passwords" style="display:none;"> \
					    					<p>输入密码：<input class="ipt-text" type="password" onpaste="return false;" /> <span class="tips"></span></p> \
					    					<p>确认密码：<input class="ipt-text" type="password" onpaste="return false;" /> <span class="tips"></span></p> \
					    				</div> \
					    			</div> \
					    		</div> \
					    		<div class="field"> \
					    			<div class="label">失效时间：</div> \
					    			<div class="ipt "> \
					    				<div class="datepicker"> \
						    				<input class="ipt-text" type="text" readonly="readonly" id="datePicker" onclick="WdatePicker({minDate:\'%y-%M-{%d}\'});" /> \
						    				<span class="icon icon-date" onclick="WdatePicker({el:\'datePicker\',minDate:\'%y-%M-{%d}\'})"></span> \
						    			</div>&nbsp; \
						    			<select id="hours" style="width:70px;"> \
					                    </select> \
					    			</div> \
					    			<div class="tips" id="dateTip"></div> \
					    		</div> \
					    		<div class="field desc" style="display:none;"> \
					    			<div class="label">外链说明：</div> \
					    			<div class="ipt"> \
					    				<textarea class="ipt-text" id="outchainNote"></textarea> \
					    			</div> \
					    			<div class="tips" id="noteTip" style="margin-left:80px;"></div> \
					    		</div> \
					    	</div>';
	var tpl_getoutchain = '<div class="outchain-dialog"> \
							<div id="fileInfo" class="file-info"></div> \
				    		<div class="field link"> \
				    			<div class="label">外链地址：</div> \
				    			<div class="ipt"> \
				    				<input class="ipt-text" type="text" id="outchainIpt" value="" readonly="readonly" /> <span id="outchainCopy" class="copy">复制<span></span></span> | <a id="outchainCheck" href="#" target="_blank">查看</a> \
				    			</div> \
				    		</div> \
				    		<div class="field link"> \
				    			<div class="label"></div> \
				    			<div class="ipt"> \
				    				<span class="tip">您可以复制链接地址，通过QQ、msn发给同事、合作伙伴</span> \
				    			</div> \
				    		</div> \
				    	</div>';

	var tpl_sendoutchain = '<div class="sendoutchain-dialog"> \
							<div id="fileInfo" class="file-info"></div> \
					    		<div class="field"> \
					    			<div class="label">收件人：</div> \
					    			<div class="ipt"> \
					    				<span class="error">邮箱格式不正确，请检查。</span> \
					    				<input id="sendTo" type="text" class="ipt-text" placeholder="多个邮箱请用;分隔" /> \
					    			</div> \
					    		</div> \
					    		<div class="field"> \
					    			<div class="label">留言：</div> \
					    			<div class="ipt"> \
					    				<textarea id="sendContent" class="ipt-text"></textarea> \
					    			</div> \
					    		</div> \
					    	</div>';

	//创建外链
	/**
     * 创建外链
     * @static
     * @param {Sbox.Models.File} file 需要创建外链的文件
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.CreateOutChain = function(file){
		//先判断是否生成过外链
		//如果生成过，返回外链地址，并直接跳到复制外链部分；
		//如果没生成过，开始生成步骤。
		var dialog = null;
		if(typeof WdatePicker === 'undefined'){
			$.getScript(STATIC_DOMAIN +'/js/libs/datepicker/WdatePicker.js',function(){
				createDialog();
			})	
		}else{
			createDialog();
		}
		function createDialog(){
			var isCreate = !file.get('outlink');
			var hasPassword = file.get('hasPassword') * 1,
				sharePrivilege = file.get('sharePrivilege'),
				language = file.get('language');
			dialog = new Sbox.Views.Window({
				title:isCreate ? '外链分享':'外链设置',
				body:tpl_createoutchain,
				width:500,
				closeButton:true,
				onHide:function(){
					dialog.remove();
				}
			});

			var bd = dialog.body,
				fileInfo = bd.find('#fileInfo'),
				needPass = bd.find('#needPass'),
				passwords = bd.find('#passwords'),
				pass1 = passwords.find('input').eq(0),
				pass2 = passwords.find('input').eq(1),
				passTip1 = passwords.find('.tips').eq(0),
				passTip2 = passwords.find('.tips').eq(1),
				datePicker = bd.find('#datePicker'),
				hours = bd.find('#hours'),
				dateTip = bd.find('#dateTip'),
				outchainNote = bd.find('#outchainNote'),
				noteTip = bd.find('#noteTip'),
				selector;

			var isdir = (typeof file.get('parentDir') !== 'undefined'),
				name = file.get('name'),
				size = file.get('size'),
				filetype = isdir ? 'folder' : getFileType(name),
				previewable = previewFileType.test(filetype),
				shortName,fileName;

			if(filetype === 'rar' || filetype === 'zip'){
				if(size >= 100 * 1024 * 1024){
					previewable = false;
				}
			}


			if(isdir || filetype === 'unknow'){
				shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
			}else{
				fileName = name.substring(0,name.lastIndexOf('.'));
				shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + name.substring(name.lastIndexOf('.') + 1); 
			}
			fileInfo.html('<span class="file-type '+ filetype +'"></span><span class="file-name" title="'+ name +'">'+ shortName +'</span>')

			var hoursOptions = '';
			for(var i = 0; i<24;i++){
				var tmp = i < 10 ? '0' + i : '' + i;
				tmp = tmp + ':00';
				hoursOptions += '<option value="'+ tmp +'">'+ tmp +'</option>';
			}
			hours.html(hoursOptions);

			if(!isCreate){
				if(hasPassword){
					passwords.show();
					passTip1.empty().html('<span class="tip">不修改密码请保持为空</span>');
					needPass.val(1);
					bd.find('.switch a').removeClass('off').addClass('on');
				}

				$('#sharePrivilege' + sharePrivilege).attr('checked',true);
				$('#language' + language).attr('checked',true);

			}
			if(!isdir && !previewable){
				$('#sharePrivilege1').attr('disabled',true);
				$('#sharePrivilege1').next().css('color','#CCC')
			}
			var d = new Date(new Date().valueOf() + 30 * 24 * 60 * 60 * 1000);
			var date = file.get('expiredate') || (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + '00:00:00');
			if(date.indexOf(' ') > 0){
				date = date.split(' ');
			}else{
				date = [date,"00:00:00"]
			}
			datePicker.val(date[0]);
			outchainNote.val(file.get('memo'));
			setTimeout(function(){
				hours.find('option[value="'+ date[1].split(':')[0] +':00"]').attr('selected',true);
				selector = Sbox.makeSelector(hours);
			},50)

			pass1.on('blur',function(){
				if(pass1.val().length > 16){
					passTip1.html('<span class="error">密码长度不得超过16位</span>');
				}else{
					passTip1.empty();
				}
				if(pass1.val() === pass2.val()){
					passTip2.empty();
				}
			});
			pass2.on('blur',function(){
				if(pass1.val() !== pass2.val()){
					passTip2.html('<span class="error">两次输入密码不一致</span>');
				}else{
					passTip2.empty();
				}
			})
			datePicker.on('click',function(){
				dateTip.empty();
			})

			dialog.addButton({
				text:isCreate ? '生成外链':'确定',
				onclick:function(){
					var flag = true;
					bd.find('.tips').empty();
					if(needPass.val() === '1'){
						if(!hasPassword && pass1.val() === ''){
							passTip1.empty().html('<span class="error">请输入密码</span>');
							flag = false;
						}else if(pass1.val().length !== $.trim(pass1.val()).length){
							passTip1.empty().html('<span class="error">首尾不能含有空格</span>');
							flag = false;
						}else if(pass1.val().length > 16){
							passTip1.html('<span class="error">密码长度不得超过16位</span>');
							flag = false;
						}else if(pass1.val() !== pass2.val()){
							passTip2.html('<span class="error">两次输入密码不一致</span>');
							flag =false;
						}
					}

					if(datePicker.val() === ''){
						dateTip.html('<span class="error">请选择失效时间</span>');
						flag = false;
					}else{
						var date = datePicker.val(),
							time = hours.val() + ':00';
						var d = date.split('-').concat(time.split(':'));
						if(new Date(d[0],d[1]-1,d[2],d[3],d[4],d[5]) < new Date()){
							dateTip.html('<span class="error">失效时间应大于当前时间</span>');
							flag = false;
						}
					}

					if(outchainNote.val().length > 200){
						noteTip.html('<span class="error">不能超过200字</span>');
						flag = false;
					}

					if(flag){
						var p = needPass.val() === '1' ? pass1.val() : '';
						var time = datePicker.val() + ' '+ hours.val() +':00';
						var note = outchainNote.val();
						var power = $('input[name="sharePrivilege"]:checked').val(),
							language = $('input[name="language"]:checked').val();
						file.createOutChain(parseInt(needPass.val()),p,time,note,power,language);
						dialog.remove();
					}
				},
				className:'confirm'
			}).addButton({
				text:'取消',
				onclick:function(){
					dialog.remove();
				},
				className:'cancle'
			})

			dialog.body.on('click','.switch a',function(){
				var bd = dialog.body,
					pass = bd.find('.pass'),
					type = bd.find('.switch input');
				if($(this).hasClass('on')){
					pass.hide();
					type.val(0);
					$(this).removeClass('on').addClass('off');
				}else if($(this).hasClass('off')){
					pass.show();
					type.val(1);
					$(this).removeClass('off').addClass('on');
					if(hasPassword){
						passTip1.empty().html('<span class="tip">不修改密码请保持为空</span>');
					}
				}
			})
		}
		
		return dialog;
	}
	//获取外链
	/**
     * 获取外链
     * @static
     * @param {Sbox.Models.File} file 需要获取外链的文件
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.ShowOutChain = function(file){
		var dialog = new Sbox.Views.Window({
				title:'查看外链',
				body:tpl_getoutchain,
				width:500,
				closeButton:true,
				onHide:function(){
					dialog.remove();
				},
				onRemove:function(){
					if(jQuery.browser.msie){ //IE下title会被改掉，只好。。。再改回来。
						setTimeout(function(){
							document.title = WEBSITE_NAME; 
						},50)
					}
					// clip && clip.hide();
				}
			})
			
			dialog.addButton({
				text:'关闭',
				onclick:function(){
					dialog.remove();
				}
			})

			var ipt = dialog.body.find('#outchainIpt'),
				fileInfo = $('#fileInfo');

			var isdir = (typeof file.get('parentDir') !== 'undefined'),
				name = file.get('name'),
				filetype = isdir ? 'folder' : getFileType(name),
				shortName,fileName;

			if(isdir || filetype === 'unknow'){
				shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
			}else{
				fileName = name.substring(0,name.lastIndexOf('.'));
				shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + name.substring(name.lastIndexOf('.') + 1); 
			}
			fileInfo.html('<span class="file-type '+ filetype +'"></span><span class="file-name" title="'+ name +'">'+ shortName +'</span>')


			ipt.val(file.get('outlink'));
			ipt.on('click',function(){
				$(this).select();
			})
			dialog.body.find('#outchainCheck').attr('href',file.get('outlink'));
			if(typeof ZeroClipboard === 'undefined'){
				$.getScript(STATIC_DOMAIN+'/js/libs/zeroclipboard/ZeroClipboard.js',function(){
					makeCopy();
				})
			}else{
				makeCopy();
			}

			function makeCopy(){
				var clip = new ZeroClipboard.Client();
				clip.setText("");
				clip.setHandCursor(true);
				//clip.glue('outchainCopy');
				// var copy = $().css({
				// 	position:'absolute',
				// 	top:0,
				// 	left:0
				// })
				$('#outchainCopy span').html(clip.getHTML(24,26));
				clip.addEventListener('mouseOver',function(){
					clip.setText( ipt.val() );
				});
				clip.addEventListener('mouseDown',function(){
					if(jQuery.browser.msie){ //IE下title会被改掉，只好。。。再改回来。
						setTimeout(function(){
							document.title = WEBSITE_NAME; 
						},50)
					}
				})
				clip.addEventListener('complete', function (client, text) {
					Sbox.Success('复制成功！');
				});

				if(jQuery.browser.msie){ //IE下title会被改掉，只好。。。再改回来。
					setTimeout(function(){
						document.title = WEBSITE_NAME; 
					},50)
				}
			}

			return dialog;
	}
	//发送外链
	/**
     * 发送外链
     * @static
     * @param {Sbox.Models.File} file 需要发送外链的文件
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.SendOutChain = function(file){
		var dialog = new Sbox.Views.Window({
			title:'邮件发送',
			body:tpl_sendoutchain,
			width:520,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		})
		var sendTo = dialog.body.find('#sendTo'),
			plv = sendTo.attr('placeholder'),
			emailError = sendTo.prev(),
			sendContent = dialog.body.find('#sendContent'),
			fileInfo = $('#fileInfo');

		var isdir = (typeof file.get('parentDir') !== 'undefined'),
			name = file.get('name'),
			filetype = isdir ? 'folder' : getFileType(name),
			shortName,fileName;

		if(isdir || filetype === 'unknow'){
			shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
		}else{
			fileName = name.substring(0,name.lastIndexOf('.'));
			shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + name.substring(name.lastIndexOf('.') + 1); 
		}
		fileInfo.html('<span class="file-type '+ filetype +'"></span><span class="file-name" title="'+ name +'">'+ shortName +'</span>')


		var flag = true;
		dialog.addButton({
			text:'发送',
			onclick:function(){
				sendTo.trigger('blur');

				var mails = sendTo.val(),
					content = sendContent.val();
				mails = mails.split(';');
				if(flag){
					file.sendOutChain(mails,content);
					dialog.remove();
				}else{
					emailError.show();
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			},
			className:'cancle'
		})

		sendTo.on('blur',function(){
			flag = true;

			if(sendTo.val() === plv || $.trim(sendTo.val()) === ''){
				flag = false;
			}
			var mails = sendTo.val(),
				content = sendContent.val();
			mails = mails.split(';');
			_(mails).each(function(mail){
				mail = $.trim(mail);
				if(mail !== ''){
					if(!mailReg.test(mail)){
						flag = false;
					}
				}
			});
			if(!flag){
				emailError.show();
			}
		}).on('focus',function(){
			emailError.hide();
		})

		Sbox.placeholder(sendTo);
		return dialog;
	}
	//修改外链
	/**
     * 修改外链
     * @static
     * @param {Sbox.Models.File} file 需要修改外链的文件
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.EditOutChain = function(file){
		Sbox.CreateOutChain(file);
	}
	//删除外链
	/**
     * 删除外链
     * @static
     * @param {Array} files 需要删除外链的文件{Sbox.Models.File}数组
     * @param {Sbox.Collections.FileList} fileList 文件列表
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.DeleteOutChain = function(files,fileList){
		var dialog = Sbox.Warning({
			title:'取消外链',
			message:'<p>您确定要取消所选外链吗？</p><p class="tip">取消后外链地址将失效！</p>',
			closeButton:true,
			callback:function(f){
				if(f){
					fileList.deleteOutchains(files);
				}
			}
		})
	}
})(jQuery);

(function($){ //匿名上传
	var tpl_createuploadlink = '<div class="outchain-dialog"> \
					                <div id="fileInfo" class="file-info"> \
					                    <span class="file-type folder"></span><span class="file-name" title="我的图片">我的图片</span> \
					                </div> \
					                <div class="field"> \
					                    <div class="label">上传密码：</div> \
					                    <div class="ipt"> \
					                        <div class="pass" id="passwords"> \
					                            <p style="margin-top:0;">输入密码：<input class="ipt-text" type="password" onpaste="return false;"><span class="tips"></span></p> \
					                            <p>确认密码：<input class="ipt-text" type="password" onpaste="return false;"><span class="tips"></span></p> \
					                        </div> \
					                    </div> \
					                </div> \
					                <div class="field"> \
					                    <div class="label">失效时间：</div> \
					                    <div class="ipt "> \
					                        <div class="datepicker"> \
					                            <input class="ipt-text" type="text" readonly="readonly" id="datePicker" onclick="WdatePicker({minDate:\'%y-%M-{%d}\'});"> \
					                            <span class="icon icon-date" onclick="WdatePicker({el:\'datePicker\',minDate:\'%y-%M-{%d}\'})"></span> \
					                        </div>&nbsp; \
					                        <select id="hours" style="width: 70px;"></select> \
					                    </div> \
					                    <div class="tips" id="dateTip"></div> \
					                </div> \
					            </div>',
		tpl_getuploadlink = '<div class="outchain-dialog"> \
								<div id="fileInfo" class="file-info"></div> \
					    		<div class="field link"> \
					    			<div class="label">上传链接：</div> \
					    			<div class="ipt"> \
					    				<input class="ipt-text" type="text" id="outchainIpt" value="" readonly="readonly" /> <span id="outchainCopy" class="copy">复制<span></span></span> | <a id="outchainCheck" href="#" target="_blank">查看</a> \
					    			</div> \
					    		</div> \
					    		<div class="field link"> \
					    			<div class="label"></div> \
					    			<div class="ipt"> \
					    				<span class="tip">匿名用户访问上传链接即可上传300M文件到该文件夹下</span> \
					    			</div> \
					    		</div> \
					    	</div>';

	//生成上传链接
	Sbox.CreateUploadLink = function(file){
		var dialog = null;
		if(typeof WdatePicker === 'undefined'){
			$.getScript(STATIC_DOMAIN +'/js/libs/datepicker/WdatePicker.js',function(){
				createDialog();
			})	
		}else{
			createDialog();
		}

		function createDialog(){
			var isCreate = !file.get('uploadlink') ;
			//var hasPassword = file.get('password');
			dialog = new Sbox.Views.Window({
				title:isCreate ? '开启匿名上传':'匿名上传设置',
				body:tpl_createuploadlink,
				width:500,
				closeButton:true,
				onHide:function(){
					dialog.remove();
				}
			});

			var bd = dialog.body,
				fileInfo = bd.find('#fileInfo'),
				passwords = bd.find('#passwords'),
				pass1 = passwords.find('input').eq(0),
				pass2 = passwords.find('input').eq(1),
				passTip1 = passwords.find('.tips').eq(0),
				passTip2 = passwords.find('.tips').eq(1),
				datePicker = bd.find('#datePicker'),
				hours = bd.find('#hours'),
				dateTip = bd.find('#dateTip'),
				selector;

			
			fileInfo.html(getFileInfo(file));

			var hoursOptions = '';
			for(var i = 0; i<24;i++){
				var tmp = i < 10 ? '0' + i : '' + i;
				tmp = tmp + ':00';
				hoursOptions += '<option value="'+ tmp +'">'+ tmp +'</option>';
			}
			hours.html(hoursOptions);

			if(!isCreate){
				passTip1.empty().html('<span class="tip">不修改密码请保持为空</span>');
			}

			var d = new Date(new Date().valueOf() + 7 * 24 * 60 * 60 * 1000);
			var date = file.get('expiredate') || (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + '00:00:00');
			if(date.indexOf(' ') > 0){
				date = date.split(' ');
			}else{
				date = [date,"00:00:00"]
			}
			datePicker.val(date[0]);
			setTimeout(function(){
				hours.find('option[value="'+ date[1].split(':')[0] +':00"]').attr('selected',true);
				selector = Sbox.makeSelector(hours);
			},50)

			pass1.on('blur',function(){
				if(pass1.val().length > 16){
					passTip1.html('<span class="error">密码长度不得超过16位</span>');
				}else{
					passTip1.empty();
				}
				if(pass1.val() === pass2.val()){
					passTip2.empty();
				}
			});
			pass2.on('blur',function(){
				if(pass1.val() !== pass2.val()){
					passTip2.html('<span class="error">两次输入密码不一致</span>');
				}else{
					passTip2.empty();
				}
			})
			datePicker.on('click',function(){
				dateTip.empty();
			})

			dialog.addButton({
				text:'确定',
				onclick:function(){
					var flag = true;
					bd.find('.tips').empty(),
					passVal = pass1.val();
					if(isCreate && passVal === ''){
						passTip1.empty().html('<span class="error">请输入密码</span>');
						flag = false;
					}else if(passVal.length !== $.trim(passVal).length){
						passTip1.empty().html('<span class="error">首尾不能含有空格</span>');
						flag = false;
					}else if(passVal.length > 16){
						passTip1.html('<span class="error">密码长度不得超过16位</span>');
						flag = false;
					}else if(passVal !== pass2.val()){
						passTip2.html('<span class="error">两次输入密码不一致</span>');
						flag =false;
					}

					if(datePicker.val() === ''){
						dateTip.html('<span class="error">请选择失效时间</span>');
						flag = false;
					}else{
						var date = datePicker.val(),
							time = hours.val() + ':00';
						var d = date.split('-').concat(time.split(':'));
						if(new Date(d[0],d[1]-1,d[2],d[3],d[4],d[5]) < new Date()){
							dateTip.html('<span class="error">失效时间应大于当前时间</span>');
							flag = false;
						}
					}

					if(flag){
						var p = pass1.val();
						var time = datePicker.val() + ' '+ hours.val() +':00';
						file.createUploadLink({
							password:p,
							time:time
						});
						dialog.remove();
					}
				},
				className:'confirm'
			}).addButton({
				text:'取消',
				onclick:function(){
					dialog.remove();
				},
				className:'cancle'
			})

		}

		return dialog
	}
	//获取上传链接
	Sbox.ShowUploadLink = function(file){
		var dialog = new Sbox.Views.Window({
			title:'查看匿名上传链接',
			body:tpl_getuploadlink,
			width:500,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			},
			onRemove:function(){
				if(jQuery.browser.msie){ //IE下title会被改掉，只好。。。再改回来。
					setTimeout(function(){
						document.title = WEBSITE_NAME; 
					},50)
				}
				// clip && clip.hide();
			}
		})
		
		dialog.addButton({
			text:'关闭',
			onclick:function(){
				dialog.remove();
			}
		})

		var ipt = dialog.body.find('#outchainIpt'),
			fileInfo = $('#fileInfo');
			
		fileInfo.html(getFileInfo(file));

		ipt.val(file.get('uploadlink'));
		ipt.on('click',function(){
			$(this).select();
		})
		dialog.body.find('#outchainCheck').attr('href',file.get('uploadlink'));
		if(typeof ZeroClipboard === 'undefined'){
			$.getScript(STATIC_DOMAIN+'/js/libs/zeroclipboard/ZeroClipboard.js',function(){
				makeCopy();
			})
		}else{
			makeCopy();
		}

		function makeCopy(){
			var clip = new ZeroClipboard.Client();
			clip.setText("");
			clip.setHandCursor(true);
			//clip.glue('outchainCopy');
			// var copy = $().css({
			// 	position:'absolute',
			// 	top:0,
			// 	left:0
			// })
			$('#outchainCopy span').html(clip.getHTML(24,26));
			clip.addEventListener('mouseOver',function(){
				clip.setText( ipt.val() );
			});
			clip.addEventListener('mouseDown',function(){
				if(jQuery.browser.msie){ //IE下title会被改掉，只好。。。再改回来。
					setTimeout(function(){
						document.title = WEBSITE_NAME; 
					},50)
				}
			})
			clip.addEventListener('complete', function (client, text) {
				Sbox.Success('复制成功！');
			});

			if(jQuery.browser.msie){ //IE下title会被改掉，只好。。。再改回来。
				setTimeout(function(){
					document.title = WEBSITE_NAME; 
				},50)
			}
		}

		return dialog;
	}
	//修改上传链接
	Sbox.EditUploadLink = function(file){
		Sbox.CreateUploadLink(file);
	}
	//删除上传链接
	Sbox.DeleteUploadLink = function(files,fileList){
		var dialog = Sbox.Warning({
			title:'关闭匿名上传',
			message:'<p>您确定要关闭该文件夹匿名上传吗？</p><p class="tip">关闭后上传链接地址将失效！</p>',
			closeButton:true,
			callback:function(f){
				if(f){
					fileList.deleteUploadLinks(files);
				}
			}
		})
	}

	function getFileInfo(file){
		var isdir = (typeof file.get('parentDir') !== 'undefined'),
			name = file.get('name'),
			filetype = isdir ? 'folder' : getFileType(name),
			previewable = previewFileType.test(filetype),
			shortName,fileName;

		if(isdir || filetype === 'unknow'){
			shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
		}else{
			fileName = name.substring(0,name.lastIndexOf('.'));
			shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + name.substring(name.lastIndexOf('.') + 1); 
		}
		return '<span class="file-type '+ filetype +'"></span><span class="file-name" title="'+ name +'">'+ shortName +'</span>'
	}
})(jQuery);

(function($){//文件上锁

	var tpl_lock = '<div class="lock-dialog"> \
			    		<div class="lock-type"> \
			    			<input type="hidden" id="lockType" value="0" /> \
			    			<div class="radio auto"> \
			    				<span class="icon icon-radiobox-checked"></span> \
			    				<span class="label">自动解锁</span> \
			    				<select id="lockTime" style="width:140px"> \
			    					<option value="30">半小时</option> \
			    					<option value="60">一小时</option> \
			    					<option value="180">三小时</option> \
			    					<option value="360">六小时</option> \
			    					<option value="720">十二小时</option> \
			    					<option value="1440">二十四小时</option> \
			    				</select> \
			    			</div> \
			    			<div class="radio manual"> \
			    				<span class="icon icon-radiobox-unchecked"></span> \
			    				<span class="label">手动解锁</span> \
			    			</div> \
			    		</div> \
			    	</div>';
	/**
     * 文件上锁
     * @static
     * @param {Sbox.Models.File} file 需要上锁的文件
     */
	Sbox.Lock = function(file){
		if(file.get('lock')){
			file.unlock();
			return;
		}
		/* 2012-08-06 angelscat 暂时屏蔽自动解锁
		var dialog = new Sbox.Views.Window({
			title:'文件上锁',
			body:tpl_lock,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		})
		
		dialog.addButton({
			text:'确定',
			onclick:function(){
				var lockType = parseInt($('#lockType').val());
				var time = lockType ? '' : parseInt($('#lockTime').val())
				file.lock(time);
				dialog.remove();
			}
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		});

		Sbox.makeSelector('lockTime');

		var bd = dialog.body;

		bd.on('click','.radio',function(){
			bd.find('.radio .icon-radiobox-checked').removeClass('icon-radiobox-checked').addClass('icon-radiobox-unchecked');
			$(this).find('.icon').removeClass('icon-radiobox-unchecked').addClass('icon-radiobox-checked');
			bd.find('#lockType').val($(this).hasClass('auto') ? 0 : 1);
		})
		// .on('click','.selector .arrow-down',function(){
		// 	bd.find('.selector ul').show();
		// }).on('click','.selector ul li',function(){
		// 	bd.find('#lockTime').val($(this).attr('_time'));
		// 	bd.find('#lockTimeText').text($(this).text());
		// }).on('click',function(e){
		// 	if((e.target || e.srcElement) !== bd.find('.selector .arrow-down')[0]) bd.find('.selector ul').hide();
		// })

		// $(document).on('click',function(){
		// 	bd.find('.selector ul').hide();
		// })

		return dialog;
		*/

		file.lock();
	}
})(jQuery);

(function($){//修改备注
	/**
     * 修改备注，仅供首页使用
     * @static
     * @param {Sbox.Models.File} file 需要修改备注的文件
     */
	Sbox.EditRemark = function(file){
		var li = $('#' + file.get('id')),
			remark = li.find('.file-remark'),
			input = remark.find('input');
		remark.addClass('active');
		setTimeout(function(){
			input.focus();
			input.select();
		},20)
	}
})(jQuery);

(function($){//重命名
	
	/**
     * 重命名，仅供首页使用
     * @static
     * @param {Sbox.Models.File} file 需要重命名的文件
     */
	Sbox.ReName = function(file){
		var li = $('#' + file.get('id')),
			remark = li.find('.file-name'),
			input = remark.find('input');
		remark.addClass('active');
		setTimeout(function(){
			var name = file.get('name');
			var start = 0,
				end = 0;
			if(file.get('parentDir') || file.isNew() || getFileType(name) === 'unknow'){
				end = name.length;
			}else{
				end = name.lastIndexOf('.') >= 0 ? name.lastIndexOf('.') : name.length;
			}
			if(input[0].createTextRange){
				var range = input[0].createTextRange();
				range.moveStart("character", -1);
				range.moveStart("character", -1);
				range.collapse();
				range.moveStart("character", start);
				range.moveEnd("character",end);
				range.select();
			}else{
				input[0].setSelectionRange(start,end);
				input[0].focus();
			}
		},20)
	}
})(jQuery);

(function($){//复制/移动
	
	var dialog = null,
		currentDir = {id:'root'};
	function createDialog(keepOrigin,isReduce){
		dialog = new Sbox.Views.Window({
			title:isReduce ? '还原' : (keepOrigin ? '复制' : '移动'),
			body:'<div class="folds myfile cur"> \
					<span class="fold '+ (userPublicAcl === 3 ? 'close' : 'open') +'"></span> \
					<a href="javascript:;" hidefocus="true" data-id="root"><span class="ico-folder '+ (userPublicAcl === 3 ? 'folder-close' : 'folder-open') +'"></span>我的文件</a> \
				</div> \
				<ul id="copyAndMoveTreeToMine" class="ztree" style="'+ (userPublicAcl === 3 ? 'display:none;' : '') +'"><li style="padding:20px;text-align:center;" class="tree-loading"><span class="icon icon-loading"></span></li></ul> \
				<div class="folds publicfile" style="'+ (userPublicAcl === 3 ? '' : 'display:none;') +'"> \
					<span class="fold close"></span> \
					<a href="javascript:;" hidefocus="true" data-id="public"><span class="ico-folder folder-close"></span>企业共享</a> \
				</div> \
				<ul id="copyAndMoveTreeToPublic" class="ztree" style="display:none;"><li style="padding:20px;text-align:center;" class="tree-loading"><span class="icon icon-loading"></span></li></ul> \
				<div class="folds sharefile" style="display:none;"> \
					<span class="fold close"></span> \
					<a href="javascript:;"><span class="ico-folder folder-close"></span>我收到的共享文件</a> \
				</div> \
				<ul style="display:none;" id="copyAndMoveTreeToShare" class="ztree" style=""><li style="padding:20px;text-align:center;"><span class="icon icon-loading"></span></li></ul>',
			closeButton:true,
			height:355,
			width:440
		});
		var treeContainer = dialog.body.find('#copyAndMoveTreeToMine'),
			shareTreeContainer = dialog.body.find('#copyAndMoveTreeToShare'),
			publicTreeContainer = dialog.body.find('#copyAndMoveTreeToPublic')

		var setting = {
            view: {
                autoCancelSelected:false, //是否支持ctrl反选
                dblClickExpand:false, //是否双击打开
                expandSpeed:'fast',//("slow", "normal", or "fast") or 1000
                nameIsHTML:true,//name是否允许html
                selectedMulti:false, //是否支持多选
                showIcon:true,//是否显示icon
                showLine:false,//是否显示虚线
                showTitle:true //是否显示title
            },
            data: {
                keep:{
                    leaf:false, //如果为true则所有子节点都无法添加子节点
                    parent:false //如果为true则表示即使所有子节点全部移除依旧保持父节点状态
                                //所以根据需求这两参数应该不用变了
                }
            },
            async:{//异步加载所需参数
                autoParam : ['id'],//需要提交的参数如id=1&name=test，可以修改参数别名如['id=tid']将提交tid=1
                //contentType : "application/x-www-form-urlencoded",//默认的'application/x-www-form-urlencoded'可以满足大部分需要，'application/json'可以进行json数据的提交
                dataFilter : function(treeId,parentNode,childNodes){
                	var _childNodes = []
                	if(childNodes.code === 701 || childNodes.code === 403){
                		dialog.hide();
                		Sbox.Login();
                	}else{
	                	_(childNodes).each(function(node){
	                		var o = {}
	                		o.id = node.id;
	                		o.name = node.name;
	                		o.isParent = node.hasSon || node.hsaSon ? true : false;
	                		//o.isParent = true;
	                		_childNodes.push(o);
	                	})
                	}
                	return _childNodes;
                }, //对返回的节点数据进行预处理。
                //dataType : "text", //返回的数据类型，一般为text。与jQuery.ajax类型一致。
                enable : true, //是否开启异步加载
                //otherParam : {},//其他自定义的参数如{a:1,b:2}或['a','1','b','2'];
                type : "get", //请求方式
                url : "/GetService!getService.action?_t=" + new Date().valueOf() //请求url // /GetService!getService.action  || treenode.json
            },
            callback:{ //各种回调
                onClick:function(e,treeId,treeNode){
                	dialog.body.find('.folds').removeClass('cur');
                	if(treeNode.zAsync){
                		tree.expandNode(treeNode,true,true,true)
                	}else{
                		tree.reAsyncChildNodes(treeNode,'refresh',false)
                	}
                    currentDir = treeNode;
                    tree3.cancelSelectedNode()
                },
                onAsyncSuccess:function(e,treeId,treeNode,msg){ //总是在展开成功后,将treeNode交给checkNode处理
                    if(treeNode && treeNode.children.length === 0){
                		treeNode.isParent = false;
                		tree.updateNode(treeNode);
                    }
                    updateWidth();

                    treeContainer.find('li.tree-loading').remove();
                },
                onExpand:function(){
                	updateWidth();
                }
            }
        };
        // var setting2 = {
        // 	view: {
        //         autoCancelSelected:false, //是否支持ctrl反选
        //         dblClickExpand:false, //是否双击打开
        //         expandSpeed:'fast',//("slow", "normal", or "fast") or 1000
        //         nameIsHTML:true,//name是否允许html
        //         selectedMulti:false, //是否支持多选
        //         showIcon:true,//是否显示icon
        //         showLine:false,//是否显示虚线
        //         showTitle:true //是否显示title
        //     },
        //     data: {
        //         keep:{
        //             leaf:false, //如果为true则所有子节点都无法添加子节点
        //             parent:false //如果为true则表示即使所有子节点全部移除依旧保持父节点状态
        //                         //所以根据需求这两参数应该不用变了
        //         }
        //     },
        //     async:{//异步加载所需参数
        //         autoParam : ['id'],//需要提交的参数如id=1&name=test，可以修改参数别名如['id=tid']将提交tid=1
        //         //contentType : "application/x-www-form-urlencoded",//默认的'application/x-www-form-urlencoded'可以满足大部分需要，'application/json'可以进行json数据的提交
        //         dataFilter : function(treeId,parentNode,childNodes){
        //         	var _childNodes = []
        //         	_(childNodes).each(function(node){
        //         		//if(node.acl !== 3) return;
        //         		var o = {}
        //         		o.id = node.id;
        //         		o.name = decodeURI(node.name);
        //         		o.isParent = typeof node.hasSonDir === 'undefined' ||  node.hasSonDir ? true : false;
        //         		//o.isParent = true;
        //         		_childNodes.push(o);
        //         	})
        //         	return _childNodes;
        //         }, //对返回的节点数据进行预处理。
        //         //dataType : "text", //返回的数据类型，一般为text。与jQuery.ajax类型一致。
        //         enable : true, //是否开启异步加载
        //         //otherParam : {},//其他自定义的参数如{a:1,b:2}或['a','1','b','2'];
        //         type : "get", //请求方式
        //         url : "/GetShareDir!getTree.action?_t=" + new Date().valueOf() //请求url // /GetService!getService.action  || treenode.json
        //     },
        //     callback:{ //各种回调
        //         onClick:function(e,treeId,treeNode){
        //         	dialog.body.find('.folds').removeClass('cur');
        //         	if(treeNode.zAsync){
        //         		tree2.expandNode(treeNode,true,true,true)
        //         	}else{
        //         		tree2.reAsyncChildNodes(treeNode,'refresh',false)
        //         	}
        //             currentDir = treeNode;
        //         },
        //         onAsyncSuccess:function(e,treeId,treeNode,msg){ //总是在展开成功后,将treeNode交给checkNode处理
        //             if(treeNode && treeNode.children.length === 0){
        //         		treeNode.isParent = false;
        //         		tree2.updateNode(treeNode);
        //             }
        //             //updateWidth();
        //         },
        //         onExpand:function(){
        //         	//updateWidth();
        //         }
        //     }
        // }
        var setting3 = {
            view: {
                autoCancelSelected:false, //是否支持ctrl反选
                dblClickExpand:false, //是否双击打开
                expandSpeed:'fast',//("slow", "normal", or "fast") or 1000
                nameIsHTML:true,//name是否允许html
                selectedMulti:false, //是否支持多选
                showIcon:true,//是否显示icon
                showLine:false,//是否显示虚线
                showTitle:true //是否显示title
            },
            data: {
                keep:{
                    leaf:false, //如果为true则所有子节点都无法添加子节点
                    parent:false //如果为true则表示即使所有子节点全部移除依旧保持父节点状态
                                //所以根据需求这两参数应该不用变了
                }
            },
            async:{//异步加载所需参数
                autoParam : ['id'],//需要提交的参数如id=1&name=test，可以修改参数别名如['id=tid']将提交tid=1
                //contentType : "application/x-www-form-urlencoded",//默认的'application/x-www-form-urlencoded'可以满足大部分需要，'application/json'可以进行json数据的提交
                dataFilter : function(treeId,parentNode,childNodes){
                	var _childNodes = []
                	if(childNodes.code === 701 || childNodes.code === 403){
                		dialog.hide();
                		Sbox.Login();
                	}else{
	                	_(childNodes).each(function(node){
	                		var o = {}
	                		o.id = node.id;
	                		o.name = node.name;
	                		o.isParent = node.hasSon || node.hsaSon ? true : false;
	                		//o.isParent = true;
	                		_childNodes.push(o);
	                	})
                	}
                	return _childNodes;
                }, //对返回的节点数据进行预处理。
                //dataType : "text", //返回的数据类型，一般为text。与jQuery.ajax类型一致。
                enable : true, //是否开启异步加载
                //otherParam : {},//其他自定义的参数如{a:1,b:2}或['a','1','b','2'];
                type : "get", //请求方式
                url : "/GetPublicNodeList!getAllnode.action?_t=" + new Date().valueOf() //请求url // /GetService!getService.action  || treenode.json
            },
            callback:{ //各种回调
                onClick:function(e,treeId,treeNode){
                	dialog.body.find('.folds').removeClass('cur');
                	if(treeNode.zAsync){
                		tree3.expandNode(treeNode,true,true,true)
                	}else{
                		tree3.reAsyncChildNodes(treeNode,'refresh',false)
                	}
                    currentDir = treeNode;
                    tree.cancelSelectedNode()
                },
                onAsyncSuccess:function(e,treeId,treeNode,msg){ //总是在展开成功后,将treeNode交给checkNode处理
                    if(treeNode && treeNode.children.length === 0){
                		treeNode.isParent = false;
                		tree3.updateNode(treeNode);
                    }
                    updateWidth();

                    publicTreeContainer.find('li.tree-loading').remove();
                },
                onExpand:function(){
                	updateWidth();
                }
            }
        };

        var tree = $.fn.zTree.init(treeContainer, setting),
        	// tree2 = $.fn.zTree.init(shareTreeContainer,setting2),
        	tree3 = $.fn.zTree.init(publicTreeContainer,setting3);


        function updateWidth(){
        	var divs = treeContainer.find('.treenode_bg'),
        		width = 420;
        	divs.each(function(){
        		var div = $(this),
        			a = div.find('a'),
        			w = parseInt(div.css('paddingLeft')) + 18 + a.width();
        		if(w > width) width = w;
        	})
        	if(treeContainer.height() > treeContainer.parent().height() && width == 420){
        		width = width - 20;
        	}
        	treeContainer.width(width);
        }

		dialog
		// .addButton({
		// 	text:'新建文件夹',
		// 	className:'create btn24-blue',
		// 	onclick:function(){
		// 		//TODO 新建的操作会直接调用新建目录的API在服务器生成成功后需要更新包括 左侧的树，右侧的文件列表 等信息。
		// 		var addedNodes = tree.addNodes(currentDir,{name:'<input id="tempAddTreeNode" type="text" value="新建文件夹" />'});
		// 		var input = $('#tempAddTreeNode');
		// 		input.focus();
		// 		input.bind('click',function(e){
		// 			e.stopImmediatePropagation();
		// 		}).bind('blur',function(e){
		// 			var val = $(this).val(),
		// 				tagertId = currentDir || 'root';
		// 			$.post('/CreateDir!createDir.action',{
		// 				tagertId : tagertId,
		// 				name : val
		// 			},function(r){
		// 				if(r.code === 500){
		// 					Sbox.Alert({
		// 						message:r.messate,
		// 						callback:function(){
		// 							input.focus();
		// 						}
		// 					})
		// 				}else{
		// 					//成功
		// 					addedNodes[0].name = val;
		// 					addedNodes[0].id = r.id;
		// 					tree.addedNodes(addedNodes[0]);
		// 				}
		// 			},'json')
		// 		}).bind('keyup',function(e){
		// 			if(e.keyCode === 13){
		// 				$(this).blur();
		// 			}
		// 		})
		// 	}
		// })
		.addButton({
			text:'确定',
			className:'confirm'
		})
		.addButton({
			text:'取消',
			className:'cancle',
			onclick:function(){
				dialog.hide();
			}
		}).addStyle('dialog-tree');

		dialog.body.find('.folds').on('click',' a',function(){
			if($(this).parent().hasClass('sharefile')) return;
			dialog.body.find('.folds').removeClass('cur');
			$(this).parent().addClass('cur');
			// console.log($(this).attr('data-id'))
			currentDir = {id:$(this).attr('data-id')};
			tree.cancelSelectedNode();
			tree3.cancelSelectedNode();
		}).on('click','.fold',function(){
			var target = $(this),
				parent = target.parent(),
				folder = parent.find('.ico-folder'),
				ul = parent.next();
			if(target.hasClass('open')){
				ul.slideUp(100,function(){
					folder.removeClass('folder-open').addClass('folder-close');
					target.removeClass('open').addClass('close');
				})
			}else{
				ul.slideDown(100,function(){
					folder.removeClass('folder-close').addClass('folder-open');
					target.removeClass('close').addClass('open');
				});
			}
		})

		Sbox.addTree({type:'mine',tree:tree});
		//Sbox.addTree({type:'share',tree:tree2})
		Sbox.addTree({type:'public',tree:tree3});
	}

	/**
     * 移动或者复制文件
     * @static
     * @param {Array} files 需要移动或复制的文件{Sbox.Models.File}数组
     * @param {Boolean} keepOrigin true为复制false为移动
     * @param {Sbox.Collections.FileList} fileList 需要移动的文件所在列表
     * @param {Boolean} isReduce 是否是回收站还原
     */
	Sbox.Move = function(files,keepOrigin,fileList,type,isReduce){
		keepOrigin = keepOrigin || false; //标记是否保存源文件，保存即为复制，不保存即为移动。
		showPublic = (type === 'mine' || type === 'restore' ? false : true);
		var url;
		if(dialog === null){
			createDialog(keepOrigin,isReduce);
		}else{
			dialog.show();
			dialog.setTitle(isReduce ? '还原' : (keepOrigin ? '复制' : '移动'));
		}
		if(showPublic){
			dialog.body.find('.publicfile').show();
			if(dialog.body.find('.publicfile .fold').hasClass('close')){
				dialog.body.find('#copyAndMoveTreeToPublic').hide();
			}else{
				dialog.body.find('#copyAndMoveTreeToPublic').show();
			}
		}else{
			dialog.body.find('.publicfile,#copyAndMoveTreeToPublic').hide();
		}

		dialog.footer.off('click');
		dialog.footer.on('click','.confirm',function(){
			parentId = files[0].get('belongDir') || files[0].get('parentDir');
			parentId = (parentId == userId ? 'root' : parentId);
			if(!isReduce && parentId == currentDir.id){
				Sbox.Fail('您要' + (keepOrigin ? '复制' : '移动') + '的文件已存在目标目录下',2)
				dialog.hide();
				return;
			}
			//console.log(currentDir.id);
			fileList.moveFiles(files,keepOrigin,currentDir.id,isReduce);
			dialog.hide();
		})
	}
})(jQuery);

(function($){
	var downloadForm;
	/**
     * 下载文件，可以批量打包下载
     * @static
     * @param {Array} files 需要下载的文件{Sbox.Models.File}数组
     */
	Sbox.Download = function(files){
		var ids = [],firstName;
		if(!downloadForm){
			downloadForm = $('<form method="post" action="/GetFiles!getFiles.action" style="display:none;"><input type="hidden" name="ids" /><input type="hidden" name="firstName" /></form>').appendTo($('body'));
		}

		if(files.length === 1 && !files[0].get('parentDir')){ //如果只有一个且是文件，那么普通下载
			window.open('/GetFile!getFile.action?resourceId='+files[0].get('id')+'&length='+files[0].get('size'))
		}else{
			firstName = files[0].get('name');
			_(files).each(function(file){
				ids.push({
					resourceId:file.get('id'),
					flag:file.get('parentDir') ? 0 : 1
				})
			})
			downloadForm.find('input').eq(0).val(jsonToString(ids));
			downloadForm.find('input').eq(1).val(firstName);
			downloadForm.submit();
		}
	}
})(jQuery);

(function($){ //统一管理所有的tree实例
	var trees = []; //所有tree列表，不管哪里需要更新，统一这里处理……

	/**
     * 添加新的tree实例
     * @static
     * @param {Object} tree 添加的tree实例
     */
	Sbox.addTree = function(tree){
		trees.push(tree);
	};

	/**
     * 像所有的tree实例上添加node
     * @static
     * @param {String} id 添加到哪个节点下
     * @param {Array} files 需要添加的节点 {Sbox.Models.File}
     * @param {String} to 添加到那种类型的树上
     * @param {String} use 是否更新
     */
	Sbox.addNodeToTree = function(id,files,to,use){ //添加
		var nodes = [];
		id = (id === userId ? 'root' : id);
		_(files).each(function(file){
			var o = {}
			if(file.get('email')){
    			o.id = '';
    			o.uid = file.get('id');
    			o.name = file.get('nickName'); // + '<' + file.get('email') + '>';
    			o.isParent = true;
    			o.acl = 1;
				nodes.push(o);
    		}else if(file.get('parentDir')){
    			o.uid = '';
        		o.id = file.get('id');
        		o.name = file.get('name');
        		o.isParent = file.get('hasSon') || file.get('hsaSon') ? true : false;
        		//if(parentNode) o.acl =  parentNode.acl;
        		if(file.get('acl')) o.acl = file.get('acl');
				nodes.push(o);
    		}
			// if(file.get('parentDir')){
			// 	o.name = file.get('name');
			// 	o.id = file.get('id');
			// 	o.isParent = file.get('hasSon') || file.get('hsaSon') ? true : false;
			// 	//o.isParent = true;
			// 	nodes.push(o);
			// }
		});
		if(nodes.length === 0) return;
		_(trees).each(function(t){
			//TODO 移动之后的处理
			var type = t.type,
				tree = t.tree;
			if(id === 'root' || id === 'public'){ //根目录的新增
				if((to === 'mine' && type === 'mine' && id === 'root') || (to === 'public' && type === 'public' && id === 'public')){
					_(nodes).each(function(node){
						if(!tree.getNodeByParam('id',node.id,null)){
							tree.addNodes(null,[node]);
						}else if(use === 'update'){
							var needUpdateNode = tree.getNodeByParam('id',node.id,null);
							if(needUpdateNode.name !== node.name){
								needUpdateNode.name = node.name;
								tree.updateNode(needUpdateNode);
							}
						}
					})
				}else if(to === 'share'){
					if(type === 'share'){
						_(nodes).each(function(node){
							if(!tree.getNodeByParam('uid',node.uid,null)){
								tree.addNodes(null,[node]);
							}
						})
						// tree.addNodes(null,nodes);
					}
				}
				
			}else{ //非根目录下的新增
				var parent = tree.getNodeByParam('id',id,null) || tree.getNodeByParam('uid',id,null);
				if(parent && parent.zAsync){
					if(parent.children && parent.children.length === 0 && nodes.length === 0) return;
					if(nodes.length !== 0){
						parent.isParent = true;
						tree.updateNode(parent);
						if(parent.acl){
							_(nodes).each(function(node){
								node.acl = node.acl || parent.acl;
							})
						};
						_(nodes).each(function(node){
							if(!tree.getNodeByParam('id',node.id,null)){
								tree.addNodes(parent,[node]);
							}else if(use === 'update'){
								var needUpdateNode = tree.getNodeByParam('id',node.id,null);
								if(needUpdateNode.name !== node.name){
									needUpdateNode.name = node.name;
									tree.updateNode(needUpdateNode);
								}
								if(needUpdateNode.acl !== node.acl){ //更新acl信息 fix PAN-1268 @2013-08-30
									needUpdateNode.acl = node.acl;
									tree.updateNode(needUpdateNode);	
								}
							}
						})
						// tree.addNodes(parent,nodes);
					}
				}
			}
		})
	};

	/**
     * 重命名某个节点
     * @static
     * @param {String} id 节点id
     * @param {Sbox.Models.File} file 新的节点
     */
	Sbox.renameNodeToTree = function(id,file){ //重命名
		_(trees).each(function(t){
			var type = t.type,
				tree = t.tree;
			var currentNode = tree.getNodeByParam('id',id,null);
			if(currentNode){
				currentNode.name = file.get('name');
				tree.updateNode(currentNode);
			}
		})
	};

	/**
     * 删除某些节点
     * @static
     * @param {Array} files 要删除的节点列表 
     */
	Sbox.deleteNodeToTree = function(files,to){ //删除
		_(trees).each(function(t){
			var type = t.type,
				tree = t.tree;
			_(files).each(function(file){
				var currentNode = tree.getNodeByParam('id',file.get('id'),null);
				tree.removeNode(currentNode);
			})
		})
	};

	/**
     * 回收站还原的时候要重新构建树结构
     * @static
     * @param {Array} files 重建的树节点列表
     */
	Sbox.reduceToTree = function(files,file){
		files.shift();
		// if(file && file.get('parentDir')){
		// 	var o = {};
		// 	o[file.get('id')] = file.get('name');
		// 	console.log(file.get('id'));
		// 	files.push(o);
		// }
		_(trees).each(function(t){
			var parentNode = null;
			var type = t.type,
				tree = t.tree;
			var dirs = _(files).clone(),
				len = dirs.length;
			if(len === 0) return;
			var tmp = dirs[0],
				id = _(tmp).keys()[0],
				//name = tmp[id],
				notFind = !(tree.getNodeByParam('id',id,null) || tree.getNodeByParam('uid',id,null)); 
			if(!notFind || (notFind && !$.isNumeric(id) && (type === 'mine' || type === 'move' || type === 'public'))){//第一轮是否找到，如果找到，那么继续，如果没找到，并且是自己的，那么继续。
				reduce();
			} 
			function reduce(){
				var dir = dirs.shift();
				if(!dir) return;
				var id = _(dir).keys()[0],
					name = dir[id];
				var currentNode = tree.getNodeByParam('id',id,null) || tree.getNodeByParam('uid',id,null);

				if(currentNode){ //如果能够查询到
					if(currentNode.zAsync){ //如果已经加载过，那么就继续向下查询，否则停止查询
						parentNode = currentNode;
						reduce();
					}
				}else{ //如果查询不到当前节点，那么将当前节点添加到当前树
					if(parentNode){
						parentNode.isParent = true;
						tree.updateNode(parentNode);
					}
					tree.addNodes(parentNode,{
						id:id,
						name:name,
						isParent:true
					});
				}
			}

		})
	}
})(jQuery);

(function($){
	//HTML5 方式
	/**
     * HTML5方式的上传
     * @class HTMLUpload
     * @constructor
     * @param {Object} params
     */
	Sbox.HTMLUpload = function(params){
		this.dirId = params.dirId || null;
		this.fileId = params.fileId || null;
		this.path = params.path;
		this.fileList = params.fileList;
		this.el = params.el || $('#' + params.id) || null;
		this.onuploadstart = params.onuploadstart || function(){}; //开始上传
		this.onprogress = params.onprogress || function(){}; //上传中
		this.onuploaded = params.onuploaded || function(){}; //上传完成
		this.onerror = params.onerror || function(){}; //上传出错
		this.block = params.block || 1024 * 1024; //分块大小，默认1M
		this.uploadNum = params.num || 3; //同时上传个数
		this.init();
	};
	Sbox.HTMLUpload.prototype = {
		/** @lends Sbox.HTMLUpload*/
		//初始化：
		//替换element，绑定事件；
		init:function(){
			var _this = this;
			//替换当前element
			var ipt = $('<input type="file" multiple size="1" />'),
				btn = $('<span class="u-btn"></span>');
			this.el.replaceWith(ipt);
			this.el = ipt;
			this.el.after(btn);
			this.fr = new FileReader(); //filereader

			this.queryFiles = {}; //用来标记是否已经选了某个文件
			this.uploadQuery = []; //用来排队
			this.isUploadingNum = 0; //正在上传的个数

			var showError = this.onerror;
			this.onerror = function(msg,id){
				if(id){
					var currentUpload = _this.uploadQuery[id],
					file = currentUpload.file,
					dirId = currentUpload.dirId;
					_this.queryFiles[dirId+file.name+file.size] = false;
				}
				showError(msg,id);
			}

			btn.click(function(){
				_this.el.trigger('click');
			})

			//绑定事件
			this.el.on('change',function(e){
				if(this.value === '') return;
				_this.selectFile(this.files);
				//_this.getUploadId(this.files[0]);
				this.value = '';

				//IE下file input选择同一个文件不会触发change时间，fixed PAN-1341，update @2013-08-30 14:57 
				var tmpForm = $('<form>');
				_this.el.before(tmpForm);
				_this.el.appendTo(tmpForm);
				tmpForm[0].reset();
				tmpForm.after(_this.el);
				tmpForm.remove();
			})

		},
		selectFile:function(files){
			var _this = this;
			var uploadQuery = this.uploadQuery,
				queryFiles = this.queryFiles,
				dirId = this.path ? this.path.get('pathId') : this.dirId;
			if(files.length <= 100){
				_(files).each(function(file){
					var block = isPreviewImgFile(file.name,file.size) ? file.size : _this.block;
					if(!queryFiles[dirId + file.name + file.size]){
						var id = uploadQuery.length;
						uploadQuery[id] = {
							file:file,
							dirId:dirId,
							block:block,
							status:'waiting' //初始化的时候，始终默认的等待，然后统一交给队列处理
						}
						//
						_this.onuploadstart(id,file.name,file.size);
						queryFiles[dirId+file.name+file.size] = true;
					}
				})
				_this.manageQuery();
			}else{
				_this.onerror('同时上传文件不得超过100个');
			}
		},
		update:function(path,fileList){
			this.path = path;
			this.fileList = fileList;
		},
		//处理队列，每次选择文件、取消、暂停、开始等操作，都调用这个方法来处理
		manageQuery:function(){
			//console.log(this.isUploadingNum);
			var uploadQuery = this.uploadQuery;
			for(var i = 0 , len = uploadQuery.length ; i < len ; i++){
				if(this.isUploadingNum < 3){
					if(uploadQuery[i] && uploadQuery[i].status === 'waiting'){
						// if(uploadQuery[i].uploadId){
						// 	this.upload(i);
						// 	this.isUploadingNum ++ ;
						// }else{
						// 	this.getUploadId(i);
						// 	this.isUploadingNum ++ ;
						// }
							this.getUploadId(i);
							this.isUploadingNum ++ ;
					}else{
						continue;
					}
				}else{
					break;
				}
			}
		},

		//取得当前文件的uploadId
		getUploadId:function(id){
			var _this = this;
			var currentUpload = this.uploadQuery[id],
				file = currentUpload.file,
				dirId = currentUpload.dirId;
			currentUpload.status = 'uploading';
			//console.log(file);
			$.post('/UploadInitialization!initialization.action',{
				Length:file.size,
				DirId:dirId,
				FileId:this.fileId,
				FileName:file.name,
				ModifyTime:file.lastModifiedDate || new Date(),
				CreateTime:file.lastModifiedDate || new Date()
			},function(r){
				var result = r.split(':');
				//console.log(result)
				if(r.indexOf('"code"') > 0){
					Sbox.Login();
				}
				else if(result[0] === '200'){
					currentUpload.uploadId = result[1];
					currentUpload.uniqueFileSign = result[2];
				    currentUpload.start = result[3] * 1;
				    if(currentUpload.start === file.size){
						_this.completeUpload(id);
					}else{
						if(currentUpload.status === 'stopped' || currentUpload.status === 'waiting' || currentUpload.status === 'cancled') return;
						_this.onprogress(id,currentUpload.start,file.size);
						_this.upload(id);
					}


					//var id = result[2];
					// if(!_this.uploadQuery[id]){
					// 	//uploadId标记队列
					// 	_this.uploadQuery[id] = {
					// 		uploadId : result[1],
					// 		uniqueFileSign : result[2],
					// 		start:result[3] * 1,
					// 		file:file,
					// 		dirId:dirId,
					// 		waiting:true 
					// 	};
					// 	this.query.push(_this.uploadQuery[id]);


					// 	//开始上传，将时间戳作为唯一标识
					// 	_this.onuploadstart(id,file.name,file.size);
					// 	// //获得当前文件上传到哪里了
					// 	// _this.getCurrentPos(id);
					// 	var currentUpload = _this.uploadQuery[id];
					// 	if(currentUpload.start === file.size){
					// 		_this.completeUpload(id);
					// 		//_this.onuploaded(id)
					// 	}else{
					// 		_this.onprogress(id,currentUpload.start,file.size);
					// 		_this.upload(id);	
					// 	}
					// }else{
					// 	//_this.onerror('该文件正在上传！');
					// }

				}else{
					if(result[0] === '501'){
						_this.onerror('空间大小不足',id);
					}else if(result[0] === '503'){
						_this.onerror('该文件被锁定',id);
					}else if(result[0] === '505'){
						_this.onerror('没有权限',id);
					}else if(result[0] === '506'){
						_this.onerror('存在同名文件',id);
					}else if(result[0] === '701'){
						Sbox.Login();
					}else{
						_this.onerror('服务器错误',id);
					}

					currentUpload.status = 'fail';
					delete _this.uploadQuery[id];
					delete _this.queryFiles[dirId + file.name + file.size];
					_this.isUploadingNum --;
					_this.manageQuery();
				} 
			},'text').error(function(){
				Sbox.Loading().remove();
				_this.onerror('服务器错误',id);

				currentUpload.status = 'fail';
				delete _this.uploadQuery[id];
				delete _this.queryFiles[dirId + file.name + file.size];
				_this.isUploadingNum --;
				_this.manageQuery();
			})
		},
		//获取当前文件已经传到哪了
		// getCurrentPos:function(id){
		// 	var _this = this;
		// 	var currentUpload = this.uploadQuery[id],
		// 		file = currentUpload.file;
		// 	//console.log(currentUpload);
		// 	// $.get('/GetUploadInfo!getUploadInfo.action?_t=' + Math.random() + '&uploadId=' + currentUpload.uploadId,function(r){
		// 		// currentUpload.start = r * 1;
		// 		if(currentUpload.start === file.size){
		// 			_this.completeUpload(id);
		// 			//_this.onuploaded(id)
		// 		}else{
		// 			_this.onprogress(id,currentUpload.start,file.size);
		// 			_this.upload(id);	
		// 		}
		// 	// },'text')
		// },
		//上传，可以抽象出来，否则每次调用都要初始化一堆变量
		upload:function(id){
			var _this = this;
			if(!this.uploadQuery[id]) return;
			var currentUpload = this.uploadQuery[id],
				dirId = currentUpload.dirId,
				file = currentUpload.file,
				start = currentUpload.start,
				block = currentUpload.block,
				end = file.size > start + block ? start + block : file.size,
				cur = file.size > start + block ? block : file.size - start,
				index = start / block,
				xhr = new XMLHttpRequest(),
				blob;
			//console.log(start,end)
			//console.log(index);
			currentUpload.fr = currentUpload.fr || new FileReader();
			var fr = currentUpload.fr;
			if(currentUpload.status === 'stopped' || currentUpload.status === 'waiting' && currentUpload.status === 'cancled') return;
			if(cur === 0){
				_this.completeUpload(id);
				return;
			}
			currentUpload.status = 'uploading';
			if(file.mozSlice){
				blob = file.mozSlice(start,end);
			}else if(file.webkitSlice){
				blob = file.webkitSlice(start,end);
			}else if(file.slice){
				blob = file.slice(start,end)
			}else{
				Sbox.Error('不支持HTML5方式上传');
			}

			xhr.open("POST",'/UploadRange!range.action',true);
			xhr.setRequestHeader('Content-Type','application/octet-stream');
			xhr.setRequestHeader('dirid',dirId);
			xhr.setRequestHeader('filename',encodeURIComponent(file.name)); //opera不允许中文的header
			xhr.setRequestHeader('pos',start);
			xhr.setRequestHeader('totalsize',cur);
			xhr.setRequestHeader('index',index);
			xhr.setRequestHeader('uploadid',currentUpload.uploadId);

    		
			xhr.onreadystatechange = function(){
				if(xhr.readyState === 4 && xhr.status === 200){
					if(xhr.responseText.indexOf('701') >= 0){
						Sbox.Login();
						return;
					}
					if(xhr.responseText === ''){
						_this.onerror('上传错误',id)
						currentUpload.status = 'fail';
						delete _this.uploadQuery[id];
						delete _this.queryFiles[dirId + file.name + file.size];
						_this.isUploadingNum --;
						_this.manageQuery();

						return;
					}
					var r;
					try{
						r = $.parseJSON(xhr.responseText);
					}catch(e){
						r = {code:-1};
					}
					xhr = null;
					currentUpload.isUploading = false;//请求返回之后标记未上传中
					if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){
						if(currentUpload.status !== 'stopped' && currentUpload.status !== 'waiting' && currentUpload.status !== 'cancled'){ //如果请求返回时，已经是等待或者暂停状态，那么就不重绘了
							_this.onprogress(id,end,file.size)
						}
						currentUpload.start = end;
						if(currentUpload.start === file.size){
							//完成
							_this.completeUpload(id);
							return;
						}else{
							(function(){
								_this.upload(id);
							})();
						}
					}else{
						_this.onerror('上传错误',id)
						currentUpload.status = 'fail';
						delete _this.uploadQuery[id];
						delete _this.queryFiles[dirId + file.name + file.size];
						_this.isUploadingNum --;
						_this.manageQuery();
					}
				}else if(xhr.readyState === 4 && xhr.status === 500){
					_this.onerror('上传错误',id);
					currentUpload.status = 'fail';
					delete _this.uploadQuery[id];
					delete _this.queryFiles[dirId + file.name + file.size];
					_this.isUploadingNum --;
					_this.manageQuery();
				}
			}

			// var f = new FormData();
			// f.append('file',blob);
			// xhr.send(f);

			// filereader各种内存泄露啊，上传大文件伤不起。issue:http://code.google.com/p/chromium/issues/detail?id=114548
			// fr.readAsArrayBuffer(blob);
			// fr.onload = function(e){
			// 	blob = null;
			// 	currentUpload.isUploading = true;//开始上传之后标记正在上传
			// 	xhr.send(fr.result);
			// }

			// web worker貌似还是解决不了内存泄露啊。。。 issue:http://code.google.com/p/chromium/issues/detail?id=114548 Comment 13 
			// this.worker = this.worker || new Worker('/assets/js/readfile.js');
			// var worker = this.worker;
			// worker.onmessage = function(e){
			// 	currentUpload.isUploading = true;
			// 	xhr.send(e.data);
			// }
			// worker.postMessage(blob);

			// 直接send blob也可以，可是搜狗高速模式居然不行。。。TODO W3C:http://www.w3.org/TR/XMLHttpRequest2/#the-send-method
			currentUpload.isUploading = true;
			//console.log(blob)
			xhr.send(blob);
		},
		//完成上传
		completeUpload:function(id){
			var _this = this;
			var currentUpload = this.uploadQuery[id];
			if(!currentUpload) return;
			var	dirId = currentUpload.dirId,
				file = currentUpload.file;
			if(currentUpload.status === 'stopped') return;
			currentUpload.isUploading = true;
			$.post('/UploadRange!complete.action',{
				uniqueFileSign:currentUpload.uniqueFileSign,
				filename:file.name,
				uploadId:currentUpload.uploadId,
				dirId:dirId
			},function(r){
				clearTimeout(currentUpload.ct);
				currentUpload.isUploading = false;
				if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200 || r.code === 201){
					currentUpload.status = 'complete';
					_this.onuploaded(id,dirId,_this.path,_this.fileList);
				}else if(r.code === 501){
					currentUpload.status = 'fail';
					_this.onerror('空间不足',id);
				}else{
					currentUpload.status = 'fail';
					_this.onerror('存储错误',id);
				}
				delete _this.uploadQuery[id];
				delete _this.queryFiles[dirId + file.name + file.size];
				_this.isUploadingNum --;
				_this.manageQuery();
				
			},'json').error(function(){
				_this.onerror('存储错误',id);
				currentUpload.status = 'fail';
				delete _this.uploadQuery[id];
				delete _this.queryFiles[dirId + file.name + file.size];
				_this.isUploadingNum --;
				_this.manageQuery();
			})
		},
		//暂停上传
		pauseUpload:function(id){
			var currentUpload = this.uploadQuery[id];
			clearTimeout(currentUpload.ct); //暂停时取消上传等待
			//currentUpload.stopped = true;
			if(currentUpload.uploadId){
				$.post('/UploadRange!cancel.action',{
					uploadId:currentUpload.uploadId,
					uniqueFileSign:currentUpload.uniqueFileSign
				},function(r){
					currentUpload.isCancling = false;
				},'json').error(function(){
					currentUpload.isCancling = false;
				})
			}
			if(currentUpload.status === 'uploading'){
				this.isUploadingNum --;
			}
			currentUpload.status = 'stopped';
			this.manageQuery();
		},
		//开始上传
		startUpload:function(id){
			var _this = this;
			var currentUpload = this.uploadQuery[id];
			//currentUpload.stopped = false;
			if(currentUpload.isUploading || currentUpload.isCancling){ //如果正在上传，或者正在取消，那么等待50ms后继续；
				currentUpload.ct = setTimeout(function(){
					_this.startUpload(id);
				},50);
			}else{//否则直接开始上传
				currentUpload.status = 'waiting';
				this.manageQuery();
			}
		},
		//取消上传
		cancle:function(id){
			var _this = this;
			var currentUpload = this.uploadQuery[id],
				dirId = currentUpload.dirId,
				file = currentUpload.file;
			clearTimeout(currentUpload.ct);
			if(!currentUpload.isCancling){
				if(currentUpload.uploadId){
					currentUpload.isCancling = true;
					$.post('/UploadRange!cancel.action',{
						uploadId:currentUpload.uploadId,
						uniqueFileSign:currentUpload.uniqueFileSign
					},function(r){
						currentUpload.isCancling = false;
					},'json').error(function(){
						currentUpload.isCancling = false;
					})
				}
			}
			if(currentUpload.status === 'uploading'){
				this.isUploadingNum --;
			}
			currentUpload.status = 'cancled';
			delete this.uploadQuery[id];
			delete this.queryFiles[dirId + file.name + file.size];
			setTimeout(function(){
				_this.manageQuery();
			},50)
		}
	};



	var dialog = null,
		uploadMinimize = null,
		uploadHandler = null;

	var tpl_upload = '<div class="upload-dialog2" id="uploadContainer"> \
					<div class="opts"><div id="uploadBtn" class="upload-btn"></div></div> \
					<div class="upload-head"> \
	                    <ul> \
	                        <li class="name">文件名</li> \
	                        <li class="percent">进度</li> \
	                        <li class="size">大小</li> \
	                        <li class="op">操作</li> \
	                    </ul> \
	                </div> \
	                <div class="upload-body" id="uploadBody"> \
		    	        <div class="upload-tip"> \
			                '+ (supportHtml5 ? '<p>上传文件大小无限制，支持文件拖拽上传</p><p>按住Shift或Ctrl键可以选择多个文件，一次最多选择100个</p>' : '<p>上传文件大小限制300 MB，建议使用支持HTML5上传大小无限制的浏览器，如：最新版的Chrome、Firefox、搜狗浏览器(高速模式)等</p>') + ' \
		    	        </div> \
	    	        </div> \
    			</div>',
    tpl_minimize = '<div class="upload-minimize"> \
			    	    <div class="um-hd">文件上传中</div> \
			    	    <div class="um-act"> \
			    	        <a href="javascript:;" class="maxmize"><span class="icon icon-maxmize"></span></a> \
			    	        <a href="javascript:;" class="close"><span class="icon icon-close"></span></a> \
			    	    </div> \
			    	    <div class="um-bd"> \
			    	        <div class="um-progress"> \
			    	        	<div class="per"></div> \
			    	            <div class="cur"></div> \
			    	        </div> \
			    	    </div> \
			    	</div>';
	
	/**
     * 上传文件
     * @param {String} fileId 上传目录id
     * @param {String} type 是新上传upload，还是覆盖upgrade
     * @param {Sbox.Collections.FileList} [fileList] 当前filelist，用于刷新
     * @param {Array} [files] 拖放选择的文件
     */
	Sbox.Upload = function(fileId,type,fileList,files){
		var settings = {
			flash_url : '/assets/swf/swfu-v2.swf',
			upload_url: '/UploadRange!upload.action',
			post_params: {

			},
			file_size_limit : '300 MB',
			file_types : '*.*',
			file_types_description : 'All Files',
			file_upload_limit : 100,
			file_queue_limit : 0,
			custom_settings : {
			},
			debug: false,

			// Button settings
			button_image_url: STATIC_DOMAIN +'/img/upload-v2.png',
			button_width: "97",
			button_height: "31",
			button_placeholder_id: "uploadHandler",
			button_cursor:-2,
			button_window_mode:'transparent',

			// The event handler functions are defined in handlers.js
			swfupload_loaded_handler : swfuploadLoaded,
			file_dialog_start_handler : resetTitle,
			file_queued_handler : fileQueued,
			file_queue_error_handler : fileQueueError,
			file_dialog_complete_handler : fileDialogComplete,
			upload_start_handler : uploadStart,
			upload_progress_handler : uploadProgress,
			upload_error_handler : uploadError,
			upload_success_handler : uploadSuccess,
			upload_complete_handler : uploadComplete,
			queue_complete_handler : queueComplete	// Queue plugin event
		}
		var uploadIds = [],
			uploadContainer = null,
			uploadBody = null;
		var trickList = {};

		if(typeof fileId !== 'string'){
			var path = fileId;
			fileId = path.get('pathId');
		}

		if(dialog){
			dialog.show();
			uploadMinimize.hide();

			if(supportHtml5){
				uploadHandler.update(path,fileList);

				if(files){
					uploadHandler.selectFile(files);
				}
			}else if(uploadHandler){
				uploadHandler.addSetting('path',path);
				uploadHandler.addSetting('fileList',fileList);
			}
		}else{
			createUpload();
		}

		function createUpload(){
			dialog = new Sbox.Views.Window({
				title:'上传文件',
				body:tpl_upload,
				width:700,
				minimize:true,
				closeButton:true,
				esc:false,
				onShow:function(){

				},
				onClose:function(){
					onClose();
				},
				onMinimize:function(){
					dialog.moveTo(-9999,-9999);
					dialog.overlay.remove();
					uploadMinimize.show();
				},
				onRemove:function(){
					uploadMinimize.remove();
					dialog = null;
					uploadHandler = null;
					uploadMinimize = null;
					resetTitle();
				}
			}).addStyle('dialog-upload');
			dialog.addButton({
				text:'取消',
				onclick:function(){
					onClose();
				}
			});

			uploadContainer = dialog.body.find('#uploadContainer');
			uploadBody = uploadContainer.find('#uploadBody');
			uploadContainer.find('#uploadBtn').html('<div id="uploadHandler">添加文件</div>');

			if(supportHtml5){
				uploadHandler = new Sbox.HTMLUpload({
					dirId:(type === 'upload' ? fileId : null),
					fileId:(type === 'upgrade' ? fileId : null),
					path:path,
					fileList:fileList,
					id:'uploadHandler',
					onuploadstart:setUpload,
					onprogress:uploadRedraw,
					onuploaded:html5UploadComplete,
					onerror:showUploadError
				})

				if(files){
					uploadHandler.selectFile(files);
				}

				try{
		            uploadBody[0].addEventListener('dragleave',function(e){
		                e.preventDefault();
		                e.stopPropagation();
		            })

		            uploadBody[0].addEventListener('dragenter',function(e){
		                e.preventDefault();
		                e.stopPropagation();
		            })
		            uploadBody[0].addEventListener("dragover", function(e){  
					    e.stopPropagation();  
					    e.preventDefault();  
					}); 
		            uploadBody[0].addEventListener('drop',function(e){
		            	e.preventDefault();
		                e.stopPropagation();
		                
		                //console.log(e)
		                var files = e.dataTransfer.files;
		                uploadHandler.selectFile(files);
		            })
				}catch(e){}
			}else if(checkFlash()){
				uploadContainer.find('#uploadBtn').css({
					position:'relative',
					left:-9999,
					top:-9999
				})
				if(typeof SWFUpload === 'undefined'){
					$.getScript(STATIC_DOMAIN+'/js/libs/swfupload.js',function(){
						uploadHandler = new SWFUpload(settings);
						uploadHandler.addSetting('path',path);
						uploadHandler.addSetting('fileList',fileList);
					})
				}else{
					uploadHandler = new SWFUpload(settings);
					uploadHandler.addSetting('path',path);
					uploadHandler.addSetting('fileList',fileList);
				}
			}else{
				uploadContainer.find('#uploadBtn').html('<span style="color:#E65455;">上传需要flash支持，请下载安装后重试，<a target="_blank" href="http://get.adobe.com/cn/flashplayer/">下载地址</a></span>');
			}

			uploadMinimize = $(tpl_minimize).appendTo($('body')).hide();
			uploadMinimize.on('click','.maxmize',function(){
				$('#main').find('.my-file:visible .main-op .upload,.share-file:visible .main-op .upload,.public-file:visible .main-op .upload').trigger('click');
				// dialog.show();
				// uploadMinimize.hide();
			}).on('click','.close',function(){
				onClose();
			})
		}

		function resetTitle(){
			if(jQuery.browser.msie){
				document.title = WEBSITE_NAME;
			}
		}

		function onClose(){
			if(supportHtml5){
				if(uploadIds.length === 0){
					dialog.remove();
					return;
				}
			}else{
				if(!uploadHandler){ //如果没有装flash,fix bug #PAN-794 @2013-02-20
					setTimeout(function(){
						dialog.remove();
					},30);
					return;
				}
				else if(uploadHandler.getStats().files_queued === 0){
					uploadHandler.destroy();
					setTimeout(function(){
						dialog.remove();
					},30);
					return;
				}
			}

			Sbox.Warning({
				message:'<p>您确定要取消正在上传的文件吗？</p>',
				callback:function(f){
					if(f){
						if(supportHtml5){
							_(uploadIds).each(function(uploadId){
								uploadHandler.cancle(uploadId);
							})
						}else{
							uploadHandler.destroy();
						}
						window.onbeforeunload = null;
						setTimeout(function(){
							dialog.remove();
						},30);
					}
				}
			})
		} 

		//html5 callbacks
		function setUpload(uploadId,filename,contentLength){
			// console.log('setup',uploadId,filename)
			if(!uploadBody.find('dl')[0]){
				uploadBody.find('.upload-tip').hide();
				uploadBody.append('<dl>');
			}
			if(dialog.getButton('完成')[0]) dialog.getButton('完成')[0].text('取消');

			var dl = uploadBody.find('dl');
			uploadIds.push(uploadId);
			var dd = '<dd id="upload_' + uploadId +'"> \
						<div class="progress"></div> \
                        <ul> \
                            <li class="name" title="'+ filename +'">' + filename + '</li> \
                            <li class="percent"><span class="waiting">等待上传</span></li> \
                            <li class="size">' + formatbytes(contentLength) + '</li> \
                            <li class="oprator"> \
                                    <a class="stop" href="javascript:;"><span class="icon icon-stop2"> </span></a>&nbsp;<a class="cancle" href="javascript:;"><span class="icon icon-cancle2"> </span></a> \
                            </li> \
                        </ul> \
                    </dd>';
            dd = $(dd);
            if(isPreviewImgFile(filename,contentLength)){
            	dd.find('.stop').css('opacity',0.3).addClass('disabled');
            	//dd.attr('title','图片上传不支持暂停');
            }
			dl.append(dd);
			// uploadBody.stop(true,true).animate({
			// 	scrollTop:1 * dd.height() * dl.find('dd').length
			// })
			//dd.data('date',new Date().valueOf()).data('size',0);
			trickList[uploadId] = {
				status:'uploading'
			}
			dd.on('click','.stop',function(e){
				var target = $(e.currentTarget);
				if(target.hasClass('disabled')) return;
				uploadHandler.pauseUpload(uploadId);
				dd.find('.percent').empty().html('<span class="stopped">暂停上传</span>');
				target.attr('class','start');
				target.html('<span class="icon icon-start2"></span>').css('opacity',0.3).addClass('disabled');
				setTimeout(function(){
					target.css('opacity','').removeClass('disabled');
				},1 * 1000)
				clearInterval(trickList[uploadId].st);
				trickList[uploadId].status = 'stopped';
			}).on('click','.start',function(e){
				var target = $(e.currentTarget);
				if(target.hasClass('disabled')) return;
				uploadHandler.startUpload(uploadId);
				dd.find('.percent').empty().html('<span class="waiting">等待上传</span>');
				target.attr('class','stop');
				target.html('<span class="icon icon-stop2"></span>')
				trickList[uploadId].status = 'uploading';
			}).on('click','.cancle',function(){
				uploadHandler.cancle(uploadId)
				dd.find('.percent').empty().html('<span class="fail">取消上传</span>');
				dd.find('.progress').remove();
				dd.find('.oprator').empty();
				clearInterval(trickList[uploadId].st);
				trickList[uploadId].status = 'cancled';
				remove(uploadId);
				resetTotalProgress();
			})

			if(jQuery.browser.msie){ 
				setTimeout(function(){
					document.title = WEBSITE_NAME; 
				},50)
			}

			window.onbeforeunload = function(){
				return '您有文件正在上传，继续操作会中断上传，要继续吗？'
			}
		}
		function uploadRedraw(uploadId,start,size){
			//console.log('redraw',uploadId,start,size)
			if(start > size) start = size;
			var dd = $('#upload_' + uploadId),
				progress = dd.find('.progress'),
				percent = dd.find('.percent'),
				name = dd.find('.name').attr('title');
				//speed = dd.find('.speed'),
				//uploaded = dd.find('.uploaded'),
				//total = dd.find('.total');
			var preDate = dd.data('date'),
				preSize = dd.data('size'),
				s = 128 * 1024, //默认速度
				block = isPreviewImgFile(name,size) ? size :1024 * 1024, //小于10M的图片分块为图片大小，非图片或10M以上默认分块为1M
				now = new Date().valueOf();
			if(!!preSize || preSize === 0){
				s = parseInt((start - preSize) / (now - preDate) * 1000 * 100) / 100;
				block = start - preSize;
			}
			block = Math.min(block,size - start);
			dd.data('date',now).data('size',start);

			clearInterval(trickList[uploadId].st);
			if(percent.find('.stopped,.fail')[0]) return;
			if(!dd.data('progress')){ //如果没有赋值过，那么初始化赋值
				var per = parseInt( start / size * 10000 ) / 100 + '%';
				progress.css('width',per);
				percent.text(per);
				dd.data('progress',per);
			}else{
				percent.text(dd.data('progress'));
			}

			//speed.text(s + '/s');
			//uploaded.text(formatbytes(start));
			//total.text(formatbytes(size));

			if(start >= size){
				dd.find('.percent').empty().html('<span class="saving">99.99%</span>');
				progress.animate({
					width: '100%'
				},300);
			}else{
				if(trickList[uploadId].status !== 'uploading') return;
				trick(uploadId,start,size,s,block);
			}
		}
		function trick(uploadId,start,size,speed,block){
			var dd = $('#upload_' + uploadId),
				progress = dd.find('.progress'),
				percent = dd.find('.percent');

				if(block > size) block = size;

				var i = 0, //计数
					n = 10, //1s更新10次
					begin = percent.text().replace('%','') * 1, //开始时的进度
					max = parseInt( (start + block) / size * 10000 ) / 100, //最大进度
					time = block / speed,//预估时间
					perAdded = 1 / Math.ceil(time * n) * (max - begin),  //每次更新进度
					curPercent = begin; //当前进度
				//console.log(begin,max,time,perAdded,curPercent);
				trickList[uploadId].st = setInterval(function(){
					i ++ ;
					curPercent = parseInt((begin + perAdded * i) * 100) / 100;
					if(curPercent < max){
						progress.css('width',curPercent + '%');
						percent.text(curPercent + '%');
						dd.data('progress',curPercent + '%');
						resetTotalProgress();
					}else{
						clearInterval(trickList[uploadId].st);
					}
				},1000 / n)
		}
		function html5UploadComplete(uploadId,dirId,path,fileList){
			// console.log('complete',uploadId);
			var dd = $('#upload_' + uploadId);
			dd.find('.percent').empty().html('<span class="success">上传成功</span>');
			dd.find('.progress').remove();
			dd.find('.oprator').empty();
			remove(uploadId);
			//console.log(dirId,path.get('pathId'));
			if(dirId == userId) dirId = 'root';
			//console.log(fileList,dirId,path)
			if(fileList && dirId === path.get('pathId')) fileList.trigger('reload');
			Sbox.RefreshUsage();
			resetTotalProgress();
		}
		function remove(uploadId){
			var dl = uploadBody.find('dl'),
				dd = $('#upload_' + uploadId),
				tip = uploadBody.find('.upload-tip');
			dd.removeAttr('id');
			uploadIds.splice(_(uploadIds).indexOf(uploadId),1);
			if(uploadIds.length === 0){
				window.onbeforeunload = null;
				setTimeout(function(){
					if(dialog.getButton('取消')[0]) dialog.getButton('取消')[0].text('完成');
				},30)
			}
		}
		function showUploadError(error,uploadId){
			if(uploadId || uploadId === 0){
				if(error.length > 6){
					var tmp = error;
					error = "上传错误";
					//Sbox.Error(error);
				}
				var dd = $('#upload_' + uploadId);
				dd.find('.percent').empty().html('<span class="fail">'+error+'</span>');
				dd.find('.progress').remove();
				dd.find('.oprator').empty();
				remove(uploadId);
			}else{
				Sbox.Error(error);
			}
			if(trickList[uploadId] && trickList[uploadId].st){
				clearInterval(trickList[uploadId].st);	
			}
		}
		function resetTotalProgress(){
			if(!uploadMinimize) return;
			var list = uploadBody.find('dd'),
				num = 0,
				total = 0;
			_(list).each(function(dd){
				var percent = $(dd).find('.percent');
				if(percent.find('.fail,.cancled')[0]){

				}else if(percent.find('.success,.saving')[0]){
					num ++;
					total += 100;
				}else if(percent.find('.waiting')[0]){
					num ++;
				}else{
					var per = $(dd).data('progress') ? $(dd).data('progress').replace('%','') * 1 : 0;
					num ++;
					total += per;
				}
			})
			var totalProgress = num === 0 ? '' : parseInt(total / num * 100) / 100 + '%';
			uploadMinimize.find('.per').text(totalProgress);
			uploadMinimize.find('.cur').css('width',totalProgress);


			if(totalProgress === '100%'){
				uploadMinimize.find('.um-hd').text('上传完成');
			}else{
				uploadMinimize.find('.um-hd').text('文件上传中');
			}
		}

		//flash callbacks
		function swfuploadLoaded(){
			resetTitle();
			uploadContainer.find('#uploadBtn').css({
				position:'',
				left:0,
				top:0
			})
		}
		function fileQueued(file){
			var _this = this;
			file.name = decodeURIComponent(file.name);
			this.addFileParam(file.id,'dirId',uploadHandler.getSetting('path').get('pathId'));
			this.addFileParam(file.id,'length',file.size)
			if(!uploadBody.find('dl')[0]){
				uploadBody.find('.upload-tip').hide();
				uploadBody.append('<dl>');
			}
			if(dialog.getButton('完成')[0]) dialog.getButton('完成')[0].text('取消');
			var dl = uploadBody.find('dl');
			var dd = '<dd id="upload_' + file.id +'"> \
						<div class="progress"></div> \
						<ul> \
							<li class="name" title="'+ file.name +'">' + file.name + '</li> \
							<li class="percent"><span class="waiting">等待上传</span></li> \
							<li class="size">' + formatbytes(file.size) + '</li> \
							<li class="oprator"> \
								<a class="cancle" href="javascript:;" title="取消"><span class="icon icon-cancle2"> </span></a>&nbsp; \
							</li> \
						</ul> \
					</dd>';
			dd = $(dd);
			dl.append(dd);
			var progress = dd.find('.progress'),
				percent = dd.find('.percent'),
				oprator = dd.find('.oprator');

			dd.on('click','.cancle',function(){
				_this.cancelUpload(file.id);
				progress.remove();
				oprator.empty();
				percent.html('<span class="cancled">取消上传</span>');
				resetTotalProgress();
			})

			window.onbeforeunload = function(){
				return '您有文件正在上传，继续操作会中断上传，要继续吗？'
			}
		}
		function fileQueueError(file,errorCode,message){
			if(errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED){
				Sbox.Error('同时上传文件不得超过100个');
				return;
			}
			this.addFileParam(file.id,'dirId',fileId);
			if(!uploadBody.find('dl')[0]){
				uploadBody.find('.upload-tip').hide();
				uploadBody.append('<dl>');
			}
			if(typeof file.size === 'undefined'){
				errorCode = SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT;
				size = '未知大小';
			}else{
				size = formatbytes(file.size)
			}
			if(dialog.getButton('完成')[0]) dialog.getButton('完成')[0].text('取消');
			var dl = uploadBody.find('dl');
			var dd = '<dd id="upload_' + file.id +'"> \
						<div class="progress"></div> \
						<ul> \
							<li class="name" title="'+ file.name +'">' + file.name + '</li> \
							<li class="percent"><span class="waiting">等待上传</span></li> \
							<li class="size">' + size + '</li> \
							<li class="oprator"> \
								<a class="cancle" href="javascript:;" title="取消"><span class="icon icon-cancle2"> </span></a>&nbsp; \
							</li> \
						</ul> \
					</dd>';
			dd = $(dd);
			dl.append(dd);
			var percent = dd.find('.percent');
			dd.find('.oprator').empty();
			switch (errorCode) {
				case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
					showError(file,'超过大小限制');
					break;
				case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
					showError(file,'文件为空');
					break;
				case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
					showError(file,'文件类型错误');
					break;
				default:
					if (file !== null) {
						showError(file,'未知错误');
					}
					break;
				}
		}
		function fileDialogComplete(numFilesSelected,numFilesQueued){
			this.startUpload();
			resetTitle();
		}
		function uploadStart(){

		}
		function uploadProgress(file,bytesLoaded,bytesTotal){
			var per = Math.ceil( (bytesLoaded / bytesTotal) * 10000 ) / 100;
			var dd = $('#upload_' + file.id),
				progress = dd.find('.progress'),
				percent = dd.find('.percent'),
				oprator = dd.find('.oprator');

			progress.css('width', per + '%');
			dd.data('progress',per + '%');
			if(per === 100){
				percent.html('<span class="saving"><span class="icon icon-loading"></span>正在存储</span>');
				oprator.empty();
			}else{
				percent.html(per + '%');
			}
			resetTotalProgress();
		}
		function uploadError(file,errorCode,message){
			console.log(errorCode)
			var dd = $('#upload_' + file.id),
				progress = dd.find('.progress'),
				percent = dd.find('.percent');
			switch (errorCode) {
				case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
					showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.HTTP_ERROR +'</em>');
					this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
					break;
				case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
					showError(file,'上传失败');
					this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
					break;
				case SWFUpload.UPLOAD_ERROR.IO_ERROR:
					showError(file,'服务器错误');
					this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
					break;
				case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
					showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.SECURITY_ERROR +'</em>');
					this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
					break;
				case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
					showError(file,'空间不足');
					this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
					break;
				case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
					showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED +'</em>');
					this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
					break;
				case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
					showError(file,'取消上传');
					break;
				case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
					showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED +'</em>');
					break;
				default:
					showError(file,'上传错误');
					this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
					break;
				}
		}
		function uploadSuccess(file,serverData){
			var dd = $('#upload_' + file.id),
				progress = dd.find('.progress'),
				percent = dd.find('.percent'),
				oprator = dd.find('.oprator');

			//TODO serverData
			progress.remove();
			oprator.empty();
			if(serverData.indexOf('701:') >= 0){
				//percent.html('<span class="success">登录超时</span>');
				Sbox.Login();
			}else{
				serverData = jQuery.parseJSON(serverData);
				//console.log(serverData.code)
				if(serverData.code === 200){
					percent.html('<span class="success">上传成功</span>');
					if(uploadHandler.getSetting('fileList') && file.post.dirId === uploadHandler.getSetting('path').get('pathId')) uploadHandler.getSetting('fileList').trigger('reload');
				}else if(serverData.code === 501){
					percent.html('<span class="fail">空间大小不足</span>');
				}else if(serverData.code === 503){
					percent.html('<span class="fail">该文件被锁定</span>');
				}else if(serverData.code === 505){
					percent.html('<span class="fail">没有权限</span>');
				}else if(serverData.code === 506){
					percent.html('<span class="fail">存在同名文件</span>');
				}else{
					percent.html('<span class="fail">上传失败</span>');
				}
			}
			Sbox.RefreshUsage();
		}
		function uploadComplete(){
			if (this.getStats().files_queued === 0) {
				window.onbeforeunload = null;
				if(dialog.getButton('取消')[0]) dialog.getButton('取消')[0].text('完成');
			}
		}
		function queueComplete(){
			if (this.getStats().files_queued === 0) {
				window.onbeforeunload = null;
				if(dialog.getButton('取消')[0]) dialog.getButton('取消')[0].text('完成');
			}
		}
		function showError(file,message){
			var dd = $('#upload_' + file.id);
			dd.find('.percent').empty().html('<span class="fail">'+ message +'</span>');
			dd.find('.progress').remove();
			dd.find('.oprator').empty();
			dd.removeAttr('id');
		}
	}

})(jQuery);


(function($){ //还原

	/**
	 * 还原文件
	 * @param {Array} files 需要还原的文件
	 * @param {Sbox.Collections.FileList} fileList 这些文件所属的filelist
	 */
	Sbox.Restore = function(files,fileList){
		Sbox.Move(files,false,fileList,'restore',true); //后来还原改为需要选择文件夹
		// fileList.restore(files);
		// var dialog = Sbox.Confirm({
		// 	title:'还原文件',
		// 	message:'您确定要还原所选文件(夹)吗？',
		// 	callback:function(f){
		// 		if(f){
		// 			fileList.restore(files);
		// 		}
		// 	}
		// })
		// return dialog;
	}
	
})(jQuery);

(function($){ //彻底删除
	/**
	 * 彻底删除文件
	 * @param {Array} files 需要彻底删除的文件
	 * @param {Sbox.Collections.FileList} fileList 这些文件所属的filelist
	 */
	Sbox.CompleteDelete = function(files,fileList){
		var dialog = Sbox.Warning({
			title:'彻底删除',
			message:'<p>您确定要彻底删除所选文件吗？ </p><p class="tip">文件删除后将无法找回！</p>',
			callback:function(f){
				if(f){
					fileList.completeDelete(files);
				}
			}
		})
	}
})(jQuery);

(function($){ //刷新使用空间
	/**
	 * 刷新使用空间
	 */
	window.userPublicAcl = null;
	Sbox.RefreshUsage = function(){
		if(!$('#sidebar .usage')[0]) return;

		var usage = $('#sidebar .usage'),
			bar = usage.find('.cur'),
			used = usage.find('.used'),
			total = usage.find('.total');
		$.get('/User!getSpace.action?_t=' + Math.random(),function(r){
			if(r.code === 200){
				bar.css('width',Math.max(r.userUsedSpace / r.allSpace * 100,1) + '%');
				used.text(formatbytes(r.userUsedSpace));
				total.text(formatbytes(r.allSpace));
				window.userPublicAcl = r.acl;
			}
		},'json')
	}
})(jQuery);

(function($){ //获取消息信息
	/**
	 * 获取消息信息
	 */
	Sbox.getMsgInfo = function(){
		var msgTip = $('#msgTip'),
			num = msgTip.find('.msg-num');

		$.get('/MessageAction!count.action?_t=' + Math.random(),function(r){
			if(r.code === 200){
				if(r.count > 0){
					num.html('<em>'+ r.count +'</em>').show();
					msgTip.find('a').attr('href','/message/' + (r.sCount ? 0 : 1));
					// msgTip.find('a').attr('href','/MessageAction!getMsg.action?type=0&sCount=' + r.sCount);
				}
			}
		},'json')
	}

	jQuery(function(){
		if(!document.getElementById('msgTip')) return;

		Sbox.getMsgInfo();
		var time = 30 * 1000;
		setInterval(function(){
			Sbox.getMsgInfo();
		},time);
	});

})(jQuery);

(function($){ //登录超时直接跳到首页
	/**
	 * 登录超时直接跳到首页
	 */
	Sbox.Login = function(){
		var dialog = Sbox.Error({
			message:'登录超时,请重新登录。',
			onHide:function(){
				location.href = '/login';
			}
		})
	}
})(jQuery);

(function($){ //所有这样的链接都阻止默认行为，IE下会导致一些问题，比如会触发beforeunload,在ie6下会阻断后续请求 etc；
	if($.browser.msie){
		$('a[href="javascript:;"]').click(function(e) {
			e.preventDefault();
		});
		$(document).on('click','a[href="javascript:;"]',function(e){
			e.preventDefault();
		})
	}
})(jQuery);

(function($){ //保证页面宽度不小于1000px;
	$(window).bind('resize',function(){
		resize();
	})
	function resize(){
		var winWidth = $(window).width();
		if(winWidth < 1000){
			$('body').width(1000);
		}else{
			$('html,body').width('100%');
		}
	}
	jQuery(function(){
		resize();
	})
})(jQuery);

(function($){ //用户引导
	/**
	 * 用户引导
	 * @param {Boolean} isAdmin 是否是管理员
	 */
	Sbox.Guide = function(isAdmin){

		var guide_tpl = '<div class="guide-dialog"> \
			<ul class="guide-detail" id="guideDetail"> \
				<li><img src="'+ STATIC_DOMAIN +'/img/guide/step1_v2.jpg" /></li> \
				<li style="display:none;"><img src="'+ STATIC_DOMAIN +'/img/guide/step2_v2.jpg" /></li> \
				<li style="display:none;"><img src="'+ STATIC_DOMAIN +'/img/guide/step3_v2.jpg" /></li> \
				<li style="display:none;"><img src="'+ STATIC_DOMAIN +'/img/guide/step4_v2.jpg" /></li> \
				'+ (isAdmin ? '<li style="display:none;"><img src="'+ STATIC_DOMAIN +'/img/guide/step5_v2.jpg" /></li>' : '') +'\
			</ul> \
			<div class="guide-page" id="guidePage"> \
				<span class="cur"></span> \
				<span></span> \
				<span></span> \
				<span></span> \
				'+ (isAdmin ? "<span></span>" : "") +' \
			</div> \
			<div class="guide-control" id="guideControl"> \
				<a href="javascript:;" class="prev-guide btn btn24 btn24-gray" style="display:none;">上一页</a> \
				<a href="javascript:;" class="next-guide btn btn24 btn24-gray">下一页</a> \
				<a href="javascript:;" class="quite-guide">跳过</a> \
			</div> \
		</div>';
		var dialog = new Sbox.Views.Window({
			body:guide_tpl,
			width:657,
			esc:false
		})
		.header.hide()
		.footer.hide()
		.addStyle('dialog-guide');

		var bd = dialog.body,
			guideDetail = bd.find('#guideDetail'),
			guidePage = bd.find('#guidePage'),
			guideControl = bd.find('#guideControl'),
			li = guideDetail.find('li'),
			len = li.length,
			pages = guidePage.find('span'),
			prevBtn = guideControl.find('.prev-guide'),
			nextBtn = guideControl.find('.next-guide'),
			quiteBtn = guideControl.find('.quite-guide');
		var cur = 0;
		
		guideControl.on('click','.prev-guide',function(){
			cur -- ;
			if(cur === 0){
				prevBtn.hide();
			}
			nextBtn.text('下一页');
			quiteBtn.show();
			switchGuide();
		}).on('click','.next-guide',function(){
			if(cur === len - 1){
				$.get('/User!updateGuideStatus.action?_t='+Math.random(),{
					guideStatus:1
				});
				dialog.remove();
			}else{
				cur ++;
				if(cur === len - 1){
					nextBtn.text('完成');
					quiteBtn.hide();
				}
			}
			prevBtn.show();
			switchGuide();
		}).on('click','.quite-guide',function(){
			$.get('/User!updateGuideStatus.action?_t='+Math.random(),{
				guideStatus:1
			});
			dialog.remove();
		})

		function switchGuide(){
			li.hide();
			li.eq(cur).show();
			guidePage.find('.cur').removeClass('cur');
			pages.eq(cur).addClass('cur');
		}

		return dialog;
	}
})(jQuery);

(function($){ //重构提醒
	/**
	 * 重构提醒
	 */
	Sbox.Notice = function(){
		if($.cookie('notice')) return;

		var notice_tpl = '<div class="notice-content"> \
							<p class="tips">搜狐企业网盘将于 <span class="time">2014年1月18日 18:00</span> 至 <span class="time">19日 0:00</span> 进行<span class="thing">系统升级</span>，</br>期间将不能访问网盘的所有服务，不便之处敬请谅解</p> \
							<p class="cd"><span>10</span>秒内自动关闭......</p> \
							<p class="action"><button class="btn btn32 btn32-green">不再提示</button></p> \
						</div>';
		var dialog = new Sbox.Views.Window({
			title:'通知',
			body:notice_tpl,
			width:660,
			esc:false,
			closeButton:true
		})
		.footer.hide()
		.addStyle('dialog-notice');

		var bd = dialog.body,
			cd = bd.find('.cd span'),
			btn = bd.find('.action button'),
			s = cd.text() * 1;

		function countDown(){
			setTimeout(function(){
				s--;
				cd.text(s);
				if(s <= 0){
					dialog.remove();
				}else{
					countDown();
				}
			}, 1000)
		}
		countDown();

		btn.on('click', function(){
			$.cookie('notice', 1);
			dialog.remove();
		})

		function switchGuide(){
			li.hide();
			li.eq(cur).show();
			guidePage.find('.cur').removeClass('cur');
			pages.eq(cur).addClass('cur');
		}

		return dialog;
	}
})(jQuery);


(function($){
	var ImgPreview;
    /**
     * 图片预览
     * @class ImgPreview
     * @constructor
     * @param {Object} options
     * @example 
     * new Sbox.Views.ImgPreview({
     *      imgs:[{id:id,key:key,name:name,size:size}], //图片数组
     *      index:1, //显示第几张
     * })
     */
	Sbox.Views.ImgPreview = ImgPreview  = function(options){
		this.imgs = options.imgs || [];
		this.index = options.index || 0;
		this.downloadable = typeof options.downloadable === 'undefined' ? true : options.downloadable;
		this.load = false;
		this.currentRnd = 0;
		this._winWidth = $(window).width();
		this._winHeight = $(window).height();
		this._spaceHeight = 36;

		this.thumbCache = {}; //缩略图已加载缓存 TODO
		this.init();
	}
	/** @lends Sbox.Views.ImgPreview*/
	/** 预览地址*/
	ImgPreview.URL = PREVIEW_URL; //构造诸如此类地址：http://img.itc.cn/photo/jC2gRx6h78k_w283
	/** 下载地址*/
	ImgPreview.DOWNLOAD_URL = '/GetFile!getFile.action'; //下载地址
	/** 预览图片大小*/
	ImgPreview.PREVIEW_SIZE = 'w800'; //预览图片大小
	/** 缩略图大小*/
	ImgPreview.THUMB_SIZE = 's80'; //缩略图大小
	/** 默认图片地址*/
	ImgPreview.DEFAULT_IMG = STATIC_DOMAIN + '/img/filetype/preview/p-picture.png'; //默认图片地址
	/** 出错图片地址*/
	ImgPreview.ERROR_IMG = STATIC_DOMAIN + '/img/img-error.png'; //出错图片
	/** 缩略图所占宽度*/
	ImgPreview.THUMB_WIDTH = 104;
	/** 键盘按键值*/
	ImgPreview.KEY = {
		LEFT:37,
		RIGHT:39,
		ESC:27
	};
	(function(){
		var div = document.createElement('div')
			style = div.style,
			cssArr = ["transform", "MozTransform", "webkitTransform", "OTransform",'msTramsform'],
			len = cssArr.length;
		for(var i = 0; i < len; i++){
			if(cssArr[i] in style){
				/** 支持的CSS3属性或者filter*/
				ImgPreview.SUPPORT = cssArr[i];
				break;
			}
		}
		if('filters' in div) ImgPreview.SUPPORT = 'filter';
	})()
	/** 
	 * 缩放图片
	 * @param {Object} el 需要缩放的图片引用
	 * @param {Number} winWidth 图片容器宽度
	 * @param {Number} contentHeight 图片容器高度
	 * @param {Number} imgWidth 图片宽度
	 * @param {Number} imgHeight 图片高度
	 */
	ImgPreview.resize = function(el,winWidth,contentHeight,imgWidth,imgHeight){ //缩放图片
		el.stop();
		if(winWidth / contentHeight > imgWidth / imgHeight){
			var h = Math.min(contentHeight,imgHeight),
				w = h * (imgWidth / imgHeight);
			el.animate({
				height:h,
				width:w
			})
        }else{
        	var w = Math.min(winWidth,imgWidth),
        		h = w * (imgHeight / imgWidth);
        	el.animate({
				width:w,
				height:h
			})
        }
        el.data('cursize',w + '|' + h);
	}
	/** 
	 * 获取图片的实际大小
	 * @param {String} src 需要加载的图片地址
	 * @param {Function} callback 图片load完成或者onerror后的回调
	 */
	ImgPreview.getRealSize = function(src,callback){ //获得图片实际大小，load完成后，回调
		var img = new Image();
		var tmp = $('<div style="visibility:hidden; position:absolute; left:-9999em; top:-9999em;"></div>').appendTo($('body')).append(img);
		img.onload = function(){
			callback({
				key:src,
				width:tmp.width(),
				height:tmp.height()
			},true)
			tmp.remove();
		}
		img.onerror = function(){
			callback({
				key:src,
				width:194,
				height:175
			},false);
		}
		img.src = ImgPreview.URL + src + '_' + ImgPreview.PREVIEW_SIZE;
	}
	/** 
	 * 获取图片矩阵变换后的值
	 * @param {Number} radian 角度
	 * @param {Number} dx 缩放比例
	 * @param {Number} dy 缩放比例
	 */
	ImgPreview.getMatrix = function(radian, dx, dy) {
        var cos = Math.cos(radian),
            sin = Math.sin(radian),
            _dx = dx || 1,
            _dy = dy || 1;
        return {
            m11: cos * _dx,
            m12: - sin * _dy,
            m21: sin * dx,
            m22: cos * _dy
        };
    }


	$.extend(ImgPreview.prototype,{
		/** @private*/
		init:function(){
			this._buildDOM();
			this.buildThumbs(this.index);
			this.initEvent();
			this.show();
		},
		_buildDOM:function(){ //构建原始的空DOM
			var html = '<div class="preview-container"> \
					        <div class="preview-close"> \
					            <a href="javascript:;" title="关闭" hidefocus="true"><span>关闭</span></a> \
					        </div> \
					        <div class="preview-panel"> \
					            <div class="preview-control"> \
					                <a href="javascript:;" class="rotate-left " title="向左旋转" hidefocus="true"><span>向左旋转</span></a> \
					                <a href="javascript:;" class="rotate-right" title="向右旋转" hidefocus="true"><span>向右旋转</span></a> \
					                <a href="javascript:;" class="original-img" target="_blank" title="查看原图" hidefocus="true"><span>查看原图</span></a> \
					                <a href="javascript:;" class="download-img" title="下载图片" hidefocus="true"><span>下载图片</span></a> \
					            </div> \
					        </div> \
					        <div class="preview-content"> \
					            <div class="preview-prev"> \
					                <a href="javascript:;" hidefocus="true" title="上一张"><span>上一张</span></a> \
					            </div> \
					            <div class="preview-next"> \
					                <a href="javascript:;" hidefocus="true" title="下一张"><span>下一张</span></a> \
					            </div> \
					            <div class="preview-photo"> \
					                <table> \
					                    <tr> \
					                        <td valign="middle"> \
					                        	<img style="width:68px;height:68px;" src="'+ ImgPreview.DEFAULT_IMG +'" /> \
					                        </td> \
					                    </tr> \
					                </table> \
					            </div> \
					            <div class="preview-info"> \
					                <span class="file-name"></span> \
					                <span class="file-index"></span> \
					            </div> \
					        </div> \
					        <div class="preview-thumbs"> \
					            <ul></ul> \
					        </div> \
					    </div>';
			var previewContainer = this.el = $(html).appendTo($('body'));


			this.previewContent = previewContainer.find('.preview-content');
			this.previewPanel = previewContainer.find('.preview-panel');
			this.previewControl = previewContainer.find('.preview-control');
			this.previewThumbs = previewContainer.find('.preview-thumbs');
			this.previewInfo = previewContainer.find('.preview-info');
			this.previewPrev = previewContainer.find('.preview-prev');
			this.previewNext = previewContainer.find('.preview-next');
			this.previewClose = previewContainer.find('.preview-close a');
			this.previewName = previewContainer.find('.file-name');
			this.previewIndex = previewContainer.find('.file-index');
			this.previewPhoto = previewContainer.find('.preview-photo img'); //一些DOM引用

			this._panelHeight = this.previewPanel.height();
			this._thumbsHeight = this.previewThumbs.height();
			this._infoHeight = this.previewInfo.height(); //一些固定的高度

			this.previewContent.height(this._winHeight - this._panelHeight - this._thumbsHeight - this._infoHeight - this._spaceHeight);
			this.el.width(this._winWidth);

			if(typeof outLinkInfo !== 'undefined' && outLinkInfo.sharePrivilege == 1){
				this.previewControl.find('.download-img').remove();
			}
			
		},
		/** 
		 * 构建缩略图列表
		 * @param {Number} [position] 当前显示的图片的索引，如果为空表示是浏览器缩放
		 */
		buildThumbs:function(position){ //构建缩略图列表  //TODO 优化
			//console.log(position)
			var isResize = typeof position === 'undefined'


			if(!this.downloadable){
				this.previewControl.find('.download-img').hide();
			}else{
				this.previewControl.find('.download-img').show();
			}

			var ul = this.previewThumbs.find('ul');

			var num = parseInt(this._winWidth / ImgPreview.THUMB_WIDTH),
				thumbs = ul.find('li'),
				thumbsNum = thumbs.length,
				imgs = this.imgs,
				imgsNum = imgs.length,
				thumbCache = this. thumbCache;

			position = !isResize ? parseInt(position) : this.index;
			//if(position >= imgsNum || position <= 0) return;
			num = num % 2 ? num : num - 1;
			var middle = parseInt(num / 2),
				pos;
			if(thumbsNum === 0){//如果没有构建过，那么重新构建；
				var lst = '';
				for(var i = 0 ; i < num ; i ++){
					pos = position + i - middle;

					if((i < middle && middle - i > position) || (i > middle && i - (middle - position) >= imgsNum)){
						lst += '<li class="tmp"></li>';
					}else{
						lst += '<li><a href="javascript:;" '+ (i === middle ? 'class="cur"' : '') +' hidefocus="true" data-pos="'+ pos +'" data-key="' + imgs[pos].key +'"><img src="'+ ImgPreview.URL + imgs[pos].key +'_'+ ImgPreview.THUMB_SIZE +'" /></a></li>'
					}
				}
				lst = $(lst);
				lst.find('img').on('load',function(){ //TODO 缓存
					thumbCache[$(this).attr('src')] = true;
				});
				lst.find('img').on('error',function(){ //TODO error
					$(this).attr('src',ImgPreview.ERROR_IMG);
				})
				ul.append(lst);
			}else{//如果构建过，那么计算更新； 包括resize 以及 切换的时候都会更新，一个是更新数量，一个是更新pos
				var step = position - this.index;
				ul.find('.cur').removeClass('cur');
				ul.find('li:eq('+ (middle + step) +')').find('a').addClass('cur');
				if(step > 0){ //向后移动
					ul.find('li:lt('+step+')').remove();
					var append = ''
					for(var i = 0; i < step; i++){
						if(this.index + middle + i + 1 < imgsNum){
							pos = this.index + middle + i + 1;
							append += '<li><a href="javascript:;" hidefocus="true" data-pos="'+ pos +'" data-key="' + imgs[pos].key +'"><img src="'+ ImgPreview.URL + imgs[pos].key +'_'+ ImgPreview.THUMB_SIZE +'" /></a></li>'
						}else{
							append += '<li class="tmp"></li>'
						}
					}
					// ul.css({
					// 	left: step * ImgPreview.THUMB_WIDTH
					// })
					append = $(append);
					append.find('img').on('load',function(){ //TODO 缓存
						thumbCache[$(this).attr('src')] = true;
					});
					append.find('img').on('error',function(){ //TODO error
						$(this).attr('src',ImgPreview.ERROR_IMG);
					})
					ul.append(append);
					// ul.animate({
					// 	left:0
					// })
				}else if(step < 0){ //向前移动
					step = -step;
					ul.find('li:gt('+(thumbsNum - step - 1)+')').remove();
					var prepend = '';
					for(var i = 0; i < step; i++){
						if(this.index - middle - i - 1 >= 0){
							pos = this.index - middle - i - 1;
							prepend = '<li><a href="javascript:;" hidefocus="true" data-pos="'+ pos +'" data-key="' + imgs[pos].key +'"><img src="'+ ImgPreview.URL + imgs[pos].key +'_'+ ImgPreview.THUMB_SIZE +'" /></a></li>' + prepend;
						}else{
							prepend = '<li class="tmp"></li>' + prepend;
						}
					}
					// ul.css({
					// 	left: - step * ImgPreview.THUMB_WIDTH
					// })
					
					//TODO 缓存
					prepend = $(prepend);
					prepend.find('img').on('load',function(){ //TODO 缓存
						thumbCache[$(this).attr('src')] = true;
					});
					prepend.find('img').on('error',function(){ //TODO error
						$(this).attr('src',ImgPreview.ERROR_IMG);
					})
					ul.prepend(prepend);
					// ul.animate({
					// 	left:0
					// })
				}else{ //不移动的时候就是resize
					if(thumbsNum > num){ //如果缩小，那么前后减少
						var rn = (thumbsNum - num) / 2;
						ul.find('li:lt('+ rn +'),li:gt('+ (thumbsNum - rn - 1) +')').remove();
					}else if(thumbsNum < num){ //如果放大，那么前后增加。
						var an = (num - thumbsNum) / 2, prepend = '' , append = '';
						for(var i = 0; i < an; i++){ 
							if(middle - i > position){
								prepend += '<li class="tmp"></li>';
							}else{
								pos = position + i - middle;
								prepend += '<li><a href="javascript:;" hidefocus="true" data-pos="'+ pos +'" data-key="' + imgs[pos].key +'"><img src="'+ ImgPreview.URL + imgs[pos].key +'_'+ ImgPreview.THUMB_SIZE +'" /></a></li>'
							}
							if((thumbsNum + i + an) - (middle - position) < imgsNum){
								pos = position + (thumbsNum + i + an) - middle;
								append += '<li><a href="javascript:;" hidefocus="true" data-pos="'+ pos +'" data-key="' + imgs[pos].key +'"><img src="'+ ImgPreview.URL + imgs[pos].key +'_'+ ImgPreview.THUMB_SIZE +'" /></a></li>'
							}else{
								append += '<li class="tmp"></li>';
							}
		                }
		                append = $(append);
		                prepend = $(prepend);
						append.find('img').on('load',function(){ //TODO 缓存
							thumbCache[$(this).attr('src')] = true;
						});
						append.find('img').on('error',function(){ //TODO error
							$(this).attr('src',ImgPreview.ERROR_IMG);
						})
						prepend.find('img').on('load',function(){ //TODO 缓存
							thumbCache[$(this).attr('src')] = true;
						});
						prepend.find('img').on('error',function(){ //TODO error
							$(this).attr('src',ImgPreview.ERROR_IMG);
						})
		                ul.prepend(prepend).append(append);
					}
				}
			}
			this.index = position;

			if(!isResize){
				this.load = false;
				this.currentRnd = 0;
				//每次构建完成之后处理详细信息，不包括resize
				this.showDetail();
			}

			return this;
		},

		/** 
		 * 显示图片的详细信息，包括大图、名字、序号、下载、全图 etc.
		 */
		showDetail:function(){
			var _this = this;
			var curImg = this.imgs[this.index],
				imgsNum = this.imgs.length,
				previewPhoto = this.previewPhoto;
			//显示大图；
			previewPhoto.attr('src',ImgPreview.URL + curImg.key + '_' + ImgPreview.THUMB_SIZE)
			if(ImgPreview.SUPPORT !== 'filter'){
				previewPhoto[0].style[ImgPreview.SUPPORT] = '';
			}else{
				previewPhoto[0].style.filter = '';
				// previewPhoto.attr('class','rotate0');
				previewPhoto.css({
					left:0,
					top:0
				})
			}
			ImgPreview.getRealSize(curImg.key,function(img,flag){ //预加载图片，加载完成后回调
				if(img.key !== _this.imgs[_this.index].key) return; //如果最后返回的不是当前选中的图片，那么不处理。
				if(!flag){ //如果图片加载出错
					previewPhoto.attr('src',ImgPreview.ERROR_IMG);
				}else{
					previewPhoto.attr('src',ImgPreview.URL + curImg.key + '_' + ImgPreview.PREVIEW_SIZE);
				}
				previewPhoto.attr('data-realsize',img.width + '|' + img.height);

				var winWidth = _this._winWidth,
					contentHeight = _this.previewContent.height(),
					imgWidth = img.width,
					imgHeight = img.height;

				ImgPreview.resize(previewPhoto,winWidth,contentHeight,imgWidth,imgHeight);

                _this.load = true;
			});
			
			if(this.index + 1 < imgsNum) ImgPreview.getRealSize(this.imgs[this.index + 1].key,function(){});
			if(this.index + 2 < imgsNum) ImgPreview.getRealSize(this.imgs[this.index + 2].key,function(){});
			//显示name；
			this.previewName.html(curImg.name);
			//显示序号；
			this.previewIndex.html('('+ (this.index + 1) +'/'+ this.imgs.length +')');
			//下载 和 全图；
			this.previewControl.find('.original-img').attr('href',ImgPreview.URL + curImg.key);
			this.previewControl.find('.download-img').attr('href',ImgPreview.DOWNLOAD_URL + '?resourceId='+ curImg.id +'&length=' + curImg.size);
		},
		/** 
		 * 绑定各种事件
		 */
		initEvent:function(){ //绑定事件
			var _this = this;
			this.el.on('click',function(e){
				e.stopImmediatePropagation();
			});
			//resize
			$(window).bind('resize',function(){
				_this._winWidth = $(window).width();
				_this._winHeight = $(window).height();
				_this.previewContent.height(_this._winHeight - _this._panelHeight - _this._thumbsHeight - _this._infoHeight - _this._spaceHeight);
				_this.el.width(_this._winWidth);

				var winWidth = _this._winWidth,
					contentHeight = _this.previewContent.height(),
					imgSize = (_this.previewPhoto.attr('data-realsize') || "68|68").split('|');
				ImgPreview.resize(_this.previewPhoto,winWidth,contentHeight,imgSize[0],imgSize[1])
				_this.buildThumbs();
			});
			//trun-left
			//trun-right
			this.previewControl.on('click','.rotate-left ',function(){
				_this.doRotate(- Math.PI / 2);
			}).on('click','.rotate-right',function(){
				_this.doRotate(Math.PI / 2);
			});
			//close
			this.previewClose.on('click',function(){
				_this.hide();
			});
			//prev
			this.previewPrev.on('click',function(){
				if(_this.index - 1 < 0) return;
				_this.buildThumbs(_this.index - 1);
			}).on('mouseenter',function(){
				$(this).find('a').addClass('hover').show();
			}).on('mouseleave',function(){
				$(this).find('a').hide();
			});
			//next
			this.previewNext.on('click',function(){
				if(_this.index + 1 >= _this.imgs.length) return;
				_this.buildThumbs(_this.index + 1);
			}).on('mouseenter',function(){
				$(this).find('a').addClass('hover').show();
			}).on('mouseleave',function(){
				$(this).find('a').hide();
			});
			//scroll
			this._scrollEvent = function(e){
				if(_this.isHidden) return;
				if($.browser.mozilla){
					if(e.originalEvent.detail > 0){
						_this.previewNext.trigger('click');
					}else{
						_this.previewPrev.trigger('click');	
					}
				}else{
					if(e.originalEvent.wheelDelta < 0){
						_this.previewNext.trigger('click');
					}else{
						_this.previewPrev.trigger('click');	
					}
				}
			}
			if($.browser.mozilla){
				$(document).bind('DOMMouseScroll',this._scrollEvent);
			}else{
				$(document).bind('mousewheel',this._scrollEvent);
			}
			//key left,key right,esc etc.
			this._keyEvent = function(e){
				if(_this.isHidden) return;
				if(e.keyCode === ImgPreview.KEY.ESC){
					_this.hide();
				}
				if(e.keyCode === ImgPreview.KEY.LEFT){
					_this.previewPrev.trigger('click');
				}
				if(e.keyCode === ImgPreview.KEY.RIGHT){
					_this.previewNext.trigger('click');
				}
			}
			$(document).bind('keydown',this._keyEvent);
			//thumb click
			this.previewThumbs.on('click','a',function(){
				var pos = $(this).attr('data-pos');
				_this.buildThumbs(pos);
			});
		},
		/** 
		 * 旋转
		 * @param {Number} radian 角度
		 * @param {Number} dx 缩放比例
		 * @param {Number} dy 缩放比例
		 */
		rotate:function(radian,dx,dy){
			this.load = false;
			dx = dy = Math.min(dx,dy,1);
			var mtx = ImgPreview.getMatrix(radian,dx,dy),
				previewPhoto = this.previewPhoto,
				imgWidth = previewPhoto.width(),
				imgHeight = previewPhoto.height();
			if(ImgPreview.SUPPORT !== 'filter'){
				previewPhoto[0].style[ImgPreview.SUPPORT] = 'matrix(' + [mtx.m11.toFixed(20), mtx.m21.toFixed(20), mtx.m12.toFixed(20), mtx.m22.toFixed(20)].join(',') + ', '+dx+', '+dy+' )';
			}else{
				previewPhoto[0].style.filter = '';
				if($.browser.version === '8.0' && navigator.userAgent.indexOf('Trident') > 0){
					if(parseInt(radian / Math.PI) == radian / Math.PI){
						var left = 0,
							top = 0
					}else{
						var left = (imgWidth - imgHeight * dy) / 2,
							top = (imgHeight - imgWidth * dx) / 2;
					}
					previewPhoto.css({
						left:left,
						top:top
					})
				}
				//previewPhoto[0].style.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=' + mtx.m11 + ',' + 'M12=' + mtx.m12 + ',' + 'M21=' + mtx.m21 + ',' + 'M22=' + mtx.m22 + ',' + 'SizingMethod="auto expand")';
				var i = Math.abs(parseInt(radian * 2 / Math.PI));
				// previewPhoto.attr('class','rotate' + i);
				previewPhoto[0].style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ i +')';
				previewPhoto.css({
					width:previewPhoto.data('cursize').split('|')[0] * dx + i,
					height:previewPhoto.data('cursize').split('|')[1] * dy + i
				})
			}

			this.load = true;
		},
		/** 
		 * 旋转
		 * @param {Number} rnd 旋转角度
		 */
		doRotate:function(rnd){
			if(!this.load) return;
			var dx,dy;
			dx = dy = 1;
			var currentRnd = this.currentRnd += rnd;
			if(Math.abs(currentRnd) >= 2 * Math.PI) currentRnd = this.currentRnd = 0;
			var contentHeight = this.previewContent.height(),
				realsize = this.previewPhoto.attr('data-realsize').split('|'),
				winWidth = this._winWidth,
				imgWidth = this.previewPhoto.width(),
				imgHeight = this.previewPhoto.height(),
				rndIsInt = parseInt(currentRnd / Math.PI) == currentRnd / Math.PI;

			//TODO 计算缩放比例
			if(!rndIsInt){ //正负90度的情况下，需要重新计算宽高即缩放比例
				if(contentHeight < imgWidth){
					dx = dy = contentHeight / imgWidth;
				}else{
					dx = dy = Math.min(contentHeight / imgWidth, Math.min(winWidth,realsize[1]) / imgHeight)
				}
				if(winWidth < imgHeight){
					dx = dy = winWidth / imgHeight;
				}else{
					dx = dy = Math.min(winWidth / imgHeight, Math.min(contentHeight,realsize[0]) / imgWidth)
				}

				// if($.browser.msie && parseInt($.browser.version) <= 8){
				// 	if(imgWidth < imgHeight){
				// 		dx = dy = imgWidth / imgHeight;
				// 	}else{
				// 		dx = dy = imgHeight / imgWidth;
				// 	}
				// }
				
			}
			this.rotate(currentRnd,dx,dy);
		},
		/** 
		 * 重建，可以重新设置图片list以及索引
		 * @param {Object} params 同构造函数参数
		 */
		rebuild:function(params){ //不同目录下的话img list不同，需要重建
			this.imgs = params.imgs || [];
			this.index = params.index || 0;
			this.downloadable = typeof params.downloadable === 'undefined' ? true : params.downloadable;
			this.buildThumbs(this.index);
			this.show();
		},
		/** 
		 * 显示组件
		 */
		show:function(){
			this._overlay = this._overlay || new Sbox.Views.Overlay({
				opacity:0.85,
				bgcolor:'#cdcdcd',
				modal:true
			})

			this.el.show();
			this.isHidden = false;
			return this;
		},
		/** 
		 * 隐藏组件,DOM未销毁，可重用
		 */
		hide:function(){
			this.el.hide();
			this._overlay.remove();
			this._overlay = null;
			this.isHidden = true;
			this.previewThumbs.find('ul').empty();
			this.previewPhoto.css({
				width:68,
				height:68,
				left:0,
				top:0
			}).attr('src',ImgPreview.DEFAULT_IMG);

			if(ImgPreview.SUPPORT !== 'filter'){
				this.previewPhoto[0].style[ImgPreview.SUPPORT] = '';
			}else{
				this.previewPhoto[0].style.filter = '';
			}

			return this;
		},
		/** 
		 * 销毁DOM，unbind事件
		 */
		remove:function(){
			$(document).unbind('keydown',this._keyEvent);

			if($.browser.mozilla){
				$(document).unbind('DOMMouseScroll',this._scrollEvent);
			}else{
				$(document).unbind('mousewheel',this._scrollEvent);
			}

			this.el.remove();
		}
	})


	/**
	 * 图片预览，首页可以调用传入file以及filelist
	 * @param {Sbox.Models.File} file 点击的文件
	 * @param {Sbox.Collections.FileList} filelist 当前文件列表
	 */
	Sbox.Preview = function(file,filelist){
		var i = 0,index,imgs = [];
		filelist.each(function(f){
			if(isPreviewImgFile(f.get('name'),f.get('size'))){
				imgs.push({
					id:f.get('id'),
					name:f.get('name'),
					key:f.get('thumbnailsKey'),
					size:f.get('size')
				})
				if(file.get('id') === f.get('id')) index = i;
				i++;
			}
		})
		if(!window.imgPreviewHandle){
			window.imgPreviewHandle = new Sbox.Views.ImgPreview({
				index:index,
				imgs:imgs,
				downloadable:!file.get('power') || file.get('power') < 4
			})
		}else{
			window.imgPreviewHandle.rebuild({
				index:index,
				imgs:imgs,
				downloadable:!file.get('power') || file.get('power') < 4
			})
		}
	}
})(jQuery);

(function($){ //回收站密码相关
	var tpl_setPassword = '<form><div class="recyclebin-password-dialog"> \
			        		<div class="field"> \
			        			<div class="label">网盘登录密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" class="ipt-text" name="loginPassword" id="loginPassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        		<div class="field"> \
			        			<div class="label">设置回收站密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" class="ipt-text" name="deletePassword" id="deletePassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        		<div class="field"> \
			        			<div class="label">确认回收站密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" class="ipt-text" name="rdeletePassword" id="rdeletePassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        	</div></form>';
	var tpl_changePassword = '<form><div class="recyclebin-password-dialog"> \
			        		<div class="field"> \
			        			<div class="label">原回收站密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" tabindex="1" class="ipt-text" name="sdeletePassword" id="sdeletePassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        		<div class="field" style="margin:-10px 0 0 0;"> \
			        			<div class="label"></div> \
			        			<div class="ipt"> \
			        				<a href="javascript:;" id="forgetPassword" style="color:#337FD4">忘记回收站密码？</a> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        		<div class="field"> \
			        			<div class="label">新回收站密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" tabindex="2" class="ipt-text" name="deletePassword" id="deletePassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        		<div class="field"> \
			        			<div class="label">确认密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" tabindex="3" class="ipt-text" name="rdeletePassword" id="rdeletePassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        	</div></form>';
	var tpl_cancelPassword = '<form><div class="wn-msg" style="margin-left:80px;"><p>您确认取消回收站密码吗？</p> \
								<p class="tip">取消回收站密码后，您的回收站数据不再受保护！</p> \
				        		<div class="field" style="margin-top:10px;"> \
				        			<div class="label">回收站密码：</div> \
				        			<div class="ipt"> \
				        				&nbsp;<input type="password" class="ipt-text" style="width:100px;" name="deletePassword" id="deletePassword" onpaste="return false;" /> \
				        			</div> \
				        			<div class="tips" style="font-size:12px; vertical-align:top;"> \
				        			</div> \
				        		</div> \
								</div></form>';
	
	var tpl_validatePassword = '<form><div class="recyclebin-password-dialog"> \
			        		<div class="field"> \
			        			<div class="label">请输入回收站密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" class="ipt-text" name="deletePassword" id="deletePassword" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        		<div class="field"> \
			        			<div class="label"></div> \
			        			<div class="ipt"> \
			        				<a href="javascript:;" id="forgetPassword" style="color:#337FD4">忘记回收站密码？</a> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip"></span> \
			        			</div> \
			        		</div> \
			        	</div></form>'
	Sbox.SetDeletePassword = function(callback){ //设置回收站密码
		var dialog = new Sbox.Views.Window({
			title:'设置回收站密码',
			body:tpl_setPassword,
			width:560,
			closeButton:true
		})

		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				var bd = dialog.body,	
					ipt = bd.find('input');
				ipt.blur();
				if(flag){
					loginPasswordTip.html('<span class="icon icon-loading"></span>');
					$.post('/User!setDeletePassword.action',dialog.body.find('form').serialize(),function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){ //TODO  服务器密码验证
							Sbox.Success('设置成功');
							dialog.remove();
							if(callback) callback(); //设置成功之后回调，有可能是设置页面设置，有可能是回收站页面设置，回调内容会不一样。
						}else if(r.code === 302){
							loginPasswordTip.html('<span class="error">登录密码错误</span>');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					});
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			loginPassword = bd.find('#loginPassword'),
			deletePassword = bd.find('#deletePassword'),
			rdeletePassword = bd.find('#rdeletePassword'),
			loginPasswordTip = loginPassword.parent().next(),
			deletePasswordTip = deletePassword.parent().next(),
			rdeletePasswordTip = rdeletePassword.parent().next();
		var flag = true;

		bd.find('form').on('submit',function(){
			dialog.getButton('确定')[0].trigger('click');
			return false;
		})
		bd.find('input').on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		})
		loginPassword.on('blur',function(){
			var val = $(this).val();
			if(val === ''){
				loginPasswordTip.html('<span class="error">请输入登录密码</span>');
				flag = false;
			}else if(val.length > 16 || val.length < 6){
				loginPasswordTip.html('<span class="error">长度为6-16个字符</span>');
				flag = false;
			}
		}).on('focus',function(){
			loginPasswordTip.empty();
		})
		deletePassword.on('blur',function(){
			var val = $(this).val();
			if(val === ''){
				deletePasswordTip.html('<span class="error">请输入回收站密码</span>');
				flag = false;
			}else if(val.length > 16 || val.length < 6){
				deletePasswordTip.html('<span class="error">长度为6-16个字符</span>');
				flag = false;
			}
			if(val === rdeletePassword.val()){
				rdeletePasswordTip.empty();
			}else{
				rdeletePasswordTip.html('<span class="error">两次输入密码不一致</span>');
				flag = false;
			}
		}).on('focus',function(){
			deletePasswordTip.empty();
		})
		rdeletePassword.on('blur',function(){
			var val = $(this).val(),
				dpass = deletePassword.val();
			if(val === ''){
				rdeletePasswordTip.html('<span class="error">请确认密码</span>');
				flag = false;
			}else if(dpass !== '' && val !== dpass){
				rdeletePasswordTip.html('<span class="error">两次输入密码不一致</span>');
				flag = false;
			}
		}).on('focus',function(){
			rdeletePasswordTip.empty();
		})
	}
	Sbox.ChangeDeletePassword = function(callback){ //修改回收站密码
		var dialog = new Sbox.Views.Window({
			title:'修改回收站密码',
			body:tpl_changePassword,
			width:560,
			closeButton:true
		})

		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				var bd = dialog.body,	
					ipt = bd.find('input');
				ipt.blur();
				if(flag){
					sdeletePasswordTip.html('<span class="icon icon-loading"></span>');
					$.post('/User!updateDeletePassword.action',dialog.body.find('form').serialize(),function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){ //TODO  服务器密码验证
							Sbox.Success('修改成功');
							dialog.remove();
							if(callback) callback(); //设置成功之后回调，有可能是设置页面设置，有可能是回收站页面设置，回调内容会不一样。
						}else if(r.code === 302){
							sdeletePasswordTip.html('<span class="error">旧密码错误</span>');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					});
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			sdeletePassword = bd.find('#sdeletePassword'),
			deletePassword = bd.find('#deletePassword'),
			rdeletePassword = bd.find('#rdeletePassword'),
			sdeletePasswordTip = sdeletePassword.parent().next(),
			deletePasswordTip = deletePassword.parent().next(),
			rdeletePasswordTip = rdeletePassword.parent().next();
		var flag = true;
		bd.find('form').on('submit',function(){
			dialog.getButton('确定')[0].trigger('click');
			return false;
		})
		bd.find('input').on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		})
		sdeletePassword.on('blur',function(){
			var val = $(this).val();
			if(val === ''){
				sdeletePasswordTip.html('<span class="error">请输入原回收站密码</span>');
				flag = false;
			}else if(val.length > 16 || val.length < 6){
				sdeletePasswordTip.html('<span class="error">长度为6-16个字符</span>');
				flag = false;
			}
		}).on('focus',function(){
			sdeletePasswordTip.html('');
		})
		bd.find('#forgetPassword').on('click',function(){ //TODO
			Sbox.ResetDeletePassword();
		})
		deletePassword.on('blur',function(){
			var val = $(this).val();
			if(val === ''){
				deletePasswordTip.html('<span class="error">请输入新回收站密码</span>');
				flag = false;
			}else if(val.length > 16 || val.length < 6){
				deletePasswordTip.html('<span class="error">长度为6-16个字符</span>');
				flag = false;
			}
			if(val === rdeletePassword.val()){
				rdeletePasswordTip.empty();
			}else{
				rdeletePasswordTip.html('<span class="error">两次输入密码不一致</span>');
				flag = false;
			}
		}).on('focus',function(){
			deletePasswordTip.empty();
		})
		rdeletePassword.on('blur',function(){
			var val = $(this).val(),
				dpass = deletePassword.val();
			if(val === ''){
				rdeletePasswordTip.html('<span class="error">请确认密码</span>');
				flag = false;
			}else if(dpass !== '' && val !== dpass){
				rdeletePasswordTip.html('<span class="error">两次输入密码不一致</span>');
				flag = false;
			}
		}).on('focus',function(){
			rdeletePasswordTip.empty();
		})
	}
	Sbox.CancelDeletePassword = function(callback){ //取消回收站密码
		var dialog = new Sbox.Views.Window({
			title:'取消回收站密码',
			body:tpl_cancelPassword,
			width:560,
			closeButton:true
		}).addStyle('dialog-warning')

		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				var bd = dialog.body,	
					ipt = bd.find('input');
				ipt.blur();
				if(flag){
					deletePasswordTip.html('<span class="icon icon-loading"></span>');
					$.post('/User!cancelDeletePassword.action',dialog.body.find('form').serialize(),function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){ 
							Sbox.Success('取消成功');
							dialog.remove();
							if(callback) callback(); //设置成功之后回调，有可能是设置页面设置，有可能是回收站页面设置，回调内容会不一样。
						}else if(r.code === 302){ 
							deletePasswordTip.html('<span class="error">密码错误</span>');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					});
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})
		var bd = dialog.body,
			deletePassword = bd.find('#deletePassword'),
			deletePasswordTip = deletePassword.parent().next();
		var flag = true;
		bd.find('form').on('submit',function(){
			dialog.getButton('确定')[0].trigger('click');
			return false;
		})
		bd.find('input').on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		})
		deletePassword.on('blur',function(){
			var val = $(this).val();
			if(val === ''){
				deletePasswordTip.html('<span class="error">密码不能为空</span>');
				flag = false;
			}else if(val.length > 16 || val.length < 6){
				deletePasswordTip.html('<span class="error">长度为6-16个字符</span>');
				flag = false;
			}
		}).on('focus',function(){
			deletePasswordTip.empty();
		})
	}
	Sbox.ResetDeletePassword = function(callback){
		Sbox.Warning('<p>您确认重置回收站密码吗？</p>',function(f){
			if(f){
				$.post('/User!forgetDeletePassword.action?_t=' + Math.random(),function(r){
					if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){ //TODO  服务器密码验证
						Sbox.Alert({
							message:'<div class="reset-dp-success"><p>回收站密码重置成功！</p><p class="tip">已将新密码发送到您的登录邮箱中，请尽快查收！</p></div>',
							width:500
						});
					}else{
						Sbox.Error('重置失败，请稍候重试');
					}
				},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				});
			} 
		})
	}
	Sbox.ValidateDeletePassword = function(callback){
		var dialog = new Sbox.Views.Window({
			title:'回收站密码验证',
			body:tpl_validatePassword,
			width:560,
			closeButton:true
		})

		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				var bd = dialog.body,	
					ipt = bd.find('input');
				ipt.blur();
				if(flag){
					deletePasswordTip.html('<span class="icon icon-loading"></span>');
					$.post('/User!confirmDeletePassword.action',dialog.body.find('form').serialize(),function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){ //TODO  服务器密码验证
							//Sbox.Success('设置成功');
							dialog.remove();
							if(callback) callback(); //设置成功之后回调，有可能是设置页面设置，有可能是回收站页面设置，回调内容会不一样。
						}else if(r.code === 302){
							deletePasswordTip.html('<span class="error">回收站密码错误</span>');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					});
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			deletePassword = bd.find('#deletePassword'),
			deletePasswordTip = deletePassword.parent().next();
		var flag = true;
		bd.find('form').on('submit',function(){
			dialog.getButton('确定')[0].trigger('click');
			return false;
		})

		bd.find('input').on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		})
		bd.find('#forgetPassword').on('click',function(){ //TODO
			Sbox.ResetDeletePassword();
		})
		
		deletePassword.on('blur',function(){
			var val = $(this).val();
			if(val === ''){
				deletePasswordTip.html('<span class="error">请输入回收站密码</span>');
				flag = false;
			}else if(val.length > 16 || val.length < 6){
				deletePasswordTip.html('<span class="error">长度为6-16个字符</span>');
				flag = false;
			}
		}).on('focus',function(){
			deletePasswordTip.empty();
		})
	}
})(jQuery)