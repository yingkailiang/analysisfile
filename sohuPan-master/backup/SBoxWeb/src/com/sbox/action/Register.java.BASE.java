package com.sbox.action;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;
import com.sohu.sendcloud.Message;
import com.sohu.sendcloud.SendCloud;
import com.sohu.sendcloud.exception.BlankException;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class Register extends CommonAction {

	private static final long serialVersionUID = 1L;
	private String message;
	private SBoxUserProfile suser = new SBoxUserProfile();
	private String sign = null;
	private String accessId = null;
	private String expireDate = null;
	private String loginName = null;
	private String email = null;
	private String forward = null;
	private String type;
	private String date;
	private String title;

	public String register() {
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		loginName = getParameter("username");
		String password = getParameter("password");
		String repassword = getParameter("repassword");
		String validateCode = (String) session.get(SessionName.VALIDATECODE);
		String validateCodeClient = getParameter(SessionName.VALIDATECODE);
		if ((StringUtils.isEmpty(validateCode))
				|| (StringUtils.isEmpty(validateCodeClient))
				|| !validateCode.equals(validateCodeClient)) {
			this.message = "验证码错误";
			return "register1";
		}
		if (StringUtils.isEmpty(loginName)) {
			this.message = "输入用户名为空";
			return "register1";
		}
		if (StringUtils.isEmpty(password) || StringUtils.isEmpty(password)
				|| !password.equals(repassword)) {
			this.message = "密码不一致";
			return "register1";
		}
		String city = getParameter("city");
		String cityCode = getParameter("cityCode");
		String company = getParameter("company");
		String country = getParameter("country");
		String contact = getParameter("contact");
		String countryCode = getParameter("countryCode");
		String realName = getParameter("realName");
		String provinceCode = getParameter("provinceCode");
		String nickName = getParameter("nickName");
		String phoneNum = getParameter("phoneNum");
		String province = getParameter("province");
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			String register = sc.register(loginName, loginName, password);
			if (!StringUtils.isEmpty(register)) {
				JSONObject js = JSONObject.fromObject(register);
				boolean hasCode = js.has("code");
				if (hasCode) {
					int code = js.getInt("code");
					if (code == 303) {
						this.message = "email 已经存在（is exist）";
						return "register1";
					}
				} else {
					String domain = js.getString("domain");
					String secretToken = js.getString("secretToken");
					long id = js.getLong("id");
					suser.setId(id);
					suser.setCity(city);
					suser.setCityCode(cityCode);
					suser.setCompany(company);
					suser.setCountry(country);
					suser.setCountryCode(countryCode);
					suser.setDomain(domain);
					suser.setEmail(loginName);
					suser.setNickName(nickName);
					suser.setPhoneNum(phoneNum);
					suser.setProvince(province);
					suser.setProvinceCode(provinceCode);
					suser.setRealName(realName);
					SecretKey secretKey = new SecretKey(domain, String
							.valueOf(id), secretToken);
					sc.updateUser(suser, secretKey);
					// addCookie(ID, String.valueOf(id));
					// addCookie(DOMAIN, domain);
					// addCookie(SECRETKEY, secretToken);
					accessId = js.getString("accessId");

					sc = SBoxClientInstance.getSboxClient();
					String activeUSer = sc.getActiveUserInfo(accessId);
					JSONObject activeJson = JSONObject.fromObject(activeUSer);
					sign = activeJson.getString("sign");
					expireDate = activeJson.getString("expiredate");
					expireDate = expireDate.substring(0, 10)
							+ expireDate.substring(11, 19);
					String title = "搜狐企业网盘验证";
					String body = collectHtmlContent(loginName, accessId, sign,
							expireDate).toString();
					try {
						Message message = new Message("service@pan.sohu.net",
								title, body);
						message.addRecipient(loginName);
						SendCloud sendCloud = new SendCloud("wangpan",
								"1234567", false, message);
						sendCloud.send();

					} catch (BlankException e) {
						e.printStackTrace();
					} catch (Exception e) {
						e.printStackTrace();
					}
					/**
					 * String title = "搜狐企业网盘验证"; boolean sendmail =
					 * EmailManager.sendEmail(loginName, title,
					 * collectHtmlContent(accessId, sign, expireDate)
					 * .toString()); if (!sendmail) { this.message =
					 * "邮件发送失败，请重发"; return "register2"; }
					 */
				}
			} else {
				this.message = "注册失败，请重新注册！";
				return "register1";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
			this.message = "此链接已经失效！";
			this.setTitle("用户激活");
			return "register4";
		} catch (JSONException e) {
			e.printStackTrace();
			this.message = "注册失败，请重新注册！";
			return "register1";
		}
		forward = getEmailAddres(loginName);
		return "register2";
	}

	public String certificate() throws JSONException {
		sign = getParameter("sign");
		expireDate = getParameter("expireDate");
		accessId = getParameter("accessId");
		if (StringUtils.isEmpty(expireDate) || StringUtils.isEmpty(sign)
				|| StringUtils.isEmpty(accessId)) {
			this.message = "验证失败，请重发激活邮件！";
			return "register2";
		}
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			String activeuser = sc.activeUser(accessId, expireDate, sign);
			JSONObject userJson = JSONObject.fromObject(activeuser);
			String code = userJson.getString("code");
			if (!StringUtils.isEmpty(code) && code.equals("200")) {
				if ("1".equals(type)) {
					// flagJsonObject.put("uid", userId);
					// flagJsonObject.put("date", newDate.getTime());
					// flagJsonObject.put("sign", signWord);
					setDate(userJson.getString("date"));
					sign = userJson.getString("sign");
					return "setPassword";
				} else {
					this.message = "验证成功";
					this.loginName = userJson.getString("email");
					return "register3";
				}
			} else if (!StringUtils.isEmpty(code) && code.equals("501")) {
				this.message = "验证超时，请重发激活邮件！";
				this.loginName = userJson.getString("email");
				return "register2";
			} else if (!StringUtils.isEmpty(code) && code.equals("300")) {
				//this.message = "您已经验证过，可直接登录！";
				this.message = "此链接已经失效！";
				this.loginName = userJson.getString("email");
				this.setTitle("用户激活");
//				if ("1".equals(type)) {
//					setDate(userJson.getString("date"));
//					sign = userJson.getString("sign");
//					return "setPassword";
//				}else{
				return "register4";
//				}
			} else {
				this.message = "验证失败，请重发激活邮件！";
				this.loginName = userJson.getString("email");
				return "register2";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
			this.message = "此链接已经失效！";
			this.setTitle("用户激活");
			return "register4";
		} catch (JSONException e) {
			e.printStackTrace();
			this.message = "此链接已经失效！";
			this.setTitle("用户激活");
			return "register4";
		}
	}

	public void resentEmail() throws IOException {

		accessId = getParameter("accessId");
		loginName = getParameter("loginName");
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		String activeUSer = null;
		try {
			activeUSer = sc.getActiveUserInfo(accessId);
			JSONObject activeJson = JSONObject.fromObject(activeUSer);
			expireDate = activeJson.getString("expiredate");
			// expireDate = expireDate.substring(0, 10)
			// + expireDate.substring(11, 19);
			sign = activeJson.getString("sign");
			String title = "搜狐企业网盘验证";
			String body = collectHtmlContent(loginName, accessId, sign,
					expireDate).toString();
			try {
				Message message = new Message("service@pan.sohu.net", title,
						body);
				message.addRecipient(loginName);
				SendCloud sendCloud = new SendCloud("wangpan", "1234567",
						false, message);
				sendCloud.send();
				ajaxBack("{code:200,message:\"Email send is success!\"}");
			} catch (BlankException e) {
				e.printStackTrace();
				ajaxBack("{code:500,message:\"API is error!\"}");
			} catch (Exception e) {
				e.printStackTrace();
				ajaxBack("{code:500,message:\"API is error!\"}");
			}

		} catch (SBoxClientException e) {
			e.printStackTrace();
			ajaxBack("{code:500,message:\"API is error!\"}");
		} catch (JSONException e) {
			e.printStackTrace();
			ajaxBack("{code:500,message:\"Json Data is error!\"}");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public String regLogin() {

		try {
			Login login = new Login();
			String slogin = login.loadUserInfo();
			if (!StringUtils.isEmpty(slogin)
					&& (slogin.equals("login") || slogin.equals("relogin"))) {
				this.message = "登录失败";
				return "relogin";
			} else if (!StringUtils.isEmpty(slogin) && slogin.equals("index")) {
				this.message = "登录成功";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
			this.message = "自动登录失败";
			return "relogin";
		} catch (JSONException e) {
			e.printStackTrace();
			this.message = "API is wrong,自动登录失败";
			return "relogin";
		}
		return "index";
	}

	public static String getEmailAddres(String loginName) {
		String mailSite = "";
		loginName = loginName.toLowerCase();
		String emailSuffix = loginName
				.substring(loginName.lastIndexOf("@") + 1);
		if (!StringUtils.isEmpty(emailSuffix)) {
			if (emailSuffix.equals("gmail.com")) {
				mailSite = "https://mail.google.com/";
			} else if (emailSuffix.equals("vip.sohu.com")) {
				mailSite = "http://" + emailSuffix;
			} else if (emailSuffix.equals("vip.sohu.net")) {
				mailSite = "http://" + emailSuffix;
			} else if (emailSuffix.equals("sohu.com")) {
				mailSite = "http://mail." + emailSuffix;
			} else if (emailSuffix.equals("sohu.net")) {
				mailSite = "http://mail." + emailSuffix;
			} else if (emailSuffix.contains("vip")) {
				mailSite = "http://" + emailSuffix;
			} else {
				mailSite = "http://mail." + emailSuffix;
			}
		}
		return mailSite;
	}

	protected static StringBuffer collectHtmlContent(String loginName,
			String accessId, String sign, String expireDate) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String url = request.getRequestURL().toString();
		String[] urls = url.split("/");
		if (StringUtils.isEmpty(urls[2])) {
			urls = url.split("\\");
		}
		String[] http = urls[0].split(":");
		StringBuffer emailContent = new StringBuffer();
		try {
			emailContent = emailModelUp(emailContent);
			emailContent.append("<strong style='font-size:14px;'>您好，"
					+ loginName + "：</strong>  ");
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'>感谢您注册搜狐企业网盘，为了您的帐号安全，需要验证您的邮箱，请点击下面的链接激活帐号。 </p>");
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'><a style='color:#2C71BE; font-size:14px;' href='"
							+ http[0]
							+ "://"
							+ urls[2]
							+ "/Register!certificate.action?accessId="
							+ accessId
							+ "&sign="
							+ sign
							+ "&expireDate="
							+ expireDate
							+ "' style='color:#2C71BE;'>点击此链接，激活帐号！</a></p>");
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'>(如果链接无法点击，请将此链接复制到浏览器地址栏后访问。为了保障您帐号的安全性，请在 24小时</p>");
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'>内完成验证，此链接将在您验证一次后失效！如果链接失效，您可以在登录后重新发送确认邮件。)</p>");
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'>若您没有注册过搜狐企业网盘，请您忽略此邮件，此帐号将不会被验证，由此给您带来的不便请谅解。</p>");
			emailContent.append("<br/>");
			emailContent
					.append("<p style='font-size:12px; margin:10px 0; color:#919191;'>(此为系统邮件，请勿回复。 如有任何疑问请<a href='mailto:pan@sohu.net' style='color:#2C71BE;'>联系我们</a>。)</p>");
			emailContent = emailModelDown(emailContent);
		} catch (Exception e) {
		}
		return emailContent;
	}

	public SBoxUserProfile getSuser() {
		return suser;
	}

	public void setSuser(SBoxUserProfile suser) {
		this.suser = suser;
	}

	public String getSign() {
		return sign;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getAccessId() {
		return accessId;
	}

	public void setAccessId(String accessId) {
		this.accessId = accessId;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getExpireDate() {
		return expireDate;
	}

	public void setExpireDate(String expireDate) {
		this.expireDate = expireDate;
	}

	public String getLoginName() {
		return loginName;
	}

	public void setLoginName(String loginName) {
		this.loginName = loginName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getForward() {
		return forward;
	}

	public void setForward(String forward) {
		this.forward = forward;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getDate() {
		return date;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTitle() {
		return title;
	}

}
