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
		chrome.extension.onConnect.addListener(function(port) {
			//此时是页面contentScript发来的消息
			if(port.name == "page") {
				self.pagePort = port;
				self.pagePort.onMessage.addListener($.proxy(self.listenPage, self));
			}
			//此时是iframe中pan.html发来的消息
			else if(port.name == "pan"){
				self.panPort = port;
				self.panPort.onMessage.addListener($.proxy(self.listenPan, self));
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
		window.onstorage = function(e) {
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
			chrome.browserAction.setIcon({path : "images/logo/19.png"});
			options.success();
		}
		else {
			chrome.browserAction.setIcon({path : "images/logo/19_2.png"});
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
		chrome.browserAction.setPopup({popup : "popup.html"});
	},
	loginError : function() {
		chrome.browserAction.setPopup({popup : "login.html"});
	},
	popLogin : function() {		
		var self = this;
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
			chrome.windows.create(winData, function(win) {
				self.popWin = win.id;
				chrome.windows.onRemoved.addListener($.proxy(self.listenPopClose, self));
			});			
		}
		else {
			chrome.windows.update(self.popWin, winData, function(win) {
				
			});	
		}
	},
	//监听弹出框关闭
	listenPopClose : function(winId) {
		var self = this;
		if(winId == self.popWin) {
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
			chrome.windows.onRemoved.removeListener(self.listenPopClose);
		}
	}
});

var panBg = new panBackground();