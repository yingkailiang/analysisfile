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
        <title>搜狐企业网盘 - 文件夹下载</title>
        
        
        <script type="text/javascript">
            var outLinkInfo = {
                id:'<s:property value="dirResourceId"/>',
                name:'<s:property value="dirName"/>',
                userId:'<s:property value="userId"/>',
                date:'<s:property value="date"/>',
                sign:'<s:property value="sign"/>',
                sid:'<s:property value="id"/>',
                sharePrivilege:'<s:property value="sharePrivilege"/>',
                language:'<s:property value="language"/>'
            }
        </script>
    </head>
    <body class="outchain-page">
        <s:include value="head2.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
			<s:param name="language"><s:property value="language"/></s:param>
		</s:include>
        <div class="page-main">
            <div class="outchain-fold">
                <div class="file-info">
                    <h2><s:property value="dirName"/></h2>
                </div>
                <div class="file-explore" id="fileExplorer">
                    
                </div>
                 <s:if test="sharePrivilege==2">
                <div class="file-action" id="fileAction" >
                    <div class="file-btn">
                     <s:if test="language==0">
                        <input type="button" class="btn btn32 btn32-blue btn32-disabled" value="下载" />
                     </s:if>
                      <s:if test="language==1">
                        <input type="button" class="btn btn32 btn32-blue btn32-disabled" value="Download" />
                     </s:if>
                    </div>
                    <div class="file-down-time">
                        <s:if test="language==0">下载次数</s:if><s:if test="language==1">Download times</s:if>：<s:property value="downCount"/> 
                    </div>
                </div>
                </s:if>
            </div>
        </div>
        
		<script type="text/template" id="navigation-template">
			<# 
				var len = paths.length;
			 #>
			<span class="up">
				<a href="javascript:;" title="<s:if test="language==0">返回上一级</s:if><s:if test="language==1">Up one level</s:if>" class="<# if(len === 1){ #>disabled<# } #>"><span class="icon icon-up"></span> <s:if test="language==0">上一级</s:if><s:if test="language==1">Up one level</s:if></a>
			</span>
			<span class="sep">|</span>
			<span id="path" class="path">
				 <# _(paths).each(function(path,i){ #>
				 		<# 
				 			var shortPath = getStrSize(path) > 16 ? cutStr(path,16) + '...' : path;
				 		#>
				 		<#	
				 			if(len > 5 && i > 1 && i < len-4){
				 				return;
				 			}else if(len > 5 && i === 1){
				 		#>
						<span>
							<span class="arrow">&gt;</span>
							...
						</span>
				 		<# }else{ #>
						<span>
							<# if(i !== 0){ #><span class="arrow">&gt;</span><# } #>
							<a href="javascript:;" data-id="<#= pathIds[i]  #>" _index="<#= i #>" title="<#= path #>" <#if(i===len-1){#>class="current"<#}#>><#- shortPath #></a>
						</span>
						<# } #>
				<# }) #>
			</span>
		</script>
		<script type="text/template" id="file-sort-template">
			<div class="checkbox">
				<span class="icon icon-unchecked"></span>
			</div>
			<div class="col name asc">
				<s:if test="language==0">文件名</s:if><s:if test="language==1">Name</s:if>
				<span class="sort"></span>
			</div>
			<div class="col size sep">
				<s:if test="language==0">大小</s:if><s:if test="language==1">Size</s:if>
				<span class="sort"></span>
			</div>
			<div class="col time sep">
				<s:if test="language==0">修改时间</s:if><s:if test="language==1">Modified</s:if>
				<span class="sort"></span>
			</div>
		</script>
		<script type="text/template" id="file-list-tempate">
			<ul class="files clearfix"><li style="text-align:center; padding:20px 0; color:gray;"><span class="icon icon-loading"></span> 正在加载...</li></ul>
		</script>
		<script type="text/template" id="listview-file-template">
			<# 
				var isUserList = typeof email !== 'undefined';
				if(isUserList){
					var isdir = true;
					var fileName = nickName;// + '&lt;' + email + '&gt;';
					var shortName = fileName;
					shareFlag = false;
					note = ''
					modifyTime = '-';
				}
				else{
					var isdir = (typeof parentDir !== 'undefined');
					if(!isdir){
						var size = formatbytes(size);
						var filetype = getFileType(name);
					}
					var previewable = previewFileType.test(filetype);

					var shortName,fileName;
					if(isdir || filetype === 'unknow'){
						shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
					}else{
						fileName = name.substring(0,name.lastIndexOf('.'));
						shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + name.substring(name.lastIndexOf('.') + 1); 
					}
					shortName = shortName.replace(/ /g,'&nbsp;');
					var shortRemark = getStrSize(note) > 10 ? cutStr(note,10) + '...' : note;
					shortRemark = shortRemark.replace(/ /g,'&nbsp;').replace(/</g,'&lt;').replace(/>/,'&gt;');
					var star = false;
					var isShareRoot = typeof(shareMail) !== 'undefined';
					modifyTime = modifyTime.substring(0,modifyTime.lastIndexOf(':'));
					var power = ['可查看','可上传','可编辑'];
					var lock =false;
				}
			 #>
			<div class="checkbox">
				<span class="icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"></span>
			</div>
			<div class="col name clearfix">
				<div class="file-icon">
					<# if(isdir){ #>
					<a href="javascript:;"><span class="file-type folder"></span></a>
					<# }else{ #>
					<a hideFocus="true" <# if(previewable){ #>target="_blank"<# } #> href="<# if(isdir){ #>javascript:;<# }else if(previewable){ #>/GetFile!getFileOnLineLinkForOutLink.action?sign=<#= outLinkInfo.sign #>&shareType=1&userId=<#= outLinkInfo.userId #>&date=<#= outLinkInfo.date #>&resourceId=<#= id #>&outResourceId=<#= outLinkInfo.id #><# }else{ #>javascript:;<# } #>" ><span class="file-type <#= filetype #>"></span></a>
					<# } #>
					<# if(typeof lock !== 'undefined' && lock){ #><span class="locked"></span><# } #>
				</div>
				<div class="file-name" title="<# if(typeof(acl) !== 'undefined' && typeof(shareUserName) !== 'undefined'){ #>来自<#= shareUserName #> <# } #><#= name #>">
					<a hideFocus="true" <# if(previewable){ #>target="_blank"<# } #> href="<# if(isdir){ #>javascript:;<# }else if(previewable){ #>/GetFile!getFileOnLineLinkForOutLink.action?sign=<#= outLinkInfo.sign #>&shareType=1&userId=<#= outLinkInfo.userId #>&date=<#= outLinkInfo.date #>&resourceId=<#= id #>&outResourceId=<#= outLinkInfo.id #><# }else{ #>javascript:;<# } #>" <# if(!isdir && !previewable){ #>class="unpreviewable"<# } #>>
						<#= shortName #>
					</a> 
					<input type="text" class="ipt-text" value="<# if(typeof name !== 'undefined' && name !== ''){#><#= name #><# }else{ #>新建文件夹<# } #>" /> &nbsp;
				</div>
			</div>
			<div class="col size"><# if(!isdir){ #> <#= size #> <# }else{ #> - <# } #></div>
			<div class="col time"><#= modifyTime #></div>
		</script>
		<script type="text/template" id="file-stat-template">
            <s:if test="language==0">共<#= folderNum #>个文件夹，<#= fileNum #>个文件</s:if>
            <s:if test="language==1"><#= folderNum #> <# if(folderNum > 1){ #>folders<# }else{ #>folder<# } #> and <#= fileNum #> <# if(fileNum > 1){ #>files<# }else{ #>file<# } #></s:if>
		</script>
        
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/models.js?$ver"></script>
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/outlink.js?$ver"></script>
        
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>