package com.sbox.action;

import java.io.IOException;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class FileVersion extends CommonAction {

	@SuppressWarnings("deprecation")
	public void switchVersion() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("resourceId");
		String version = getParameter("version");
		try {
			String copyDir = sbox.switchLatestVersion(resourceId, version, secretKey);
			ajaxBack(copyDir);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
