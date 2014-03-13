package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class ShareManager extends CommonAction {
	private static final Logger logger = Logger.getLogger(ShareManager.class);

	public void getVisitors() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String allGroup = sbox.getAllGroup(secretKey);
			String service = sbox.getUserListByDomain(secretKey.getDomain(),
					secretKey);
			JSONObject users = JSONObject.fromObject(service);
			JSONArray userList = users.getJSONArray("sboxUserList");
			for (Object jo : userList) {
				JSONObject jsu = (JSONObject) jo;
				jsu.put("type", "p");
			}
			JSONArray groups = JSONArray.fromObject(allGroup);
			for (Object jo : groups) {
				JSONObject js = (JSONObject) jo;
				js.put("type", "g");
			}
			groups.addAll(userList);
			// sboxUserList
			ajaxBack(groups.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void getAccessors() {
		SecretKey secretKey = getSecretKey();
		String resourceId = getParameter("resourceId");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getShareUserList(resourceId, secretKey);
			ajaxBack(service);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
