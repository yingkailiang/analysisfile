
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="../head-inc.jsp" >
        </s:include>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/models.js?$ver"></script>
        <script type="text/javascript">
            jQuery(function(){
                var file = new Sbox.Models.File({
                    id:'<s:property value="resourceId" />'
                }),
                loading;
                file.bind('sendoutchain.begin',function(){
                    loading = Sbox.Loading('正在发送请稍候...');
                });
                file.bind('sendoutchain.end',function(r){
                    loading.remove();
                    if(r.code === 200){
                        Sbox.Success('发送成功');
                    }else{
                        Sbox.Fail('发送失败');
                    }
                })
                $('#sendOutChain').on('click',function(){
                    Sbox.SendOutChain(file);
                })
            });
        	
            jQuery(function(){
                var d1 = new Date(),
                    url = "<s:text name="view" />",
                    previewContain = $('#previewContain'),
                    t = 2 * 1000,
                    st ;
                $.getScript(url+"static/test.js",function(){
                    var d2 = new Date();
                    if(d2 - d1 < t){
                        clearTimeout(st);
                        previewContain.html('<iframe frameborder="0" style="border:0;height:705px;width:760px;" src="'+ url +'view?source=<s:property value="onLineUrl" />"></iframe>')
                        
                    }
                });
                st = setTimeout(function(){
                    previewContain.html('<p><img src="<%=CDNTools.CDN_URL %>/img/connect-fail-en.png" /></p>');
                },t)
            })
                	
        </script>
        <title>搜狐企业网盘 - 在线预览</title>
    </head>
    <body class="file-preview">
        <s:include value="../head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
	
			<s:param name="language"><s:property value="language"/></s:param>
		
		</s:include>
        <div class="preview-main">
        	<div class="file-info">
            	<h2><s:property value="fileName" /></h2>
            	 <p>
            	 
	            <s:if test="shareType==0&&sharePrivilege==2">
	            	<span class="file-size"><s:property value="fileSize"/></span>
	            	<span class="down-times"><s:if test="language==0">下载次数</s:if><s:if test="language==1">Download times</s:if>：<s:property value="downCount"/></span>
	            </s:if>
	              &nbsp;
	            </p>
            </div>
            <div class="actions">
             <s:if test="sharePrivilege==1">
             </s:if>
             <s:if test="sharePrivilege==2">
             	<form action="/OutLink!downloadForOnline.action" method="post">
		             <input type="hidden" name="fileId" value="<s:property value="resourceId"/>" />
		             <input type="hidden" name="userId" value="<s:property value="userId"/>" />
		             <input type="hidden" name="date" value="<s:property value="date"/>" />
		             <input type="hidden" name="sign" value="<s:property value="sign"/>" />
		             <input type="hidden" name="outResourceId" value="<s:property value="outResourceId"/>" />
		             <input type="hidden" name="shareType" value="<s:property value="shareType"/>" />
		             <input type="hidden" name="language" value="<s:property value="language"/>" />
		             <s:if test="language==0">
		             <input type="submit" class="btn btn32 btn32-blue" value="下载" />
		             </s:if>
		             <s:if test="language==1">
		             <input type="submit" class="btn btn32 btn32-blue" value="download" />
		             </s:if>
             	</form>
             </s:if>
             <s:if test="sharePrivilege==3">
             <s:if test="!(\"4\".equals(acl)||\"5\".equals(acl)||\"6\".equals(acl))||null==acl">
                <a href="/GetFile!getFile.action?resourceId=<s:property value="resourceId" />" class="btn btn32 btn32-blue"><span>下载</span></a>
                </s:if>
             </s:if>
            </div>
            <div class="preview-contain" id="previewContain">
                <span style="display:block; padding:100px 0; text-align:center;"><span class="icon icon-loading"></span> <s:if test="language==0">正在连接中...</s:if><s:if test="language==1">Connecting...</s:if></span>
            </div>
        </div>
        <s:include value="../tj.jsp" >
        </s:include>
	</body>
</html>
