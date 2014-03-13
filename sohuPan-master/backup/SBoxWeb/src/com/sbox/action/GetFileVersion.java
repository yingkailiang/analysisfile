package com.sbox.action;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
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
public class GetFileVersion extends CommonAction {
	private static final Logger logger = Logger.getLogger(GetFileVersion.class);

	public void getFile() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("resourceId");
		String version = getParameter("version");
		String splitId = getParameter("splitId");
		HttpServletResponse response = ServletActionContext.getResponse();
		try {
			SBoxObject object = sbox.getObjectByVersion(resourceId, version,splitId,
					secretKey);
			if (object != null) {
				String fileName = object.getName();
				HttpServletRequest request = ServletActionContext.getRequest();
				response.addHeader("Content-Disposition",
						"attachment; filename="
								+ GetFile.getFileName(request, fileName));
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
			} else {
				response.sendRedirect("/404-1.jsp");
			}
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}
}
