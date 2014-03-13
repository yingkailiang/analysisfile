<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
String pageStatus = request.getParameter("pageStatus");
if(user!=null){
	userId = user.getUser().getId();
}
%>
		<script type="text/javascript">
			var userId = <%=userId%>;
			<s:if test="#attr.user.account">
			var isDomainAdmin = 1;
			</s:if>
			<s:else>
			var isDomainAdmin = 0;
			</s:else>
		</script>
		<div id="header" class="header clearfix">
    		<h1 class="logo" id="logo">
    			<a href="/"><img src="<%=CDNTools.CDN_URL %>/img/logo-v3.png" /></a>
    		</h1>
    		<ul class="nav">
    			<li><a href="/" 
    			<%if("1".equals(pageStatus)) {%>
    			class="on"
    			<%}%>>文件管理</a></li>
    			<li class="sep"></li>
                <s:if test="#attr.user.account<=0">
    			<li><a href="/AddressInfo/" 
    			<%if("2".equals(pageStatus)) {%>
    			class="on"
    			<%}%>>企业通讯录</a></li>
    			<li class="sep"></li>  
    			</s:if>
                
    			<li><a href="/log/" 
    			<%if("3".equals(pageStatus)) {%>
    			class="on"
    			<%}%>
    			>日志查询</a></li>
    			
    			<!--<li class="sep"></li>
    			<li><a href="/downloads/" target="_blank"
    			<%if("4".equals(pageStatus)) {%>
    			class="on"
    			<%}%>
    			>客户端下载</a></li>-->
    			
    		</ul>
    		<div class="userinfo clearfix">
                <div class="msg-tip" id="msgTip">
                    <a href="/message/0"><span class="icon icon-msg"></span></a>
                    <span class="msg-num" style="display:none;"><em>0</em></span>
                </div>
    			<div class="usermanage" id="userInfo">
                    <span class="icon icon-account-info"></span>
    				<a class="username" href="/"><s:property value="#session.user.userPro.nickName" /></a>
                    <a href="javascript:;" class="more-handle" hidefocus="true"><span class="more"></span></a>
    				<ul class="dropdown moreinfo" style="display:none;">
    					<li><a href="/account">个人设置</a></li>
                        <li><a href="/updates" target="_bank">更新日志</a></li>
                        <li><a href="/feedBack/" target="_blank">意见反馈</a></li>
                        <li><a href="/help/" target="_blank">帮助中心</a></li>
    					<li><a href="/logout">退出</a></li>
    				</ul>
    			</div>
                <s:if test="#attr.user.account">
                <div class="manage-entrance">
                    <span class="sep"></span>
                    <a href="/PanInfo/" target="_blank">管理后台</a>
                </div>
                </s:if>
                <script type="text/javascript">
                    jQuery(function(){
                        var userInfo = $('#userInfo'),
                            moreinfo = userInfo.find('.moreinfo'),
                            st;
                        userInfo.on('mouseenter',function(e){
                            clearTimeout(st);
                            moreinfo.show();
                        }).on('mouseleave',function(e){
                            clearTimeout(st);
                            st = setTimeout(function(){
                                moreinfo.hide();
                            },300)
                        })
                        moreinfo.on('mouseenter',function(){
                            clearTimeout(st);
                            moreinfo.show();
                        }).on('mouseleave',function(){
                            clearTimeout(st);
                            st = setTimeout(function(){
                                moreinfo.hide();
                            },300)
                        })
                    })
                </script>
    			<!--
                <div class="sizeinfo">
    				<span><s:property value="#session.usedSize" /> / <s:property value="#session.allSize" /></span>
    			</div>
                -->
    			<script type="text/javascript">
    			var lastSize = "<s:property value='#session.lastSize' />"
    			</script>
    		</div>
    	</div>