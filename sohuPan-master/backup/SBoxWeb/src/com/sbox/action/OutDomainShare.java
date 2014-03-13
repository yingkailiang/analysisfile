package com.sbox.action;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.JSONTools;
import com.sbox.tools.SessionName;
import com.sun.jndi.toolkit.url.UrlUtil;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class OutDomainShare extends CommonAction {
	private static final Logger logger = Logger.getLogger(OutDomainShare.class);
	private Long userId = 0l;
	private String dirId = "";
	private String sign = "";
	private int accept = 0;
	private String message = "";
	private String url = "";
	private long id;
	private String path;
	private String title;
	private String email;

	public String accept() throws IOException {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String result = "";
		try {
			result = sbox.accept(userId, dirId, getAccept(), sign);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		JSONObject json = JSONObject.fromObject(result);
		int code = json.getInt("code");
		if (code == 200) {
			//修改 PAN-1253 ：begin
			//message = "您已经接受共享";
			//path = UrlUtil.decode(path,"UTF-8");
			// url = json.getString("url");
			//loadUserInfo(json);
			User user = (User) getSession(SessionName.USER);
			if (user == null) {
				return "login";
			} else {
				if(email.equals(user.getUser().getLoginName())){
					return "acceptIntive";
				}else{
					putSession(SessionName.USER, null);
					return "login";
				}
			}
			//PAN-1253 :end
		} else if (code == 303) {
			message = "此链接已经失效！";
			title = "域外共享";
		}
		return "accept_success";
	}

	public String acceptForward() {
		return "home";
	}

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
				account = (SBoxAccount) JSONTools.toModel(SBoxAccount.class,
						jaccount);
			}
		}
		// 取出用户扩展信息
		if (js.has("jProfile")) {
			jProfile = js.getJSONObject("jProfile");
			if (jProfile != null) {
				userpro = (SBoxUserProfile) JSONTools.toModel(
						SBoxUserProfile.class, jProfile);
			}
		}
		// 取出用户登陆信息
		if (js.has("user")) {
			juser = js.getJSONObject("user");
			suser = (SBoxUser) JSONTools.toModel(SBoxUser.class, juser);
			setId(juser.getLong("id"));
		}
		user = new User(account, suser, userpro);
		putSession(SessionName.USER, user);
	}

	public String unaccept() throws SBoxClientException {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String result = sbox.unaccept(userId, dirId, getAccept(), sign);
		JSONObject json = JSONObject.fromObject(result);
		int code = json.getInt("code");
		if (code == 200) {
			message = "您已经拒绝接受共享";
		} else if (code == 303) {
			message = "此链接已经失效！";
			title = "域外共享";
		}
		return "accept_success";
	}

	public void reSendEmail() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String result = sbox.reSendEmail(userId, dirId, secretKey);
			ajaxBack(result);
		} catch (IOException e) {
			e.printStackTrace();
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setDirId(String dirId) {
		this.dirId = dirId;
	}

	public String getDirId() {
		return dirId;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getSign() {
		return sign;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getMessage() {
		return message;
	}

	public void setAccept(int accept) {
		this.accept = accept;
	}

	public int getAccept() {
		return accept;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getUrl() {
		return url;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getId() {
		return id;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getPath() {
		return path;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

}
