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
        <title>搜狐企业网盘 - 企业通讯录</title>
        <script type="text/javascript">
            var rootDepartmentInfo = {
            	id:'<s:property value='rootDepartmentInfo.id'/>',
                name:'<s:property value='rootDepartmentInfo.name'/>',
                power:-1
            }
        </script>
    </head>
    <body class="account">
		<s:include value="../head.jsp" >
			<s:param name="pageStatus" value="2"></s:param>
		</s:include>
        <div id="content" class="manage-content organize organize-contact">
            <!--main start-->
            <div id="main" class="main">
                <div class="organize-view clearfix" id="organizeView">
                </div>
            </div>
            <!--marin end-->
        </div>
        <!--templates-->
        <script type="text/template" id="departmentActionsTemplate">
        </script>
        <script type="text/template" id="statTemplate">
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
        </script>
        <script type="text/template" id="addUserTemplate">
        </script>
        <script type="text/template" id="toolbarTemplate">
        </script>
        <script type="text/template" id="ulistHeadTemplate">
            <div class="ulist-head">
                <div class="col col-checkbox">
                    <i class="checkbox icon icon-unchecked" style="display:none;"> </i>&nbsp;
                </div>
                <div class="col col-name">
                    <span class="">姓名</span>
                </div>
                <div class="col col-email">帐号邮箱</div>
                <div class="col col-phone">办公电话</div>
            </div>
        </script>
        <script type="text/template" id="uItemTemplate">
            <div class="col col-checkbox">
                <i style="display:none;" class="checkbox icon <# if(typeof checked !=='undefined' && checked){ #>icon-checked<# }else{ #>icon-unchecked<# }#>"> </i>&nbsp;
            </div>
            <div class="col col-name">
                <span <# if(isDomainAdmin){ #>class="isdomainadmin" title="IT管理员"<# } #><# if(!isActive){ #>class="not-active" title="未激活"<# } #>><#= nickName #></span>
            </div>
            <div class="col col-email"><#= email #></div>
            <div class="col col-phone"><#= phoneNum #></div>
        </script>
        <script type="text/template" id="menuTemplate">
        </script>
        <!--//templates-->
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/organize.js?$ver"></script>
        <s:include value="../tj.jsp" >
        </s:include>
    </body>
</html>
