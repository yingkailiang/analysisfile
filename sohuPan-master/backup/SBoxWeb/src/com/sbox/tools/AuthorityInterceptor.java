package com.sbox.tools;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionInvocation;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.config.ConfigManager;
import com.sbox.config.GeneralConfig;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * @author :horson.ma
 * @version :2012-8-6 下午6:18:38 类说明
 */
public class AuthorityInterceptor extends CommonAction implements
		com.opensymphony.xwork2.interceptor.Interceptor, javax.servlet.Filter {
	private static final Logger logger = Logger
			.getLogger(AuthorityInterceptor.class);
	private static final long serialVersionUID = 1L;
	private String errorMessage;
	private String loginName;
	private String accessId;
	private String forward;
	private Long reload = 0l;
	private static final ConfigManager INSTANCE = ConfigManager.getInstance();
	private String jspath;

	@SuppressWarnings("unused")
	public String intercept(ActionInvocation invocation) throws Exception {
		HttpServletRequest request = ServletActionContext.getRequest();
		String url = request.getServletPath();
		try {
			if (url.equals(""))
				url += "/";
			if (url.startsWith("/")
					&& (url.startsWith("/MessageAction") || url
							.startsWith("/LoginPage"))) {
				return invocation.invoke();
			}
			// 是否加载过个性设置。
			HttpSession session = request.getSession();
			User user = (User) getSession(SessionName.USER);
			GeneralConfig conf = (GeneralConfig) INSTANCE
					.get(GeneralConfig.class);
			// 有些地方不需要验证登陆，需特殊对待，如注册和取验证码
			if (url.startsWith("/")
					&& (url.startsWith("/reg")
							|| url.startsWith("/Register")
							|| url.startsWith("/OutDomainShare")
							|| url.startsWith("/Login")
							|| url.startsWith("/login")
							|| url.startsWith("/GetCode")
							|| url.startsWith("/OutLink")
							|| url.startsWith("/PasswordAction")
							|| url.startsWith("/s")
							|| url.startsWith("/f")
							|| url.startsWith("/u")
							|| url.startsWith("/AnonymousUpload")
							|| url.startsWith("/UploadRange!upload.action")
							|| url.startsWith("/GetFile!getManual.action")
							|| url.startsWith("/feedBack")
							|| url
									.startsWith("/ShareCheckPassword!share.action")
							|| url
									.startsWith("/GetFile!getFileOnLineLink.action")
							|| url
									.startsWith("/GetDirAndFile!getService.action")
							|| url
									.startsWith("/ShareUrlDirAndFile!view.action")
							|| url
									.startsWith("/CheckShareDirPassword!share.action")
							|| url.startsWith("/GetDirFiles!getFiles.action")
							|| url
									.startsWith("/AnonymousWholeUpload!sendFile.action")
							|| url
									.startsWith("/GetFile!getFileOnLineLinkForOutLink.action")
							|| url
									.startsWith("/FeedBackAjax!createFeedBack.action") || url
							.startsWith("/FeedBack!createFeedBack.action"))) {
				return invocation.invoke();
			} else if (url.startsWith("/")
					&& (url.startsWith("/AccountManage")
							|| url.startsWith("/User!toPage") || url
							.startsWith("/Group!getAll"))) {

			}
			if (user == null) {
				String id = getParameter("accessId");
				String secretkey = getParameter("token");
				String domain = getParameter("domain");
				if (StringUtils.isNotEmpty(id)
						&& StringUtils.isNotEmpty(secretkey)
						&& StringUtils.isNotEmpty(domain)) {
					addCookie(SessionName.ID, id);
					addCookie(SessionName.SECRETKEY, secretkey);
					addCookie(SessionName.DOMAIN, domain);
				}
				String loginKey = getCookieValue(SecurityTools.COOKIE_KEY);
				SecurityResult author = SecurityTools.author(loginKey);
				if (author.isSuccess()) {
					user = loginUsedAuthor(author);
				}
			}
			if (user != null) {
				if (url.startsWith("/")
						&& (url.startsWith("/AccountManage!getcompanyinfo")
								|| url.startsWith("/User!toPage")
								|| url.startsWith("/Group!getAll")
								|| url.startsWith("/User!organs.action") 
								|| url.startsWith("/PanInfo!get")
								|| url.startsWith("/Group!getAll") 
								|| url.startsWith("/AdminLog!toPage")
								|| url.startsWith("/AdminLog!setPage")
								|| url.startsWith("/AdminLog!prevPage")
								|| url.startsWith("/AdminLog!nextPage")
								|| url.startsWith("/AdminLoginLog!toPage")
								|| url.startsWith("/AdminLoginLog!setPage") 
								|| url.startsWith("/AdminLoginLog!prevPage") 
								|| url.startsWith("/AdminLoginLog!nextPage")
								|| url.startsWith("/PanInfo!get"))) {
					SBoxAccount account = user.getAccount();
					if (account != null) {
						return invocation.invoke();
					} else {
						if (url.startsWith("/User!organs.action")) {
							if (user.getUser().getIsAdmin() == 1) {
								return invocation.invoke();
							}
						}
						return "no_acl";
					}
				} else {
					spaceCalculate();
					return invocation.invoke();
				}
			}
			ServletActionContext.getRequest().getSession().invalidate();
			if (isAjaxRequest()) {
				logger.debug("User was quit.");
				return "ajaxLogin";
			} else if (url.startsWith("/Upload")) {
				logger.debug("User was quit.");
				return "flashLogin";
			} else {
				putSession("returnURL", url);
				logger.debug("User was quit.");
				return "filterlogin";
			}
		} catch (Exception e) {
			e.printStackTrace();
			//PAN-1247:start
//			ServletActionContext.getRequest().getSession().invalidate();
			//PAN-1247:end
			if (isAjaxRequest()) {
				logger.debug("User was quit.");
				return "ajaxLogin";
			} else if (url.startsWith("/Upload")) {
				logger.debug("User was quit.");
				return "flashLogin";
			} else {
				putSession("returnURL", url);
				return "404";
			}
		}
	}

	@SuppressWarnings("unused")
	public void loadIndividSetting() {
		HttpServletRequest request = ServletActionContext.getRequest();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String url = request.getRequestURL().toString();
		url = url.replaceAll("https://|http://", "");
		url = url.substring(0, url.indexOf("/"));
		String individSetting = "";

		try {
			JSONObject individSet = null;
			if (!url.equals("pan.sohu.net")) {
				if (url.contains("pan.sohu.net")) {
					String domain = url.replaceAll(".pan.sohu.net", "");
					individSetting = sbox.loadIndividSetting(domain);
				} else {
					individSetting = sbox.loadIndividSetting(url);
				}
				individSet = JSONObject.fromObject(individSetting);
			} else {
				individSet = new JSONObject();
				individSet.put("code", 201);
				individSet.put("result", "no individ set.");
			}
			putSession(SessionName.INDIVIDSET, individSet);
			putSession(SessionName.ISLOADINDIVIDSET, true);
		} catch (Exception e) {
			logger.debug("get Individ Setting is error.");
		}
	}

	private void spaceCalculate() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String userUsedSpace = sbox.userUsedSpace(secretKey);
			JSONObject result = JSONObject.fromObject(userUsedSpace);
			// allSize = ToolsUtil.toSizeStr(settingSize);
			// usedSize = ToolsUtil.toSizeStr(useSize);
			Long useSize = result.getLong("userUsedSpace");
			Long settingSize = result.getLong("userTotalSpace");
			String allSize = ToolsUtil.toSizeStr(settingSize);
			putSession("allSize", allSize);
			putSession("usedSize", ToolsUtil.toSizeStr(result
					.getLong("userUsedSpace")));
			if (!StringUtils.isEmpty(allSize) && !allSize.equals("0")
					&& settingSize > 0) {
				double r = (useSize.doubleValue() / settingSize.doubleValue()) * 100;
				BigDecimal b = new BigDecimal(r);
				r = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
				putSession("baifenbi", r);
			} else {
				putSession("baifenbi", "0");
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
	}

	private boolean isTokenExpire(ActionInvocation invocation, Map session,
			SecretKey cookieSecretKey) {
		User user;
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		String expire = null;
		try {
			expire = sc.checkTokenExpire(cookieSecretKey);
			JSONObject jsonObject = JSONObject.fromObject(expire);
			int code = jsonObject.getInt("code");
			if (code == 200) {
				return false;
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return true;
		}
		return true;
	}

	private boolean isAjaxRequest() {
		HttpServletRequest request = ServletActionContext.getRequest();
		String requestType = request.getHeader("X-Requested-With");
		if ("XMLHttpRequest".equals(requestType)) {
			return true;
		}
		return false;
	}

	public SecretKey getCookieSecretKey() {
		String accesskeyId = SessionName.getCookieValue(SessionName.ID);
		String secretkey = SessionName.getCookieValue(SessionName.SECRETKEY);
		String domain = SessionName.getCookieValue(SessionName.DOMAIN);
		if (StringUtils.isEmpty(accesskeyId) || StringUtils.isEmpty(secretkey)
				|| StringUtils.isEmpty(domain)) {
			return null;
		}
		SecretKey sk = new SecretKey(domain, accesskeyId, secretkey);
		return sk;
	}

	protected SecretKey getSecretKey() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		User attribute = (User) session.getAttribute(SessionName.USER);
		if (attribute != null) {
			return attribute.getSecretKey();
		}
		return getCookieSecretKey();
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getLoginName() {
		return loginName;
	}

	public void setLoginName(String loginName) {
		this.loginName = loginName;
	}

	public String getAccessId() {
		return accessId;
	}

	public void setAccessId(String accessId) {
		this.accessId = accessId;
	}

	public String getForward() {
		return forward;
	}

	public void setForward(String forward) {
		this.forward = forward;
	}

	public Long getReload() {
		return reload;
	}

	public void setReload(Long reload) {
		this.reload = reload;
	}

	public String getJspath() {
		return jspath;
	}

	public void setJspath(String jspath) {
		this.jspath = jspath;
	}

	protected String getParameter(String key) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String parameter = request.getParameter(key);
		return parameter;
	}

	@SuppressWarnings("deprecation")
	public void addCookie(String name, String value) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String pathInfo = request.getServerName();
		Cookie cookie = new Cookie(name, URLEncoder.encode(value));
		cookie.setMaxAge(60 * 60 * 24 * 14);
		cookie.setDomain(pathInfo);
		HttpServletResponse response = ServletActionContext.getResponse();
		response.addCookie(cookie);
	}

	public void destroy() {

	}

	public void init() {

	}

	@Override
	public void doFilter(ServletRequest arg0, ServletResponse arg1,
			FilterChain arg2) throws IOException, ServletException {
		HttpServletRequest request = ServletActionContext.getRequest();
		User user = (User) getSession(SessionName.USER);
		if (user == null) {
			String loginKey = getCookieValue(SecurityTools.COOKIE_KEY);
			SecurityResult author = SecurityTools.author(loginKey);
			if (author.isSuccess()) {
				user = loginUsedAuthor(author);
			}
		}
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {

	}

}