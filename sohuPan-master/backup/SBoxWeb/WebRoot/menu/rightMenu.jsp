<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
String pageStatus = request.getParameter("pageStatus");
if(user==null){
	RequestDispatcher rd = this.getServletContext().getRequestDispatcher("../login");
    rd.forward(request,response);
}else{
	userId = user.getUser().getId();
}

%>

<div id="sidebar" class="sidebar ">
    <div class="mod group-manage <%if("1".equals(pageStatus)) {%>on<%}%>">
        <div class="mod-hd">
            <a href="/PanInfo/">网盘概况</a>
        </div>
    </div>
    <!--<div class="mod qiye-info <%if("2".equals(pageStatus)) {%>on<%}%>">
        <div class="mod-hd">
            <a href="/CompanyInfo/">企业信息</a>
        </div>
    </div>
    -->
    
    <div class="mod user-manage <%if("3".equals(pageStatus)) {%>on<%}%>">
        <div class="mod-hd">
            <a href="/UserList/">用户管理</a>
        </div>
    </div>
    <div class="mod group-manage <%if("4".equals(pageStatus)) {%>on<%}%>">
        <div class="mod-hd">
            <a href="/GroupList/">群组管理</a>
        </div>
    </div>
    <div class="mod group-manage <%if("6".equals(pageStatus)) {%>on<%}%>">
        <div class="mod-hd">
            <a href="/AdminLog!toPage.action">管理日志</a>
        </div>
    </div>
    <div class="mod group-manage <%if("5".equals(pageStatus)) {%>on<%}%>">
        <div class="mod-hd">
            <a href="/individset1/">企业设置</a>
        </div>
    </div>
</div>
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