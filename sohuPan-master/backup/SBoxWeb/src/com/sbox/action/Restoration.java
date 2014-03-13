package com.sbox.action;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxObject;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class Restoration extends CommonAction {
	private static final Logger logger = Logger.getLogger(Restoration.class);

	public void regain() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("resourceId");
		String path = getParameter("path");
		String key = getParameter("key");
		HttpServletResponse response = ServletActionContext.getResponse();

		try {
			SBoxObject object = sbox.getObject(resourceId, "bytes=0-",
					secretKey);
			response.addHeader("Content-Disposition", "attachment; filename="
					+ URLEncoder.encode(object.getName(), "UTF-8"));
			ServletOutputStream outputStream = response.getOutputStream();
			InputStream content = object.getContent();
			byte[] bytes = new byte[1024 * 150];
			int size = -1;
			while ((size = content.read(bytes)) != -1) {
				outputStream.write(bytes, 0, size);
				outputStream.flush();
			}
			content.close();
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
