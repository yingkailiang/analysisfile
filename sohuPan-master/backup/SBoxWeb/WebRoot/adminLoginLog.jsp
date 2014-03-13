<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
String pageStatus = request.getParameter("pageStatus");
if(user==null){
	RequestDispatcher rd = this.getServletContext().getRequestDispatcher("/login");
    rd.forward(request,response);
}else{
	userId = user.getUser().getId();
}
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/datepicker/WdatePicker.js"></script>
        <script type="text/javascript">
	        function prevPage(){
		        var a = $("#logForm");
		        a.attr('action','AdminLoginLog!prevPage.action');
		        a.submit();
	    	}
	    	function setPage(pageIndex){
	    		var a = $("#logForm");
	    		$("#nowPage").attr('value',pageIndex);
		        a.attr('action','AdminLoginLog!setPage.action');
		        a.submit();
	    	}
	    	function nextPage(){
	    		var a = $("#logForm");
		        a.attr('action','AdminLoginLog!nextPage.action');
		        a.submit();
        	}
        </script>
        <title>搜狐企业网盘</title>
    </head>
    <body class="manage">
        <s:include value="header-admin.jsp" >
			<s:param name="pageStatus" value="4"></s:param>
		</s:include>

        <div id="content" class="manage-content has-side clearfix">
            <div id="sidebar" class="sidebar">
                <ul class="setting-nav">
                    <li><a href="/AdminLog!toPage.action">文件操作</a></li>
                    <li><a href="/AdminLoginLog!toPage.action" class="current">用户登录</a></li>
                </ul>
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
            </div>
           
            <!--main start-->
             <div id="main" class="main">
                <div class="manage-log">
                    <div class="detail">
                        <div class="log-filter">
                            <form action="/AdminLoginLog!toPage.action" method="get" name="form1" id="logForm">
                                <span class="label">日期：</span>
                                <div class="datepicker">
                                    <input type="text" class="ipt-text" readonly="readonly" name="startTime" id="startTime" onclick="WdatePicker({minDate:'%y-{%M-1}-%d',maxDate:'#F{$dp.$D(\'endTime\')||\'%y-%M-%d\';}'});" value='<s:property value="startTime"  />'/>
                                    <span class="label icon icon-date" onclick="WdatePicker({el:'startTime',minDate:'%y-{%M-1}-%d',maxDate:'#F{$dp.$D(\'endTime\')||\'%y-%M-%d\';}'})"></span>
                                </div>
                                <span class="label">&nbsp;-&nbsp;</span>
                                <div class="datepicker">
                                    <input type="text"  class="ipt-text" readonly="readonly" name="endTime" id="endTime" onclick="WdatePicker({minDate:'#F{$dp.$D(\'startTime\')||$dp.$DV(\'%y-%M-%d\',{M:-1});}',maxDate:'%y-%M-%d'})" value='<s:property value="endTime"  />' />
                                    <span class="label icon icon-date" onclick="WdatePicker({el:'endTime',minDate:'#F{$dp.$D(\'startTime\')||$dp.$DV(\'%y-%M-%d\',{M:-1});}',maxDate:'%y-%M-%d'})"></span>
                                </div>
                                <span class="label">&nbsp; 筛选用户：</span>
                                <input type="text" class="ipt-text"  id="selectUser"  name="userEmail" value="<s:property value='userEmail'/>" />
                                <input id="nowPage" name="nowPage" type="hidden" value="0"/>
                                <span class="btns">
                                    <a  href="javascript:document.getElementById('logForm').submit();" class="btn btn24 btn24-blue"><span>查询</span></a>
                                </span>
                                <script type="text/javascript">
                                    jQuery(function(){
                                        Sbox.Util.selectUser('selectUser');
                                    })
                                </script>
                            </form>
                        </div>
                        <div class="record">
                            <table>
                                <colgroup>
                                    <col width="18%" />
                                    <col width="25%" />
                                    <col width="15%" />
                                    <col width="15%" />
                                    <col width="15%" />
                                </colgroup>
                                <tr>
                                    <th>用户名</th>
                                    <th>邮箱地址</th>
                                    <th>登录时间</th>
                                    <th>IP地址</th>
                                    <th>登录终端</th>
                                </tr>
                                <s:if test="logs.size > 0">
                                <s:iterator value="logs" status="i">
                                <tr id="<s:property value="resourceId"/>">
                                    <td><span title="<s:property value="username" />"><s:property value="username" /></span></td>
                                    <td><span title="<s:property value="email" />"><s:property value="email" /></span></td>
                                    <td><span title="<s:property value="createTime.substring(0,16)" />"><s:property value="createTime.substring(0,16)" /></span></td>
                                    <td><span title="<s:property value="ip" />"><s:property value="ip" /></span></td>
                                    <td><span title="<s:property value="sourcePlatform" />"><s:property value="sourcePlatform" /></span></td>
                                </tr>
                                </s:iterator>
                                </s:if>
                                <s:else>
                                <tr>
                                    <td colspan="5" style="border:0; text-align:center; padding:30px 0;">没有操作记录</td>
                                </tr>
	                            </s:else>  
                            </table>
                        </div>
                        <div class="list-footer">
	    		 		<s:if test="page!=null&&page.allPage>1">
                        <div class="page">
                        <ul>
                        		<!--<s:if test="page.nowPage==1">
                                <li class="prev-page">上一页</li>
                                </s:if>
                                --><s:if test="page.nowPage!=1">
                                <li class="prev-page"><a href="javascript:setPage(<s:property value="page.nowPage-1"/>);">上一页</a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage==7">
                                <li ><a href="javascript:setPage(1);">1</a></li>
                                <li ><a href="javascript:setPage(2);">2</a></li>
                                </s:if>
                                
                                <s:else>
                                <s:if test="page.nowPage-5>1">
                                <li _page="1"><a href="javascript:setPage(1);">1</a></li>
                                <li _page="1"><span >...</span></li>
                                </s:if>
                                </s:else>
                                <s:else>
                                <s:if test="page.nowPage!=1">
                                <li _page="1"><a href="javascript:setPage(1);">1</a></li>
                                </s:if>
                                </s:else>
                                
                                <s:if test="page.nowPage-4>1">
                            		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage-4"/>);"><s:property value="page.nowPage-4"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-3>1">
                            		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage-3"/>);"><s:property value="page.nowPage-3"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage-2>1">
                               		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage-2"/>);"><s:property value="page.nowPage-2"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-1>1">
                            		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage-1"/>);"><s:property value="page.nowPage-1"/></a></li>
                                </s:if>
                                <li class="cur-page"><a href="javascript:;"><s:property value="page.nowPage"/></a></li>
                                <s:if test="page.nowPage+1<=page.allPage">
                               		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage+1"/>);"><s:property value="page.nowPage+1"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+2<=page.allPage">
                               		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage+2"/>);"><s:property value="page.nowPage+2"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage+3<=page.allPage">
                               		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage+3"/>);"><s:property value="page.nowPage+3"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+4<=page.allPage">
                               		<li _page="1"><a href="javascript:setPage(<s:property value="page.nowPage+4"/>);"><s:property value="page.nowPage+4"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage+6==page.allPage">
                                <li ><a href="javascript:setPage(<s:property value="page.allPage-1"/>);"><s:property value="page.allPage-1"/></a></li>
                                <li ><a href="javascript:setPage(<s:property value="page.allPage"/>);"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                
                                <s:else>
                                <s:if test="page.nowPage+5<page.allPage">
                                <li ><span >...</span></li>
                                <li ><a href="javascript:setPage(<s:property value="page.allPage"/>);"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                </s:else>
                                <s:else>
                                <s:if test="page.nowPage+5==page.allPage">
                                <li ><a href="javascript:setPage(<s:property value="page.allPage"/>);"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                </s:else>
                                <!--<s:if test="page.nowPage==page.allPage">
                                <li class="next-page">下一页</li>
                                </s:if>-->
                                <s:if test="page.nowPage!=page.allPage">
                                <li class="next-page"><a href="javascript:setPage(<s:property value="page.nowPage+1"/>);">下一页</a></li>
                                 </s:if>
                                <!--<li class="next-page">总共<s:property value="page.allPage"/>页</li>-->
                            </ul>
                        </div>
                        </s:if>
	    		 	</div>
	    		 </div>

                    </div>
                </div>
            </div>
            <!--main end-->
            <!--main end-->
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>