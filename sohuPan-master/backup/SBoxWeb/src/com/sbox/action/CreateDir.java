package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class CreateDir extends CommonAction {
	private static final Logger logger = Logger.getLogger(CreateDir.class);

	public void createDir() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		// sbox.setDomain(secretKey.getDomain());
		String tagertId = getParameter("tagertId");
		String shareFlag = getParameter("shareFlag");
		String name = getParameter("name").trim();
		if (StringUtils.isEmpty(name) || name.length() >= 256) {
			JSONObject jssu = new JSONObject();
			jssu.put("code", 601);
			jssu.put("message", "Name is not allowed empty");
			try {
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		try {
			String createDir = sbox.createDir(tagertId, shareFlag == null ? 0
					: Integer.parseInt(shareFlag), name, secretKey);
			ajaxBack(createDir);
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}
}
