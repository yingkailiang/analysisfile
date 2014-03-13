package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 接收消息设置
 * 
 * @author yangwei
 */
public class ShareEmailSet extends CommonAction {
	
	private int code;

	public String setShareEmail() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String shareEmail = getParameter("shareEmail");
		try {
			if(StringUtils.isEmpty(shareEmail))
			{
				shareEmail = "0";
			}
			
		    String emailCode = sbox.updateShareEmail(shareEmail, secretKey);
			
			if (StringUtils.isNotEmpty(emailCode)) {

				try {
					JSONObject json = JSONObject.fromObject(emailCode);
					code = json.getInt("code");
				} catch (Exception e) {
					e.printStackTrace();
					return "404";
				}
				return "success";

			}
			
		} catch (SBoxClientException e) {
			logger.error("SBox ShareEmailSet API error", e);
			e.printStackTrace();
		} 
		
		return "404";
	}
	
	
	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	

}
