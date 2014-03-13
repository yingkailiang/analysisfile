<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
if(user==null){
	RequestDispatcher rd = this.getServletContext().getRequestDispatcher("/login");
    rd.forward(request,response);
}else{
	userId = user.getUser().getId();
}
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
	    <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/history.js?$ver"></script>
	    <script type="text/javascript">
	    	var resourceId = "<s:property value='resourceId'/>";
	    	var versonNumber = "<s:property value='versionNum'/>";
	    	var parentDir = "<s:property value='parentDir'/>";
	    	var fileName = "<s:property value='fileName'/>";
	    </script>
        <title>搜狐企业网盘 - 历史版本</title>
    </head>
    <body>
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="1" />
		</jsp:include>
    	<div id="content">
    		<div id="history">
    			<div class="main-op" id="mainOp"  style="display:none;">
    				<a class="btn btn32 btn32-green uploadnew" href="javascript:;"><span>上传新版本</span></a>
    			</div>
    			<div class="navigation">
	    		 		您可以查看该文件最新的十个历史版本。 
	    		 </div>
	    		 <div class="list-table history">
	    		 	<div class="list-header">
	    		 		<div class="name col">
	    		 			文件名
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="version col sep">
	    		 			版本号
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="size col sep">
	    		 			大小
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="time col sep">
	    		 			修改时间
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="operator col sep">
	    		 			操作者
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<!-- <div class="op-type col sep">
	    		 			操作
	    		 			<span class="sort"></span>
	    		 		</div> -->
	    		 	</div>
	    		 	<div class="list-body">
	    		 		<ul class="files listview" id="fileList">
	    		 		<s:iterator value="historyVersion" status="i">
	    		 			<li class="list-item" data-version="<s:property value='versionNumber'/>" data-name="<s:property value="fileName"/>" data-size="<s:property value="size"/>" data-id="<s:property value="uniqueFileSign"/>" data-splitId="<s:property value="splitId"/>" data-key="<s:property value="thumbnailsKey"/>">
	    		 				<div class="col name clearfix">
	    		 					<div class="file-icon"><a href="/GetFile!getFileOnLineLink.action?resourceId=<s:property value="uniqueFileSign"/>&version=<s:property value="versionNumber"/>&splitId=<s:property value="splitId"/>" target="_blank"><span class="file-type <s:property value="fileType"/>"></span></a></div>
	    		 					<div class="file-name" title="<s:property value="fileName"/>"><a href="/GetFile!getFileOnLineLink.action?resourceId=<s:property value="uniqueFileSign"/>&version=<s:property value="versionNumber"/>&splitId=<s:property value="splitId"/>" target="_blank"><s:property value="fileName"/></a></div>
	    		 					<div class="file-operation">
	    		 						&nbsp;
	    		 						<s:if test="isNewVesion<1">
	    		 						<a title="替换为当前版本" href="javascript:;" class="replace"><span class="icon icon-replace"></span></a>
	    		 						</s:if>
	    		 						<a title="下载" href="/GetFileVersion!getFile.action?resourceId=<s:property value="uniqueFileSign"/>&version=<s:property value="versionNumber"/>&splitId=<s:property value="splitId"/>&amp;path=path&amp;key=key" class="download"><span class="icon icon-download"></span></a>
	    		 						<s:if test="isNewVesion<1">
	    		 						<a title="删除" href="javascript:;" class="del"><span class="icon icon-delete"></span></a>
	    		 						</s:if>
	    		 					</div>
	    		 				</div>
	    		 				<div class="col version" title="<s:property value="versionNumber"/>"><s:property value="versionNumber"/><s:if test="isNewVesion>=1"><span style="color:#A7A8A8;"> (当前版本)</span></s:if></div>
	    		 				<div class="col size"><s:property value="strSize"/></div>
	    		 				<div class="col time"><s:property value="modifyDate.substring(0,16)"/></div>
	    		 				<div class="col operator" title="<s:property value="table"/>"><s:property value="table"/></div>
	    		 				<!-- <div class="col op-type">编辑</div> -->
	    		 			</li>
	    		 			</s:iterator>
	    		 		</ul>
	    		 	</div>
	    		 </div>
    		</div>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>