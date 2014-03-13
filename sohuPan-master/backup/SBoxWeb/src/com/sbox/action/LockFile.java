package com.sbox.action;

import java.io.IOException;
import java.sql.Date;
import java.text.SimpleDateFormat;

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
public class LockFile extends CommonAction {
	private static final Logger logger = Logger.getLogger(LockFile.class);

	public void lock() {
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
		String LockTime = getParameter("LockTime");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date date = null;
		try {
			int time = Integer.parseInt(LockTime);
			date = new Date(System.currentTimeMillis() + time * 60 * 1000);
		} catch (Exception e) {
		}
		try {
			String objectLock = sbox.createFileLock(resourceId,
					date == null ? "" : sdf.format(date), secretKey);
			ajaxBack(objectLock);
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}
}
