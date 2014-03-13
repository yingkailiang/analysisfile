package com.sbox.config;

import javax.servlet.*;

import java.io.IOException;
import javax.servlet.http.*;

import com.sbox.config.impl.CommonServlet;
import com.sbox.model.User;
import com.sbox.tools.SecurityResult;
import com.sbox.tools.SecurityTools;
import com.sbox.tools.SessionName;

/**
 * @author :horson.ma
 * @version :2012-8-15 下午6:39:44 类说明
 */
public class SessionFilter extends CommonServlet implements Filter {

	private String loginUrl;
	private FilterConfig config;
	private String index;

	public void init(FilterConfig filterconfig) throws ServletException {
		setConfig(filterconfig);
		setLoginUrl(filterconfig.getInitParameter("loginUrl"));
		setIndex(filterconfig.getInitParameter("index"));
	}

	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest hsRequest = (HttpServletRequest) request;
		String url = hsRequest.getServletPath();
		System.out.println(url);
		if(loginUrl.equals(url)){
			chain.doFilter(request, response);
			return;
		}
		User user = (User) hsRequest.getSession()
				.getAttribute(SessionName.USER);

		if (user != null) {
			chain.doFilter(request, response);
		} else {
			String loginKey = getCookieValue(hsRequest,
					SecurityTools.COOKIE_KEY);
			SecurityResult author = SecurityTools.author(loginKey);
			if (author.isSuccess()) {
				user = loginUsedAuthor(author);
			}
			if (user == null) {
				RequestDispatcher rd = request.getRequestDispatcher(loginUrl);
				rd.forward(request, response);
				return;
			} else {
				chain.doFilter(request, response);
			}
		}

	}

	public void destroy() {
	}

	public void setIndex(String index) {
		this.index = index;
	}

	public String getIndex() {
		return index;
	}

	public void setConfig(FilterConfig config) {
		this.config = config;
	}

	public FilterConfig getConfig() {
		return config;
	}

	public void setLoginUrl(String loginUrl) {
		this.loginUrl = loginUrl;
	}

	public String getLoginUrl() {
		return loginUrl;
	}

}