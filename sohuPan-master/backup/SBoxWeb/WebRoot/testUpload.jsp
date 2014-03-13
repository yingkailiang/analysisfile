<?xml version="1.0" encoding="UTF-8" ?>
<%@ taglib prefix="s" uri="/struts-tags" %>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Test Upload</title>
<s:head />
</head>
<body>
  <s:fielderror></s:fielderror>
<s:form action="batchAddUser" method="post" enctype="multipart/form-data" namespace="/">
	<s:textfield name="spaceSizeStr" label="spaceSize"/>
    <s:file name="file" label="File"/>
    <s:submit/>
</s:form>
</body>
</html>