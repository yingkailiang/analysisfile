package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class CopyFile extends CommonAction {
	private static final Logger logger = Logger.getLogger(CopyResource.class);
	@SuppressWarnings("deprecation")
	public void copyFile() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String targetId = getParameter("targetId");
		String rename = getParameter("rename");
		String resourceId = getParameter("resourceId");
		try {
			String copyDir = sbox.copyObject(resourceId, targetId, rename,
					secretKey);
			ajaxBack(copyDir);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
