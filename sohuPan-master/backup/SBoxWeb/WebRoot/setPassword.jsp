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
        
        <!--head-inc.jsp start-->
        <s:include value="head-inc.jsp" >
        </s:include>
        <!--head-inc.jsp end-->
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/organize.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 设置密码</title>
        
    </head>
    <body class="account">
        <!--head.jsp start-->
        <!--<s:include value="head2.jsp" >
			<s:param name="pageStatus" value="5"></s:param>
		</s:include>
        --><!-- head.jsp end -->
        
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
        
        <div id="content" class="activate">
            <div class="activate-mod">
                <h3>
                    帐号激活成功<br /><span>给您的帐号设置一个登录密码</span>
                </h3>
                <form action="/PasswordAction!resetPassword.action" method="post" id="submitFm">
                    <input type="hidden" name="uid" value="<s:property value="accessId" />"/>
                	<input type="hidden" name="date" value="<s:property value="date" />"/>
                	<input type="hidden" name="sign" value="<s:property value="sign" />"/>
                	<input type="hidden" name="type" value="1"/>
                	<input type="hidden" name="reset" value="-1"/>
                    <div class="field">
                        <div class="label">设置登录密码：</div>
                        <div class="ipt">
                            <input name="password1" type="password" class="ipt-text" id="password" />
                        </div>
                        <div class="tips"></div>
                    </div>
                    <div class="field">
                        <div class="label">确认登录密码：</div>
                        <div class="ipt">
                            <input name="password2" type="password" class="ipt-text" id="confirmPassword" />
                        </div>
                        <div class="tips"></div>
                    </div>
                    <div class="field">
                        <div class="label"></div>
                        <div class="ipt">
                            <input type="submit" value="立即登录" class="btn btn32 btn32-blue" />
                        </div>
                    </div>
                </form>
                <script type="text/javascript">
                    jQuery(function(){
                        var submitFm = $('#submitFm'),
                            password = $('#password'),
                            confirmPassword = $('#confirmPassword'),
                            flag = true;
                        submitFm.on('submit',function(){
                            flag = true;
                            password.trigger('blur');
                            confirmPassword.trigger('blur');
                            return flag;
                        })
                        password.on('blur',function(){
                            if(password.val() ===''){
                                password.parent().next().html('<span class="error">请输入密码</span>');
                                flag = false;
                            }else if(password.val().length > 16 || password.val().length < 6){
                                password.parent().next().html('<span class="error">请输入6-16位密码</span>');
                                flag = false;
                            }else{
                                password.parent().next().empty();
                            }
                        }).on('focus',function(){
                            password.parent().next().empty();
                        })
                        confirmPassword.on('blur',function(){
                            if(confirmPassword.val() === ''){
                                confirmPassword.parent().next().html('<span class="error">请确认密码</span>');
                                flag = false;
                            }else if(password.val() !== confirmPassword.val()){
                                confirmPassword.parent().next().html('<span class="error">两次密码不一致</span>');
                                flag = false;
                            }else{
                                confirmPassword.parent().next().empty();
                            }
                        }).on('focus',function(){
                            confirmPassword.parent().next().empty();
                        })

                    })
                </script>
            </div>
        </div>
<!--tj.jsp start-->        
<s:include value="tj.jsp" >
        </s:include>
<!--tj.jsp end-->
    </body>
</html>
