package com.sbox.action;

import java.io.IOException;

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
public class GetVersionList extends CommonAction {

	@SuppressWarnings("deprecation")
	public void getVersionList() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				ajaxBack(403, "The authentication information is empty!");
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("resourceId");
		try {
			String checkVersionList = sbox.checkVersionList(resourceId,
					secretKey);
			ajaxBack(checkVersionList);
		} catch (SBoxClientException e) {
			try {
				ajaxBack(500, e.getMessage());
			} catch (IOException ex) {
				ex.printStackTrace();
			}
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
