<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <title>搜狐企业网盘 - <s:property value="title"/></title>
    </head>
    <body>
    	<s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
        <div id="content">
            <div id="download">
                <div class="d-table">
                    <div class="download-head">
                        	您没有相应的权限
                    </div>
                    <div class="download-bad">
                        <p class="tip">无操作权限</p>
                        <p class="desc">无操作权限,请联系管理员！</p>
                    </div>
                </div>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>
