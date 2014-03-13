package com.sbox.tools;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.apache.struts2.ServletActionContext;

import com.sbox.model.User;
import com.sbox.sdk.security.SecretKey;

/**
 * Session 常量名称的定义
 * 
 * @author Jack.wu.xu
 */
public final class SessionName {
	protected final static String ID = "id";
	protected final static String SECRETKEY = "secretkey";
	protected final static String DOMAIN = "sbox.domain";
	public final static String SP = "sp";
	public final static String USER = "user";
	
	public final static String SHARERESOURCEID = "shareResourceId";  //文件夹外链
	
	public final static String SHAREFILEID = "shareFileId";  //文件外链
	
	public final static String ADMINLOGSESSION = "Admin_Log_Session";  //文件文件夹管理日志
	
	public final static String ADMINLOGINLOGSESSION = "Admin_Login_Log_Session";  //文件文件夹管理日志
	/**
	 * 管理员key
	 */
	public final static String STAFF = "Admin";

	/**
	 * 手机短信验证码.
	 */
	public final static String SMS_CODE = "session_sms_code";

	/**
	 * 客户端类型.
	 */
	public final static String CLIENT_TYPE = "session_client_type";

	/**
	 * 验证码
	 */
	public final static String VALIDATECODE = "validateCode";
	/**
	 * 订购关系ID
	 */
	public final static String ORDER_ID = "orderId";
	public static final String INDIVIDSET = "IndividSet";
	public static final String ISLOADINDIVIDSET = "IsLoadIndividSet";

	public static boolean isLogin() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute(SessionName.USER);
		SecretKey cookieSecretKey = getCookieSecretKey();
		if (user != null || cookieSecretKey != null) {
			return true;
		} else {
			return false;
		}

	}

	public static User getUser() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute(SessionName.USER);
		return user;

	}

	private static SecretKey getCookieSecretKey() {
		String accesskeyId = getCookieValue(ID);
		String secretkey = getCookieValue(SECRETKEY);
		String domain = getCookieValue(DOMAIN);
		if (StringUtils.isEmpty(accesskeyId) || StringUtils.isEmpty(secretkey)
				|| StringUtils.isEmpty(domain)) {
			return null;
		}
		SecretKey sk = new SecretKey(domain, accesskeyId, secretkey);
		return sk;
	}

	public static String getCookieValue(String name) {
		HttpServletRequest request = ServletActionContext.getRequest();
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

}
