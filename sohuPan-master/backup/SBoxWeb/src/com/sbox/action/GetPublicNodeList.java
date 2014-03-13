package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

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
public class GetPublicNodeList extends CommonAction {

	@SuppressWarnings("deprecation")
	public void getService() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		String id = getParameter("id");
		if (StringUtils.isEmpty(id)) {
			id = "public";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getPublicDir(id, secretKey);
			JSONObject fromObject = JSONObject
					.fromObject(service);
			int code = fromObject.getInt("code");
			if (code == 200) {
				JSONArray jsonArray = fromObject
						.getJSONArray("sboxDirList");
				JSONArray jsonFiles = fromObject
						.getJSONArray("sboxFileLatestList");
				JSONArray array = new JSONArray();
				array.addAll(jsonArray);
				array.addAll(jsonFiles);
				ajaxBack(array.toString());
			} else {
				ajaxBack(service);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public void getAllnode() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		String id = getParameter("id");
		if (StringUtils.isEmpty(id)) {
			id = "public";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getPublicDir(id, secretKey);
			JSONObject fromObject = JSONObject
					.fromObject(service);
			int code = fromObject.getInt("code");
			if (code == 200) {
				net.sf.json.JSONArray jsonArray = fromObject
						.getJSONArray("sboxDirList");
				JSONArray array = new JSONArray();
				array.addAll(jsonArray);
				ajaxBack(array.toString());
			} else {
				ajaxBack(service);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	
}
