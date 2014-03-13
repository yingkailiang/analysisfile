/*ini();

function ini() {
	checkLogin();
	listenToken();
}*/
//监听页面中post来的请求
function listenContent() {
	this.initialize();
}

$.extend(listenContent.prototype, {
	initialize : function() {
		this.listenPort();
	},
	listenPort : function() {
		var self = this;
		sogouExplorer.extension.onConnect.addListener(function(port) {
			//console.log(port);
			//此时是页面contentScript发来的消息
			if(port.name == "page") {
				self.pagePort = port;
				self.pagePort.onMessage.addListener($.proxy(self.listenPage, self));
			}
			//此时是iframe中pan.html发来的消息
			else if(port.name == "pan"){
				self.panPort = port;
				self.panPort.onMessage.addListener($.proxy(self.listenPan, self));
			}else if(port.name == 'ajax'){
				self.ajaxPort = port;
				self.ajaxPort.onMessage.addListener($.proxy(self.listenAjax,self));
			}else if(port.name == 'win'){
				self.winPort = port;
			}
			if(port.name == 'loadjs'){
				sogouExplorer.tabs.executeScript(null, {
					"file": "js/base.js",
					"allFrames": true
				});
				sogouExplorer.tabs.executeScript(null, {
					"file": "js/config.js",
					"allFrames": true
				});
				sogouExplorer.tabs.executeScript(null, {
					"file": "js/ui/drag.js",
					"allFrames": true
				});
				sogouExplorer.tabs.executeScript(null, {
					"file": "js/insertedJs/site.js",
					"allFrames": true
				});
				sogouExplorer.tabs.executeScript(null, {
					"file": "js/insertedJs/pan.js",
					"allFrames": true
				});
			}
		});
	},
	listenPage : function(msg) {
		if(msg.page == "checkLogin") {			
			var self = this;
			panBg.checkLogin({
				success : function() {
					self.pagePort.postMessage({checkLogin : "success"})
				},
				error : function() {
					panBg.popLogin();
					//self.pagePort.postMessage({checkLogin : "error"})
				}
			});
		}		
	},
	listenPan : function(msg) {
		var self = this;
		//隐藏网盘
		if(msg.pan == "hide") {
			self.pagePort.postMessage({pan : "hide"});
		}
		//登录
		else if(msg.pan == "login") {
			self.pagePort.postMessage({pan : "hide"});			
			panBg.popLogin();
		}
		//添加内容到页面
		else if(msg.pan == "add") {
			self.pagePort.postMessage(msg);
		}
		//获取外链
		else if(msg.pan == 'link'){
			$.ajax({
				url : panApi.getOutlink,
				type : "get",
				dataType : "json",
				data : {ids : msg.ids.join(",")},
				success : function(res,status){
					self.panPort.postMessage({
						type:'success',
						res:res,
						status:status
					});
				},
				error : function(xhr,errorMsg){
					self.panPort.postMessage({
						type:'fail',
						errorMsg:errorMsg
					})
				}
			});
		}
	},
	listenAjax:function(msg){
		var self = this;
		if(msg.type == 'list'){
		$.ajax({
			url : panApi.getFileList,
			type : "get",
			cache : false,
			dataType : "json",
			data : {id : msg.id},
			success : function(res,status){
				self.ajaxPort.postMessage({
					type:'success',
					res:res,
					status:status
				});
			},
			error : function(xhr,errorMsg){
				self.ajaxPort.postMessage({
					type:'fail',
					errorMsg:errorMsg
				});
			}
		});
		}
	}
});

function panBackground() {
	this.initialize();
}

$.extend(panBackground.prototype, {
	initialize : function() {
		var self = this;
		self.msgListen = new listenContent();
		//默认登出
		localStorage.removeItem("token");
		self.checkLogin({
			success : self.loginSuccess,
			error : self.loginError
		});
		self.listenToken();
	},
	//监听token改变
	listenToken : function() {
		var self = this;
		top.onstorage = function(e) {
			if (e.key == "token"){
				self.checkLogin({
					success : self.loginSuccess,
					error : self.loginError
				});		
			}
		}
	},
	checkLogin : function(options) {
		var self = this,
			loginStatus = !!localStorage["token"];
		if(loginStatus) {
			sogouExplorer.browserAction.setIcon({path : "images/logo/19.png"});
			options.success();
		}
		else {
			sogouExplorer.browserAction.setIcon({path : "images/logo/19_2.png"});
			options.error();
		}
	},
	//保持登录状态
	keepLogin : function() {
		$.ajax({
			url : panApi.keepLogin,
			type : "post",
			dataType : "json",
		});
	},
	loginSuccess : function() {
		sogouExplorer.browserAction.setPopup({popup : "popup.html",width:180,height:110});
	},
	loginError : function() {
		sogouExplorer.browserAction.setPopup({popup : "login.html",width:400,height:280});
	},
	popLogin : function() {		
		var self = this,
			winData = {
				width : 440,
				height : 320,			
				focused : true
			};
		winData.left = parseInt((screen.availWidth - winData.width)/2);
		winData.top = parseInt((screen.availHeight - winData.height)/2);

		if(!self.popWin) {
			winData.url = "login.html";
			winData.type = "popup";
			sogouExplorer.windows.create(winData, function(win) {
				self.popWin = win.id;
				setTimeout(function(){
					if(self.msgListen.winPort){
						self.msgListen.winPort.onDisconnect.addListener($.proxy(self.listenPopClose, self));
					}
				},500);
				//sogouExplorer.windows.onRemoved.addListener($.proxy(self.listenPopClose, self));
			});			
		}
		else {
			sogouExplorer.windows.update(self.popWin, winData, function(win) {
				
			});	
		}
	},
	//监听弹出框关闭
	listenPopClose : function(winId) {
		var self = this;

		delete self.popWin;
		self.checkLogin({
			success : function() {
				if(self.msgListen.pagePort){
					self.msgListen.pagePort.postMessage({checkLogin : "success"})
				}
			},
			error : function() {
				
			}
		})
		// if(winId == self.popWin) {

		// 	//sogouExplorer.windows.onRemoved.removeListener(self.listenPopClose);
		// }
	}
});

var panBg = new panBackground();
