<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
        <s:include value="../head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <script type="text/javascript">
            jQuery(function(){
                function resize(){
                    var winHeight = $(window).height(),
                        hdHeight = $('#header').height();
                    $('#sidebar').height(winHeight - hdHeight - 15);
                }
                resize();
                $(window).on('resize',resize);
            })
        </script>
        <title>搜狐企业网盘</title>
    </head>
    <body class="manage">
        <s:include value="../header-admin.jsp" >
			<s:param name="pageStatus" value="3"></s:param>
		</s:include>
        <div id="content" class="manage-content group-list clearfix">
            <div id="main" class="main">
                <div class="main-op">
                    <a class="btn btn32 btn32-green <s:if test="agn >= groupSize">btn32-disabled</s:if>" title="新建群组" id="createGroup"><span>新建群组</span></a>
                </div>
                <div class="stat">
                   	 一共能建<s:property value="groupSize"/>个群组，还能新建<s:property value="groupSize-agn"/>个群组
                </div>
                <div class="list-table u-list group-list" id="groupList">
                    <div class="list-header">
                        <div class="col name asc">
                            群组名
                        </div>
                        <div class="col num sep">
                            成员数目
                        </div>
                        <div class="col time sep">
                            创建时间
                        </div>
                    </div>
                    <div class="list-body">
                        <ul class="listview">
                           <s:if test="groupList.size > 0">
	    		 			<s:iterator value="groupList" status="i">
								<li class="list-item" data-id="<s:property value="id"/>" data-email="<s:property value="loginName"/>">
		    		 				<div class="col name clearfix">
	                                    <a href="/Group/MemberList/<s:property value="id"/>/<s:property value="group_name"/>"><s:property value="group_name"/></a>
	                                    <span class="actions">
	                                        <a href="javascript:;" title="重命名群组" class="rename-group"><span class="icon icon-edit"></span></a>
	                                        <a href="javascript:;" title="删除群组" class="del-group"><span class="icon icon-del-group"></span></a>
	                                    </span>
	                                </div>
		    		 				<div class="col num"><s:property value="number"/></div>
                                	<div class="col time"><s:property value="createTime.substring(0,16)"/></div>
		    		 			</li>
		    		 		</s:iterator>
	    		 		</s:if>
                        <s:else>
                            <li class="list-item list-empty">还没有群组，<a href="javascript:;" onclick="$('#createGroup').trigger('click')">立即创建</a></li>
                        </s:else> 
                        </ul>
                    </div>
                    <div class="list-footer">
                     	<s:if test="page!=null&&page.allPage>1">
                        <div class="page">
                        <ul>
                        		<s:if test="page.nowPage==1">
                                <li class="prev-page">上一页</li>
                                </s:if>
                                <s:if test="page.nowPage!=1">
                                <li class="prev-page"><a href="/Group!prevPage.action">上一页</a></li>
                                </s:if>
                                <s:if test="page.nowPage-4>0">
                                <li _page="1"><a href="/Group!setPage.action?pageNumber=1">1</a></li>
                                <li _page="1"><span >...</span></li>
                                <s:else>
                                <li _page="1"><a href="/Group!setPage.action?pageNumber=1">1</a></li>
                                </s:else>
                                </s:if>
                                <s:if test="page.nowPage-1>0">
                            		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage-1"/>"><s:property value="page.nowPage-1"/></a></li>
                                </s:if>
                                <li class="cur-page"><a href="javascript:;"><s:property value="page.nowPage"/></a></li>
                                <s:if test="page.nowPage+1<=page.allPage">
                               		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage+1"/>"><s:property value="page.nowPage+1"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+2<=page.allPage">
                               		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage+2"/>"><s:property value="page.nowPage+2"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+4<page.allPage">
                                <li _page="1"><span >...</span></li>
                                <li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.allPage"/>"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage==page.allPage">
                                <li class="next-page">下一页</li>
                                </s:if>
                                <s:if test="page.nowPage!=page.allPage">
                                <li class="next-page"><a href="/Group!nextPage.action">下一页</a></li>
                                 </s:if>
                                <li class="next-page">总共<s:property value="page.allPage"/>页</li>
                            </ul>
                        </div>
                        </s:if>
                    </div> 
                </div>
            </div>
        </div>
        <s:include value="../tj.jsp" >
        </s:include>
    </body>
</html>