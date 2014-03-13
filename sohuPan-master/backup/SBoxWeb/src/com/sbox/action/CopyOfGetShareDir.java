package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
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
public class CopyOfGetShareDir extends CommonAction {
	private static final Logger logger = Logger.getLogger(CopyOfGetShareDir.class);

	public void getTree() {
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
		String resourceId = getParameter("id");
		try {
			if (StringUtils.isEmpty(resourceId)) {
				String objectLock = sbox.getShareService(secretKey);
				JSONObject fromObject = JSONObject.fromObject(objectLock);
				int code = fromObject.getInt("code");
				if (code == 200) {
					ajaxBack(fromObject.getJSONArray("SboxDirList").toString());
				} else {
					ajaxBack("[]");
				}
			} else {
				String allNodes = sbox.getAllNodes(resourceId, secretKey);
				net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
						.fromObject(allNodes);
				if (fromObject.getInt("code") == 200) {
					JSONArray jsonArray = fromObject
							.getJSONArray("sboxDirList");
					ajaxBack(jsonArray.toString());
				} else {
					ajaxBack("[]");
				}
			}
			// ajaxBack(objectLock);
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}

	public void getNodes() {
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
		String resourceId = getParameter("id");
		try {
			if (StringUtils.isEmpty(resourceId) || "root".equals(resourceId)) {
				String objectLock = sbox.getShareService(secretKey);
				JSONObject fromObject = JSONObject.fromObject(objectLock);
				int code = fromObject.getInt("code");
				if (code == 200) {
					ajaxBack(fromObject.getJSONArray("SboxDirList").toString());
				} else {
					ajaxBack("[]");
				}
			} else {
				String service = sbox.getService(resourceId, secretKey);
				net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
						.fromObject(service);
				net.sf.json.JSONArray jsonArray = fromObject
						.getJSONArray("sboxDirList");
				net.sf.json.JSONArray jsonFiles = fromObject
						.getJSONArray("sboxFileLatestList");
				JSONArray array = new JSONArray();
				array.addAll(jsonArray);
				array.addAll(jsonFiles);
				ajaxBack(array.toString());
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
