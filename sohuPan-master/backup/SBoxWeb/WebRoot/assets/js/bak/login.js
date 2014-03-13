/**
 * @fileOverview 登录页面使用
 * @author angelscat@vip.qq.com
 */

jQuery(function(){ // 登录页面
	if(!document.getElementById('loginMain')) return;

	function resize(){

		var loginMain = $('#loginMain'),
			mainHeight = loginMain.height(),
			winHeight = $(window).height();

		if(winHeight < 550){
			$(document.body).height(550);
			winHeight = 550;
		}else{
			$(document.body).height('100%');
		}
		if(winHeight > mainHeight){
			loginMain.css({
				top:(winHeight - mainHeight - 50 ) / 2
			})
		}else{
			loginMain.css({
				top:0
			})
		}
	}

	$(window).on('resize',resize);
	setTimeout(function(){
		resize();
	},20)


	var loginError = $('#loginError'),
		loginName = $('#loginName'),
		loginPassword = $('#loginPassword'),
		loginCode = $('#loginCode'),
		loginSubmit = $('#loginSubmit'),
		loginForm = $('#loginForm');

	if($.trim(loginName.val()) === ''){
		loginName.focus();
	}else if(loginPassword.val() === ''){
		loginPassword.focus();
	}
	setInterval(function(){
		loginName.trigger('keyup')
		loginPassword.trigger('keyup')
	},200)
	
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
		}
		else if(loginCode[0] && $.trim(loginCode.val()) === ''){
			loginError.text('请输入验证码').css('visibility','visible');
			loginCode.focus();
			return false;
		}else{
			loginError.css('visibility','hidden');
		}

		loginName.val($.trim(loginName.val()));

		loginSubmit.attr('disabled',true).addClass('submit-btn-disabled');
	})

	loginName.on('keyup',function(){
		if(loginName.val() !== ''){
			loginName.parent().prev().hide();
		}else{
			loginName.parent().prev().show();
		}
	}).on('focus',function(){
		if(loginName.val() !== ''){
			loginName.parent().prev().hide();
		}else{
			loginName.parent().prev().show();
		}
	}).on('blur',function(){
		if(loginName.val() !== ''){
			loginName.parent().prev().hide();
		}else{
			loginName.parent().prev().show();
		}
	})

	loginPassword.on('keyup',function(){
		if(loginPassword.val() !== ''){
			loginPassword.parent().prev().hide();
		}else{
			loginPassword.parent().prev().show();
		}
	})
});
