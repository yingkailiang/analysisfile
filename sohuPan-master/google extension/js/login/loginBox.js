function loginViaSohu(options) {
	this.loginStatus = true;
	this.$el = $(options.el);
}

$.extend(loginViaSohu.prototype , {
	$ : function(el) {
		return this.$el.find(el);
	},

	initialize : function() {
		var self = this;
		self.event();
	},
	//初始相关事件
	event : function() {
		var self = this;

		$(document.body).on("contextmenu", function(e) {
			e.preventDefault();
		});
		
		self.$("#pan-sohu-login").on("click", function() {				
			self.loginSohu();
		});

		self.$el.on("keydown", function(e) {
			if(e.keyCode == "13") {
				self.$("#pan-sohu-login").trigger("click");
			}
		});
	},
	//登录搜狐
	loginSohu : function() {
		var self = this,
			username, password, options;

		self.checkInput();
		if(!self.loginStatus) {
			return;
		}
		self.loginIng();
		username = self.$("#userid").val();
		password = self.$("#password").val();

		options = {
			username : username,
			password : password,
			success : $.proxy(self.loginSuccess, self),
			error : $.proxy(self.loginError, self)
		};

		sohuPan.loginPan(options);
	},
	//正在登录
	loginIng : function() {
		var self = this;
		self.$(".login-btn-disabled").show();
	},
	//登录结束
	loginEnd : function() {
		var self = this;
		self.$(".login-btn-disabled").hide();
	},
	//登录成功
	loginSuccess : function(res) {
		var self = this,
			token;
		if(res) {
			//如果返回的状态码是200，说明登录成功
			if(res.code == 200) {
				/*token = {
					accessId: res.user.accessId,
					domain: res.user.domain,
					secretToken: res.user.secretToken
				};*/
				chrome.cookies.get({url: "http://pan.sohu.net", name: "JSESSIONID"}, function(cookie) {
					var token = cookie.value;
					localStorage["token"] = token;
					window.close();
				});
				//localStorage["token"] = JSON.stringify(token);				
			}
			else {
				self.handleErrorCode(res);
			}
		}
		self.loginEnd();
	},
	//登录失败
	loginError : function(res) {
		var self = this;
		if(res) {
			self.handleErrorCode(res);
		}
		else {
			self.showMsg("error", "登录失败");
		}
		self.loginEnd();
	},
	//处理错误代码
	handleErrorCode : function(xhr) {
		var self = this,
			res = $.parseJSON(xhr.responseText);
		if(res) {
			if(res.code == 403) {
			self.showMsg("error", "帐号和密码不匹配");	
			}
			else if(res.code == 500) {
				self.showMsg("error", "登录失败");
			}
		}
		else {
			self.showMsg("error", "登录失败");
		}
		self.loginEnd();		
	},

	//检查输入状况
	checkInput : function() {
		var self = this,
			needCheck = true;
		self.$(".kan-ipt").on("focus", function(e) {
			
		});

		self.$(".kan-ipt").each(function(i, ele) {
			//用needCheck控制循环
			if(needCheck) {
				var $ipt = $(ele),
					$id = $ipt.attr("id"),
					$val = $ipt.val();
				if($id == "userid") {
					//输入登录邮箱地址
					if($val == "") {
						self.showMsg("error", "请输入登录邮箱地址");
						needCheck = false;
						self.loginStatus = false;
						return;
					}

					//邮箱地址不正确
					if(!self.checkMail($val)) {
						self.showMsg("error", "请输入正确的邮箱地址");
						needCheck = false;
						self.loginStatus = false;
						return;
					}
				}
				else if($id == "password") {
					//请输入密码
					if($val == "") {
						self.showMsg("error", "请输入密码");
						needCheck = false;
						self.loginStatus = false;
						return;
					}
				}				
				self.loginStatus = true;								
			}				
		});

		//如果上面的判断都通过了，说明输入没有问题
		if(self.loginStatus) {			
			self.$(".pan-msg-box").html("");
		}
	},

	//判断是否是邮箱
	checkMail : function(m) {
		var m = m.split("@");
		//此时没有@
		if(m.length != 2) {
			return false;
		}
		else {
			//此时@后面的不是正确的域名
			if(m[1].split(".").length < 2) {
				return false;
			}
		}		
		return true;
	},

	//显示消息
	showMsg : function(type, msgText) {
		var self = this,
			$msgBox = self.$(".pan-msg-box"),
			errorMsg;
		if(type == "error") {
			errorMsg = $("<div class='msg'></div>");
			errorMsg.text(msgText);
			$msgBox.html(errorMsg);
		}
	}
});

var loginView = new loginViaSohu({el : "#pan-body"});
loginView.initialize();