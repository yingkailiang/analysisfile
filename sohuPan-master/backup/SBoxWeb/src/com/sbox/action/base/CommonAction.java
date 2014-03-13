package com.sbox.action.base;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionSupport;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.security.contans.SessionKey;
import com.sbox.tools.CommonUtilities;
import com.sbox.tools.JSONTools;
import com.sbox.tools.SecurityResult;
import com.sbox.tools.SecurityTools;
import com.sbox.tools.SessionName;
import com.sbox.tools.TransferStr;

public class CommonAction extends ActionSupport {
	private Map<String, String> cookie;
	protected final static String ID = "id";
	protected final static String SECRETKEY = "secretkey";
	protected final static String DOMAIN = "sbox.domain";
	protected static final Logger logger = Logger.getLogger(CommonAction.class);
	public static final String M_SECRETKEY = "ikey";

	protected User loginUsedAuthor(SecurityResult author) {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			String ip = CommonUtilities.getIp();
			String login = sc.login(author.getLoginName(),
					author.getPassword(), new String[] { ip });
			JSONObject js = JSONObject.fromObject(login);
			int code = js.getInt("code");
			if (code == 200) {
				loadUserInfo(js);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return (User) getSession(SessionName.USER);
	}

	protected String getDeletePassword() {
		String secretKey = (String) getSession(SecurityTools.DELETE_KEY);
		SecurityResult author = SecurityTools.author(secretKey);
		if (author.isSuccess()) {
			return author.getPassword();
		}
		return "";
	}

	protected void loadUserInfo(JSONObject js) throws JSONException {
		User user = null;
		JSONObject juser = null;
		JSONObject jaccount = null;
		JSONObject jProfile = null;
		SBoxAccount account = null;
		SBoxUser suser = null;
		SBoxUserProfile userpro = null;
		if (js.has("jAccount")) {
			jaccount = js.getJSONObject("jAccount");
			if (!jaccount.isEmpty()) {
				account = (SBoxAccount) JSONTools.toModel(SBoxAccount.class,
						jaccount);
			}
		}
		if (js.has("jProfile")) {
			jProfile = js.getJSONObject("jProfile");
			if (jProfile != null) {
				userpro = (SBoxUserProfile) JSONTools.toModel(
						SBoxUserProfile.class, jProfile);
			}
		}
		if (js.has("user")) {
			juser = js.getJSONObject("user");
			suser = (SBoxUser) JSONTools.toModel(SBoxUser.class, juser);
		}
		user = new User(account, suser, userpro);
		putSession(SessionName.USER, user);
	}

	protected SecretKey getSecretKey() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		User attribute = (User) session.getAttribute(SessionName.USER);
		if (attribute != null) {
			return attribute.getSecretKey();
		}
		SecretKey cookieSecretKey = getCookieSecretKey();
		if (cookieSecretKey == null) {
			return getParameterSecretKey();
		}
		return cookieSecretKey;
	}

	private SecretKey getParameterSecretKey() {
		String accesskeyId = getParameter(ID);
		String secretkey = getParameter(SECRETKEY);
		String domain = getParameter(DOMAIN);
		if (StringUtils.isEmpty(accesskeyId) || StringUtils.isEmpty(secretkey)
				|| StringUtils.isEmpty(domain)) {
			return null;
		}
		SecretKey sk = new SecretKey(domain, accesskeyId, secretkey);
		return sk;
	}

	public User loadUser(SecretKey secretKey) {
		return null;
	}

	protected SecretKey getCookieSecretKey() {
		String mkey = getCookieValue(CommonAction.M_SECRETKEY);
		if (mkey == null) {
			return null;
		}
		try {
			String[] split = mkey.split("%2F");
			String domain = null;
			String accesskeyId = null;
			String secretkey = null;
			if (split != null && split.length == 3) {
				accesskeyId = split[1];
				secretkey = split[2];
				domain = split[0];
			}
			if (StringUtils.isEmpty(accesskeyId)
					|| StringUtils.isEmpty(secretkey)
					|| StringUtils.isEmpty(domain)) {
				return null;
			}
			SecretKey sk = new SecretKey(domain, accesskeyId, secretkey);
			return sk;
		} catch (Exception e) {
			return null;
		}
	}

	public void putSession(String key, Object value) {
		HttpSession session = ServletActionContext.getRequest().getSession();
		session.setAttribute(key, value);
	}

	public static Object getSession(String key) {
		HttpSession session = ServletActionContext.getRequest().getSession();
		return session.getAttribute(key);
	}

	protected User getUser() {
		HttpServletRequest request = ServletActionContext.getRequest();
		User user = (User) request.getSession().getAttribute(SessionKey.USER);
		return user;
	}

	public String getCookieValue(String name) {
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
	/*PAN-1296 设置cookie值*/
	/*Begin*/
	public void setCookieValue(String name, String value) {
		HttpServletRequest request = ServletActionContext.getRequest();
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return;
		}
		for (Cookie cookie : cookies) {
			if (cookie.getName().equals(name)) {
				cookie.setValue(value);
				break;
			}
		}
	}
	/*End*/

	public void clearCookie(String name) {
		HttpServletRequest request = ServletActionContext.getRequest();
		// Cookie[] cookies = request.getCookies();
		HttpServletResponse response = ServletActionContext.getResponse();
		// cookies不为空，则清除
		// if (cookies != null) {
		// for (Cookie cookie : cookies) {
		// String value = cookie.getName();
		// // 查找名称
		// if (value.equals(name)) {

		Cookie cook = new Cookie(name, "");
		response.addCookie(cook);
		// }
		// }
		// }
	}

	public void clearCookieAll() {
		HttpServletRequest request = ServletActionContext.getRequest();
		Cookie[] cookies = request.getCookies();
		HttpServletResponse response = ServletActionContext.getResponse();
		// cookies不为空，则清除
		// if (cookies != null) {
		// for (Cookie cookie : cookies) {
		// Cookie cook = new Cookie(cookie.getName(), "");
		// response.addCookie(cook);
		// }
		// }
	}

	protected void ajaxBack(String json) throws IOException {
		try {
			JSONObject fromObject = JSONObject.fromObject(json);
			if (fromObject.getInt("code") == 701) {
				putSession(SessionName.USER, null);
				HttpSession session = ServletActionContext.getRequest()
						.getSession();
				session.invalidate();
				clearCookieAll();
				addCookie(SecurityTools.COOKIE_KEY, "");
			}
		} catch (Exception e) {
		}
		HttpServletResponse response = ServletActionContext.getResponse();
		ServletOutputStream outputStream = response.getOutputStream();
		outputStream.write(json.getBytes("UTF-8"));
	}

	protected void ajaxBack(int code, String message) throws IOException {
		HttpServletResponse response = ServletActionContext.getResponse();
		ServletOutputStream outputStream = response.getOutputStream();
		JSONObject jssu = new JSONObject();
		try {
			jssu.put("code", code);
			jssu.put("message", message);
			outputStream.write(jssu.toString().getBytes());
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	protected String genIntegerByString(String m) {
		if (StringUtils.isBlank(m) || StringUtils.isEmpty(m)) {
			return "";
		} else {
			Base64 decode = new Base64();
			String base64Str = null;

			try {
				base64Str = new String(decode.decode(m));
			} catch (Exception e) {
				e.printStackTrace();
			}
			if (!base64Str.contains(",")) {
				return "";
			}
			String[] splitData = base64Str.split(",");
			m = splitData[1];
			StringBuffer temp = new StringBuffer();
			for (int j = 0; j < m.length(); j++) {
				for (int i = 0; i < TransferStr.chars.length; i++) {
					String s = TransferStr.chars[i];
					if (s.equalsIgnoreCase(String.valueOf(m.charAt(j)))) {
						temp.append(i);
					}
				}
			}
			if (temp.toString().equalsIgnoreCase(splitData[0])) {
				return splitData[0];
			}
		}
		return "";
	}

	protected Cookie[] getCookies() {
		HttpServletRequest request = ServletActionContext.getRequest();
		Cookie[] cookies = request.getCookies();
		return cookies;
	}

	protected String getParameter(String key) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String parameter = request.getParameter(key);
		return parameter;
	}

	protected String getHeader(String key) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String parameter = request.getHeader(key);
		return parameter;
	}

	protected String getAttribute(String key) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String attribute = (String) request.getAttribute(key);
		return attribute;
	}

	public void setCookiesMap(Map cookies) {
		this.cookie = cookies;
	}

	public void setAttribute(String name, String value) {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		session.setAttribute(name, value);
	}

	@SuppressWarnings("deprecation")
	public void addCookie(String name, String value) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String pathInfo = request.getServerName();
		Cookie cookie = new Cookie(name, URLEncoder.encode(value));
		cookie.setDomain(pathInfo);
		cookie.setPath("/");
		cookie.setSecure(false);
		HttpServletResponse response = ServletActionContext.getResponse();
		response.addCookie(cookie);
	}

	@SuppressWarnings("deprecation")
	public void addCookie(String name, String value, int age) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String pathInfo = request.getServerName();
		Cookie cookie = new Cookie(name, URLEncoder.encode(value));
		cookie.setMaxAge(age);
		cookie.setDomain(pathInfo);
		cookie.setPath("/");
		cookie.setSecure(false);
		HttpServletResponse response = ServletActionContext.getResponse();
		response.addCookie(cookie);
	}

	@SuppressWarnings("deprecation")
	public void addCookie(String name, String value, String domain) {
		Cookie cookie = new Cookie(name, URLEncoder.encode(value));
		cookie.setMaxAge(60 * 60 * 24 * 14);
		cookie.setDomain(domain);
		HttpServletResponse response = ServletActionContext.getResponse();
		response.addCookie(cookie);
	}

	public void removeCookie(String name) {
		addCookie(name, "");
	}

	public static StringBuffer emailModelUp(StringBuffer emailContent) {
		emailContent
				.append("<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><html xmlns='http://www.w3.org/1999/xhtml'>");
		emailContent
				.append("<head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head>");
		emailContent.append("<body style='width:610px; margin:0; padding:0;'>");
		emailContent
				.append("<table width='610' border='0' cellpadding='0' cellspacing='0' style='margin:0 auto; line-height:1.5;border:1px solid #DDD ; border-collapse:collapse; font-size:12px;font-family:Tahoma; color:#3D3D3D; text-align:left;'> ");
		emailContent
				.append("<tr><td height='84' width='15' bgcolor='#2C71BE' valign='middle'>&nbsp;</td>");
		emailContent
				.append("<td height='84' width='230' bgcolor='#2C71BE' valign='middle'>");
		emailContent
				.append("<a href='https://pan.sohu.net' title='搜狐企业网盘'><img alt='搜狐企业网盘' src='https://pan.sohu.net/assets/img/mail-logo.jpg' /></a></td>");
		emailContent
				.append("<td height='84' width='365' bgcolor='#2C71BE' valign='middle'>&nbsp;</td></tr><tr><td colspan='3' style='font-size:12px;'>");
		emailContent
				.append("<table width='610' border='0' cellpadding='0' cellspacing='0'>");
		emailContent.append("<tr><td width='30' height='300'>&nbsp;</td>");
		emailContent.append("<td width='550' height='300' valign='top'><br />");
		return emailContent;
	}

	public static StringBuffer emailModelDown(StringBuffer emailContent) {

		emailContent
				.append("</td><td width='30' height='300'>&nbsp;</td></tr><tr><td colspan='3'></td></tr></table></td></tr><tr>");
		emailContent
				.append("<td colspan='3' height='12' style='overflow:hidden; font-size:0; height:12px;'><img src='https://pan.sohu.net/assets/img/mail-bottom.png' /></td></tr></table>");
		return emailContent;
	}
}
