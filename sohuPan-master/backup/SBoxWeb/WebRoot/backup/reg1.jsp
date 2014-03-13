<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>
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
        
        <title>搜狐企业网盘 - 注册</title>
    </head>
    <body class="account">
    	
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
    	<div id="regContentWrap">
    	<form action="/Register!register.action">
    		<div class="reg-content">
    			<h2>激活帐号</h2>
    			<div class="steps step1">填写帐号信息</div>
    			<div class="reg-info">
	    			<div class="form-field">
	    				<div class="label">登录邮箱：</div>
	    				<div class="ipt">
	    					<input name="loginName" type="text" class="input-txt" />
	    				</div>
	    				<div class="tips">
	    					该邮箱用于接收激活邮件，请填写务必真实有效！<span class="icon icon-right"></span><s:property value="message"/><span class="icon icon-wrong"></span>
	    				</div>
	    			</div>
	    			<div class="form-field">
	    				<div class="label">密码：</div>
	    				<div class="ipt">
	    					<input name="password" type="password" class="input-txt" />
	    				</div>
	    				<div class="tips">
	    					6-12位字符，推荐使用组合密码！
	    				</div>
	    			</div>
	    			<div class="form-field confirm-pass">
	    				<div class="label">确认密码：</div>
	    				<div class="ipt">
	    					<input type="password" class="input-txt" />
	    				</div>
	    				<div class="tips">
	    					请再次输入密码！
	    				</div>
	    			</div>
	    			<div class="form-field">
	    				<div class="label">企业名称：</div>
	    				<div class="ipt">
	    					<input name="company" type="text" class="input-txt" />
	    				</div>
	    				<div class="tips">
	    					企业名称务必真实有效！
	    				</div>
	    			</div>
	    			<div class="form-field">
	    				<div class="label">联系人：</div>
	    				<div class="ipt">
	    					<input name="realName" type="text" class="input-txt" />
	    				</div>
	    				<div class="tips">
	    					联系人务必真实有效！
	    				</div>
	    			</div>
	    			<div class="form-field">
	    				<div class="label">固定电话：</div>
	    				<div class="ipt">
	    					<input name="phoneNum" type="text" class="input-txt" />
	    				</div>
	    			</div>
	    			<div class="form-field">
	    				<div class="label">移动电话：</div>
	    				<div class="ipt">
	    					<input name="phoneNum" type="text" class="input-txt" />
	    				</div>
	    			</div>
    				<div class="form-field validate">
    					<div class="label">验证码：</div>
    					<div class="ipt">
    						<input type="text" class="input-txt" />
    					</div>
    					<div class="code">
    						<img src="#" />
    						<a href="#">换一张</a>
    					</div>
    				</div>
    				<div class="read">
    					<p><a href="#">请阅读《搜狐企业网盘服务协议》</a></p>
    				</div>
    				<div class="form-field reg-btn">
    					<div class="label"></div>
	    				<div class="ipt">
	    					<input type="submit" value="同意协议并注册" class="btn btn-lightgreen" />
	    					已有帐号，<a href="#">立即登陆</a>
	    				</div>
    				</div>
    			</div>
    		</div>
    		</form>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>
