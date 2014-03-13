package com.sbox.action;

import java.io.IOException;

import org.apache.log4j.Logger;

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
public class CopyDir extends CommonAction {
	private static final Logger logger = Logger.getLogger(CopyDir.class);
	@SuppressWarnings("deprecation")
	public void copyDir() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String targetId = getParameter("targetId");
		String resourceId = getParameter("resourceId");
		try {
			String copyDir = sbox.copyDir(resourceId, targetId, secretKey);
			ajaxBack(copyDir);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
