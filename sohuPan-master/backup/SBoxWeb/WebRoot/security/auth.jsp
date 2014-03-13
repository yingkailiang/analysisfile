
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="../taglibs.jsp"%>
<%@ page import="com.sbox.tools.SessionName" %>
<%@ page import="com.sbox.tools.SecurityTools" %>
<%@ page import="com.sbox.tools.DomainDividSetTools" %>
<%@ page import="com.sbox.tools.SecurityResult" %>
<%@ page import="javax.servlet.http.Cookie" %>
<%@ page import="com.sbox.sdk.client.SBoxClient" %>
<%@ page import="net.sf.json.JSONObject" %>
<%@ page import="org.apache.commons.lang3.StringUtils" %>
<%@ page import="com.sbox.action.base.CommonAction"%>
<%@ page import="com.sbox.model.User" %>
<%
		String domain = request.getRequestURL().toString();
		String url = request.getServletPath();
		String paths = request.getParameter("path");
		if(paths!=null&&StringUtils.isEmpty(paths) ){
			paths="/";
		}
		System.out.println("requestURL:"+domain+"    servletPath:"+url+"    path:"+paths);
		Object bool = session.getAttribute(SessionName.ISLOADINDIVIDSET);
		Boolean flag = true;
		if(bool!=null){
			flag = (Boolean)bool;
		}
		//if(!flag){
			JSONObject individ = DomainDividSetTools.loadIndividSetting(domain);
			if(individ!=null&&individ.getInt("code")==200){
				session.setAttribute(SessionName.INDIVIDSET, individ);
				session.setAttribute(SessionName.ISLOADINDIVIDSET, true);
			}else if(individ!=null&&individ.getInt("code")==202){//
				response.sendRedirect("https://pan.sohu.net/");
				System.out.println("user::::::"+individ);
			}
		//}
		User user = (User) session.getAttribute(SessionName.USER);
		System.out.println("user::::::"+user);
		if(!url.startsWith("/login")){
			System.out.println(url);
			if (user == null) {
				Cookie[] cks = request.getCookies();
				String loginKey = "";
				if(cks != null){
					for(Cookie c : cks){
						String name = c.getName();
						System.out.println("CookieName::::::"+name);
						if(SecurityTools.COOKIE_KEY.equals(name)){
							loginKey = c.getValue();
							break;
						}
					}
				}
				System.out.println("loginKey::::::"+loginKey);
				if(!loginKey.equals("")){
					SecurityResult author = SecurityTools.author(loginKey);
					if (author.isSuccess()) {
						String rUrl = request.getServletPath();
						String requestURI = request.getRequestURI();
						System.out.println(rUrl);
						System.out.println(requestURI);
						String returnUrl = (String)session.getAttribute("returnURL");
						String loginUrl = "/Login!login.action?loginName="+author.getLoginName()+"&password="+author.getPassword()+"&loginGoon=0&rurl="+returnUrl;
						RequestDispatcher rd = request.getRequestDispatcher(loginUrl);
						//request.setAttribute("loginName",author.getLoginName());
						//request.setAttribute("password",author.getPassword());
						rd.forward(request, response);
					}else{
						if (!(url.startsWith("/")
								&& (url.startsWith("/reg") || url.startsWith("/Register")
										|| url.startsWith("/Login") || url.startsWith("/login")
										|| url.startsWith("/GetCode")
										|| url.startsWith("/OutLink")
										|| url.startsWith("/PasswordAction")
										|| url.startsWith("/s") || url
										.startsWith("/UploadRange!upload.action")))) {
						RequestDispatcher rd = request.getRequestDispatcher("/login?errorMessage="+author.getFailureReason());
						rd.forward(request, response);
						}
					}
				}else
				if (!(url.startsWith("/")
						&& (url.startsWith("/reg") || url.startsWith("/Register")
								|| url.startsWith("/Login") || url.startsWith("/login")
								|| url.startsWith("/GetCode")
								|| url.startsWith("/OutLink")
								|| url.startsWith("/PasswordAction")
								|| url.startsWith("/s") || url
								.startsWith("/UploadRange!upload.action")))) {
					domain = domain.replaceAll("https://|http://", "");
					System.out.println("domain s;:"+domain);
					domain = domain.substring(0, domain.indexOf("/"));
					System.out.println("domain s;:  "+domain);
				}
			}else{
				//String loginName = user.getUser().getLoginName();
				//String loginUrl = "/Login!checkUserOvertime.action?loginName="+loginName+"";
				//RequestDispatcher rd = request.getRequestDispatcher(loginUrl);
				//rd.forward(request, response);
				//UserCheck userCheck = new UserCheck();
				//userCheck.checkUserOvertime(loginName);
			}
		}else{
			System.out.println(url);
			if (user == null) {
				Cookie[] cks = request.getCookies();
				String loginKey = "";
				if(cks != null){
					for(Cookie c : cks){
						String name = c.getName();
						System.out.println("CookieName::::::"+name);
						if(SecurityTools.COOKIE_KEY.equals(name)){
							loginKey = c.getValue();
							break;
						}
					}
				}
				System.out.println("loginKey::::::"+loginKey);
				if(!loginKey.equals("")){
					SecurityResult author = SecurityTools.author(loginKey);
					if (author.isSuccess()) {
						String rUrl = request.getServletPath();
						String requestURI = request.getRequestURI();
						System.out.println(rUrl);
						System.out.println(requestURI);
						String returnUrl = (String)session.getAttribute("returnURL");
						String loginUrl = "/Login!login.action?loginName="+author.getLoginName()+"&password="+author.getPassword()+"&loginGoon=0&rurl="+returnUrl;
						RequestDispatcher rd = request.getRequestDispatcher(loginUrl);
						rd.forward(request, response);
						//request.setAttribute("loginName",author.getLoginName());
						//request.setAttribute("password",author.getPassword());
						//response.sendRedirect(loginUrl);
					}
				}
			}else{
				//RequestDispatcher rd = request.getRequestDispatcher("/index");
				//rd.forward(request, response);
				response.sendRedirect("/index");
			}
		}
%>