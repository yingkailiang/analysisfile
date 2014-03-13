<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
if(user==null){
    RequestDispatcher rd = this.getServletContext().getRequestDispatcher("/login");
    rd.forward(request,response);
}else{
    userId = user.getUser().getId();
}
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <script type="text/javascript">
            jQuery(function(){
                function resize(){
                    var winHeight = $(window).height(),
                        hdHeight = $('#header').height();
                    $('#sidebar').height(winHeight - hdHeight - 15);
                }
                resize();
                $(window).on('resize',resize);
            })
        </script>
        <title>搜狐企业网盘</title>
    </head>
    <body class="manage">
        <jsp:include page="header-admin.jsp" flush="true">
		  <jsp:param name="pageStatus" value="5" />
		</jsp:include>
		<div id="content" class="manage-content  has-side clearfix">
            <div id="sidebar" class="sidebar">
                <ul class="setting-nav">
                    <li><a href="/individset1.jsp">个性设置</a></li>
                    <li><a href="/adminset/" class="current">管理设置</a></li>
                </ul>
                <script type="text/javascript">
                    jQuery(function(){
                        function resize(){
                            var winHeight = $(window).height(),
                                hdHeight = $('#header').height();
                            $('#sidebar').height(winHeight - hdHeight - 15);
                        }
                        resize();
                        $(window).on('resize',resize);
                    })
                </script>
            </div>
            <div id="main" class="main">
                <div class="setting-main">
                    <div class="detail">
                    <s:if test="!\"1\".equals(#session.user.account.packageId)">
                        <div class="setting-item">
                            <h4>转让管理员</h4>
                            <p id="actions" class="sc">
                                <span class="desc">把您管理员的身份转让给其他成员，不再有管理员权限变为普通用户</span>
                                <a href="javascript:;" class="btn btn24 btn24-gray" id="changeAdmin">转让管理员</a>
                            </p>
                        </div>
                        <hr />
                        </s:if>
                    <div class="setting-item setting-ip" id="settingIpModule">
                        <h4>限制IP登录</h4>
                        <p class="sc">
                            <span class="desc">设置后，域下帐号只能在指定IP地址范围内登录网盘<br /><span style="color:#6E91C3;">请指定固定IP，动态IP可能导致受限用户无法登录</span></span>
                           <s:if test="isSet==1">
                            <a href="javascript:;" class="btn btn24 btn24-gray" id="setIpRestrict">设置IP限制</a>
                            </s:if>
                             <s:if test="isSet==0"><a href="javascript:;" class="btn btn24 btn24-gray" id="editIpRestrict">修改IP限制</a>
                            <a href="javascript:;" class="btn btn24 btn24-gray" id="cancelIpRestrict">取消IP限制</a>
                            </s:if>
                        </p>
                    </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </body>
</html>