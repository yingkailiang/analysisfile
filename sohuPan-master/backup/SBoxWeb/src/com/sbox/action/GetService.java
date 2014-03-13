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
public class GetService extends CommonAction {

	@SuppressWarnings("deprecation")
	public void getService() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("id");
		if (StringUtils.isEmpty(resourceId)) {
			resourceId = "root";
		}
		try {
			long start = System.currentTimeMillis();
			String allNodes = sbox.getAllNodes(resourceId, secretKey);
			long end = System.currentTimeMillis();
			logger.info("GetService dirs used :" + (end - start) + "ms");
			JSONObject fromObject = JSONObject.fromObject(allNodes);
			if (fromObject.getInt("code") == 200) {
				JSONArray jsonArray = fromObject.getJSONArray("sboxDirList");
				jsonArray = GetNodeList.hasSonDid(jsonArray, sbox, secretKey);
				ajaxBack(jsonArray.toString());
			} else {
				ajaxBack(allNodes);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static String toUnicode(String s) {
		String s1 = "";
		for (int i = 0; i < s.length(); i++) {
			s1 += "\\u" + Integer.toHexString(s.charAt(i) & 0xffff);
		}
		return s1;
	}

}
