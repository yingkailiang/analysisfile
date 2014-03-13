package com.sbox.action;

import java.io.IOException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

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
public class GetFileInfo extends CommonAction {
	private static final Logger logger = Logger.getLogger(GetFileInfo.class);

	public void getFileInfo() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("resourceId");
		HttpServletResponse response = ServletActionContext.getResponse();
		try {
			String objectInfo = sbox.getObjectInfo(resourceId, secretKey);
			ServletOutputStream outputStream = response.getOutputStream();
			outputStream.write(objectInfo.getBytes());
			outputStream.flush();
			outputStream.close();
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}
}
