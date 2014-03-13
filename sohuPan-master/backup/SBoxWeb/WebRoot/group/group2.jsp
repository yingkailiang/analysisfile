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
         <script type="text/javascript">
          	var groupId= <s:property value="groupId"/>;
        </script>
        <title>搜狐企业网盘</title>
    </head>
    <body class="manage">
       <s:include value="../header-admin.jsp" >
			<s:param name="pageStatus" value="3"></s:param>
		</s:include>
        <div id="content" class="manage-content group-member clearfix">
            <div id="main" class="main">
                <div class="main-op">
                    <a class="btn btn32 btn32-green" title="添加群组成员" id="addNewGroup"><span>添加群组成员</span></a>
                </div>
                <div class="navigation">
                     <span class="path">
                        <span>
                            <a href="/Group!getAll.action" _index="0" title="群组">群组</a>
                        </span>
                        <span>
                            <span class="arrow">&gt;</span>
                            <a href="javascript:;"title="<s:property value="#session.GroupName"/>" class="current"><s:property value="#session.GroupName"/></a>
                        </span>
                    </span>
                </div>
                <div class="list-table u-list group-list" id="groupMemberList">
                    <div class="list-header">
                        <div class="col name asc">
                            成员名
                        </div>
                        <div class="col mail sep">
                            邮箱
                        </div>
                        <div class="col time sep">
                            最近登录时间
                        </div>
                    </div>
                    <div class="list-body">
                        <ul class="listview">
                            <s:if test="groupList.size > 0">
	    		 			<s:iterator value="groupList" status="i">
								<li class="list-item" data-id="<s:property value="id"/>" data-email="<s:property value="loginName"/>">
		    		 				<div class="col name clearfix">
	                                    <s:property value="nickName"/>
	                                    <span class="actions">
	                                        <a href="javascript:;" title="移出群组" class="remove"><span class="icon icon-delete-user"></span></a>
	                                        <a href="javascript:;" title="移动到其他群组" class="moveto"><span class="icon icon-moveto"></span></a>
	                                    </span>
	                                </div>
		    		 				<div class="col num"><s:property value="loginName"/></div>
                                	<div class="col time"><s:property value="lastLoginTime.substring(0,16)"/></div>
		    		 			</li>
		    		 		</s:iterator>
	    		 		</s:if>
                        <s:else>
                            <li class="list-item list-empty">该群组还没有成员，<a href="javascript:;" onclick="$('#addNewGroup').trigger('click')">立即添加</a></li>
                        </s:else> 
                        </ul>
                    </div>
                     <div class="list-footer">
                    <s:if test="page!=null&&page.allPage>1">
                        <div class="page">
                        <ul>
                        	<s:if test="page.nowPage!=1">
                                <li class="prev-page"><a href="/Group!prevPageMember.action?groupId=<s:property value="groupId"/>">上一页</a></li>
                                </s:if>
                                 <s:if test="page.nowPage==1">
                                <li class="prev-page">上一页</li>
                               </s:if>
                                <s:if test="page.nowPage-4>0">
                                <li _page="1"><a href="/Group!setPageMember.action?pageNumber=1&groupId=<s:property value="groupId"/>">1</a></li>
                                <li _page="1"><span >...</span></li>
                                </s:if>
                                <s:if test="page.nowPage-2>0">
                               		<li _page="1"><a href="/Group!setPageMember.action?pageNumber=<s:property value="page.nowPage-2"/>&groupId=<s:property value="groupId"/>"><s:property value="page.nowPage-2"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-1>0">
                            		<li _page="1"><a href="/Group!setPageMember.action?pageNumber=<s:property value="page.nowPage-1"/>&groupId=<s:property value="groupId"/>"><s:property value="page.nowPage-1"/></a></li>
                                </s:if>
                                <li class="cur-page"><a href="javascript:;"><s:property value="page.nowPage"/></a></li>
                                <s:if test="page.nowPage+1<=page.allPage">
                               		<li _page="1"><a href="/Group!setPageMember.action?pageNumber=<s:property value="page.nowPage+1"/>&groupId=<s:property value="groupId"/>"><s:property value="page.nowPage+1"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+2<=page.allPage">
                               		<li _page="1"><a href="/Group!setPageMember.action?pageNumber=<s:property value="page.nowPage+2"/>&groupId=<s:property value="groupId"/>"><s:property value="page.nowPage+2"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+4<page.allPage">
                                <li _page="1"><span >...</span></li>
                                <li _page="1"><a href="/Group!setPageMember.action?pageNumber=<s:property value="page.allPage"/>&groupId=<s:property value="groupId"/>">111<s:property value="page.allPage"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage!=page.allPage">
                                <li class="next-page"><a href="/Group!nextPageMember.action?groupId=<s:property value="groupId"/>">下一页</a></li>
                                </s:if>
                                 <s:if test="page.nowPage==page.allPage">
                                	<li class="next-page">下一页</li>
                                </s:if>
<%--                                 <s:else> --%>
<%--                                  --%>
<%--                                 </s:else> --%>
<%--                                  </s:if> --%>
                                
                                <li class="next-page">总共<s:property value="page.allPage"/>页</li>
                            </ul>
<!--                             <ul> -->
<!--                                 <li class="prev-page"><a href="/Group!prevPage.action">上一页</a></li> -->
<%--                                 <s:if test="page.nowPage-2>0"> --%>
<%--                                 	<s:if test="page.nowPage-2=1"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage-2"/>"><s:property value="page.nowPage-2"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 	<s:if test="page.nowPage-2>1"> --%>
<!--                                 		<li><span>...</span></li> -->
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage-2"/>"><s:property value="page.nowPage-2"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 </s:if> --%>
<%--                                 <s:if test="page.nowPage-1>=1"> --%>
<%--                                 	<s:if test="page.nowPage-1=1"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage-1"/>"><s:property value="page.nowPage-1"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 	<s:if test="page.nowPage-1>1"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage-1"/>"><s:property value="page.nowPage-1"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 </s:if> --%>
<%--                                 <li class="cur-page"><s:property value="page.nowPage"/></li> --%>
<%--                                 <s:if test="page.nowPage+1<=page.allPage"> --%>
<%--                                 	<s:if test="page.nowPage+1=page.allPage"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage+1"/>"><s:property value="page.nowPage+1"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 	<s:if test="page.nowPage+2>page.allPage"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage+1"/>"><s:property value="page.nowPage+1"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 </s:if> --%>
<%--                                 <s:if test="page.nowPage+2<=page.allPage"> --%>
<%--                                 	<s:if test="page.nowPage+2=page.allPage"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage+2"/>"><s:property value="page.nowPage+2"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 	<s:if test="page.nowPage+2>page.allPage"> --%>
<%--                                 		<li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.nowPage+2"/>"><s:property value="page.nowPage+2"/></a></li> --%>
<%--                                 	</s:if> --%>
<%--                                 </s:if> --%>
<%--                                 <li _page="1"><a href="/Group!setPage.action?pageNumber=<s:property value="page.allPage"/>"><s:property value="page.allPage"/></a></li> --%>
<!--                                 <li class="next-page"><a href="/Group!nextPage.action">下一页</a></li> -->
<%--                                 <li class="next-page">总共<s:property value="page.allPage"/>页</li> --%>
<!--                             </ul> -->
                        </div>
                        </s:if>
                </div>
            </div>
        </div>
        <s:include value="../tj.jsp" >
        </s:include>
    </body>
</html>