package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

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
public class CopyResource extends CommonAction {
	private static final Logger logger = Logger.getLogger(CopyResource.class);
	@SuppressWarnings("deprecation")
	public void copy() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String targetId = getParameter("targetId");
		String dirId = getParameter("dirIds");
		String fileIds = getParameter("fileIds");
		String[] dids = dirId.split(",");
		String[] fids = fileIds.split(",");
		net.sf.json.JSONArray array = new JSONArray();
		try {
			for (String id : dids) {
				if (!StringUtils.isEmpty(id)) {
					String copyDir = sbox.copyDir(id, targetId, secretKey);
					net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
							.fromObject(copyDir);
					net.sf.json.JSONObject object = new net.sf.json.JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "dir");
					array.add(object);
				}
			}
			for (String id : fids) {
				if (!StringUtils.isEmpty(id)) {
					String deleteDir = sbox.copyObject(id, targetId, "",
							secretKey);
					net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
							.fromObject(deleteDir);
					net.sf.json.JSONObject object = new net.sf.json.JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "file");
					array.add(object);
				}
			}
			ajaxBack(array.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
