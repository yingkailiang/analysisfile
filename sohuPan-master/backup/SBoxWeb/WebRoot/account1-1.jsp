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
        <s:if test="!''.equals(errorMessage)">
        <span class="message-area">
            <span class="<s:property value="isSuccess" />"><i class="icon"></i> <s:property value="errorMessage" /></span>    
        </span>
        </s:if>
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="4" />
		</jsp:include>
    	<div id="accountContent">
        	<form action="AccountManage!modifyNickName.action" method="post">
        		<div class="account-content">
        			<div class="tabs">
        				<ul>
        					<li><a href="javascript:;" class="selected"><span>帐号信息</span></a></li>
                            <li><a href="/account/1-2"><span>修改密码</span></a></li>
                            <li><a href="/user/update"><span>安全设置</span></a></li>
                            <li><a href="/account/email" ><span>消息设置</span></a></li>
                            <li><a href="/deviceManage" ><span>设备管理</span></a></li>
        				</ul>
        			</div>
        			<div class="account-info">
        				<h3><span class="icon icon-account"></span>帐号信息</h3>
        				<div class="field">
        					<div class="label">邮箱：</div>
        					<div class="ipt">
        						<s:property value="#session.user.userPro.email" />
        					</div>
        				</div>
        				<div class="field" id="nameFiled">
        					<div class="label">姓名：</div>
        					<div class="ipt">
        						<input name="nickName" autocomplete="off" type="text" class="ipt-text" value="<s:property value="#session.user.userPro.nickName" />"/>
        					</div>
                            <div class="tips">* 建议填写真实姓名</div>
        				</div>
        				<div class="field">
        					<div class="label"></div>
        					<div class="ipt">
        						<input type="submit" class="btn btn24 btn24-blue" value="保存" />
        					</div>
        				</div>
        			</div>
        		</div>
    		</form>
            <script type="text/javascript">
                jQuery(function(){
                    var nameFiled = $('#nameFiled'),
                        ipt = nameFiled.find('input'),
                        tips = nameFiled.find('.tips');
                    var flag = true;
                    var oldName = ipt.val();
                    ipt.on('blur',function(){
                        ipt.val($.trim(ipt.val()))
                        var val = ipt.val();
                        if(val === ''){
                            tips.html('<span class="error">* 用户名不能为空</span>');
                            tips.focus();
                            flag = false;
                        }else if(val.length > 10){
                            tips.html('<span class="error">* 长度不能超过10个字符</span>');
                            tips.focus();
                            flag = false;
                        }else if(!nameReg.test(val)){
                            tips.html('<span class="error">* 支持中英文、数字、下划线</span>');
                            tips.focus();
                            flag = false;
                        }else{
                            tips.html('* 建议填写真实姓名')
                            tips.focus();
                        }
                    }).on('focus',function(){
                        tips.html('* 建议填写真实姓名')
                    })
                    $('#accountContent form').on('submit',function(){
                        flag = true;
                        if(ipt.val() === oldName) return false;
                        ipt.trigger('blur');
                        return flag;
                    })
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
