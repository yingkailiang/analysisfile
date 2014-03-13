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
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <title>搜狐企业网盘</title>
    </head>
    <body class="manage">
        <s:include value="header-admin.jsp" >
			<s:param name="pageStatus" value="1"></s:param>
		</s:include>

        <div id="content" class="manage-content clearfix">
            <div id="main" class="main">
                <div class="pan-info">
                    <div class="detail">
                        <div class="filed">
                            <div class="label">公司名称：</div>
                            <div class="info"><s:property value="#session.user.userPro.company"/></div>
                        </div>
                        <div class="filed">
                            <div class="label">域帐号：</div>
                            <div class="info"><s:property value="#session.user.userPro.email"/></div>
                        </div>
                        <div class="filed">
                            <div class="label">网盘容量：</div>
                            <div class="info"><s:property value="allSpace"/></div>
                        </div>
                        <div class="filed">
                            <div class="label">空间使用状况：</div>
                            <div class="info"> 
                                <div class="usage-bar">
                                    <span class="cur" style="width:<s:property value="spaceUsed"/>%;"></span>
                                </div> 
                                <s:property value="spaceUsedStr"/>
                            </div>
                        </div>
                        <div class="filed">
                            <div class="label">用户数：</div>
                            <div class="info"><s:property value="#session.user.account.buyNumber"/>，<span class="desc">已分配<s:property value="openNumber"/>个用户，剩余<s:property value="#session.user.account.buyNumber-openNumber"/>个</span></div>
                        </div>
                        <div class="filed">
                            <div class="label">群组数：</div>
                            <div class="info"><s:property value="#session.user.account.groupSize"/>，<span class="desc">已创建<s:property value="groupNumber"/>个群组，剩余<s:property value="#session.user.account.groupSize-groupNumber"/>个</span></div>
                        </div>
                        <hr />
                        <div class="filed">
                            <div class="label">网盘状态：</div>
                            <s:if test="#session.user.account.status==0">
                            <div class="info">试用中</div>
                            </s:if>
                            <s:if test="#session.user.account.status==1">
                            <div class="info">已开通</div>
                            </s:if>
                            <s:if test="#session.user.account.status==2">
                            <div class="info">即将删除</div>
                            </s:if>
                        </div>
                        <div class="filed">
                            <div class="label">开通时间：</div>
                            <div class="info"><s:date format="yyyy-MM-dd" name="#session.user.account.regisDate"/></div>
                        </div>
                        <div class="filed">
                            <div class="label">到期时间：</div>
                            <div class="info">
                            <s:date format="yyyy-MM-dd" name="#session.user.account.closeDate"/></div>
                        </div>
<!--                        <div class="filed">-->
<!--                            <div class="label"><a href="#" class="btn btn32 btn32-blue" style="padding:0 10px;"><span>购买服务</span></a></div>-->
<!--                            <div class="info"><span class="desc">文件上传大小无上限，更快的传输速度，更优质的服务</span></div>-->
<!--                        </div>-->
<!--                        <div class="filed">-->
<!--                            <div class="label"><a href="#" class="btn btn32 btn32-green" style="padding:0 10px;"><span>扩展容量</span></a></div>-->
<!--                            <div class="info"><span class="desc">增加一个用户名额，同时增加10G空间，一年300元</span></div>-->
<!--                        </div>-->
                    </div>
                </div>
            </div>
        </div>
        <s:include value="tj.jsp" >
        </s:include>
    </body>
</html>