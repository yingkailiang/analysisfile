<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html >
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/account.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 用户信息</title>
    </head>
    <body class="account">
        <s:if test="errorMessage!=null">
        <span class="message-area">
            <span class="<s:property value="isSuccess" />"><i class="icon"></i> <s:property value="errorMessage" /></span>
        </span>
        </s:if>
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="4" />
		</jsp:include>
    	<div id="accountContent">
    	<form action="AccountManage!modifyPassword.action" method="post">
    		<div class="account-content">
    			<div class="tabs">
    				<ul>
    					<li><a href="/account"><span>帐号信息</span></a></li>
                        <li><a href="javascript:;" class="selected"><span>修改密码</span></a></li>
                        <li><a href="/user/update"><span>安全设置</span></a></li>
                        <li><a href="/account/email" ><span>消息设置</span></a></li>
                        <li><a href="/deviceManage" ><span>设备管理</span></a></li>
    				</ul>
    			</div>
    			<div class="account-info">
    				<h3><span class="icon icon-passlock"></span>修改密码</h3>
    				<div class="field">
    					<div class="label">旧密码：</div>
    					<div class="ipt">
    						<input name="oldPassword" id="oldPassword" autocomplete="off" type="password" class="ipt-text" onpaste="return false;" />
    					</div>
                        <div class="tips"></div>
    				</div>
    				<div class="field">
    					<div class="label">新密码：</div>
    					<div class="ipt">
    						<input name="newPassword" id="newPassword" autocomplete="off" type="password" class="ipt-text" onpaste="return false;" />
    					</div>
                        <div class="tips">6-16个字符，建议使用大小写字母、数字和符号的组合密码</div>
    				</div>
                    <div class="field password-strength">
                        <div class="label"> </div>
                        <div class="ipt" id="passwordStrength">
                            <span class="cur">弱</span><span>&nbsp;</span><span>&nbsp;</span>
                        </div>
                    </div>
    				<div class="field">
    					<div class="label">确认密码：</div>
    					<div class="ipt">
    						<input name="idePassword" id="idePassword" autocomplete="off" type="password" class="ipt-text" onpaste="return false;" />
    					</div>
                        <div class="tips"></div>
    				</div>
    				<div class="field">
    					<div class="label"></div>
    					<div class="ipt">
    						<input type="submit" class="btn btn24 btn24-blue" value="保存" />
    					</div>
    				</div>
    			</div>
    		</div>
    		</form>
            <script type="text/javascript">
                jQuery(function(){
                    var fm = $('form'),
                        oldPassword = $('#oldPassword'),
                        newPassword = $('#newPassword'),
                        idePassword = $('#idePassword'),
                        passwordStrength = $('#passwordStrength'),
                        strengthTips = passwordStrength.find('span');
                    var flag = true;

                    oldPassword.on('blur',function(){
                        if(oldPassword .val() ===''){
                            oldPassword.parent().next().html('<span class="error">请输入旧密码</span>');
                            flag = false;
                        }else if(oldPassword.val().length > 16 || oldPassword.val().length < 6){
                            oldPassword.parent().next().html('<span class="error">请输入正确的密码</span>');
                            flag = false;
                        }else{
                            oldPassword.parent().next().empty();
                        }
                    }).on('focus',function(){
                        oldPassword.parent().next().empty();
                    })
                    newPassword.on('blur',function(){
                        if(newPassword.val() ===''){
                            newPassword.parent().next().html('<span class="error">请输入新密码</span>');
                            flag = false;
                        }else if(newPassword.val().length > 16 || newPassword.val().length < 6){
                            newPassword.parent().next().html('<span class="error">请输入6-16位新密码</span>');
                            flag = false;
                        }else{
                            newPassword.parent().next().empty();
                        }
                    }).on('focus',function(){
                        newPassword.parent().next().empty();
                    }).on('keyup',function(){
                        var newPassVal = newPassword.val(),
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
                    idePassword.on('blur',function(){
                        if(idePassword.val() === ''){
                            idePassword.parent().next().html('<span class="error">请确认密码</span>');
                            flag = false;
                        }else if(newPassword.val() !== idePassword.val()){
                            idePassword.parent().next().html('<span class="error">两次密码不一致</span>');
                            flag = false;
                        }else{
                            idePassword.parent().next().empty();
                        }
                    }).on('focus',function(){
                        idePassword.parent().next().empty();
                    })
                    fm.on('submit',function(){
                        flag = true;
                        fm.find('input').trigger('blur');
                        return flag;
                    })

                    if($('.message-area')[0]){
                        setTimeout(function(){
                            $('.message-area').fadeOut();
                        },3000)
                    }
                })
            </script>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>
