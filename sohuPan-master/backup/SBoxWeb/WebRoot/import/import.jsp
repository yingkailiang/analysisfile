<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page import="com.sbox.tools.CDNTools" %><%@ include file="../taglibs.jsp"%>
<h1>导入Excel</h1>
 <hr>
 <form action="/addUsers/" method="post" enctype="multipart/form-data">
<input type="file" name="Filedata" id="importExcel">
<input type="submit" value="导入"> 
</form>