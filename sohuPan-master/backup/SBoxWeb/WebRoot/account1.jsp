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
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="0" />
		</jsp:include>
    	<div id="accountContent">
    	<form action="AccountManage!modifyaccount.action" method="post">
    		<div class="account-content">
    			<div class="tabs">
    				<ul>
    					<li><a href="/account" class="selected"><span>帐号信息</span></a></li>
    				</ul>
    			</div>
    			<div class="account-info">
    				<h3><span class="icon icon-account"></span>帐号信息</h3>
    				<div class="field">
    					<div class="label">邮箱：</div>
    					<div class="ipt">
    						<s:property value="userPro.email" />
    					</div>
    				</div>
    				<div class="field">
    					<div class="label">用户名：</div>
    					<div class="ipt">
    						<input name="nickName" autocomplete="off" type="text" class="ipt-text" value="<s:property value="userPro.nickName" />"/>
    					</div>
    				</div>
    				<h3><span class="icon icon-passlock"></span>修改密码</h3>
    				<div class="field">
    					<div class="label">旧密码：</div>
    					<div class="ipt">
    						<input name="oldPassword" autocomplete="off" type="password" class="ipt-text" onpaste="return false;" />
    					</div>
                        <div class="tips">不修改密码请保持为空</div>
    				</div>
    				<div class="field">
    					<div class="label">新密码：</div>
    					<div class="ipt">
    						<input name="newPassword" autocomplete="off" type="password" class="ipt-text" onpaste="return false;" />
    					</div>
    				</div>
    				<div class="field">
    					<div class="label">确认密码：</div>
    					<div class="ipt">
    						<input name="idePassword" autocomplete="off" type="password" class="ipt-text" onpaste="return false;" />
    					</div>
    				</div>
    				<div class="field">
    					<div class="label"></div>
    					<div class="ipt">
    						<input type="submit" class="btn btn24 btn24-blue" value="保存" />
    						<span class="<s:property value="isSuccess" />"><s:property value="errorMessage" /></span>
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
