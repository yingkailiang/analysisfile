package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
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
public class DeleteObject extends CommonAction {
	private static final Logger logger = Logger.getLogger(DeleteObject.class);

	@SuppressWarnings("deprecation")
	public void delete() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String dirIds = getParameter("dirIds");
		String[] dis = dirIds.split(",");
		String fileIds = getParameter("fileIds");
		String[] fis = fileIds.split(",");
		net.sf.json.JSONArray array = new JSONArray();
		try {
			for (String id : dis) {
				if (!StringUtils.isEmpty(id)) {
					String deleteDir = sbox.deleteDir(id, secretKey);
					JSONObject fromObject = JSONObject.fromObject(deleteDir);
					JSONObject object = new JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "dir");
					array.add(object);
				}
			}
			for (String id : fis) {
				if (!StringUtils.isEmpty(id)) {
					String deleteObject = sbox.deleteObject(id, secretKey);
					JSONObject fromObject = JSONObject.fromObject(deleteObject);
					net.sf.json.JSONObject object = new net.sf.json.JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "file");
					array.add(object);
				}
			}
			ajaxBack(array.toString());
		} catch (SBoxClientException e) {
			logger.error(e.getMessage(), e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
			e.printStackTrace();
		}
	}
}
