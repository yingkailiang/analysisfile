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
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/pages.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/swfupload.js"></script>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/uploadlink.js?$ver"></script>
        <script type="text/javascript">
            var uploadLinkInfo = {
                userId:'<s:property value="userId"/>',
                date:'<s:property value="date"/>',
                sign:'<s:property value="sign"/>',
                resourceId:'<s:property value="dirResourceId"/>'
            }
        </script>
        <title>搜狐企业网盘 - 匿名上传</title>
    </head>
        <body>
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
        
        <div class="page-main">
            <div class="upload-link" id="anonymousUploadMod">
                <div class="folder-name">
                    <span class="folder">&nbsp;</span>
                    <strong><s:property value="dirName"/></strong>
                </div>
                <div class="folder-info">
                    <span>所有者：<s:property value="ownerName"/></span>
                    <span>失效时间：<s:property value="expireDate"/></span>
                    <span>上传文件限制：300 MB</span>
                </div>
                <div class="upload-btn" id="uploadContainer">
                    <div class="upload-disabled" id="uploadDisabled">
                        <a href="javascript:;" class="btn btn32 btn32-disabled">添加文件</a>
                    </div>
                    <div id="uploadBtn">
                        <div id="uploadHandler"></div>
                    </div>
                </div>
                <div class="upload-info">
                    <div class="password-mod" id="passwordMod">
                        <div class="field">
                            <div class="label">
                                <label for="password">请输入上传密码：</label>
                            </div>
                            <div class="ipt">
                                <input type="password" class="ipt-text" id="password" />
                            </div>
                            <div class="tips" id="passwordTip">
                            </div>
                        </div>
                        <div class="field">
                            <div class="label"></div>
                            <div class="ipt">
                                <a href="javascript:;" class="btn btn32 btn32-blue" id="passwordBtn">确定</a>
                            </div>
                        </div>
                    </div>
                    <div class="upload-tip" id="uploadTipMod" style="display:none;">
                        <p>点击“添加文件”按钮选择文件上传</p>
                        <p>不允许上传exe、js、com、bat、dll、vbs、ocx等类型的文件</p>
                    </div>
                    <div class="upload-list" id="uploadList" style="display:none;">
                        <div class="upload-hd">
                            <span class="f-name">文件名</span>
                            <span class="f-percent">进度</span>
                            <span class="f-size">大小</span>
                            <span class="f-op">操作</span>
                        </div>
                        <div class="upload-bd" id="uploadBody">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
<s:include value="tj.jsp" >
        </s:include>
</body>
</html>