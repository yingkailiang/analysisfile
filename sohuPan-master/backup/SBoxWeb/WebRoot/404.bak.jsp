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
        <meta name="robots" content="all" />
        <meta name="author" content="" />
        <meta name="Copyright" content="" />
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/sbox-v2.css" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/jquery-min.js"></script>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/underscore-min.js"></script>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/backbone-min.js"></script>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/plugins.js"></script>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/core.js?$ver"></script>
        <title>搜狐企业网盘 - 文件下载</title>
    </head>
    <body>
        <s:include value="head2.jsp" >
            <s:param name="pageStatus" value="1"></s:param>
        </s:include>
        <div id="content">
            <div id="download">
                <div class="d-table">
                    <div class="download-head">
                            外链文件下载
                    </div>
                    <div class="download-bad">
                        <p class="tip">外链已失效！</p>
                        <p class="desc">检查到外链已经过期或删除。</p>
                    </div>
                </div>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>