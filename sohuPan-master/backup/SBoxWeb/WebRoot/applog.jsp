<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <s:include value="head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/sbox-v2.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/datepicker/WdatePicker.js"></script>
        <script type="text/javascript">
	        function prevPage(){
		        var a = $("#logForm");
		        a.attr('action','AppLogManage!prevPage.action');
		        a.submit();
	    	}
	    	function setPage(pageIndex){
	    		var a = $("#logForm");
	    		$("#nowPage").attr('value',pageIndex);
		        a.attr('action','/log/' + pageIndex);
		        a.submit();
	    	}
	    	function nextPage(){
	    		var a = $("#logForm");
		        a.attr('action','AppLogManage!nextPage.action');
		        a.submit();
        	}
        </script>
        <title>搜狐企业网盘 - 日志查询</title>
    </head>
    <body>
    	<jsp:include page="head.jsp" flush="true">
		  <jsp:param name="pageStatus" value="3" />
		</jsp:include>
    	<div id="content">
    	<form action="/log" method="get" name="form1" id="logForm">
    		<div id="log">
    			<div class="filter">
    				<span class="label">日期：</span>
    				<div class="datepicker">
    				<input type="text" class="ipt-text" readonly="readonly" name="startTime" id="startTime" onclick="WdatePicker({minDate:'%y-{%M-1}-%d',maxDate:'#F{$dp.$D(\'endTime\')||\'%y-%M-%d\';}'});" value='<s:property value="startTime"  />'/>
    					<span class="label icon icon-date" onclick="WdatePicker({el:'startTime',minDate:'%y-{%M-1}-%d',maxDate:'#F{$dp.$D(\'endTime\')||\'%y-%M-%d\';}'})"></span>
    				</div>
    				 - 
    				<div class="datepicker">
    				<input type="text"  class="ipt-text" readonly="readonly" name="endTime" id="endTime" onclick="WdatePicker({minDate:'#F{$dp.$D(\'startTime\')||$dp.$DV(\'%y-%M-%d\',{M:-1});}',maxDate:'%y-%M-%d'})" value='<s:property value="endTime"  />' />
    					<span class="label icon icon-date" onclick="WdatePicker({el:'endTime',minDate:'#F{$dp.$D(\'startTime\')||$dp.$DV(\'%y-%M-%d\',{M:-1});}',maxDate:'%y-%M-%d'})"></span>
    				</div>
    				<span class="label">
    					&nbsp;&nbsp;&nbsp;&nbsp;操作类型：
    				</span>
    				<input id="nowPage" name="nowPage" type="hidden" value="0"/>
                    <select id="logType" style='width:140px; '  name="selectorValue"  class="common-select">
                        <option value="">全部</option>
                        <option value="SBoxUploadComplete">上传</option>
                         <option value="SBoxCreateDir">新建文件夹</option>
                        <option value="SBoxDeleteObject,SBoxDeleteDir">删除</option>
                        <option value="SBoxMovRestoreDir,SBoxMovRestoreObject">还原</option>
                        <option value="SBoxMoveDir,SBoxMoveObject">移动</option>
                        <option value="SBoxRenameObject,SBoxRenameDir">重命名</option>
                        <option value="shareDir">共享</option>
                        <option value="unshareDir">解除共享</option>
                    </select>

                    <script type="text/javascript">
                        jQuery(function(){
                            var options = $('#logType option');
                            options.each(function(){
                                var option = $(this);
                                if(option.val() === "<s:property value='selectorValue'/>") option.attr('selected',true);
                            })

                            Sbox.makeSelector('logType');
                        })
                    </script>
    				<div class="downloadlog">
    					<a  href="javascript:document.getElementById('logForm').submit();" class="btn btn24 btn24-blue"><span>查询</span></a>
    				</div>
                    <span class="label tip">您可以查询最近一个月的所有操作日志。 </span>
    			</div>
	    		<div class="list-table log">
	    		 	<div class="list-header">
                        <div class="name col">
                            文件名
                            <span class="sort"></span>
                        </div>
	    		 		<div class="operator col sep">
	    		 			操作者
	    		 			<span class="sort"></span>
	    		 		</div>
	    		 		<div class="op-type col sep">
	    		 			操作
	    		 			<span class="sort"></span>
	    		 		</div>
                        <div class="time col sep">
                            操作时间
                            <span class="sort"></span>
                        </div>
                        <div class="operator col sep">
                            操作来源
                            <span class="sort"></span>
                        </div>
	    		 	</div>
	    		 	<div class="list-body">
	    		 		<ul class="files listview">
	    		 		<s:if test="logs.size > 0">
	    		 			<s:iterator value="logs" status="i">
	    		 			<li class="list-item" id = "<s:property value="resourceId"/>">
                                <div class="col name">
                                    <div class="file-icon"><span class="file-type <s:property value='operType'/>"></span></div>
                                    <div class="file-name" title="<s:property value="sourcename"/>"><s:property value="sourcename"/></div>
                                </div>
	    		 				<div class="col operator"><s:property value="operatorName"/></div>
	    		 				<div class="col op-type">
	    		 					<s:if test="oper.equals('SBoxUploadComplete')">
	    		 						上传
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxGetObject')">
	    		 						下载
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxDeleteDir')">
	    		 						删除
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxDeleteObject')">
	    		 						删除
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxMoveObject')">
	    		 						移动
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxMoveDir')">
	    		 						移动
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxCreateDir')">
	    		 						新建文件夹
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxDeleteOutChain')">
	    		 						删除外链
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxCreateOutsideChain')">
	    		 						生成外链
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxRenameObject')">
	    		 						重命名
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxRenameDir')">
	    		 						重命名
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxMovRestoreDir')">
	    		 						还原
	    		 					</s:if>
	    		 					<s:if test="oper.equals('SBoxMovRestoreObject')">
	    		 						还原
	    		 					</s:if>
	    		 					<s:if test="oper.equals('shareDir')">
	    		 						共享
	    		 					</s:if>
	    		 					<s:if test="oper.equals('unshareDir')">
	    		 						 解除共享
	    		 					</s:if>
	    		 					
	    		 				</div>
                                <div class="col time"><s:property value="createTime.substring(0,16)" /></div>
                                <div class="col operator"><s:property value="sourcePlatform" /></div>
	    		 			</li>
	    		 		</s:iterator>
	    		 			</s:if> 
                            <s:else>
                            <li class="list-item" style="padding:20px 0; text-align:center; font-size:16px; letter-spacing:0; margin-bottom:0; border:0;">没有操作记录</li>
                            </s:else> 
	    		 		</ul>
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
    		</form>
    	</div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>
