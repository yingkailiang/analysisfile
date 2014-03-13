<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>

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
    			<div class="steps step3">设置新密码</div>
                <form action="/PasswordAction!resetPassword.action" method="post">
                	<input type="hidden" name="uid" value="<s:property value="uid" />"/>
                	<input type="hidden" name="date" value="<s:property value="date" />"/>
                	<input type="hidden" name="sign" value="<s:property value="sign" />"/>
        			<div class="reset-info">
                        <s:if test="errorMessage<>null">
                        	<p class="reset-error"><span class="error"><s:property value="errorMessage" /></span></p><!--后台输出的错误信息，没有就删掉-->
                        </s:if>
                        <div class="form-field">
    	    				<div class="label">新密码：</div>
    	    				<div class="ipt">
    	    					<input id="reset-password" name="password1" type="password" class="input-txt" />
    	    				</div>
    	    				<div class="tips">
    	    				    <span class="tip">6-16位字符，推荐使用组合密码！</span>
    	    				</div>
    	    			</div>
                        <div class="form-field field password-strength">
                            <div class="label"> </div>
                            <div class="ipt" id="passwordStrength">
                                <span class="cur">弱</span><span>&nbsp;</span><span>&nbsp;</span>
                            </div>
                        </div>
                        <div class="form-field">
                            <div class="label">确认新密码：</div>
                            <div class="ipt">
                                <input id="reset-password2" name="password2" type="password" class="input-txt" />
                            </div>
                            <div class="tips">
                            </div>
                        </div>
        				<div class="form-field reset-btn">
        					<div class="label"></div>
    	    				<div class="ipt">
    	    					<input id="reset-submit" type="submit" value="确定" class="btn btn32 btn32-blue" />
    	    				</div>
        				</div>
        			</div>
                </form>
                <script type="text/javascript">
                </script>
    		</div>
    	</div>
        <s:include value="../tj.jsp" >
        </s:include>
	</body>
</html>
