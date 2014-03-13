<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.model.User" %>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%
User user = (User) session.getAttribute(SessionName.USER);
Long userId = 0l;
if(user==null){
	//RequestDispatcher rd = this.getServletContext().getRequestDispatcher("/login");
   // rd.forward(request,response);
}else{
	userId = user.getUser().getId();
}
%>
		<div id="header" class="header-wrap2 clearfix">
            <div class="header2">
               <h1 class="logo" id="logo">
                    <a href="/"><img src="/assets/img/logo-v3.png" /></a>
                </h1>
               <%  String language = request.getParameter("language");
               if(!"1".equalsIgnoreCase(language))
               {	   
                if(user!=null){ %>
                <div class="userinfo clearfix">
                    <div class="usermanage" id="userInfo">
                        <span class="icon icon-account-info"></span>
                        <a class="username" href="/"><s:property value="#session.user.userPro.nickName" /></a>
                        <a href="javascript:;" class="more-handle" hidefocus="true"><span class="more"></span></a>
                        <ul class="dropdown moreinfo" style="display:none;">
                            <li><a href="/account">个人设置</a></li>
                            <li><a href="/updates" target="_blank">更新日志</a></li>
                             <li><a href="/feedBack/" target="_blank">意见反馈</a></li>
                            <li><a href="/help/" target="_blank">帮助中心</a></li>
                            <li><a href="/logout/">退出</a></li>
                        </ul>
                    </div>
                    <script type="text/javascript">
                        jQuery(function(){
                            var userInfo = $('#userInfo'),
                                moreinfo = userInfo.find('.moreinfo'),
                                st;
                            userInfo.on('mouseenter',function(e){
                                clearTimeout(st);
                                moreinfo.show();
                            }).on('mouseleave',function(e){
                                clearTimeout(st);
                                st = setTimeout(function(){
                                    moreinfo.hide();
                                },300)
                            })
                            moreinfo.on('mouseenter',function(){
                                clearTimeout(st);
                                moreinfo.show();
                            }).on('mouseleave',function(){
                                clearTimeout(st);
                                st = setTimeout(function(){
                                    moreinfo.hide();
                                },300)
                            })
                        })
                    </script>
                </div>
                <%}else{ %>
               <div class="entrance">
                    <a href="/">首页</a><span>|</span><a href="/login">登录</a><span>|</span><a href="/help/">帮助</a>
                </div>
                <%}
               }
                %>
            </div>
    	</div>