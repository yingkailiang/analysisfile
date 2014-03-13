<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
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
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
	    <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/user.js?$ver"></script>

        <title>搜狐企业网盘 - 用户管理</title>
    </head>
    <body class="manage">
		<s:include value="head.jsp" >
			<s:param name="pageStatus" value="5"></s:param>
		</s:include>
    	<div id="content" class="manage-content user">
    		<s:include value="menu/rightMenu.jsp" >
				<s:param name="pageStatus" value="3"></s:param>
			</s:include>
            <div id="main" class="main">
            <s:if test="!\"1\".equals(#session.user.account.packageId)">
            	<div class="main-op" id="mainOp">
    				<s:if test="canAddUser">
    					<a href="javascript:;" class="btn btn32 btn32-green add"><span>添加新用户</span></a>
                        <a href="javascript:;" class="btn btn32 btn32-gray import"><span>批量导入用户</span></a>
    				</s:if>
    				<s:else>
    					<a href="javascript:;" class="btn btn32 btn32-green add btn32-disabled" title="用户数已经达到上限"><span>添加新用户</span></a>
                        <a href="javascript:;" class="btn btn32 btn32-gray import btn32-disabled" title="用户数已经达到上限"><span>批量导入用户</span></a>
    				</s:else>
    				
    			</div>
    			
    			<div class="stat">共<s:property value="#session.user.account.buyNumber"/>个用户名额，还可分配<s:property value="#session.user.account.buyNumber  - page.allMessage"/>个用户。</div>
    			</s:if>
	    		<div class="list-table u-list user-list">
	    		 	<div class="list-header">
	    		 		<div class="name col">
	    		 			用户名
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="mail col sep">
	    		 			邮箱
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="usage col sep">
	    		 			空间使用情况
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="time col sep">
	    		 			最后登录时间
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 	</div>
	    		 	<div class="list-body">
	    		 		<ul class="files listview" id="userList">
	    		 		<s:if test="jsonArray.size > 0">
	    		 		<s:iterator value="jsonArray" status="i">
								<li class="list-item" data-id="<s:property value="id"/>" 
								data-size="<s:property value="settingSize"/>"
								data-usedSpace="<s:property value="usedSpace"/>"
								data-email="<s:property value="loginName"/>">
		    		 				<div class="col name clearfix">
		    		 				<s:if test="#session.user.user.id!=id">
		    		 					<div class="file-name"><s:property value="nickName"/></div>
		    		 					</s:if>
		    		 					<s:if test="#session.user.user.id==id">
		    		 					<div class="file-name"><s:property value="nickName"/><em> (管理员)</em></div>
		    		 					</s:if>
		    		 					<s:if test="#session.user.user.id!=id">
		    		 					<div class="file-operation">
                                            <!--<a title="重置密码" href="javascript:;" class="reset"><span class="icon icon-reset-password"></span></a>-->
                                            <s:if test="!\"1\".equals(#session.user.account.packageId)">
		    		 						<a title="修改用户空间" href="javascript:;" class="edit"><span class="icon icon-edit-user"></span></a>
		    		 						<a title="删除用户" href="javascript:;" class="del"><span class="icon icon-delete-user"></span></a>
		    		 						</s:if>
		    		 					</div>
		    		 					</s:if>
		    		 				</div>
		    		 				<div class="col mail"><s:property value="loginName"/></div>
		    		 				<div class="col usage"><s:property value="usedSize"/></div>
		    		 				<div class="col time"><s:property value="lastLoginTime.substring(0,16)"/></div>
		    		 			</li>
		    		 		</s:iterator>
	    		 		</s:if>
                        <s:else>
                            <li class="list-item list-empty">还没有用户，<a href="javascript:;" onclick="$('.add').trigger('click')">立即创建新用户</a></li>
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
                                <li class="prev-page"><a href="/UserList/<s:property value="page.nowPage-1"/>">上一页</a></li>
                                </s:if>
                                <s:if test="page.nowPage-5>1">
                                <li _page="1"><a href="/UserList/1">1</a></li>
                                <li _page="1"><span >...</span></li>
                                </s:if>
                                <s:else>
                                	<s:if test="page.nowPage!=1">
                                <li _page="1"><a href="/UserList/1">1</a></li>
                                </s:if>
                                </s:else>
                                
                                <s:if test="page.nowPage-4>1">
                            		<li _page="1"><a href="/UserList/<s:property value="page.nowPage-4"/>"><s:property value="page.nowPage-4"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-3>1">
                            		<li _page="1"><a href="/UserList/<s:property value="page.nowPage-3"/>"><s:property value="page.nowPage-3"/></a></li>
                                </s:if>

                                <s:if test="page.nowPage-2>1">
                            		<li _page="1"><a href="/UserList/<s:property value="page.nowPage-2"/>"><s:property value="page.nowPage-2"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-1>1">
                            		<li _page="1"><a href="/UserList/<s:property value="page.nowPage-1"/>"><s:property value="page.nowPage-1"/></a></li>
                                </s:if>
                                <li class="cur-page"><a href="javascript:;"><s:property value="page.nowPage"/></a></li>
                                <s:if test="page.nowPage+1<=page.allPage">
                               		<li _page="1"><a href="/UserList/<s:property value="page.nowPage+1"/>"><s:property value="page.nowPage+1"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+2<=page.allPage">
                               		<li _page="1"><a href="/UserList/<s:property value="page.nowPage+2"/>"><s:property value="page.nowPage+2"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage+3<=page.allPage">
                               		<li _page="1"><a href="/UserList/<s:property value="page.nowPage+3"/>"><s:property value="page.nowPage+3"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+4<=page.allPage">
                               		<li _page="1"><a href="/UserList/<s:property value="page.nowPage+4"/>"><s:property value="page.nowPage+4"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage+5<page.allPage">
                                <li _page="1"><span >...</span></li>
                                <li _page="1"><a href="/UserList/<s:property value="page.allPage"/>"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                <s:else>
                                	<s:if test="page.nowPage+5==page.allPage">
                                <li _page="1"><a href="/UserList/<s:property value="page.allPage"/>"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                </s:else>
                                
                                <s:if test="page.nowPage==page.allPage">
                                <li class="next-page">下一页</li>
                                </s:if>
                                <s:if test="page.nowPage!=page.allPage">
                                <li class="next-page"><a href="/UserList/<s:property value="page.nowPage+1"/>">下一页</a></li>
                                 </s:if>
                                <li class="next-page">总共<s:property value="page.allPage"/>页</li>
                            </ul>
                        </div>
                        </s:if>
			        	</div>
	    		 	</div>
	    		 </div>
            </div>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>
