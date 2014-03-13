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
                <li><a href="/PanInfo/" <%if("1".equals(pageStatus)) {%>class="on"<%}%>>网盘概况</a></li>
                <li class="sep"></li>
                <li><a href="/UserList/" <%if("2".equals(pageStatus)) {%>class="on"<%}%>>用户管理</a></li>
                <li class="sep"></li>
                <li><a href="/GroupList/" <%if("3".equals(pageStatus)) {%>class="on"<%}%>>群组管理</a></li>
                <li class="sep"></li>
                <li><a href="/AdminLog!toPage.action" <%if("4".equals(pageStatus)) {%>class="on"<%}%>>管理日志</a></li>
                <li class="sep"></li>
                <li><a href="/individset1.jsp" <%if("5".equals(pageStatus)) {%>class="on"<%}%>>企业设置</a></li>
            </ul>
    		<div class="userinfo clearfix">
    			<div class="usermanage" id="userInfo">
    				<a class="switch-back" href="/"></i>切换到我的网盘</a>
    			</div>
    		</div>
    	</div>