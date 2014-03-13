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
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="Content-Language" content="zh-CN" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <style type="text/css">
            body,h1,h2,p{font: 12px/1.5 Tahoma, Helvetica, Arial,"Microsoft YaHei","微软雅黑", "\5b8b\4f53", sans-serif; color:#333333;}
            body{background:url(<%=CDNTools.CDN_URL %>/img/404/404-bg.png); height:100%;}
            .page-main{width:960px;height:240px; text-align:center; padding-top:300px; margin:0 auto; background:url(<%=CDNTools.CDN_URL %>/img/404/404-bg2.png) no-repeat center top;}
            .page-main h1{font-size:28px; color:#6b6b6b; margin-bottom:10px;}
            .page-main h1 em{color:#7cb4f2; font-style:normal;}
            .page-main .desc{color:#727272;font-size:14px; margin-bottom:50px;}
            .page-main .action .back{padding:1px 0 3px 20px ; background:url(<%=CDNTools.CDN_URL %>/img/404/back.png) no-repeat left center; color:#428bdc; margin-right:30px;}
            .page-main .action .home{padding:1px 0 3px 20px ; background:url(<%=CDNTools.CDN_URL %>/img/404/home.png) no-repeat left center; color:#727272; }
            .page-main .action a{text-decoration:none;}
            .page-main .action a:hover{text-decoration:underline;}
        </style>
        <title>搜狐企业网盘 - 页面未找到</title>
    </head>
    <body class="page-not-found">
        <div class="page-main">
            <h1><em>Sorry</em>，您访问的页面不存在！</h1>
            <p class="desc">您可能输入了错误的网址,该页面无法浏览或已被删除、移动</p>
            <p class="action">
                <a href="javascript:;" class="back" onclick="window.history.back();return false;">返回上一页</a>
                <a href="/" class="home">返回首页</a>
            </p>
        </div>
	</body>
</html>
