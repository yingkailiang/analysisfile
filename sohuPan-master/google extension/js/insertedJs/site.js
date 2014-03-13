(function ($, window) {
	function panAdd() {
		this.initialize();
	}

	$.extend(panAdd.prototype, {
		initialize : function() {

		},
		checkLogin : function(options) {
			var self = this;			
			self.port.onMessage.addListener(function(msg) {
				var loginStatus = msg.checkLogin;
				if(loginStatus) {
					if(loginStatus == "success") {
						options.success();
					}
					/*else if(loginStatus == "error") {
						options.error();
					}*/
				}				
			});
			self.port.postMessage({page : "checkLogin"});
		}		
	});

	var currentHost = location.host;
	//判断为哪个邮箱
	if(currentHost.search("163.com") != -1) {
		var panAdd163 = function() {			
			this.$attachFromPan = $('<a class="pan-add-btn" href="#">从“搜狐企业网盘”添加附件</a>');
			this.$panFileBox = $('<div id="pan-file-box"><div id="pan-file-box-inner"><div class="pan-drag-area"><span class="pan-close"></span></div></div></div>');	
			this.initialize();
		}

		$.extend(panAdd163.prototype, panAdd.prototype, {
			initialize : function() {
				var self = this;
				self.listenDOMInsert();
			},
			listenDOMInsert : function() {
				var self = this;
				$("#secContent").on("DOMNodeInserted", function(e) {
					var $current = $(e.target);
					if($current.attr("id") == "divComposeScroll") {
						self.$current = $current;
						self.$attachBox = $current.find("#divComposeAttachOperate");

						//点击添加按钮显示
						self.$attachFromPan.on("click", function(e) {
							e.preventDefault();
							//开始消息监听
							self.listenMsg();
							//检查登录状况
							self.checkLogin({
								success : function() {
									var panUrl = chrome.extension.getURL("pan.html");
									/*if(self.$edit) {
										$edit = self.$edit;
									}
									else {
										$edit = self.$edit = $($("#divComposeEditor .APP-editor-iframe")[0].contentDocument.body);
									}*/
									
									//第一次加载
									// if(!self.$panIframe) {
									// 	$panIframe = self.$panIframe = $('<iframe id="pan-iframe"></iframe>');
									// 	$panIframe.attr("src", panUrl);
									// 	self.$panFileBox.find("#pan-file-box-inner").append($panIframe);
									// }
									// else {
									// 	self.$panIframe.fadeIn("quick");	
									// }	

									if(self.$panIframe){
										self.$panIframe.remove();
										self.$panIframe === null;
									}

									$panIframe = self.$panIframe = $('<iframe id="pan-iframe"></iframe>');
									$panIframe.attr("src", panUrl);
									self.$panFileBox.find("#pan-file-box-inner").append($panIframe);
								},
								error : self.popLogin
							});												
						});

						//添加关闭按钮事件
						self.$panFileBox.on("click", ".pan-close", $.proxy(self.panBoxHide, self));

						//监听内容同时添加
						self.addContent();

						//将相关组件加载进页面
						self.insertPan();						
					}
				});
			},
			addContent : function() {
				var self = this;
				self.$current.on("addPan", function(e, content){
					//检查编辑器是否在借点中（如果发信可能会消失）
					var mailEditor = $($(".APP-editor-iframe")[0].contentDocument.body);
					if(mailEditor.html() == "") {
						delete self.contentContainer;
					}

					if(!self.contentContainer || self.contentContainer.parent().length < 1) {
						self.contentContainer = $('<table id="panMailAttach" width="100%" style="border:1px solid #d3d3d3;background-color:#F8F8F8"><tr><td style="border-bottom:1px solid #d3d3d3;"colspan="3"height="42"><img style="margin-left:15px"src="http://a2.itc.cn/sceapp/6/sohupan/img/edm/title.png"><span style="font-size:18px;color:#4e4e4e;">&nbsp;&nbsp;搜狐企业网盘附件</span></td></tr><tr height="20"></tr></table>')
						mailEditor.append(self.contentContainer);
					}
					var contentWrapTmp = $('<table>');
					contentWrapTmp.html(content);
					var ids = [];
					self.contentContainer.find('tr').each(function(){
						if($(this).attr('id'))
							ids.push('#' + $(this).attr('id'));
					})
					
					contentWrapTmp.find(ids.join(',')).each(function(){
						var id = $(this).attr('id');
						$(this).next().remove();
						self.contentContainer.find('#' + id).replaceWith($(this));
					})

					self.contentContainer.append(contentWrapTmp.html());	
				});
			},
			listenMsg : function() {
				var self = this,
					port = self.port = chrome.extension.connect({name : "page"});
				port.onMessage.addListener(function(msg) {
					if(msg.pan == "add") {
						self.$current.trigger("addPan", msg.content);
						self.panBoxHide();
					}else if(msg.pan == "hide") {
						self.panBoxHide();
					}					 
				});
			},
			insertPan : function() {
				var self = this;
				self.$panFileBox.find("#pan-file-box-inner").panDrag({dragArea : ".pan-drag-area"});
				$("#secContent").append(self.$panFileBox);
				self.$attachBox.append(self.$attachFromPan);
			},
			//隐藏网盘区
			panBoxHide : function() {
				var self = this;
				self.$panIframe.fadeOut("quick");
			}
		});
		var pan163 = new panAdd163();
	}

	if(currentHost.search('qq.com') !== -1){
		var panAddqq = function(){	
			this.$attachFromPan = $('<span class="compose_toolbtn" onmousedown="return false;" title="从“搜狐企业网盘”添加附件"><a class="compose_toolbtn_text ico_att" hidefocus="" href="javascript:;">从“搜狐企业网盘”添加附件</a></span>');
			this.$panFileBox = $('<div id="pan-file-box"><div id="pan-file-box-inner"><div class="pan-drag-area"><span class="pan-close"></span></div></div></div>');	
			this.initialize();
		}
		$.extend(panAddqq.prototype, panAdd.prototype,{
			initialize : function() {
				var self = this;
				self.listenDOMInsert();
			},
			listenDOMInsert : function() {
				var self = this;
				if($('#composecontainer')[0]){
					self.$current = $('#composecontainer');
					self.$attachBox = $('#composecontainer');
					//点击添加按钮显示
					self.$attachFromPan.on("click", function(e) {
						e.preventDefault();
						//开始消息监听
						self.listenMsg();
						//检查登录状况
						self.checkLogin({
							success : function() {
								var panUrl = chrome.extension.getURL("pan.html");
								//第一次加载
								// if(!self.$panIframe) {
								// 	$panIframe = self.$panIframe = $('<iframe id="pan-iframe"></iframe>');
								// 	$panIframe.attr("src", panUrl);
								// 	self.$panFileBox.find("#pan-file-box-inner").append($panIframe);
								// }
								// else {
								// 	self.$panIframe.fadeIn("quick");	
								// }	

								if(self.$panIframe){
									self.$panIframe.remove();
									self.$panIframe === null;
								}

								$panIframe = self.$panIframe = $('<iframe id="pan-iframe"></iframe>');
								$panIframe.attr("src", panUrl);
								self.$panFileBox.find("#pan-file-box-inner").append($panIframe);
							},
							error : self.popLogin
						});												
					});

					//添加关闭按钮事件
					self.$panFileBox.on("click", ".pan-close", $.proxy(self.panBoxHide, self));

					//监听内容同时添加
					self.addContent();

					//将相关组件加载进页面
					self.insertPan();	
				}

			},
			addContent : function() {
				var self = this;
				self.$current.on("addPan", function(e, content){
					//检查编辑器是否在借点中（如果发信可能会消失）
					var mailEditor = $($(".qmEditorIfrmEditArea")[0].contentDocument.body);
					if(mailEditor.html() == "") {
						delete self.contentContainer;
					}

					if(!self.contentContainer || self.contentContainer.parent().length < 1) {
						self.contentContainer = $('<table id="panMailAttach" width="100%" style="border:1px solid #d3d3d3;background-color:#F8F8F8"><tr><td style="border-bottom:1px solid #d3d3d3;"colspan="3"height="42"><img style="margin-left:15px"src="http://a2.itc.cn/sceapp/6/sohupan/img/edm/title.png"><span style="font-size:18px;color:#4e4e4e;">&nbsp;&nbsp;搜狐企业网盘附件</span></td></tr><tr height="20"></tr></table>')
						
						mailEditor.append(self.contentContainer);
					}
					
					var contentWrapTmp = $('<table>');
					contentWrapTmp.html(content);
					var ids = [];
					self.contentContainer.find('tr').each(function(){
						if($(this).attr('id'))
							ids.push('#' + $(this).attr('id'));
					})
					
					contentWrapTmp.find(ids.join(',')).each(function(){
						var id = $(this).attr('id');
						$(this).next().remove();
						self.contentContainer.find('#' + id).replaceWith($(this));
					})

					self.contentContainer.append(contentWrapTmp.html());					
				});
			},
			listenMsg : function() {
				var self = this,
					port = self.port = chrome.extension.connect({name : "page"});
				port.onMessage.addListener(function(msg) {
					if(msg.pan == "add") {
						self.$current.trigger("addPan", msg.content);
						self.panBoxHide();
					}else if(msg.pan == "hide") {
						self.panBoxHide();
					}					 
				});
			},
			insertPan : function() {
				var self = this;
				self.$panFileBox.find("#pan-file-box-inner").panDrag({dragArea : ".pan-drag-area"});
				$(document.body).append(self.$panFileBox);
				self.$attachBox.append(self.$attachFromPan);
			},
			//隐藏网盘区
			panBoxHide : function() {
				var self = this;
				self.$panIframe.fadeOut("quick");
			}
		})
		var panqq = new panAddqq();
	}

	
})(jQuery, window);