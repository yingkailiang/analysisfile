<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="taglibs.jsp"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html >
    <head>
        
<!--head-inc.jsp start-->
<s:include value="head-inc.jsp" >
        </s:include>
<!--head-inc.jsp end-->
		<link rel="stylesheet" rev="stylesheet" href="<%=CDNTools.CDN_URL %>/css/pages.css?$ver" type="text/css" media="all" />
        <script type="text/javascript" src="<%=CDNTools.CDN_URL %>/js/manage.js?$ver"></script>
        <title>搜狐企业网盘 - 绑定独立域名</title>
    </head>
    <body class="account">

<!--head.jsp start-->
       <s:include value="header-admin.jsp" >
            <s:param name="pageStatus" value="5"></s:param>
        </s:include>
<!--head.jsp end-->
        
        <!--main start-->
        <div class="page-main">
            <div class="bind-domain mod" id="bindDomain">
                <div class="mod-hd">绑定独立域名</div>
                <div class="mod-bd">
                    <p>说明：</p><br />
                    <p>1、您需要绑定的企业独立域名，已经购买并备案；</p>
                    <p>2、将独立域名 example.com 绑定到 <s:if test="#session.user.account.selfDomain!=null&&!\"\".equals(#session.user.account.selfDomain)">
<s:property value="#session.user.account.selfDomain"/>.pan.sohu.net
</s:if>
<s:else>
<s:property value="#session.user.account.domain"/>.pan.sohu.net
</s:else> 后，即可通过 example.com 直接访问 <s:if test="#session.user.account.selfDomain!=null&&!\"\".equals(#session.user.account.selfDomain)">
<s:property value="#session.user.account.selfDomain"/>.pan.sohu.net
</s:if>
<s:else>
<s:property value="#session.user.account.domain"/>.pan.sohu.net
</s:else> 。</p><br /><br />
                    <p>请按照以下几步进行设置：</p>
                    <h4>步骤一、提交域名信息</h4>
                    <p>绑定域名：
                     <s:if test="#session.user.account.individDomain!=null&&!\"\".equals(#session.user.account.individDomain)">
                     <input type="text" id="iptDomain" class="ipt-text" value="<s:property value="#session.user.account.individDomain"/>"/>
                     </s:if>
                     <s:else>
                     <input type="text" id="iptDomain" class="ipt-text" value=""/>
                     </s:else>
                     <span class="tips" id="tipDomail"><span class="error"></span></span></p>
                    <h4>步骤二、设置域名指向</h4>
                    <p>登录您的域名管理页面，将需要绑定域名的CNAME记录设置为：
                    <s:if test="#session.user.account.selfDomain!=null&&!\"\".equals(#session.user.account.selfDomain)">
<s:property value="#session.user.account.selfDomain"/>.pan.sohu.net
</s:if>
<s:else>
<s:property value="#session.user.account.domain"/>.pan.sohu.net
</s:else>
</p>

                    <p class="desc">（CNAME解析一般在2~24小时候生效。如果您无法直接设置您的域名，请联系您的域名提供商。）</p>
                    <h4>步骤三、确认域名指向生效</h4>
                    <p>如果您已经成功设置域名指向，请耐心等待域名指向生效。</p>
                    <p>检查生效方法：运行cmd，输入命令“ping www.example.com”，运行结果若为您设置的CNAME，即为生效。</p><br />
                    <p><input type="button" id="smtDomain" class="btn btn32 btn32-blue" value="提交" /></p>
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
