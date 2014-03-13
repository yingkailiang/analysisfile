<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html >
    <head>
        
        <!--head-inc.jsp start-->
<s:include value="../head-inc.jsp" >
        </s:include> 
        <!--head-inc.jsp end-->
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/account.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <title>搜狐企业网盘 - 用户信息</title>
    </head>
    <body class="account">
        <!--head.jsp start-->
        <s:include value="../head.jsp" >
			<s:param name="pageStatus" value="7"></s:param>
		</s:include>
        <!-- head.jsp end -->
        <!--main start-->
        <div id="accountContent">
            <form action="AccountManage!modifyNickName.action" method="post">
                <div class="account-content">
                    <div class="tabs">
                        <ul>
                            <li><a href="/account"><span>帐号信息</span></a></li>
                            <li><a href="/account/1-2"><span>修改密码</span></a></li>
                            <li><a href="/user/update"><span>安全设置</span></a></li>
                            <li><a href="/account/email" ><span>消息设置</span></a></li>
                            <li><a href="/deviceManage" class="selected"><span>设备管理</span></a></li>
                        </ul>
                    </div>
                    <div class="account-info" id="manageEquipment">
                        <h3>设备管理</h3>
                        <div class="desc">以下设备列表显示了您登录过的PC、移动设备，如果您的设备丢失或是他人设备，可以禁用该设备防止数据泄露。</div>
                        <table>
                            <colgroup>
                                <col width="15%" />
                                <col width="20%" />
                                <col width="16%" />
                                <col width="15%" />
                                <col width="10%" />
                                <col width="18%" />
                                <col width="6%" />
                            </colgroup>
                            <tr>
                                <th>设备类型</th>
                                <th>设备名称</th>
                                <th>系统名称</th>
                                <th>设备ID</th>
                                <th>登录状态</th>
                                <th>最后登录时间</th>
                                <th>操作</th>
                            </tr>
<!--                            `userid`,-->
<!--        `mac`,-->
<!--        `type`,-->
<!--        `sys_name`,-->
<!--        `login_status`,-->
<!--        `bak1`,-->
<!--        `bak2`,-->
<!--        `bak3`,-->
<!--        `status`-->
                            <s:if test="divices!=null&&divices.size > 0">
		    		 		<s:iterator value="divices" status="i">
	                            <tr>
	                                <td><s:property value="type"/></td>
	                                <td><s:property value="device_name"/></td>
	                                <td><s:property value="sys_name"/></td>
	                                <td><s:property value="mac"/></td>
	                                <td><strong>
									<s:if test="login_status==0">未登录</s:if>
									<s:elseif test="login_status==1">已登录</s:elseif>
									</strong></td>
	                                <td><s:property value="lastLoginTime"/></td>
	                                <td>
	                                <s:if test="status==1">
	                                <a href="javascript:;" class="open" data-id="<s:property value="mac"/>">启用</a>
	                                </s:if>
									<s:elseif test="status==0">
									<a href="javascript:;" class="close" data-id="<s:property value="mac"/>">禁用</a>
									</s:elseif>
									</td>
	                            </tr>
	                            </s:iterator>
                            </s:if>
                            <s:else>
                            	<tr>
                                <td colspan="7" style="text-align:center; padding:40px 0;">
                                    您还没登录过网盘客户端，<a href="/downloads">立即体验</a>
                                </td>
                            </tr>
                            </s:else>
                        </table>
                    </div>
                </div>
            </form>
        </div>
        <!--marin end-->
<!--tj.jsp start-->        
<s:include value="../tj.jsp" >
        </s:include> 
<!--tj.jsp end-->
</p>
    </body>
</html>
