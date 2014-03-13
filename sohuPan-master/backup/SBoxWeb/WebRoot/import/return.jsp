<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %>
<%@ include file="../taglibs.jsp"%>
<%String importStr = (String)session.getAttribute("importMessage"); %>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<script type="text/javascript">
		var importMessage = <%=importStr%>;
		window.parent.importUserCallback(importMessage);
	</script>
</head>
<body></body>
</html>
