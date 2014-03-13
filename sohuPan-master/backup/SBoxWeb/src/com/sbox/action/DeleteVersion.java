package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * @author Jack.wu.xu
 */
public class DeleteVersion extends CommonAction {

	public void deleteVersion() {
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
		SBox sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("resourceId");
		String versionNumber = getParameter("versionNumber");
		try {
			String deleteVersion = sbox.deleteVersion(resourceId, versionNumber,
					secretKey);
			ajaxBack(deleteVersion);
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}
}
