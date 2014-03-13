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
public class GetShareUserList extends CommonAction {

	@SuppressWarnings("deprecation")
	public void getService() {
		SecretKey secretKey = getSecretKey();
		String resourceId = getParameter("resourceId");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getShareUserList(resourceId,secretKey);
			ajaxBack(service);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
