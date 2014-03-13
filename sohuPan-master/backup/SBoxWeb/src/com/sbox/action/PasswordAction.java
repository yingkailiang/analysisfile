package com.sbox.action;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.tools.JSONTools;
import com.sbox.tools.SessionName;

public class PasswordAction extends CommonAction {
	private Logger logger = Logger.getLogger(this.getClass());
	private String password1;
	private String password2;
	private String uid;
	private String sign;
	private String date;
	private String emailAddres;
	private String errorMessage;
	private String message;
	
	/*PAN-1198 ‘-1’代表激活时设置密码*/
	/*Begin*/
	private String reset = "0";
	/*End*/

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	private String datstr;
	private String type;
	private String title;

	public String getDatstr() {
		return datstr;
	}

	public void setDatstr(String datstr) {
		this.datstr = datstr;
	}

	public String getPassword1() {
		return password1;
	}

	public void setPassword1(String password1) {
		this.password1 = password1;
	}

	public String getPassword2() {
		return password2;
	}

	public void setPassword2(String password2) {
		this.password2 = password2;
	}

	public String getUid() {
		return uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
	}

	public String getSign() {
		return sign;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getEmailAddres() {
		return emailAddres;
	}

	public void setEmailAddres(String emailAddres) {
		this.emailAddres = emailAddres;
	}

	public String toSendPage() {
		return "sendPage";
	}

	public String send() {
		String email = getParameter("email");
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			String sendResult = sc.sendResetPassword(email);
			JSONObject object = JSONObject.fromObject(sendResult);
			int code = object.getInt("code");
			if (code == 200) {
				emailAddres = Register.getEmailAddres(email);
				return "sendSuccess";
			} else if (501 == code) {
				errorMessage = "该帐号不存在";
				return "sendPage";
			}
			return "resetpasswordError";
		} catch (SBoxClientException e) {
			errorMessage = "链接异常:" + e.getMessage();
			logger.error("reset password is exception:", e);
			return "resetpasswordError";
		}

	}

	// uid=1399&datstr=1349850084442&sign=3C767C73959A527636AFCA4D5325F830
	public String resetPage() {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			String checkResetPassword = sc
					.checkResetPassword(uid, datstr, sign);
			JSONObject object = JSONObject.fromObject(checkResetPassword);
			int code = object.getInt("code");
			if (code == 200) {
				date = object.getString("date");
				sign = object.getString("sign");
				return "resetPage";
			} else if (code == 501) {
				errorMessage = "链接已经超期:";
			} else if (code == 502) {
				errorMessage = "链接认证失败:";
			} else if (code == 503) {
				message = "此链接已经失效！";
				setTitle("设置密码");
				return "invalid";
			}
			return "resetpasswordError";
		} catch (SBoxClientException e) {
			errorMessage = "链接异常:" + e.getMessage();
			logger.error("reset password is exception:", e);
			return "resetpasswordError";
		}
	}

	public String resetPassword() {
		password1 = getParameter("password1");
		password2 = getParameter("password2");
		uid = getParameter("uid");
		sign = getParameter("sign");
		date = getParameter("date");
		reset = getParameter("reset");
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		String newPassword = password1;
		if (StringUtils.isEmpty(password1) || StringUtils.isEmpty(password2)) {
			errorMessage = "密码不能为空。";
			return "resetPage";
		} else if (!password1.equals(password2)) {
			errorMessage = "密码不一致。";
			return "resetPage";
		}
		try {
			String sendResult = sc.resetPasswordByUser(uid+"_"+reset, date, sign,
					newPassword);
			JSONObject object = JSONObject.fromObject(sendResult);
			int code = object.getInt("code");
			if (code == 200) {
				if ("1".equals(getType())) {
					loadUserInfo(object);
					return "login";
				} else {
					return "resetSuccess";
				}
			}else
				if(code == 302){
					message = "此链接已经失效！";
					setTitle("设置密码");
					return "invalid";
				}
			return "resetpasswordError";
		} catch (SBoxClientException e) {
			errorMessage = "链接异常:" + e.getMessage();
			logger.error("reset password is exception:", e);
			return "resetpasswordError";
		}

	}
	/*PAN-1260 设置session值*/
	/*Begin*/
	protected void loadUserInfo(JSONObject js) throws JSONException {
		User user = null;
		JSONObject juser = null;
		JSONObject jaccount = null;
		JSONObject jProfile = null;
		SBoxAccount account = null;
		SBoxUser suser = null;
		SBoxUserProfile userpro = null;
		// 取出账号信息
		if (js.has("jAccount")) {
			jaccount = js.getJSONObject("jAccount");
			if (!jaccount.isEmpty()) {
				account = (SBoxAccount) JSONTools.toModel(SBoxAccount.class,jaccount);
			}
		}
		// 取出用户扩展信息
		if (js.has("jProfile")) {
			jProfile = js.getJSONObject("jProfile");
			if (jProfile != null) {
				userpro = (SBoxUserProfile) JSONTools.toModel(SBoxUserProfile.class, jProfile);
			}
		}
		// 取出用户登陆信息
		if (js.has("jUser")) {
			juser = js.getJSONObject("jUser");
			if(juser != null){
				suser = (SBoxUser) JSONTools.toModel(SBoxUser.class, juser);
			}
			//setUid(juser.getLong("id"));
		}
		user = new User(account, suser, userpro);
		putSession(SessionName.USER, user);
	}
	/*End*/

	public void setType(String type) {
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public void setReset(String reset) {
		this.reset = reset;
	}

	public String getReset() {
		return reset;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTitle() {
		return title;
	}
}
