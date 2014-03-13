<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="../taglibs.jsp"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="../head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/organize.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 用户管理</title>
        <%--comment  
        依据isCloudVersion的值屏蔽掉部门和用户的所有操作
         AGENT-963:end     --%>
        <script type="text/javascript">

			<s:if test="#session.user.account==null">
				var isCloudVersion = 0;
			</s:if>
			<s:else>
				<s:if test="#session.user.account.packageId==null||''.equals(#session.user.account.packageId)">
					var isCloudVersion = 0;
				</s:if>
			</s:else>
			<s:else>
				isCloudVersion = <s:property value="#session.user.account.packageId"/>;
			</s:else>

            var rootDepartmentInfo = {
            	id:'<s:property value='rootDepartmentInfo.id'/>',
                name:'<s:property value='rootDepartmentInfo.name'/>',
                allSpace:<s:property value='rootDepartmentInfo.allSpace'/>,
                usedSpace:<s:property value='rootDepartmentInfo.usedSpace'/>,
                allUsers:<s:property value='rootDepartmentInfo.allUsers'/>,
                usedUsers:<s:property value='rootDepartmentInfo.usedUsers'/>,
                adminUsedSpace:<s:property value='rootDepartmentInfo.adminUsedSpace'/>,
                adminSettingSize:<s:property value='rootDepartmentInfo.adminSettingSize'/>
            }
        </script>
    </head>
    <body class="account">
		<s:include value="../header-admin.jsp" >
			<s:param name="pageStatus" value="2"></s:param>
		</s:include>
		<s:if test="#session.user.account">
    	<div id="content" class="manage-content organize organize-amdin">
    	</s:if>
    	<s:if test="#session.user.account==null"><s:if test="#session.user.user.isAdmin==1">
    	<div id="content" class="manage-content organize organize-page">
    	</s:if></s:if>
    	<s:if test="#session.user.account!=null">
			</s:if>
            <!--main start-->
            <div id="main" class="main">
                <div class="organize-view clearfix" id="organizeView">
                </div>
            </div>
            <!--marin end-->
    	</div>
    	<!--templates-->
        <script type="text/template" id="departmentActionsTemplate">
        <#if(!isCloudVersion){#>
            <a href="javascript:;" class="btn btn24 btn24-gray add-department">新建子部门</a><a href="javascript:;" class="btn btn24 btn24-gray <# if(isRoot === 'root'){ #>btn-disabled<# } #> edit-department">编辑</a><a href="javascript:;" class="btn btn24 btn24-gray <# if(isRoot === 'root'){ #>btn-disabled<# } #> del-department">删除</a>
        <#}#>
        </script>
        <script type="text/template" id="statTemplate">
            共<#= all #>个用户名额，还可分配<#= all - used #>个用户
        </script>
        <script type="text/template" id="pathTemplate">
            <# 
                var len = paths.length;
             #>
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
                        <a href="javascript:;" data-index="<#= i #>" title="<#= path #>" <#if(i===len-1){#>class="cur"<#}#>><#- shortPath #></a>
                    </span>
                    <# } #>
            <# }) #>
        </script>
        <script type="text/template" id="usageTemplate">
            <# 
                var progress = (all === 0 ? 0 : used / all) * 100 + '%'; 
            #>
            <span>部门已用空间：</span>
            <span class="progress-bar">
                <span style="width:<#= progress #>;"> </span>
            </span>
            <span><#= formatbytes(used) #> / <#= formatbytes(all) #></span>
        </script>
        <script type="text/template" id="addUserTemplate">
			<#if(!isCloudVersion){#>
            <a href="javascript:;" class="btn btn32 btn32-green adduser">添加用户</a>
            <a href="javascript:;" class="btn btn32 btn32-gray importuser">导入用户</a>
			<#}#>
        </script>
        <script type="text/template" id="toolbarTemplate">
<#if(!isCloudVersion){#>
            <# if(edit){ #>
            <a href="javascript:;" class="edit"><i class="icon icon-edit-user"></i><span>编辑</span></a>
            <# } #>
            <# if(move){ #>
            <a href="javascript:;" class="move"><i class="icon icon-moveto"></i><span>移动</span></a>
            <# } #>
            <# if(del){ #>
            <a href="javascript:;" class="del"><i class="icon icon-delete-user"></i><span>删除</span></a>
            <# } #>
            <# if(resend){ #>
            <a href="javascript:;" class="resend"><i class="icon icon-mail"></i><span>重发激活邮件</span></a>
            <# } #>
<#}#>
        </script>
        <script type="text/template" id="ulistHeadTemplate">
            <div class="ulist-head">
                <div class="col col-checkbox">
                    <i class="checkbox icon icon-unchecked"> </i>&nbsp;
                </div>
                <div class="col col-name">
                    <span class="">姓名</span>
                </div>
                <div class="col col-email">帐号邮箱</div>
                <div class="col col-usage">空间使用情况</div>
                <div class="col col-time">角色</div>
                <div class="col col-phone">办公电话</div>
            </div>
        </script>
        <script type="text/template" id="uItemTemplate">
            <div class="col col-checkbox">
                <i class="checkbox icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"> </i>&nbsp;
            </div>
            <div class="col col-name">
                <span <# if(isDomainAdmin){ #>class="isdomainadmin" title="IT管理员"<# } #><# if(!isActive){ #>class="not-active" title="未激活"<# } #>><#= nickName #></span>
            </div>
            <div class="col col-email"><#= email #></div>
            <div class="col col-usage"><#= formatbytes(usedSize) #> / <#= formatbytes(settingSize) #></div>
            <div class="col col-time">
                <# if(isDomainAdmin){ #>
                IT管理员
                <# }else{ #>
                普通用户
                <# } #>
            </div>
            <div class="col col-phone"><#= phoneNum #></div>
        </script>
        <script type="text/template" id="menuTemplate">
<#if(!isCloudVersion){#>
            <a href="javascript:;" class="arrow"></a>
            <ul>
                <# if(add){ #>
                <li><a href="javascript:;" class="add-department">新建子部门</a></li>
                <# } #>
                <# if(edit){ #>
                <li><a href="javascript:;" class="edit-department">编辑部门</a></li>
                <# } #>
                <# if(del){ #>
                <li><a href="javascript:;" class="del-department">删除</a></li>
                <# } #>
            </ul>
<#}#>
        </script>
        <!--//templates-->
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/organize.js?$ver"></script>
        <s:include value="../tj.jsp" >
        </s:include>
    </body>
</html>
