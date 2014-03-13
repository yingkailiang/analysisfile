package com.sbox.tools;

/**
 * @author :horson.ma
 * @version :2012-8-6 下午2:18:08
 * 类说明
 */

import java.io.IOException;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.Login;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;

public class LoginFilter extends HttpServlet implements Filter {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void destroy() {
	}

	protected final static String ID = "id";
	protected final static String SECRETKEY = "secretkey";
	protected final static String DOMAIN = "sbox.domain";
	public final static String SP = "sp";
	public final static String USER = "user";
	private static boolean flag = true;

	public void doFilter(ServletRequest sRequest, ServletResponse sResponse,
			FilterChain filterChain) throws IOException, ServletException {

		HttpServletRequest request = (HttpServletRequest) sRequest;
		HttpServletResponse response = (HttpServletResponse) sResponse;
		HttpSession session = request.getSession();
		String url = request.getServletPath();
		String contextPath = request.getContextPath();
		if (url.equals(""))
			url += "/";
		if (url.startsWith("/")
				&& (url.startsWith("/reg") || url.startsWith("/Register") || url
						.startsWith("/GetCode"))) {
			filterChain.doFilter(sRequest, sResponse);
		} else {
			User User = (User) session.getAttribute(SessionName.USER);
			if (User == null) {
				filterChain.doFilter(sRequest, sResponse);
			} else {
				SecretKey cookieSecretKey = getCookieSecretKey(request);
				if (cookieSecretKey != null) {
					SBoxClient sc = SBoxClientInstance.getSboxClient();
					String expire = null;
					try {
						expire = sc.checkTokenExpire(cookieSecretKey);
						JSONObject js = JSONObject.fromObject(expire);
						String code = js.getString("code");
						if (StringUtils.isEmpty(code)) {
							return;
						} else {
							if (code.equals("200")) {
								Login login = new Login();
//								login.loadUserInfo();
							} else {
								return;
							}
						}
					} catch (SBoxClientException e) {
						e.printStackTrace();
					}
					filterChain.doFilter(sRequest, sResponse);
				} else {
					filterChain.doFilter(sRequest, sResponse);
					// response.sendRedirect("login.jsp");
					// response.sendRedirect(contextPath + "/login.jsp");
					// return;
				}

			}
		}
		filterChain.doFilter(sRequest, sResponse);
	}

	private static SecretKey getCookieSecretKey(HttpServletRequest request) {
		String accesskeyId = getCookieValue(ID, request);
		String secretkey = getCookieValue(SECRETKEY, request);
		String domain = getCookieValue(DOMAIN, request);
		if (StringUtils.isEmpty(accesskeyId) || StringUtils.isEmpty(secretkey)
				|| StringUtils.isEmpty(domain)) {
			return null;
		}
		SecretKey sk = new SecretKey(domain, accesskeyId, secretkey);
		return sk;
	}

	public static String getCookieValue(String name, HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		String result = null;
		for (Cookie cookie : cookies) {
			if (cookie.getName().equals(name)) {
				result = cookie.getValue();
				break;
			}
		}
		return result;
	}

	public void init(FilterConfig arg0) throws ServletException {

	}
}
