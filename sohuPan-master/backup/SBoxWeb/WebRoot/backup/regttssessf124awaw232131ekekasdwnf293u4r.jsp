<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %>

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/account.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/account.js?$ver"></script>
        <title>搜狐企业网盘 - 注册</title>
    </head>
    <body class="account">
        
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
    	<div id="regContentWrap">
    		<div class="reg-content" id="regModule">
                <form id="regSbox" action="/Register!register.action" method="post">
        			<h2>注册帐号</h2>
        			<div class="steps step1">填写帐号信息</div>
        			<div class="reg-info">
                        <p class="reg-error"><span class="error"><s:property value="message"/></span></p>
    	    			<div class="form-field">
    	    				<div class="label">登录邮箱：</div>
    	    				<div class="ipt">
    	    					<input id="reg-mail" name="username" type="text" class="input-txt" />
    	    				</div>
    	    				<div class="tips">
    	    					<span class="tip">该邮箱用于接收激活邮件，请填写务必真实有效！</span>
    	    					<span class="icon icon-wrong"></span>
    	    					<span class="error">错误</span>
    	    					<span class="icon icon-right"></span>
    	    					<span class="ok"></span>
    	    				</div>
    	    			</div>
    	    			<div class="form-field">
    	    				<div class="label">密码：</div>
    	    				<div class="ipt">
    	    					<input id="reg-password" name="password" type="password" class="input-txt" onpaste="return false;"  />
    	    				</div>
    	    				<div class="tips">
    	    					<span class="tip">6-12位字符，推荐使用组合密码！</span>
    	    					<span class="icon icon-wrong"></span>
    	    					<span class="error">错误</span>
    	    					<span class="icon icon-right"></span>
    	    					<span class="ok"></span>
    	    				</div>
    	    			</div>
    	    			<div class="form-field confirm-pass">
    	    				<div class="label">确认密码：</div>
    	    				<div class="ipt">
    	    					<input id="reg-password2" name="repassword" type="password" class="input-txt" onpaste="return false;" />
    	    				</div>
    	    				<div class="tips">
    	    					<span class="tip">请再次输入密码！</span>
    	    					<span class="icon icon-wrong"></span>
    	    					<span class="error">错误</span>
    	    					<span class="icon icon-right"></span>
    	    					<span class="ok"></span>
    	    				</div>
    	    			</div>
    	    			<div class="form-field">
    	    				<div class="label">企业名称：</div>
    	    				<div class="ipt">
    	    					<input name="company" type="text" class="input-txt" id="company" />
    	    				</div>
                            <div class="tips">
                                <span class="tip">企业名称务必真实有效！</span>
                                <span class="icon icon-wrong"></span>
                                <span class="error"></span>
                                <span class="icon icon-right"></span>
                                <span class="ok"></span>
                            </div>
    	    			</div>
    	    			<div class="form-field">
    	    				<div class="label">联系人：</div>
    	    				<div class="ipt">
    	    					<input name="contact" type="text" class="input-txt" id="contact" />
    	    				</div>
                            <div class="tips">
                                <span class="tip">联系人务必真实有效！</span>
                                <span class="icon icon-wrong"></span>
                                <span class="error"></span>
                                <span class="icon icon-right"></span>
                                <span class="ok"></span>
                            </div>
    	    			</div>
    	    			<div class="form-field">
    	    				<div class="label">联系电话：</div>
    	    				<div class="ipt">
    	    					<input id="reg-telephone" type="text" class="input-txt" />
    	    				</div>
                            <div class="tips">
                                <span class="tip">请填写真实的联系电话！</span>
                                <span class="icon icon-wrong"></span>
                                <span class="error"></span>
                                <span class="icon icon-right"></span>
                                <span class="ok"></span>
                            </div>
    	    			</div>
        				<div class="form-field validate">
        					<div class="label">验证码：</div>
        					<div class="ipt">
        						<input name ="validateCode" id="validateCode" type="text" class="input-txt" />
        					</div>
        					<div class="code">
        						<img align="middle" style="width:60px" alt="点击刷新验证码" id="validateCodeImg" src="/GetCode.action?<%=Math.random() %>" onClick="document.getElementById('validateCodeImg').src='/GetCode.action?'+Math.random();">
        						<a href="javasccript:;" onclick="document.getElementById('validateCodeImg').src='/GetCode.action?'+Math.random(); return false;">换一张</a>
        					</div>
                            <div class="tips">
                                <span class="tip"></span>
                                <span class="icon icon-wrong"></span>
                                <span class="error"></span>
                                <span class="icon icon-right"></span>
                                <span class="ok"></span>
                            </div>
        				</div>
        				<div class="read">
        					<p><a href="/agreement.jsp" target="_blank">请阅读《搜狐企业网盘服务协议》</a></p>
        				</div>
        				<div class="form-field reg-btn">
        					<div class="label"></div>
    	    				<div class="ipt">
    	    					<input id="reg-submit" type="submit" value="同意协议并注册" class="btn btn-lightgreen" />
    	    					已有帐号，<a href="login2.jsp">立即登录</a>
    	    				</div>
        				</div>
    			    </div>
                </form>
    		</div>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>
