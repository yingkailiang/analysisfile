<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>
<%@ page import="java.text.SimpleDateFormat" %>
<%
Date now = new Date();
SimpleDateFormat sdf = new SimpleDateFormat("yyyy");
String rigthYear = sdf.format(now); %>
<!--footer start-->
<div class="footer-wrap-v3">
    <div class="footer-v3">
        <p class="links">
            <a href="/about/">关于我们</a>
            <span>|</span>
            <a href="/updates">更新日志</a>
            <span>|</span>
            <a href="/help/">帮助中心</a>
            <span>|</span>
            <a href="/feedBack/">意见反馈</a>
            <span>|</span>
            <a href="/agreement/">服务条款</a>
            <span>|</span>
            <!-- <a href="/case/">成功案例</a> -->
            <a href="http://e.weibo.com/sohupan" target="_blank"><em>关注我</em>&nbsp;<span class="icon icon-sina"></span></a>
        </p>
        <p class="copyright">
            Copyright &copy; <%=rigthYear %> Sohu.com Inc. All Rights Reserved <br />搜狐公司 版权所有
        </p>
        <s:include value="tj.jsp" >
        </s:include>
    </div>
</div>
<!--footer end-->