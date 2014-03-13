<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
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
        <link rel="stylesheet" rev="stylesheet" href="../<%=CDNTools.CDN_URL %>/css/account.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 用户信息</title>
    </head>
    <body class="account">
    	<div id="header" class="clearfix">
    		<h1 class="logo" id="logo">
    			<a href="#"><img src="<%=CDNTools.CDN_URL %>/img/logo-v3.png" /></a>
    		</h1>
    		<ul class="nav">
    			<li><a href="#" class="on">文件管理</a></li>
    			<li class="sep"></li>
    			<li><a href="#">用户管理</a></li>
    			<li class="sep"></li>
    			<li><a href="#">日志管理</a></li>
    			<li class="sep"></li>
    			<li><a href="#">下载中心</a></li>
    		</ul>
    		<div class="userinfo clearfix">
    			<div class="usermanage">
    				<a class="username" href="#">管理员 <span class="more"></span></a>
    				<ul class="dropdown moreinfo" style="display:none;">
    					<li><a href="#">企业信息</a></li>
    					<li><a href="#">账户信息</a></li>
    					<li><a href="#">退出</a></li>
    				</ul>
    			</div>
    			<div class="sizeinfo">
    				<span>123.30MB / 5.00GB</span>
    			</div>
    		</div>
    	</div>
    	<div id="accountContent">
    	<form action="/account" method="post">
    		<div class="account-content">
    			<div class="tabs">
    				<ul>
    					<li><a href="#"><span>企业信息</span></a></li>
    					<li><a href="#" class="selected"><span>帐号信息</span></a></li>
    				</ul>
    			</div>
    			<div class="account-info">
    				<h3><span class="icon icon-account"></span>账户信息</h3>
    				<div class="field">
    					<div class="label">邮箱：</div>
    					<div class="ipt">
    						
    						<font color=red><s:property value="email" /></font>
    					</div>
    				</div>
    				<div class="field">
    					<div class="label">用户名：</div>
    					<div class="ipt">
    						<input name="username" type="text" class="ipt-text" />
    					</div>
    				</div>
    				<h3><span class="icon icon-passlock"></span>修改密码</h3>
    				<div class="field">
    					<div class="label">旧密码：</div>
    					<div class="ipt">
    						<input name="oldpassword" type="password" class="ipt-text" />
    					</div>
    				</div>
    				<div class="field">
    					<div class="label">新密码：</div>
    					<div class="ipt">
    						<input name="newpassword" type="password" class="ipt-text" />
    					</div>
    				</div>
    				<div class="field">
    					<div class="label">确认密码：</div>
    					<div class="ipt">
    						<input name="identifypassword" type="password" class="ipt-text" />
    					</div>
    				</div>
    				<div class="field">
    					<div class="label"></div>
    					<div class="ipt">
    						<input type="submit" class="btn btn24 btn24-gray" />
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
