<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="../taglibs.jsp"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html >
    <head>
       <s:include value="../head-inc.jsp" >
        </s:include>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/account.css?$ver" type="text/css" media="all" />
        <title>搜狐企业网盘 - 用户信息</title>
    </head>
    <body class="account">
        <!--head.jsp start-->
        <s:include value="../head.jsp" >
            <s:param name="pageStatus" value="4"></s:param>
        </s:include>
        <!-- head.jsp end -->
        <!--main start-->
        <div id="accountContent">
            <div class="account-content">
                <div class="tabs">
                    <ul>
                        <li><a href="/account"><span>帐号信息</span></a></li>
                        <li><a href="/account/1-2"><span>修改密码</span></a></li>
                        <li><a href="javascript:;" class="selected"><span>安全设置</span></a></li>
                        <li><a href="/account/email" ><span>消息设置</span></a></li>
                        <li><a href="/deviceManage" ><span>设备管理</span></a></li>
                    </ul>
                </div>
                <div class="account-info">
                    <h3><span class="icon icon-setting2"></span>安全设置</h3>
                    <div class="setting-item">
                        <h4>回收站密码</h4>
                        <p id="actions" class="sc">
                            <span class="desc">设置回收站密码后，在回收站删除文件时需要输入密码进行安全验证，防止他人恶意删除数据</span>
                            <s:if test="#session.user.user.openDp==0">
                            	<a href="javascript:;" class="btn btn24 btn24-gray" id="setPassword">设置回收站密码</a>
                            </s:if>
                            <s:if test="#session.user.user.openDp==1">
                            <a href="javascript:;" class="btn btn24 btn24-gray" id="changePassword">修改密码</a>
                            <a href="javascript:;" class="btn btn24 btn24-gray" id="cancelPassword">取消密码</a>
                             </s:if>
                        </p>
                    </div>
                </div>
            </div>
            <script type="text/javascript">
                jQuery(function(){
                    $('#actions').on('click','#setPassword',function(){
                        Sbox.SetDeletePassword(function(){
                            setTimeout(function(){
                                location.reload();
                            },2000)
                        })
                    }).on('click','#changePassword',function(){
                        Sbox.ChangeDeletePassword()
                    }).on('click','#cancelPassword',function(){
                        Sbox.CancelDeletePassword(function(){
                            setTimeout(function(){
                                location.reload();
                            },2000)
                        })
                    })
                })
            </script>
        </div>
        <!--marin end-->
<!--tj.jsp start-->        
		<s:include value="../tj.jsp" >
        </s:include>
<!--tj.jsp end-->
</p>
    </body>
</html>
