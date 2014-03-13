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
        <title>搜狐企业网盘 - 文件下载</title>
    </head>
    <body>
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
    	<div id="content">
    		<div id="download">
    		<form action="OutLinkForMail!download.action" method="post">
    			<div class="d-table">
    				<div class="download-head">
	    				外链文件下载
	    			</div>
	    			<input type="hidden" name="userId" value="<s:property value="userId"/>"/> 
	    			<input type="hidden" name="fileId" value="<s:property value="fileId"/>"/>
	 
	    			<div class="download-body">
	    				<div class="field">
	    					<div class="label">文件名：</div>
	    					<div class="ipt"><s:property value="fileName"/></div>
	    				</div>
	    				<div class="field">
	    					<div class="label">大小：</div>
	    					<div class="ipt"><s:property value="fileSize"/></div>
	    				</div>
	    				    		
	    				<div class="field">
	    					<div class="ipt">
	    						<input type="submit" class="btn btn32 btn32-blue" value="下载" />
	    					</div>
	    				</div>
	    			</div>
    			</div>
    		</form>
    		</div>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>
