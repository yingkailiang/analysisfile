<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
<!-- head-inc.jsp start -->
	<s:include value="head-inc.jsp" >
    </s:include>
        <title>搜狐企业网盘 - 消息</title>
    </head>
    <body class="msg-page">
        <!-- head.jsp start -->
		<s:include value="head.jsp" >
        </s:include>
        <!-- main content start -->
        <div id="content" class="msg-content-wrap">
            <div class="msg-content">
                <div class="msg-side">
                    <ul>
                    
                        <li 
                        <s:if test="type==0">class="cur"</s:if>
                        ><a href="/message/0">系统通知</a></li>
                        <li <s:if test="type==1">class="cur"</s:if>
                        ><a href="/message/1">共享消息</a></li>
                    </ul>
                </div>
                <div class="msg-main">
                    <div class="msg-mod">
                    <s:if test="type==0">
                        <div class="mod-hd">系统通知</div>
                       </s:if>
                       <s:if test="type==1">
                       <div class="mod-hd">共享消息</div>
                       </s:if>
                        <div class="mod-bd">
                            <table>
                                <colgroup>
                                    <col width="70%" />
                                    <col width="25%" />
                                </colgroup>
                                <s:if test="jsonData.size > 0">
			    		 		<s:iterator value="jsonData" status="i">
			    		 			<s:if test="status==-1">
										<tr>
		                                    <td class="msg-body"><s:property value="content" escape="false"/></td>
		                                    <td class="msg-time"><s:property value="createTime"/></td>
		                                </tr>
	                                </s:if>
	                                <s:else>
		                                <tr class="msg-new">
		                                    <td class="msg-body"><s:property value="content" escape="false"/></td>
		                                    <td class="msg-time"><s:property value="createTime"/></td>
		                                </tr>
	                                </s:else>
				    		 	</s:iterator>
			    		 		</s:if>
			    		 		<s:else>
			    		 		<tr>
                                    <td class="msg-body">暂无消息</td>
                                    <td class="msg-time"></td>
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
                                </s:if>-->
                                <s:if test="page.nowPage!=1">
                               	 	<li class="prev-page"><a href="/message/<s:property value="page.nowPage-1"/>/<s:property value="type"/>">上一页</a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage==7">
                                	<li _page="1"><a href="/message/1/<s:property value="type"/>">1</a></li>
	                                <li _page="1"><a href="/message/2/<s:property value="type"/>">2</a></li>
                                </s:if>
                                <s:else>
                                <s:if test="page.nowPage-5>1">
                                	<li _page="1"><a href="/message/1/<s:property value="type"/>">1</a></li>
	                                <li _page="1"><span >...</span></li>
                                </s:if>
                                </s:else>
                                <s:else>
                                <s:if test="page.nowPage!=1">
                                <li _page="1"><a href="/message/1/<s:property value="type"/>">1</a></li>
                                </s:if>
                                </s:else>
                                
                                <s:if test="page.nowPage-4>1">
                            		<li _page="1"><a href="/message/<s:property value="page.nowPage-4"/>/<s:property value="type"/>"><s:property value="page.nowPage-4"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-3>1">
                            		<li _page="1"><a href="/message/<s:property value="page.nowPage-3"/>/<s:property value="type"/>"><s:property value="page.nowPage-3"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage-2>1">
                            		<li _page="1"><a href="/message/<s:property value="page.nowPage-2"/>/<s:property value="type"/>"><s:property value="page.nowPage-2"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage-1>1">
                            		<li _page="1"><a href="/message/<s:property value="page.nowPage-1"/>/<s:property value="type"/>"><s:property value="page.nowPage-1"/></a></li>
                                </s:if>
                                <li class="cur-page"><a href="javascript:;"><s:property value="page.nowPage"/></a></li>
                                <s:if test="page.nowPage+1<=page.allPage">
                               		<li _page="1"><a href="/message/<s:property value="page.nowPage+1"/>/<s:property value="type"/>"><s:property value="page.nowPage+1"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+2<=page.allPage">
                               		<li _page="1"><a href="/message/<s:property value="page.nowPage+2"/>/<s:property value="type"/>"><s:property value="page.nowPage+2"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage+3<=page.allPage">
                               		<li _page="1"><a href="/message/<s:property value="page.nowPage+3"/>/<s:property value="type"/>"><s:property value="page.nowPage+3"/></a></li>
                                </s:if>
                                <s:if test="page.nowPage+4<=page.allPage">
                               		<li _page="1"><a href="/message/<s:property value="page.nowPage+4"/>/<s:property value="type"/>"><s:property value="page.nowPage+4"/></a></li>
                                </s:if>
                                
                                <s:if test="page.nowPage+6==page.allPage">
                                <li _page="1"><a href="/message/<s:property value="page.allPage-1"/>/<s:property value="type"/>"><s:property value="page.allPage-1"/></a></li>
                                <li _page="1"><a href="/message/<s:property value="page.allPage"/>/<s:property value="type"/>"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                
                                <s:else>
                                <s:if test="page.nowPage+5<page.allPage">
                                <li _page="1"><span >...</span></li>
                                <li _page="1"><a href="/message/<s:property value="page.allPage"/>/<s:property value="type"/>"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                </s:else>
                                <s:else>
                                <s:if test="page.nowPage+5==page.allPage">
                                <li _page="1"><a href="/message/1/<s:property value="type"/>"><s:property value="page.allPage"/></a></li>
                                </s:if>
                                </s:else>
                                <!--<s:if test="page.nowPage==page.allPage">
                                <li class="next-page">下一页</li>
                                </s:if>-->
                                <s:if test="page.nowPage!=page.allPage">
                                <li class="next-page"><a href="/message/<s:property value="page.nowPage+1"/>/<s:property value="type"/>">下一页</a></li>
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
        <!-- main content end -->
        <!-- tj.jsp start -->
       <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>