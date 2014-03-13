<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        
<!--head-inc.jsp start-->
<s:include value="head-inc.jsp" >
        </s:include>
<!--head-inc.jsp end-->
        
        <!--[if IE 6]>
            <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/libs/DD_belatedPNG_0.0.8a-min.js"></script>
            <script type="text/javascript">
                jQuery(function(){
                    DD_belatedPNG.fix('.pngfix');
                })
            </script>
        <![endif]-->
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <title>搜狐企业网盘 - 个性设置</title>
    </head>
    <body class="manage">

<!--head.jsp start-->
    <s:include value="header-admin.jsp" >
        <s:param name="pageStatus" value="5"></s:param>
    </s:include>
<!--head.jsp end-->

        <div id="content" class="manage-content has-side clearfix">

            <div id="sidebar" class="sidebar">
                <ul class="setting-nav">
                    <li><a href="/individset1.jsp" class="current">个性设置</a></li>
                    <li><a href="/adminset/">管理设置</a></li>
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
                <div class="setting-main">
                    <div class="detail">
                        <div class="setting-item setting-logo" id="settingLogo">
                            <h4>企业Logo</h4>
                            <div class="setting-main">
                                <div class="custom-logo">
                                <s:if test="#session.user.account!=null&&(#session.user.account.logoImage==null||''.equals(#session.user.account.logoImage))">
                                    <img src="<%=CDNTools.CDN_URL %>/img/login-logo-v20130829.png" class="pngfix" />
                               </s:if>
                                 <s:else>
                                    <img class="pngfix" height="45" width="200" src="https://pan.sohu.net/img/<s:property value="#session.user.account.logoImage"/>" />
                                 </s:else>
                                    
                                </div>
                                <div class="upload-logo">
                                    <form id="uploadForm" method="post" target="uploadFormIfm" action="/UploadRange!uploadLoginLogo.action" enctype="multipart/form-data">
                                        <iframe src="javascript:false" id="uploadFormIfm" name="uploadFormIfm" style="display:none;"></iframe>
                                        <p>仅支持PNG格式（透明背景最好)，文件不超过1M，最佳尺寸：200*45</p>
                                        <p class="upload-actions">
                                            <span class="ipt-file"><input id="uploadLogoIpt" name="Filedata" type="file" size="1" hidefocus="true"></span>
                                            <a class="btn btn32 btn32-gray" href="javascript:;" hidefocus="true">更换LOGO</a>
                                            <span class="tips"></span>
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div class="setting-item setting-domain" id="settingDomain">
                            <h4>企业个性域名</h4>
                            <input type="hidden" value="<s:property value="#session.user.account.times"/>"/>
                            <s:if test="#session.user.account!=null&&#session.user.account.selfDomain!=null&&#session.user.account.times<=2">
                            
                            <div class="setting-main ">
                                <p class="ipt">输入个性二级域名：https://&nbsp;&nbsp;<input type="text" placeholder="yourcompany" maxlength="20" class="ipt-text" id="domainIpt" value="<s:property value="#session.user.account.selfDomain"/>"/>&nbsp;&nbsp;.pan.sohu.net <span class="tips"></span></p>
                                <p class="desc">5~20个字符，支持字母、数字、连接符“-”，设置后不可修改。</p>
                                <p class="bind-entrance"><a href="/individset2.jsp" target="_blank">绑定独立域名&gt;&gt;</a></p>
                                <p class="actions"><input type="button" class="btn btn32 btn32-blue" value="保存" id="domainBtn" /></p>
                            </div>
                            </s:if>
                            <s:else >
                            <!--设置后不可修改，显示下面的-->
                            <div class="setting-main">
                                <p class="ipt">个性二级域名：https://<input type="text" value="<s:property value="#session.user.account.selfDomain"/>" class="ipt-text" disabled="disabled" /> .pan.sohu.net <span class="tips"></span></p>
                                <p class="bind-entrance"><a href="/individset2/" target="_blank">绑定独立域名&gt;&gt;</a></p>
                                <p class="actions"><input type="button" class="btn btn32 btn32-blue btn32-disabled" value="保存" disabled="disabled" /></p>
                            </div>
                            </s:else>
                        </div>
                    </div>
                </div>
            </div>
            <!--main end-->
<!--          test="#session.user.account!=null&&(#session.user.account.selfDomain==null||''.equals(#session.user.account.selfDomain))"  -->
        </div>
    </body>
</html>