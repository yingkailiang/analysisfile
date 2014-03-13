package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxDir;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.JSONTools;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class GetNodeList extends CommonAction {

	@SuppressWarnings("deprecation")
	public void getService() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		String id = getParameter("id");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getService(id, secretKey);
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
	public static JSONArray hasSonDid(JSONArray jsonArray, SBoxClient sbox,
			SecretKey secretKey) throws SBoxClientException {
		JSONArray jsonArrayNew = new JSONArray();
		if (jsonArray != null) {
			for (int i = 0; i < jsonArray.size(); i++) {
				JSONObject json = (JSONObject) jsonArray.get(i);
				SBoxDir item = (SBoxDir) JSONTools.toModel(SBoxDir.class, json);
				String service = sbox.getService(item.getId(), secretKey);
				JSONObject fromObject = JSONObject.fromObject(service);
				int code = fromObject.getInt("code");
				if (code == 200) {
					net.sf.json.JSONArray jsonArrayOld = fromObject
							.getJSONArray("sboxDirList");
					if (jsonArrayOld != null && jsonArrayOld.size() > 0) {
						item.setHasSon(1);
					} else {
						item.setHasSon(0);
					}
				} else {
					item.setHasSon(0);
				}
				jsonArrayNew.add(JSONObject.fromObject(item));
			}
		}
		return jsonArrayNew;
	}
}
