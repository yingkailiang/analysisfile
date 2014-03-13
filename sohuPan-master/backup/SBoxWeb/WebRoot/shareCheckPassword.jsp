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
		<div class="outlink-password">
            <div class="outlink-type">
            <s:if test="shareType==0">
            <span class="file"></span>
             </s:if>
             <s:if test="shareType==1">
            <span class="fold"></span>
             </s:if>
                
                <!--<span class="fold"></span></span>-->
            </div>
            <div class="file-detail">
                <h3> <s:if test="shareType==0"><s:property value="fileName"/></s:if><s:if test="shareType==1"><s:property value="dirName"/></s:if></h3>
                <s:if test="hasError == 1">
                <p class="error">密码错误</p>
                </s:if>
                <form action="/ShareCheckPassword!share.action" method="post">
                    <label for="pwd">输入密码后访问该文件（夹）</label>
                    <input type="password" class="ipt-text" name="password" id="pwd" />
                    <input type="hidden" name="userId" value="<s:property value="userId"/>"/>
                    <input type="hidden" name="fileName" value="<s:property value="fileName"/>"/>  
                    <input type="hidden" name="dirName" value="<s:property value="dirName"/>"/>  
	    			<input type="hidden" name="fileId" value="<s:property value="fileId"/>"/>
	    			<input type="hidden" name="sign" value="<s:property value="sign"/>"/> 
	    			<input type="hidden" name="date" value="<s:property value="date"/>"/> 
	    			<input type="hidden" name="dirResourceId" value="<s:property value="dirResourceId"/>"/> 
	    			<input type="hidden" name="shareType" value="<s:property value="shareType"/>"/> 
                    <input type="submit" class="btn btn32 btn32-blue" value="确认密码" />
                </form>
                <script type="text/javascript">
                    jQuery(function(){
                        var fm = $('form'),
                            ipt = fm.find('input:password'),
                            label = fm.find('label');
                        fm.on('submit',function(){
                            var pwd = $.trim(ipt.val())
                            return pwd !== '';
                        })
                        ipt.on('focus',function(){
                            label.hide();
                        }).on('blur',function(){
                            var pwd = $.trim(ipt.val());
                            if(pwd === ''){
                                label.show();
                            }
                        })
                    })
                </script>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>