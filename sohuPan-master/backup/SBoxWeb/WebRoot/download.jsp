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
        <title>搜狐企业网盘 - 文件下载</title>
    </head>
    <body>
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
			<s:param name="language"><s:property value="language"/></s:param>
		</s:include>
		<div class="page-main">
            <div class="outchain-file">
                <div class="mod-hd">
                  <s:if test="language==0">外链文件下载</s:if><s:if test="language==1">Download Link to share</s:if>
                </div>
                <div class="mod-bd">
                    <form action="/OutLink!download.action" method="post">
		    			<input type="hidden" name="userId" value="<s:property value="userId"/>"/> 
		    			<input type="hidden" name="fileId" value="<s:property value="fileId"/>"/>
		    			<input type="hidden" name="sign" value="<s:property value="sign"/>"/> 
		    			<input type="hidden" name="date" value="<s:property value="date"/>"/> 
		    			<input type="hidden" name="language" value="<s:property value="language"/>"/> 
                        <p class="file-prev" id="filePreview">
                            <span class="file-icon"></span>
                        </p>
                        <p class="file-name" id="fileName">
                        	<s:property value="fileName"/>
                        </p>
                        <p class="file-info">
                        	<span class="file-size"><s:property value="fileSize"/></span>
                        	<span class="down-times"><s:if test="language==0">下载次数</s:if><s:if test="language==1">Download times</s:if>：<s:property value="downCount"/></span>
                        </p>
                     <%--    <s:if test="!''.equals(note)">
                        <p class="file-desc">外链说明：<s:property value="note"/></p>
                        </s:if> --%>
                       
                        <p class="btns">
                            <s:if test="language==0">
                            <input type="submit" value="下载" class="btn btn32 btn32-blue">
                            </s:if>
                            <s:if test="language==1">
                            <input type="submit" value="Download" class="btn btn32 btn32-blue">
                            </s:if>
                            <!--<a href="/GetFile!getFileOnLineLink.action?resourceId=<s:property value="fileId"/>" class="btn btn32 btn32-gray" style="margin-left:15px;" target="_blank">预览</a>-->
                        </p>
                    </form>
                    <script type="text/javascript">
                        jQuery(function(){
                            var id = '<s:property value="fileId"/>',
                                key = '<s:property value="thumbnailsKey"/>',
                                name = '<s:property value="fileName"/>',
                                size = <s:property value="size"/>,
                                fileType = getFileType(name);
                            var fileName = $('#fileName'),
                                filePreview = $('#filePreview');

                            if(isPreviewImgFile(name,size)){
                                fileName.find('a').attr('href','javascript:;');
                                var img = $('<img>');
                                img.on('error',function(){
                                    img.attr('src',STATIC_DOMAIN + '/img/download-big.png');
                                })
                                img.attr('src',PREVIEW_URL + key + '_z120x90')
                                filePreview.find('span').replaceWith(img);
                            }else if(!previewFileType.test(fileType)){
                                fileName.find('a').attr('href','javascript:;').addClass('notlink')
                            }
                        });
                    </script>
                </div>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>