<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="../taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="../head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/account.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/account.js?$ver"></script>
        <title>搜狐企业网盘 - 找回密码</title>
    </head>
    <body class="account">
        <div class="header-wrap2 clearfix">
            <div class="header2">
                <h1 class="logo">
                    <a href="/"><img src="<%=CDNTools.CDN_URL %>/img/logo-v3.png" /></a>
                </h1>
                <div class="entrance">
                    <a href="/index.jsp">首页</a><span>|</span><a href="/login">登录</a><span>|</span><a href="/help/">帮助</a>
                </div>
            </div>
        </div>
    	<div id="resetContentWrap">
    		<div class="reset-content" id="resetModule">
    			<h2>找回密码</h2>
    			<div class="steps step2">找回密码</div>
    			<div class="reset-tip">
	    		     <p class="has-mailed">重置密码的邮件已发出，请登录邮箱操作。</p>
	    		     <p class="tip-btn">
	    		         <a href="<s:property value="emailAddres" />" class="btn btn32 btn32-blue">前往邮箱</a>
	    		     </p>
    			</div>
    		</div>
    	</div>
        <s:include value="../tj.jsp" >
        </s:include>
	</body>
</html>
