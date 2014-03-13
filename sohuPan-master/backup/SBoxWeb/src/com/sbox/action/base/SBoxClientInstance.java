package com.sbox.action.base;

import org.apache.commons.lang3.StringUtils;

import com.sbox.config.ConfigManager;
import com.sbox.config.GeneralConfig;
import com.sbox.sdk.client.SBoxClient;

public class SBoxClientInstance {
	private static final ConfigManager INSTANCE = ConfigManager.getInstance();
	private static SBoxClient sboxClient = null;


	public static SBoxClient getSboxClient() {
		sboxClient = new SBoxClient();
		GeneralConfig conf = (GeneralConfig) INSTANCE.get(GeneralConfig.class);
		String url = conf.get("sboxUrl");
		String s3Port = conf.get("sboxPort");
		if (StringUtils.isEmpty(s3Port)) {
			sboxClient.setEndpoint(url);
		} else {
			sboxClient.setEndpoint(url + ":" + s3Port);
		}
		return sboxClient;
	}

	public static void setSboxClient(SBoxClient sboxClient) {
		SBoxClientInstance.sboxClient = sboxClient;
	}
}
