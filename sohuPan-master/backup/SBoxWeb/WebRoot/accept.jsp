<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
       <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/pages.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - <s:property value="title"/></title>
    </head>
    <body>
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="0"></s:param>
		</s:include>
        <div class="page-main">
            <div class="outchain-file">
                <div class="mod-bd">
                    <div class="expired" style="padding-top:50px; padding-left:170px; background-position:60px 40px;">
                        <p class="tips" style="margin-bottom:20px;"><s:property value="message"/></p>
                        <p><a href="/" class="btn btn32 btn32-blue">返回首页</a></p>
                    </div>
                </div>
            </div>
        </div>
<s:include value="tj.jsp" >
        </s:include>
    </body>
</html>
