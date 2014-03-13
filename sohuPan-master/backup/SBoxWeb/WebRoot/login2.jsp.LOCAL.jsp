<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%@ include file="security/auth.jsp"%>
<%
Object returnURL = session.getAttribute("returnURL");
String uri = "/home";
if(returnURL!=null){
	uri = returnURL.toString();
}
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <!--[if IE 6]>
            <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/DD_belatedPNG_0.0.8a-min.js"></script>
            <script type="text/javascript">
                jQuery(function(){
                    DD_belatedPNG.fix('.pngfix');
                })
            </script>
        <![endif]-->
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/login.js?$ver"></script>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/login.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 用户登录</title>
    </head>
    <body class="login-page">
        <div class="login-main" id="loginMain">
            <h1>
                <a href="/" hidefocus="true">
                <s:if test="#session.IndividSet.code==200&&#session.IndividSet.result.logoKey!=null&&!\"\".equals(#session.IndividSet.result.logoKey)">
                <img class="pngfix" height="45" width="200" src="https://pan.sohu.net/img/<s:property value="#session.IndividSet.result.logoKey"/>" />
                </s:if>
            <s:else><img src="<%=CDNTools.CDN_URL %>/img/login-logo-v20130829.png" class="pngfix" />
            </s:else></a>
            </h1>
            <div class="login-module-wrap">
                <div class="login-module">
                    <form action="/loginAction#!<s:property value="path"/>" method="post" id="loginForm">
                        <s:if test="errorMessage!=null&&!''.equals(errorMessage)">
	                            <p class="login-error" id="loginError">
	                                <s:property value="errorMessage"/>
	                            </p>
                            </s:if>
                            <s:else>
                                <p class="login-error" id="loginError" style="visibility:hidden;"></p>
                            </s:else>
                            <s:if test="message!=null&&!''.equals(message)">
	                            <p class="login-error" id="loginError">
	                                <s:property value="message"/>
	                            </p>
                            </s:if>
                        <input name="url" type="hidden" 
                         value="<%=uri %>" />
                        <div class="form-field mail">
                            <div class="label"><label for="loginName">邮箱地址</label></div>
                            <div class="ipt">
                                <s:textfield name="loginName" cssClass="input-txt" id="loginName"  autocomplete="off"/>
                            </div>
                        </div>
                        <div class="form-field pass">
                            <div class="label"><label for="loginPassword">密码</label></div>
                            <div class="ipt">
                                <input name="password" type="password" class="input-txt" id="loginPassword" onpaste="return false;" autocomplete="off" />
                            </div>
                        </div>
                        <s:if test="#session.loginABC>2">
                        <div class="form-field validate">
                            <div class="ipt">
                                <input name="validateCode" type="text" class="input-txt" id="loginCode">
                            </div>
                             <div class="code">
                                    &nbsp;<img align="middle" style="width:60px" alt="点击刷新验证码" id="validateCodeImg" src="GetCode.action?<%=Math.random() %>" onClick="document.getElementById('validateCodeImg').src='/GetCode.action?'+Math.random();">
                                    <a href="javascript:;" onclick="document.getElementById('validateCodeImg').src='/GetCode.action?'+Math.random(); return false;">换一张</a>
                                </div> 
                        </div>
                        </s:if>
                        <div class="form-field remember"> 
                            <div class="label"> </div>
                            <div class="ipt">
                                <span><input type="checkbox" name="autologin" id="remember"> <label for="remember">两周内自动登录</label></span>
                                <a class="reset" href="PasswordAction!toSendPage.action">忘记密码</a>
                            </div>
                        </div>
                        <div class="form-field login-btn">
                            <div class="label"> </div>
                            <div class="ipt">
                                <input type="submit" class="submit-btn" id="loginSubmit" value="登 录" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="login-footer">
            <p class="copyright">
                Copyright &copy; 2013 Sohu.com Inc. All Rights Reserved 
            </p>
        </div>
    </body>
</html>

