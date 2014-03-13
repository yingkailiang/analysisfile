package com.sbox.action;

import java.util.Map;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;

/**
 * 
 * 
 * @author yangwei
 */
public class AccountEmail extends CommonAction {
	private static final Logger logger = Logger.getLogger(AccountEmail.class);

	private int type;


	public String email() {

		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String user = null;
		try {
			user = sbox.getUser(secretKey);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		JSONObject userObject = JSONObject.fromObject(user);
		int code = userObject.getInt("code");
		if(code == 200){
			JSONObject userJsonObject =  userObject.getJSONObject("user");
			type = Integer.valueOf(userJsonObject.getString("shareEmail"));
			return "success";
		}
		
        return "404";
	}


	public int getType() {
		return type;
	}


	public void setType(int type) {
		this.type = type;
	}

	


}
