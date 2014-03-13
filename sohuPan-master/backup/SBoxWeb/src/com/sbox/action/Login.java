package com.sbox.action;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.CommonUtilities;
import com.sbox.tools.JSONTools;
import com.sbox.tools.SecurityTools;
import com.sbox.tools.SessionName;
import com.sbox.tools.ToolsUtil;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class Login extends CommonAction {
	private String usedSize = "";
	private String allSize = "";
	private String lastSize = "";
	public static String loginTimesKey = "loginABC";
	private Long id = 0l;
	private Long reload = 0l;
	private String accessId = "";
	private String forward = "";
	private String loginName = "";
	private String password = "";
	private boolean autologin = true;
	private int loginGoon = 1;
	private Integer loginTime;
	private static final Logger logger = Logger.getLogger(Login.class);

	public Long getReload() {
		return reload;
	}

	public void setReload(Long reload) {
		this.reload = reload;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	private String realName = "";
	private String errorMessage = "";
	private String rurl;
	private String returnURL;
	private String url;
	private int isOutShareLink = 0;

	public String getErrorMessage() {
		return errorMessage;
	}

	public String timeOut() {
		String cookieValue = getCookieValue(SecurityTools.OUTPERIOD);
		if (StringUtils.isEmpty(cookieValue)) {
			this.errorMessage = "登录已经超时";
		}
		return "login";
	}

	public String index() {
		HttpServletRequest request = ServletActionContext.getRequest();
		url = request.getRequestURL().toString();
		url = url.replaceAll("https://|http://", "");
		url = url.substring(0, url.lastIndexOf("/"));
		if ("pan.sohu.net".equals(url)) {
			User user = (User) getSession(SessionName.USER);
			if (user != null) {
				return "index";
			} else {
				return "home";
			}
		} else {
			return "logout";
		}
	}

	public String home() {
		Object user = getSession(SessionName.USER);
		if (user == null) {
			HttpServletRequest request = ServletActionContext.getRequest();
			String url = request.getRequestURL().toString();
			url = request.getRequestURL().toString();
			url = url.replaceAll("https://|http://", "");
			url = url.substring(0, url.lastIndexOf("/"));
			if ("pan.sohu.net".equals(url)) {
				return "home";
			} else {
				return "login";
			}
		} else {
			return "index";
		}
	}

	public String homePage() {
		return "home";
	}

	public String prto() {
		return "index";
	}

	private boolean isSelfDomain(String ur) {
		if (ur.contains("pan.sohu.net"))
			return false;
		else {
			return true;
		}
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getRealName() {
		return realName;
	}

	public void setRealName(String realName) {
		this.realName = realName;
	}

	public String logout() {
		putSession(SessionName.USER, null);
		HttpSession session = ServletActionContext.getRequest().getSession();
		session.invalidate();
		addCookie(CommonAction.M_SECRETKEY, "");
		addCookie(SecurityTools.COOKIE_KEY, "");
		/* PAN-1296 重置cookie值 */
		/* Begin */
		// clearCookie(SecurityTools.COOKIE_KEY);
		setCookieValue(CommonAction.M_SECRETKEY, "");
		setCookieValue(SecurityTools.COOKIE_KEY, "");
		/* End */
		errorMessage = null;
		HttpServletRequest request = ServletActionContext.getRequest();
		setUrl(request.getRequestURL().toString());
		setUrl(getUrl().substring(0, getUrl().lastIndexOf("/")));
		return "logout";
	}

	public String loginByToken() throws SBoxClientException {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String time = getParameter("time");
		String secret = getParameter("secret");
		String login = sc.login(id, time, secret);
		JSONObject js = JSONObject.fromObject(login);
		int code = js.getInt("code");
		if (code == 200) {
			loadUserInfo(js);
			return "homeToken";
		} else {
			errorMessage = "临时token失效";
			return "login";
		}
	}

	public void loginForJs() {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		HttpServletRequest request = ServletActionContext.getRequest();
		setPassword(getParameter("password"));
		try {
			String ip = CommonUtilities.getIp();
			String login = sc.login(loginName, getPassword(),
					new String[] { ip });
			addCookie("JSESSIONID", request.getSession().getId());
			JSONObject js = JSONObject.fromObject(login);
			int code = js.getInt("code");
			if (code == 200) {
				loadUserInfo(js);
			}
			ajaxBack(login);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void sessionTest() {
		try {
			JSONObject js = new JSONObject();
			js.put("code", 200);
			js.put("expiredate", 1000 * 60 * 59);
			ajaxBack(js.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/* PAN-1295 新增用户是否已登录验证，返回用户名 */
	/* Begin */
	public void isLogin() {
		JSONObject js = new JSONObject();
		try {
			User user = (User) getSession(SessionName.USER);
			if (user != null) {
				js.put("code", 200);
				js.put("name", user.getUserPro().getNickName());
			} else {
				js.put("code", 404);
				js.put("name", "");
			}
			ajaxBack(js.toString());
		} catch (JSONException e1) {
			e1.printStackTrace();
		} catch (IOException es) {
			es.printStackTrace();
		}
	}

	/* End */

	public String login() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		User user = (User) getSession(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		// 多余的读取，去掉：start
		// password = getParameter("password");
		// 多余的读取，去掉：end
		if (user == null
				&& (!StringUtils.isEmpty(loginName) && !StringUtils
						.isEmpty(password))) {
			String validateCode = (String) session
					.getAttribute(SessionName.VALIDATECODE);
			//
			String validateCodeClient = getParameter(SessionName.VALIDATECODE);
			// 取出登陆尝试次数
			loginTime = (Integer) session.getAttribute(loginTimesKey);
			if (loginTime == null) {
				loginTime = 1;
				session.setAttribute(loginTimesKey, 1);
			} else {
				session.setAttribute(loginTimesKey, ++loginTime);
				if (loginTime > 3) {// 尝试登陆三次失败之后的登陆请求需要进行验证码匹配。
					if (StringUtils.isEmpty(validateCodeClient)) {
						errorMessage = "请输入验证码！";
						return "login";
					}
					if (!validateCode.equals(validateCodeClient)) {
						errorMessage = "输入验证码错误！";
						return "login";
					}
				}
			}
			try {
				String ip = CommonUtilities.getIp();
				String login = sc.login(loginName, password,
						new String[] { ip });
				if (!StringUtils.isEmpty(login)) {
					JSONObject js = JSONObject.fromObject(login);
					int code = js.getInt("code");
					if (code == 200) {
						String usernew = js.getString("user");
						JSONObject jusernew = JSONObject.fromObject(usernew);
						String active = jusernew.getString("active");
						String domain = jusernew.getString("domain");
						JSONObject individset = (JSONObject) getSession(SessionName.INDIVIDSET);
						if (individset != null) {
							JSONObject jsonObject = individset
									.getJSONObject("result");
							if (!domain.equals(jsonObject.getString("domain"))) {
								errorMessage = "帐号不是该域下用户";
								return "login";
							}
						}
						if (!StringUtils.isEmpty(active) && active.equals("1")) {
							loadUserInfo(js);
							setAccountSize();
							if (!autologin) {
								addCookie(SecurityTools.COOKIE_KEY,
										SecurityTools.createSecretKeyId(
												loginName, password),
										60 * 60 * 24 * 14);
							} else {
								if (loginGoon == 1) {
									addCookie(SecurityTools.COOKIE_KEY, "");
								}
							}
							Calendar c = Calendar.getInstance();
							c.setTime(new Date());
							c.add(Calendar.DAY_OF_MONTH, 1);
							String format = ToolsUtil.Date4.format(c.getTime());
							Date outTime = ToolsUtil.Date4.parse(format);
							int age = (int) (outTime.getTime() - System
									.currentTimeMillis());
							addCookie(SecurityTools.OUTPERIOD, "abc", age);
							String host = request.getRequestURL().toString();
							host = host.replaceAll("https://|http://", "");
							host = host.substring(0, host.indexOf("/"));
							if ("pan.sohu.net".equals(host)
									|| host.endsWith("pan.sohu.net")) {
								url = "https://" + host;
							} else {
								url = "http://" + host;
							}
							if (getIsOutShareLink() == 1) {
								return "outShareIndex";
							} else {
								return "index";
							}
						} else {
							accessId = jusernew.getString("accessId");
							forward = Register.getEmailAddres(loginName);
							if (StringUtils.isEmpty(accessId)
									|| StringUtils.isEmpty(loginName)
									|| StringUtils.isEmpty(forward)) {
								errorMessage = "信息错误！";
								return "login";
							} else {
								errorMessage = "您还未激活邮箱，请激活邮箱或重发邮件后激活！";
								return "register";
							}
						}
					} else if (code == 203) {
						logger.info(login);
						errorMessage = "帐号已经被删除";
						return "login";
					} else if (code == 204) {
						logger.info(login);
						errorMessage = "账号已经过期";
						return "login";
					} else if (code == 205) {
						logger.info(login);
						errorMessage = "您的IP不在允许范围";
						return "login";
					} else {
						logger.info(login);
						errorMessage = "帐号和密码不匹配";
						return "login";
					}
				}
			} catch (SBoxClientException e) {
				logger.info(e.getMessage());
				e.printStackTrace();
				errorMessage = "服务错误";
				return "login";
			} catch (JSONException e) {
				logger.info(e.getMessage());
				e.printStackTrace();
				errorMessage = "帐号和密码不匹配";
				return "login";
			} catch (ParseException e) {
				logger.info(e.getMessage());
				e.printStackTrace();
				errorMessage = "服务错误";
				return "login";
			}
		} else {
			if (getIsOutShareLink() == 1) {
				return "outShareIndex";
			} else {
				return "index";
			}
		}
		return "login";
	}

	public String loadUserInfo() throws SBoxClientException, JSONException {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		if (secretKey != null) {
			String login = sc.login(secretKey);
			if (!StringUtils.isEmpty(login)) {
				JSONObject js = JSONObject.fromObject(login);
				String code = "";
				try {
					code = js.getString("code");
				} catch (Exception e) {
					errorMessage = "Login API is Error!";
				}
				if (StringUtils.isEmpty(code)) {
					loadUserInfo(js);
				} else if (code.startsWith("4")) {
					errorMessage = "超时，需重新登陆";
					return "filtererror";
				} else {
					if (reload == 1l) {
						return "filtererror";
					} else {
						errorMessage = "验证码错误.";
						return "filtererror";
					}
				}
			}
			if (StringUtils.isEmpty(rurl)) {
				return "index";
			} else {
				return "reURL";
			}
		}
		return "filtererror";
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
				Long settingSize = userpro.getSettingSize();
				if (settingSize != null) {
					allSize = settingSize / (1024 * 1024) + " M";
				} else {
					allSize = "0 M";
				}
			}
		}
		if (js.has("user")) {
			juser = js.getJSONObject("user");
			suser = (SBoxUser) JSONTools.toModel(SBoxUser.class, juser);
			id = juser.getLong("id");
		}
		user = new User(account, suser, userpro);
		putSession(SessionName.USER, user);
	}

	private void setAccountSize() {
		User user = (User) getSession(SessionName.USER);
		SBoxUserProfile userpro = user.getUserPro();
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			SecretKey secretKey = user.getSecretKey();
			String userUsedSpace = sc.userUsedSpace(secretKey);
			JSONObject json = JSONObject.fromObject(userUsedSpace);
			if (json.getInt("code") == 200) {
				Long useSize = json.getLong("userUsedSpace");
				Long settingSize = userpro.getSettingSize();
				allSize = ToolsUtil.toSizeStr(settingSize);
				usedSize = ToolsUtil.toSizeStr(useSize);
				lastSize = ToolsUtil.toSizeStr(settingSize - useSize);
				addCookie(CommonAction.M_SECRETKEY, secretKey.getDomain() + "/"
						+ secretKey.getSBoxAccessKeyId() + "/"
						+ secretKey.getSBoxSecretKey());
				// addCookie(CommonAction.DOMAIN, secretKey.getDomain());
				// addCookie(CommonAction.ID, secretKey.getSBoxAccessKeyId());
				// addCookie(CommonAction.SECRETKEY,
				// secretKey.getSBoxSecretKey());
				putSession("allSize", allSize);
				putSession("usedSize", usedSize);
				putSession("lastSize", lastSize);
				if (!StringUtils.isEmpty(allSize) && !allSize.equals("0")
						&& settingSize > 0) {
					double result = (useSize.doubleValue() / settingSize
							.doubleValue()) * 100;
					BigDecimal b = new BigDecimal(result);
					result = b.setScale(2, BigDecimal.ROUND_HALF_UP)
							.doubleValue();
					putSession("baifenbi", result);
				} else {
					putSession("baifenbi", "0");
				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
	}

	public String toLogin() {
		return "login";
	}

	public String getUsedSize() {
		return usedSize;
	}

	public void setUsedSize(String usedSize) {
		this.usedSize = usedSize;
	}

	public String getAllSize() {
		return allSize;
	}

	public void setAllSize(String allSize) {
		this.allSize = allSize;
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

	public String getLoginName() {
		return loginName;
	}

	public void setLoginName(String loginName) {
		this.loginName = loginName;
	}

	public String getLastSize() {
		return lastSize;
	}

	public void setLastSize(String lastSize) {
		this.lastSize = lastSize;
	}

	public Integer getLoginTime() {
		return loginTime;
	}

	public void setLoginTime(Integer loginTime) {
		this.loginTime = loginTime;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPassword() {
		return password;
	}

	public void setLoginGoon(int loginGoon) {
		this.loginGoon = loginGoon;
	}

	public int getLoginGoon() {
		return loginGoon;
	}

	public void setAutologin(boolean autologin) {
		this.autologin = autologin;
	}

	public boolean getAutologin() {
		return autologin;
	}

	public void setRurl(String rurl) {
		this.rurl = rurl;
	}

	public String getRurl() {
		return rurl;
	}

	public void setReturnURL(String returnURL) {
		this.returnURL = returnURL;
	}

	public String getReturnURL() {
		return returnURL;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getUrl() {
		return url;
	}

	public void setIsOutShareLink(int isOutShareLink) {
		this.isOutShareLink = isOutShareLink;
	}

	public int getIsOutShareLink() {
		return isOutShareLink;
	}

}
