<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
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
    	<form action="/Register!register.action" method="post" name="form1">
    		<div class="reg-content">
    			<h2>激活帐号</h2>
    			<div class="steps step2">激活帐号</div>
    			<div class="jihuo">
    				<h3>请激活您的帐号！</h3>
                    <s:if test="message!=null"><p class="tip"><span style="color:#E65455;"><s:property value="message"/></span></p></s:if>
    			</div>
    		</div>
    		</form>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>
