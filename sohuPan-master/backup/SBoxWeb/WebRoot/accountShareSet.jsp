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
        <s:if test="code == 200"   >
        <span class="message-area">
            <span class="success"><i class="icon"></i> 设置成功</span> 
        </span>
        </s:if>
        <s:if test="code == 500"   >
        <span class="message-area">
            <span class="fail"><i class="icon"></i> 设置失败</span> 
        </span>
        </s:if>
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="4" />
		</jsp:include>
    	<div id="accountContent">
            <form action="ShareEmailSet!setShareEmail.action" method="post">
                <div class="account-content">
                    <div class="tabs">
                        <ul>
                            <li><a href="/account"><span>帐号信息</span></a></li>
                            <li><a href="/account/1-2"><span>修改密码</span></a></li>
                            <li><a href="/user/update"><span>安全设置</span></a></li>
                            <li><a href="/account/email" class="selected"><span>消息设置</span></a></li>
                            <li><a href="/deviceManage" ><span>设备管理</span></a></li>
                        </ul>
                    </div>
                    <div class="account-info">
                        <h3><span class="icon icon-msg-setting"></span>消息设置</h3>
                        <div class="setting-item">
                            <h4>防打扰设置</h4>
                            <p class="sc">
                                <input type="checkbox" id="mailSetting" name ="shareEmail" <s:if test="type==1">checked</s:if> value ="1" />
                                <label for="mailSetting">不接受共享消息邮件</label>
                            </p>
                        </div>
                        <div class="setting-actions">
                            <input type="submit" class="btn btn24 btn24-blue" value="保存" />
                        </div>
                    </div>
                </div>
            </form>
            <script type="text/javascript">
                jQuery(function(){
                    if($('.message-area')[0]){
                        setTimeout(function(){
                            $('.message-area').fadeOut();
                        },3000)
                    }
                })
            </script>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>
