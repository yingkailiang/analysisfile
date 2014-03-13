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
        <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/pages.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 文件下载</title>
    </head>
    <body>
    	<s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
			<s:param name="language"><s:property value="language"/></s:param>
		</s:include>
        <div class="page-main"><s:property value="language"/>
            <div class="outchain-file">
                <div class="mod-hd">
                   <s:if test="language==1">Download Link to share</s:if><s:else >外链文件下载</s:else>
                </div>
                <div class="mod-bd">
                    <div class="expired">
                        <p class="warn">Sorry!</p>
                        <p class="tips"><s:if test="language==1">The link you clicked is expired or invalid</s:if><s:else >您访问的链接已经过期或失效!</s:else></p>
                        <p><a href="/" class="btn btn32 btn32-blue"><s:if test="language==1">Back Homepage</s:if><s:else >返回首页</s:else></a></p>
                    </div>
                </div>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>
