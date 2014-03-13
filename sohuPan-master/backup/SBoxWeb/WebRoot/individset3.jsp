<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html >
    <head>
        
<!--head-inc.jsp start-->
<s:include value="head-inc.jsp" >
        </s:include>
<!--head-inc.jsp end-->
        
        <link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/pages.css" type="text/css" media="all" />
        <title>搜狐企业网盘 - 绑定独立域名</title>
    </head>
    <body class="account">
        <!--head.jsp start-->
        <s:include value="header-admin.jsp" >
            <s:param name="pageStatus" value="5"></s:param>
        </s:include>
        <!-- head.jsp end -->
        
        <!--main start-->
        <div class="page-main">
            <div class="bind-domain mod">
                <div class="mod-hd">绑定独立域名</div>
                <div class="mod-bd">
                    <div class="bind-success">
                        <p>感谢您申请绑定独立域名！</p>
                        <p class="desc">我们会在两周内审核您的域名，审核通过后绑定生效</p>
                    </div>
                </div>
            </div>
        </div>
        <!--marin end-->

<!--tj.jsp start-->        
<p class="tj">
<script type="text/javascript">
var _bdhmProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");
document.write(unescape("%3Cscript src='" + _bdhmProtocol + "s4.cnzz.com/stat.php%3Fid%3D4813719%26web_id%3D4813719' type='text/javascript'%3E%3C/script%3E")); 
document.write(unescape("%3Cscript src='" + _bdhmProtocol + "hm.baidu.com/h.js%3F6e7050121040e66f3c78881337f86e58' type='text/javascript'%3E%3C/script%3E")); 
</script>
<!--tj.jsp end-->
</p>
    </body>
</html>
