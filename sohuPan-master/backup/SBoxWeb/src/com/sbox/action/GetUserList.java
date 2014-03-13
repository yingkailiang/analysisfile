package com.sbox.action;

import java.io.IOException;

import org.apache.commons.lang3.StringUtils;

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
public class GetUserList extends CommonAction {

	@SuppressWarnings("deprecation")
	public void service() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		String id = getParameter("id");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getUserListByDomain(secretKey.getDomain(),secretKey);
			ajaxBack(service);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
