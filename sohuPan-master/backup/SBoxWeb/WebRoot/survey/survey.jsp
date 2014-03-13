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
        <s:include value="../head.jsp" >
			<s:param name="pageStatus" value="5"></s:param>
		</s:include>
        <div id="content" class="manage-content clearfix">
            <s:include value="../menu/rightMenu.jsp" >
				<s:param name="pageStatus" value="1"></s:param>
			</s:include>
            <div id="main" class="main">
                <div class="pan-info">
                    <div class="legend">网盘概括</div>
                    <div class="detail">
                        <div class="filed">
                            <div class="label">空间使用状况：</div>
                            <div class="info"> 
                                <div class="usage-bar">
                                    <span class="cur" style="width:28%;"></span>
                                </div> 
                                10.5 G / 100 G
                            </div>
                        </div>
                        <div class="filed">
                            <div class="label">用户数：</div>
                            <div class="info">10 / 20 ， <span class="desc">共20个用户名额，已分配10个</span></div>
                        </div>
                        <div class="filed">
                            <div class="label">群组数：</div>
                            <div class="info">10 / 20 ， <span class="desc">共5个群组名额，已创建3个</span></div>
                        </div>
                        <div class="filed">
                            <div class="label">上传单文件大小：</div>
                            <div class="info">2G</div>
                        </div>
                        <div class="filed">
                            <div class="label">文件历史版本数：</div>
                            <div class="info">5个</div>
                        </div>
                        <hr />
                        <div class="filed">
                            <div class="label">网盘状态：</div>
                            <div class="info">试用中</div>
                        </div>
                        <div class="filed">
                            <div class="label">服务时间：</div>
                            <div class="info">2012-10-17 - 2012-10-17</div>
                        </div>
                        <div class="filed">
                            <div class="label"><a href="#" class="btn btn32 btn32-blue" style="padding:0 10px;"><span>购买服务</span></a></div>
                            <div class="info"><span class="desc">文件上传大小无上限，更快的传输速度，更优质的服务</span></div>
                        </div>
                        <div class="filed">
                            <div class="label"><a href="#" class="btn btn32 btn32-green" style="padding:0 10px;"><span>扩展容量</span></a></div>
                            <div class="info"><span class="desc">增加一个用户名额，同时增加10G空间，一年300元</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <s:include value="../tj.jsp" >
        </s:include>
    </body>
</html>