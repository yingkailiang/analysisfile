package com.sbox.tools;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;

public class DomainDividSetTools {
	private static final Logger logger = Logger
			.getLogger(AuthorityInterceptor.class);

	public static JSONObject loadIndividSetting(String url) {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		url = url.replaceAll("https://|http://", "");
		url = url.substring(0, url.indexOf("/"));
		url = url.split(":")[0];
		String individSetting = "";
		JSONObject individSet = null;
		try {
			if (!url.equals("pan.sohu.net")) {
				if (url.contains("pan.sohu.net")) {
					String domain = url.replaceAll(".pan.sohu.net", "");
					individSetting = sbox.loadIndividSetting(domain);
				} else {
					individSetting = sbox.loadIndividSetting(url);
				}
				individSet = JSONObject.fromObject(individSetting);
			} else {
				individSet = new JSONObject();
				individSet.put("code", 201);
				individSet.put("result", "no individ set.");
			}
		} catch (Exception e) {
			logger.debug("get Individ Setting is error.");
		}
		return individSet;
	}
}
