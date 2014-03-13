<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="taglibs.jsp"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>



















<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>

    <head>

<!--head-inc.jsp start-->
<s:include value="head-inc.jsp" >
        </s:include>
<!--head-inc.jsp end-->
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/manage.css?$ver" type="text/css" media="all" />
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
<!--head.jsp start-->
       <s:include value="head.jsp" >
        </s:include>
<!--head.jsp end-->
        <div id="content" class="manage-content clearfix">
<!--rightMenu.jsp start-->

<div id="sidebar" class="sidebar ">

    <div class="mod group-manage ">

        <div class="mod-hd">

            <a href="/PanInfo/">网盘概况</a>

        </div>

    </div>

    <!--<div class="mod qiye-info ">

        <div class="mod-hd">

            <a href="/CompanyInfo/">企业信息</a>

        </div>

    </div>

    -->

    <div class="mod user-manage ">

        <div class="mod-hd">

            <a href="/UserList/">用户管理</a>

        </div>

    </div>

    <div class="mod group-manage ">

        <div class="mod-hd">

            <a href="/GroupList/">群组管理</a>

        </div>

    </div>

    <div class="mod group-manage on">

        <div class="mod-hd">

            <a href="/CompanyInfo/">企业设置</a>

        </div>

    </div>

</div>

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

<!--rightMenu.jsp end-->



            <!--main start-->

            <div id="main" class="main">

                <div class="setting-main">

                <div class="legend manage-tabs">

                    <a href="/CompanyInfo/">企业信息</a>

                    <a href="/individset1.jsp" >个性设置</a>

                    <a href="#" class="cur">管理设置</a>

                </div>

                    <div class="detail">

                        <div class="setting-item setting-change-admin">

                            <h4>转让管理员</h4>

                            <p id="actions" class="sc">

                                <span class="desc">把您管理员的身份转让给其他成员，不再有管理员权限变为普通用户</span>

                                <a href="javascript:;" class="btn btn24 btn24-gray" id="changeAdmin">转让管理员</a>

                            </p>

                        </div>

                        <hr />

                        <div class="setting-item setting-ip" id="settingIpModule">

                            <h4>限制IP登录</h4>

                            <p class="sc">

                                <span class="desc">设置后，域下帐号只能在指定IP地址范围内登录网盘，为空表示不限制</span>

                            </p>

                            <div class="ips" id="settingIps">

                                <div class="ip-ipt">

                                    <div class="label">IP地址：</div>

                                    <div class="ipt">

                                        <input class="ipt-text" /> <a href="javascript:;" class="add">添加</a> <span class="tips"></span>

                                    </div>

                                </div>

                                <!--如果有多条，请输出

                                <div class="ip-ipt">

                                    <div class="label"> </div>

                                    <div class="ipt">

                                        <input class="ipt-text" /> <a href="javascript:;" class="del">删除</a>

                                    </div> 

                                </div>

                                -->

                            </div>

                            <div class="action">

                                <a href="#" class="btn btn32 btn32-blue" id="settingIpBtn">保存</a>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <!--main end-->

        </div>

    </body>

</html>