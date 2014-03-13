<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
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
        <title>搜狐企业网盘 - 激活</title>
    </head>
    <body class="account">
        
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
    	<div id="regContentWrap">
    		<div class="reg-content">
    		<form action="" method="post" name="form1">
    			<h2>激活帐号</h2>
    			<div class="steps step3">激活成功</div>
    			<div class="jihuo">
    				<h3>恭喜您,帐号激活成功！</h3>
    				<p class="tip">您以后可以使用帐号<strong><s:property value="loginName"/></strong>登录搜狐企业网盘。</p>
    				<p class="ahead"><a href="/login" class="btn btn-lightblue">进入搜狐企业网盘</a></p>
    			</div>
    		</form>
    		</div>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
	    
</html>
