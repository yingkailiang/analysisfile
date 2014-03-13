<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
String pageStatus = request.getParameter("pageStatus");
if(user==null){
    //RequestDispatcher rd = this.getServletContext().getRequestDispatcher("/login");
   // rd.forward(request,response);
}else{
    userId = user.getUser().getId();
}
%>
<!-- header start -->
<div class="header-wrap-v3">
    <div class="header-v3">
        <h1 class="logo" id="logo">
            <a href="/">
            <img src="/assets/img/logo-white.png" />
            </a>
        </h1>
        <ul class="menu">
            <li><a href="/" <% if("1".equals(pageStatus)) { %>class="on"<% } %> >首页</a></li>
            <li><a href="/features/" <% if("2".equals(pageStatus)) { %>class="on"<% } %> >服务特性</a></li>
            <li><a href="/pricing/">服务报价</a></li>
            <li><a href="/agency/">渠道代理</a></li>
            <li><a href="/downloads/" <% if("3".equals(pageStatus)) { %>class="on"<% } %> >下载</a></li>
        </ul>
        <% if(user!=null){ %>
        <div class="uinfo">
            <a class="username" href="/"><s:property value="#session.user.userPro.nickName" /></a>
            <span>|</span>
            <a href="/logout/">退出</a>
        </div>
        <% }else{ %>
        <div class="uinfo">
            <a href="/login">登录</a>
            <span>|</span>
            <a href="/register/">注册</a>
        </div>
        <% } %>
    </div>
</div>
<!-- header end -->