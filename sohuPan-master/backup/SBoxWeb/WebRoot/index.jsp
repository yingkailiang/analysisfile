<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%@ include file="security/auth.jsp"%>
<%
Long userId = 0l;
String pageStatus = request.getParameter("pageStatus");
if(user!=null){
	userId = user.getUser().getId();
}
/*
PAN-1251 
判断用户是否登录，如果未登录跳转到登录页面
*/
/* Begin */
else
	response.sendRedirect("http://pan.sohu.net/home");
/* End */
String path = request.getContextPath();
System.out.println("current page:"+request.getRequestURI());
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <s:if test="#session.delete_key==null">
        	<script type="text/javascript">
				var open_delete_password = <s:property value="#session.user.user.openDp" />;
			</script>
        </s:if>
        <s:else>
        	<script type="text/javascript">
				var open_delete_password = 0;
			</script>
        </s:else>
        
	    <s:if test="#session.user.userPro.guide==0">
	    <script type="text/javascript">
	    <s:if test="#session.user.account!=null">  
		    jQuery(function(){
			    Sbox.Guide(1)
			})
	    </s:if>
		    <s:if test="#session.user.account==null">
		    <%
		    request.getSession().putValue("toUrl",request.getRequestURL());
		    %>
			  jQuery(function(){
			        Sbox.Guide(0)
			  })
			  </s:if>
	    </script>
	    </s:if>
		<title>搜狐企业网盘</title>
	</head>
    <body class="home">
		<s:include value="head.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>
    	<div id="content"></div>
		<script type="text/template" id="layout-template">
			<div id="sidebar" class="sidebar">
				
			</div>
			<div id="main" class="main">
				
			</div>
		</script>
		<script type="text/template" id="sidebar-template">
			<div class="mod mine on">
				<div class="mod-hd" id="myFileHead">
					<span class="icon icon-myfile"></span>我的文件<span class="arrow"></span>
				</div>
				<div class="mod-bd" id="myFileBody">
					
				</div>
			</div>
			<div class="mod public">
				<div class="mod-hd" id="publicFileHead">
					<span class="icon icon-publicfile"></span>企业共享<span class="arrow"></span>
				</div>
				<div class="mod-bd" id="publicFileBody">
				</div>
			</div>
			<div class="mod shared">
				<div class="mod-hd" id="shareFileHead">
					<span class="icon icon-sharefile"></span>我收到的共享文件<span class="arrow"></span>
				</div>
				<div class="mod-bd" id="shareFileBody">
				</div>
			</div>
			<div class="mod outchain">
				<div class="mod-hd" id="outChainHead">
					<span class="icon icon-outlink"></span>外链管理
				</div>
				<div class="mod-bd">
					<ul>
						<li class="outlink cur">外链分享</li>
						<li class="uploadlink">匿名上传</li>
					</ul>
				</div>
			</div>
			<!--
			<div class="mod starfiles">
				<div class="mod-hd" id="starFileHead">
					星标文件
				</div>
			</div>
			-->
			<div class="mod recyclebin">
				<div class="mod-hd" id="recycleBinHead">
					<span class="icon icon-recyclebin"></span>回收站
				</div>
				<div class="mod-bd">
					
				</div>
			</div>
			<div class="usage">
                <div class="usage-bar">
                    <span class="cur" style="width:<s:property value='#session.baifenbi' />%;"></span>
                </div>
                <p><span class="used"><s:property value="#session.usedSize" /></span> / <span class="total"><s:property value="#session.allSize" /></span></p>
            </div>
		</script>
		<script type="text/template" id="mainOperation-template">
			<a class="upload" href="javascript:;" title="上传文件"><span>上传</span></a>
			<a class="create" href="javascript:;" title="新建文件夹"><span>新建文件夹</span></a>
		</script>
		<script type="text/template" id="navigation-template">
			<# 
				var len = paths.length;
			 #>
			<span class="up">
				<a href="javascript:;" title="返回上一级" class="<# if(len === 1){ #>disabled<# } #>"><span class="icon icon-up"></span>上一级</a>
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
							<a href="javascript:;" _index="<#= i #>" title="<#= path #>" <#if(i===len-1){#>class="current"<#}#>><#- shortPath #></a>
						</span>
						<# } #>
				<# }) #>
			</span>
		</script>
		<script type="text/template" id="view-change-template">
			<a href="javascript:;" class="lview" title="列表模式"><span class="icon icon-listview"></span></a>
			<a href="javascript:;" class="pview" title="缩略图模式"><span class="icon icon-preview"></span></a>
		</script>
		<script type="text/template" id="toolbar-template">
			<# var isMine = true; #>
			<ul class="ops">
				<# if(quitshare){ #>
				<li><a href="javascript:;" class="quitshare"><span class="icon icon-quitshare"></span>退出共享</a></li>
				<# } #>
				<# if(showmember){ #>
				<li><a href="javascript:;" class="show-member"><span class="icon icon-member"></span>查看共享成员</a></li>
				<# } #>
				<# if(share){ #>
				<# if(hasShare){ #>
				<li class="has-sub">
					<a href="javascript:;" class="share-manage"><span class="icon icon-share"></span>共享管理<span class="arrow"></span></a>
					<ul class="dropdown">
						<li><a href="javascript:;" class="share-setting"><span class="icon icon-setting"></span>共享设置</a></li>
						<# if(size){ #>
						<li><a href="javascript:;" class="setsize"><span class="icon icon-size"></span>空间分配</a></li>
						<# } #>
						<li><a href="javascript:;" class="share-cancle"><span class="icon icon-cancle3"></span>解除共享</a></li>
					</ul>
				</li>
				<# }else{ #>
				<li><a href="javascript:;" class="share"><span class="icon icon-share"></span>共享</a></li>
				<# } #>
				<# } #>
				<# if(preview){ #>
				<li><a href="javascript:;" class="file-view"><span class="icon icon-fileview"></span>预览</a></li>
				<# } #>
				<# if(download){ #>
				<li><a href="javascript:;" class="download"><span class="icon icon-download"></span>下载</a></li>
				<# } #>
				<# if(outchain){ #>
				<# if(hasOutChain){ #>
				<li class="has-sub">
					<a href="javascript:;" class="outchain-manage"><span class="icon icon-outchain"></span>外链分享<span class="arrow"></span></a>
					<ul class="dropdown">
						<li><a href="javascript:;" class="outchain-view"><span class="icon icon-view"></span>查看外链</a></li>
						<li><a href="javascript:;" class="outchain-setting"><span class="icon icon-setting"></span>外链设置</a></li>
						<li><a href="javascript:;" class="outchain-send"><span class="icon icon-mail"></span>邮件发送</a></li>
						<li><a href="javascript:;" class="outchain-cancle"><span class="icon icon-cancle3"></span>取消外链</a></li>
					</ul>
				</li>
				<# }else{ #>
				<li><a href="javascript:;" class="outchain"><span class="icon icon-outchain"></span>外链分享</a></li>
				<# } #>
				<# } #>
				<# if(uploadlink){ #>
				<# if(anonymousUpload){ #>
				<li class="has-sub">
					<a href="javascript:;" class="upload-link-manage"><span class="icon icon-uploadlink"></span>匿名上传管理<span class="arrow"></span></a>
					<ul class="dropdown">
						<li><a href="javascript:;" class="uploadlink-view"><span class="icon icon-view"></span>查看上传链接</a></li>
						<li><a href="javascript:;" class="uploadlink-setting"><span class="icon icon-setting"></span>匿名上传设置</a></li>
						<li><a href="javascript:;" class="uploadlink-cancle"><span class="icon icon-cancle3"></span>关闭匿名上传</a></li>
					</ul>
				</li>
				<# }else{ #>
				<li><a href="javascript:;" class="uploadlink"><span class="icon icon-uploadlink"></span>开启匿名上传</a></li>
				<# } #>
				<# } #>
				<# if(rename){ #>
				<li><a href="javascript:;" class="rename"><span class="icon icon-rename"></span>重命名</a></li>
				<# } #>
				<# if(move){ #>
				<li><a href="javascript:;" class="move"><span class="icon icon-move"></span>移动</a></li>
				<# } #>
				<# if(del){ #>
				<li><a href="javascript:;" class="delete"><span class="icon icon-delete"></span>删除</a></li>
				<# } #>
				<# if(history){ #>
				<li><a href="javascript:;" class="history"><span class="icon icon-history"></span>历史版本</a></li>
				<# } #>
				<# if(lock){ #>
				<li><a href="javascript:;" class="lock"><span class="icon icon-lock"></span>上锁</a></li>
				<# } #>
				<# if(unlock){ #>
				<li><a href="javascript:;" class="lock"><span class="icon icon-unlock"></span>解锁</a></li>
				<# } #>
			</ul>
		</script>
		<script type="text/template" id="file-context-menu">

		</script>
		<script type="text/template" id="file-sort-template">
			<div class="checkbox">
				<span class="icon icon-unchecked"></span>
			</div>
			<div class="col name asc">
				文件名
				<span class="sort"></span>
			</div>
			<div class="col size sep">
				大小
				<span class="sort"></span>
			</div>
			<div class="col time sep">
				修改时间
				<span class="sort"></span>
			</div>
		</script>
		<script type="text/template" id="recycle-sort-template">
			<div class="checkbox">
	 			<span class="icon icon-unchecked"></span>
	 		</div>
	 		<div class="col name asc">
	 			文件名
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col time sep">
	 			删除时间
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col size sep">
	 			大小
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col create-time sep">
	 			创建时间
	 			<span class="sort"></span>
	 		</div>
		</script>
		<script type="text/template" id="link-sort-template">
			<div class="checkbox">
	 			<span class="icon icon-unchecked"></span>
	 		</div>
	 		<div class="col name asc">
	 			文件名
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col down-count sep">
	 			下载次数
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col size sep">
	 			大小
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col expire-time sep">
	 			失效时间
	 			<span class="sort"></span>
	 		</div>
		</script>
		<script type="text/template" id="uploadlink-sort-template">
			<div class="checkbox">
	 			<span class="icon icon-unchecked"></span>
	 		</div>
	 		<div class="col name asc">
	 			文件名
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col file-path sep">
	 			文件路径
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col usedsize sep">
	 			匿名上传
	 			<span class="sort"></span>
	 		</div>
	 		<div class="col expire-time sep">
	 			失效时间
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
					var fileName = isOutDomain ? (nickName + '&lt;' + email + '&gt;') : nickName;// + '&lt;' + email + '&gt;';
					var shortName = fileName;
					shareFlag = false;
					note = ''
					modifyTime = '-';
				}
				else{
					var isdir = (typeof parentDir !== 'undefined');
					if(!isdir){
						var fmtsize = formatbytes(size);
						var filetype = getFileType(name);
					}
					var previewable = previewFileType.test(filetype);

					if(filetype === 'rar' || filetype === 'zip'){
						if(size >= 100 * 1024 * 1024){
							previewable = false;
						}
					}

					if(typeof power !== 'undefined' && (power === 5)){
						previewable = false;
					}

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
					var isRoot = isdir && (parentDir == userId || parentDir === 'root');
					var star = false;
					var isShareRoot = typeof(shareMail) !== 'undefined';
					modifyTime = modifyTime.substring(0,modifyTime.lastIndexOf(':'));
	            	var powerList = ['可查看','可查看上传','可编辑','仅预览','仅上传','可预览上传'];
					var lock =false;
				}
			 #>
			<div class="checkbox">
				<span class="icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"></span>
			</div>
			<div class="col name clearfix">
				<div class="file-icon">
					<# if(isdir){ #>
					<a href="javascript:;"><span class="file-type <# if(shareFlag){ #>sharefolder<# }else{ #>folder<# } #>"></span></a>
					<# }else{ #>
					<a hideFocus="true" <# if(previewable){ #>target="_blank"<# } #> href="<# if(isdir){ #>javascript:;<# }else if(previewable){ #>/getFileOnline/<#= id #><# }else{ #>javascript:;<# } #>" ><span class="file-type <#= filetype #>"></span></a>
					<# } #>
					<# if(typeof lock !== 'undefined' && lock){ #><span class="locked"></span><# } #>
				</div>
				<div class="file-name" title="<# if(typeof(acl) !== 'undefined' && typeof(shareUserName) !== 'undefined'){ #>来自<#= shareUserName #> <# } #><#= name #>">
					<a hideFocus="true" <# if(previewable){ #>target="_blank"<# } #> href="<# if(isdir){ #>javascript:;<# }else if(previewable){ #>/getFileOnline/<#= id #><# }else{ #>javascript:;<# } #>" <# if(!isdir && !previewable){ #>class="unpreviewable"<# } #>>
						<#= shortName #>
					</a> 
					<input type="text" class="ipt-text" value="<# if(typeof name !== 'undefined' && name !== ''){#><#= name #><# }else{ #>新建文件夹<# } #>" /> &nbsp;
				</div>
				<div class="file-star" style="display:none;">
					<a href="javascript:;" class="star">
						<# if(!isdir && !star){ #>
						<span class="icon icon-star-gray"></span>
						<# }else if(!isdir && star){ #>
						<span class="icon icon-star-yellow"></span>
						<# } #>
					</a>
				</div>
				<#if(!isUserList){#>
				<div class="file-remark">
					<span class="remark-text" title="<#= note #>">
						<# if(typeof note !== 'undefined' && note !== ''){ #>
						<#= shortRemark #>
						<# } #>
					</span>
					<# if(!isShareRoot){ #>
					<input type="text" class="ipt-text" value="<#= note #>" /> &nbsp;
					<a href="javascript:;" title="备注" class="remark"><span class="icon icon-remark"></span></a>
					<# } #>
				</div>
				<#}#>
				<# if(!isShareRoot && typeof hasOutChain !== 'undefined' && hasOutChain){ #>
				<div class="file-status">
					&nbsp;
					<a title="已生成外链" href="javascript:;" class="more"><span class="icon icon-haslink"></span></a>
				</div>
				<# } #>
				<# if(isShareRoot){ #>
				<div class="file-status">
					<span class="share-power"><#= powerList[acl-1] #></span>
				</div>
				<# } #>
			</div>
			<div class="col size"><# if(!isdir){ #> <#= fmtsize #> <# }else{ #> - <# } #></div>
			<div class="col time"><#= modifyTime #></div>
		</script>
		<script type="text/template" id="preview-file-template">
			<# 
				var isUserList = typeof email !== 'undefined';
				if(isUserList){
					var isdir = true;
					var fileName = isOutDomain ? (nickName + '&lt;' + email + '&gt;') : nickName;// + '&lt;' + email + '&gt;';
					var shortName = fileName;
					shareFlag = false;
					note = ''
					modifyTime = '-';
				}
				else{
					var isdir = (typeof parentDir !== 'undefined');

					var preview;
					if(!isdir && isPreviewImgFile(name,size)){
						preview = PREVIEW_URL + thumbnailsKey + '_z120x90';
					}

					if(!isdir){
						var fmtsize = formatbytes(size);
						var filetype = getFileType(name);
					}
					var previewable = previewFileType.test(filetype);
					if(filetype === 'rar' || filetype === 'zip'){
						if(size >= 100 * 1024 * 1024){
							previewable = false;
						}
					}

					if(typeof power !== 'undefined' && (power === 5)){
						previewable = false;
					}
					var shortName,fileName;
					if(isdir || filetype === 'unknow'){
						shortName = getStrSize(name) > 18 ? cutStr(name,18) + '...' : name;
					}else{
						fileName = name.substring(0,name.lastIndexOf('.'));
						shortName = getStrSize(fileName) > 18 ? cutStr(fileName,18) + '...' : fileName + '.' + name.substring(name.lastIndexOf('.') + 1); 
					}
					shortName = shortName.replace(/ /g,'&nbsp;');
					var shortRemark = getStrSize(note) > 16 ? cutStr(note,16) + '...' : note;
					shortRemark = shortRemark.replace(/ /g,'&nbsp;').replace(/</g,'&lt;').replace(/>/,'&gt;');
					var isRoot = isdir && (parentDir == userId || parentDir === 'root');
					var star = false;
					var isShareRoot = typeof(shareMail) !== 'undefined';
					modifyTime = modifyTime.substring(0,modifyTime.lastIndexOf(':'));
					var powerList = ['可查看','可查看上传','可编辑','仅预览','仅上传','可预览上传'];
					var lock =false;
				}
			 #>
			<div class="checkbox">
				<span class="icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"></span>
			</div>
			<div class="col name clearfix">
				<div class="file-icon">
					<# if(isdir){ #>
					<a href="javascript:;"><span class="file-type <# if(shareFlag){ #>sharefolder<# }else{ #>folder<# } #>"></span></a>
					<# }else{ #>
					<a <# if(previewable){ #>target="_blank"<# } #> href="<# if(isdir){ #>javascript:;<# }else if(previewable){ #>/getFileOnline/<#= id #><# }else{ #>javascript:;<# } #>" ><span class="file-type <#= filetype #>" <# if(!isdir && (typeof preview !=='undefined')){ #>style="background-image:url(<#= preview #>)"<# } #>></span></a>
					<# } #>
					<# if(typeof lock !== 'undefined' && lock){ #><span class="locked"></span><# } #>
				</div>
				<div class="file-name" title="<# if(typeof(acl) !== 'undefined' && typeof(shareUserName) !== 'undefined'){ #>来自<#= shareUserName #> <# } #><#= name #>">
					<a <# if(previewable){ #>target="_blank"<# } #> href="<# if(isdir){ #>javascript:;<# }else if(previewable){ #>/getFileOnline/<#= id #><# }else{ #>javascript:;<# } #>" <# if(!isdir && !previewable){ #>class="unpreviewable"<# } #>>
						<#= shortName #>
					</a> 
					<input type="text" class="ipt-text" value="<# if(typeof name !== 'undefined' && name !== ''){#><#= name #><# }else{ #>新建文件夹<# } #>" /> &nbsp;
				</div>
				<div class="file-star" style="display:none;">
					<a href="javascript:;" class="star">
						<# if(!isdir && !star){ #>
						<span class="icon icon-star-gray"></span>
						<# }else if(!isdir && star){ #>
						<span class="icon icon-star-yellow"></span>
						<# } #>
					</a>
				</div>
				<#if(!isUserList){#>
				<# if(typeof(acl) === 'undefined'){ #>
				<div class="file-remark">
					<span class="remark-text" title="<#= note #>">
						<# if(typeof note !== 'undefined' && note !== ''){ #>
						<#= shortRemark #>
						<# } #>
					</span>
					<# if(!isShareRoot){ #>
					<input type="text" class="ipt-text" value="<#= note #>" /> &nbsp;
					<a href="javascript:;" title="备注" class="remark"><span class="icon icon-remark"></span></a>
					<# } #>
				</div>
				<# } #>
				<# } #>
			</div>
			<div class="col size"><# if(typeof fmtsize !== "undefined"){ #> <#= fmtsize #> <# }else{ #> - <# } #></div>
			<div class="col time"><#= modifyTime #></div>
			<# if(typeof(acl) !== 'undefined' && typeof(shareUserName) !== 'undefined'){ #><span class="share-power"><#= powerList[acl-1] #></span><# } #>
		</script>
		<script type="text/template" id="file-stat-template">
			共<#= folderNum #>个文件夹，<#= fileNum #>个文件
		</script>
		<script type="text/template" id="outchain-toolbar-template">
			<ul class="ops">
				<# if(copy){ #>
				<li><a href="javascript:;" class="copy"><span class="icon icon-view"></span>查看外链</a></li>
				<# } #>
				<# if(edit){ #>
				<li><a href="javascript:;" class="edit"><span class="icon icon-setting"></span>外链设置</a></li>
				<# } #>
				<# if(send){ #>
				<li><a href="javascript:;" class="send"><span class="icon icon-mail"></span>邮件发送</a></li>
				<# } #>
				<# if(del){ #>
				<li><a href="javascript:;" class="del"><span class="icon icon-cancle3"></span>取消外链</a></li>
				<# } #>
			</ul>
		</script>
		<script type="text/template" id="link-item-template">
			<# 
				var isdir = (typeof parentDir !== 'undefined');
				var size,filetype;
				if(!isdir){
					size = formatbytes(size);
					filetype = getFileType(name);
				}else{
					size = '-'
				}
				var shortName,fileName;
				if(isdir || filetype === 'unknow'){
					shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
				}else{
					fileName = name.substring(0,name.lastIndexOf('.'));
					shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + filetype; 
				}
				shortName = shortName.replace(/ /g,'&nbsp;');
				var lock = false;
				var star = false;
				downCount = downCount === '' ? 0 : downCount;
				expiredate = expiredate.substring(0,expiredate.lastIndexOf(':'));
			 #>
			<div class="checkbox">
				<span class="icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"></span>
			</div>
			<div class="col name clearfix">
				<div class="file-icon">
					<# if(isdir){ #>
					<span class="file-type folder"></span>
					<# }else{ #>
					<span class="file-type <#= filetype #>"></span>
					<# } #>
					<# if(typeof lock !== 'undefined' && lock){ #><span class="locked"></span><# } #>
				</div>
				<div class="file-name">
					<a href="<#= outlink #>" target="_blank" title="<#= name #>">
						<#= shortName #>
					</a>
				</div>
			</div>
			<div class="col down-count"><#= downCount #></div>
			<div class="col size"><#= size #></div>
			<div class="col expire-time"><#= expiredate #></div>
		</script>
		<script type="text/template" id="uploadlink-toolbar-template">
			<ul class="ops">
				<# if(copy){ #>
				<li><a href="javascript:;" class="copy"><span class="icon icon-view"></span>查看上传链接</a></li>
				<# } #>
				<# if(edit){ #>
				<li><a href="javascript:;" class="edit"><span class="icon icon-setting"></span>匿名上传设置</a></li>
				<# } #>
				<# if(del){ #>
				<li><a href="javascript:;" class="del"><span class="icon icon-cancle3"></span>关闭匿名上传</a></li>
				<# } #>
			</ul>
		</script>
		<script type="text/template" id="uploadlink-item-template">
			<# 
				var isdir = (typeof parentDir !== 'undefined');
				var size = formatbytes(usedSize)
					filetype = getFileType(name);
				var shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
				shortName = shortName.replace(/ /g,'&nbsp;');
				downCount = downCount === '' ? 0 : downCount;
				expiredate = expiredate.substring(0,expiredate.lastIndexOf(':'));
			 #>
			<div class="checkbox">
				<span class="icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"></span>
			</div>
			<div class="col name clearfix">
				<div class="file-icon">
					<span class="file-type folder"></span>
				</div>
				<div class="file-name">
					<a href="<#= uploadlink #>" target="_blank" title="<#= name #>">
						<#= shortName #>
					</a>
				</div>
			</div>
			<div class="col file-path" title="<#= path #>"><#= path #></div>
			<div class="col usedsize"><#= size #></div>
			<div class="col expire-time"><#= expiredate #></div>
		</script>
		<script type="text/template" id="recycle-warning-template">
		 	<p>回收站里的文件不会占用您的空间，服务器将自动清除30天前的文件。</p>
		</script>
		<script type="text/template" id="recycle-setting-template">
			<# if(!open_delete_password){ #>
		 	<a class="setting-delpass" href="javascript:;">设置回收站密码</a>
		 	<# }else{ #>
		 	<a class="change-delpass" href="javascript:;">修改回收站密码</a>
		 	<# } #>
		</script>
		<script type="text/template" id="recycle-mainop-remplate">
			<a class="btn btn32 btn32-blue" id="empty"><span>清空回收站</span></a>
		</script>
		<script type="text/template" id="recycle-toolbar-template">
			<ul class="ops">
				<# if(reduce){ #>
				<li><a href="javascript:;" class="reduce"><span class="icon icon-reduce"></span>还原</a></li>
				<# } #>
				<# if(del){ #>
				<li><a href="javascript:;" class="del"><span class="icon icon-completedelete"></span>彻底删除</a></li>
				<# } #>
			</ul>
		</script>
		<script type="text/template" id="recycle-item-template">
			<# 
				var isdir = (typeof parentDir !== 'undefined');
				var size,filetype;
				if(!isdir){
					size = formatbytes(size);
					filetype = getFileType(name);
				}else{
					size = '-'
				}
				var shortName,fileName;
				if(isdir || filetype === 'unknow'){
					shortName = getStrSize(name) > 38 ? cutStr(name,38) + '...' : name;
				}else{
					fileName = name.substring(0,name.lastIndexOf('.'));
					shortName = getStrSize(fileName) > 38 ? cutStr(fileName,38) + '...' : fileName + '.' + filetype; 
				}
				shortName = shortName.replace(/ /g,'&nbsp;');
				var lock = false;
				var star = false;
				createTime = createTime.substring(0,modifyTime.lastIndexOf(':'));
				modifyTime = modifyTime.substring(0,modifyTime.lastIndexOf(':'));
			#>
			<div class="checkbox">
				<span class="icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"></span>
			</div>
			<div class="name col clearfix">
				<div class="file-icon">
					<# if(isdir){ #>
					<span class="file-type folder"></span>
					<# }else{ #>
					<span class="file-type <#= filetype #>"></span>
					<# } #>
					<# if(typeof lock !== 'undefined' && lock){ #><span class="locked"></span><# } #>
				</div>
				<div class="file-name"><span title="<#= name #>"><#= shortName #></span></div>
			</div>
			<div class="path col">
				<#= modifyTime #>
			</div>
			<div class="col size"><#= size #></div>
			<div class="time col"><#= createTime #></div>
		</script>
	    <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/views.js?$ver"></script>
	    <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/models.js?$ver"></script>
	    <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/route.js?$ver"></script>
	    
        <s:include value="tj.jsp" >
        </s:include>
	</body>
</html>