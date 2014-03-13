package com.sbox.action;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.tools.MD5Util;
import com.sbox.tools.SignatureUtil;

/**
 * 账户Action
 * 
 * @author yangwei
 */
public class CheckShareDirPassword extends CommonAction {
	
private static final Logger logger = Logger.getLogger(CheckShareDirPassword.class);
	
	private String resourceId;

	private String userId;
	
	private String sign;

	private String date;
	
	private String password;
	
	private String shareType;


	public void share() {
		JSONObject flagJsonObject = new JSONObject();
		SBox sbox = SBoxClientInstance.getSboxClient();
		//校验时间
		Calendar calendar = Calendar.getInstance();
		calendar.setTimeInMillis(Long.valueOf(date));
		calendar.add(Calendar.DAY_OF_MONTH, 1);
		Date verifingDate = calendar.getTime();
		Date today = new Date();
		if(today.after(verifingDate))
		{
			logger.info("CheckShareDirPassword verifingDate is expire");
			flagJsonObject.put("code", 501);
			flagJsonObject.put("errorMeaasge", "CheckShareDirPassword verifingDate is expire");
		}
		//校验签名
		String md5 = "";
		if("2".equalsIgnoreCase(shareType))
		{
			md5 = genSign(userId, resourceId, date);
		}else
		{
			 shareType = "1";
			 md5 = genSign(userId, userId, date);
		}
		
		if(!sign.equalsIgnoreCase(md5))
		{
			logger.info("CheckShareDirPassword verifing sign wrong");
			flagJsonObject.put("code", 501);
			flagJsonObject.put("errorMeaasge", "CheckShareDirPassword verifing sign wrong");
		}
		String checkPassword = "" ;
		try {
			checkPassword = sbox.checkOutLinkPassword(userId, resourceId, MD5Util.MD5(password.trim()), shareType);
		} catch (SBoxClientException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		JSONObject json = JSONObject.fromObject(checkPassword);
		int checkPasswordCode = json.getInt("code");
		if(checkPasswordCode == 200)
		{
			flagJsonObject.put("code", 200);
			flagJsonObject.put("errorMeaasge", "CheckShareDirPassword verifing success");
		}else
		{
			flagJsonObject.put("code", 500);
			flagJsonObject.put("errorMeaasge", "CheckShareDirPassword fail");
		}
		
	    try {
			ajaxBack(flagJsonObject.toString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	private String genSign(String userId, String fileLasestId, String date) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("userId", userId);
		map.put("Resourceid", fileLasestId);
		map.put("date", date);
		String nvs = SignatureUtil.toPlaintext(map);
		String md5 = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
		return md5;
	}
	
	
	public String getResourceId() {
		return resourceId;
	}


	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}


	public String getUserId() {
		return userId;
	}


	public void setUserId(String userId) {
		this.userId = userId;
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
	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
	public String getShareType() {
		return shareType;
	}

	public void setShareType(String shareType) {
		this.shareType = shareType;
	}



}
