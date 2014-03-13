/**
 * @fileOverview 帐号相关页面使用，包括登录、注册、修改帐号信息密码 etc.
 * @author angelscat@vip.qq.com
 */

jQuery(function(){ // 登录页面
	if(!document.getElementById('loginModule')) return;

	var loginModule = $('#loginModule'),
		loginError = $('#loginError'),
		loginName = $('#loginName'),
		loginPassword = $('#loginPassword'),
		loginCode = $('#loginCode'),
		loginSubmit = $('#loginSubmit'),
		loginForm = $('#loginForm');

	Sbox.placeholder(loginName);
	if($.trim(loginName.val()) === '' || loginName.val() === loginName.attr('placeholder')){
		loginName.focus();
	}else if(loginPassword.val() === ''){
		loginPassword.focus();
	}
	
	loginForm.on("submit",function(){
		if($.trim(loginName.val()) === '' || loginName.val() === loginName.attr('placeholder')){
			loginError.text('请输入登录邮箱地址').css('visibility','visible');
			loginName.focus();
			return false;
		}else if(!mailReg.test($.trim(loginName.val()))){
			loginError.text('请输入正确的邮箱地址').css('visibility','visible');
			loginName.focus();
			return false;
		}else if($.trim(loginPassword.val()) === ''){
			loginError.text('请输入密码').css('visibility','visible');
			loginPassword.focus();
			return false;
		}else{
			loginError.css('visibility','hidden');
		}
		// else if($.trim(loginCode.val()) === ''){
		// 	loginError.text('请输入验证码').show();
		// 	loginCode.focus();
		// 	return false;
		// }

		loginName.val($.trim(loginName.val()));

		loginSubmit.attr('disabled',true).addClass('btn-disabled');
	})
});

jQuery(function(){ //注册页面
	if(!document.getElementById('regModule')) return;

	$(".form-field .tips .error,.form-field .tips .icon-wrong,.form-field .tips .icon-right").hide();
	var ipts = $(".reg-info input");
		formStatus = false;
	//注册表单的判定
	ipts.blur(function (){
		var _this = $(this),
			_id = _this.attr("id"),
			_value = _this.val();
		var _tips = _this.parent().parent().find(".tips"),
			_tip = _tips.children(".tip"),
			_error = _tips.children(".error,.icon-wrong"),
			_errorMsg = _error.filter(".error");
			_right = _tips.children(".ok,.icon-right");
			_rightMsg = _right.filter(".ok");

		//使用id来鉴别不同区域的判定
		switch (_id) {
			case ("reg-mail") :
				if (!mailReg.test(_value)){
					showError("请输入正确的邮箱地址");
				}
				else {
					showRight();
				}
				break;
			case ("reg-password") :
				if (_value.length <6 || _value.length > 16) {
					showError("请输入6-16位字符");
				}
				else {
					showRight();
				}
				break;
			case ("reg-password2") :
				var lastValue = $("#reg-password").val();
				if (_value != lastValue) {
					showError("两次输入不一致");
				}
				else {
					if (_value.length <6 || _value.length > 16) {
						showError("请输入6-12位字符");
					}
					else {
						showRight();
					}    						
				}
				break;
			// case ("reg-phone") :
			// 	if($.trim(_value) !== '' && !/(^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/.test(_value)){
			// 		showError('请输入正确的电话号码');
			// 	}else{
			// 		showRight();
			// 	}
			// 	break;
			case ('company') :
				if($.trim(_value) === ''){
					showError('请输入企业名称');
				}else{
					showRight();
				}
				break;
			case ('contact') : 
				if($.trim(_value) === ''){
					showError('请输入联系人');
				}else{
					showRight();
				}
				break;
			case ('reg-telephone') :
				if($.trim(_value) === ''){
					showError('请输入有效的联系方式');
				}
				else if(!/(^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$)|(^((\(\d{3}\))|(\d{3}\-))?(1[358]\d{9})$)/.test(_value)){
					showError('请输入正确的电话号码');
				}else{
					showRight();
				}
				break;
			case ('validateCode') : 
				if($.trim(_value) === ''){
					showError('请输入验证码');
				}else{
					_tips.find('.error,.icon-wrong,.icon-right').hide();
				}
				break;
		}

		//显示错误状态
		function showError(msg) {
			formStatus = false;
			msg = msg?msg:"错误";
			_tip.hide();
			_right.hide();
			_errorMsg.text(msg);
			_error.show();
		}

		//显示正确状态
		function showRight(msg) {
			msg = msg?msg:"&nbsp;";
			_tip.hide();    				
			_error.hide();
			_rightMsg.html(msg); //需要把&nbsp转义，所以只能用html方法
			_right.show();
		}

		function clearTips(){
			$(".form-field .tips .error,.form-field .tips .icon-wrong,.form-field .tips .icon-right").hide();
		}
	});

	//提交时监测相关事件
	$("#reg-submit").click(function (e){
		formStatus = true;
		ipts.trigger("blur");
		if (!formStatus){
			return false;
		}
		$("#reg-submit").addClass('btn-disabled');
	});
});

jQuery(function(){ //重置密码
	if(!document.getElementById('resetModule')) return;
	if(!document.getElementById('reset-mail')) return;

	var resetForm = $('#resetModule form'),
        resetMail = $('#reset-mail'),
        mailTip = resetMail.parent().next();
    resetForm.on('submit',function(){
        if(!mailReg.test($.trim(resetMail.val()))){
            mailTip.html('<span class="error">请输入正确的邮箱地址</span>')
            return false;
        }
    })
    resetMail.on('focus',function(){
    	mailTip.empty();
    })
});

jQuery(function(){ //重置密码修改
	if(!document.getElementById('resetModule')) return;
	if(!document.getElementById('reset-password')) return;

    var resetForm = $('#resetModule form'),
        resetPassword = $('#reset-password'),
        resetPassword2 = $('#reset-password2'),
        passwordStrength = $('#passwordStrength'),
        tip1 = resetPassword.parent().next(),
        tip2 = resetPassword2.parent().next();

    var flag = true;

    resetPassword.on('blur',function(){
    	val = resetPassword.val()
    	if(val.length > 16 || val.length < 6){
			tip1.html('<span class="error">请输入6-16位密码</span>');
			flag = false;
		}else{
			tip1.empty();
		}
		if(val !== '' && val === resetPassword2.val()){
			tip2.empty();
		}
    }).on('focus',function(){
    	tip1.empty();
    }).on('keyup',function(){
        var newPassVal = resetPassword.val(),
            i = 0;
        if(newPassVal.match(/[0-9]/g)){
            i++
        }
        if(newPassVal.match(/[a-z]/g)){
            i++
        }
        if(newPassVal.match(/[A-Z]/g)){
            i++
        }
        if(newPassVal.match(/[^0-9a-zA-Z]/g)){
            i++
        }
        if(newPassVal.length < 6 || i <= 1){
            passwordStrength.html('<span class="cur">弱</span><span>&nbsp;</span><span>&nbsp;</span>')
        }else if(i === 2){
            passwordStrength.html('<span class="cur">&nbsp;</span><span class="cur">中</span><span>&nbsp;</span>')
        }else if(i >= 3){
            passwordStrength.html('<span class="cur">&nbsp;</span><span class="cur">&nbsp;</span><span class="cur">强</span>')
        }
    })

    resetPassword2.on('blur',function(){
		if(resetPassword.val() !== resetPassword2.val()){
			tip2.html('<span class="error">两次输入密码不一致</span>');
			flag = false;
		}else{
			tip2.empty();
		}
	}).on('focus',function(){
		tip2.empty();
	})

    resetForm.on('submit',function(){
    	flag = true;
    	resetPassword.trigger('blur');
    	resetPassword2.trigger('blur');

    	return flag;
    })
});
