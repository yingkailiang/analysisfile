/**
 * Copyright Sohu Inc. 2012
 */
package com.sbox.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.configuration.XMLConfiguration;

import com.sbox.tools.CDNTools;

/**
 * @author Jack
 * 
 */
@ConfigFilePath("config.xml")
public class GeneralConfig implements IConfig {

	private Map<String, String> fields = new HashMap<String, String>();

	public void parse(XMLConfiguration xmlconf) throws ConfigException {
		fields.put("domain", xmlconf.getString("domain"));
		fields.put("withindomain", xmlconf.getString("withindomain"));
		fields.put("applationId", xmlconf.getString("applationId"));
		fields.put("secretKey", xmlconf.getString("secretKey"));
		fields.put("sboxUrl", xmlconf.getString("sboxUrl"));
		fields.put("sboxPort", xmlconf.getString("sboxPort"));
		fields.put("cdnpath", xmlconf.getString("cdnpath"));
		CDNTools.CDN_URL = xmlconf.getString("cdnpath");
		fields.put("port", xmlconf.getString("port"));
		port = Integer.parseInt(fields.get("port"));
		fields.put("xmlns", xmlconf.getString("xmlns"));
		String auth = xmlconf.getString("authorization");
		fields.put("authorization", auth);
		fields.put("jspath", xmlconf.getString("jspath"));
		fields.put("view", xmlconf.getString("view"));
		authorization = "1".equals(auth) || "true".endsWith(auth.toLowerCase()) ? true
				: false;
	}

	public String get(String name) {
		return fields.get(name);
	}

	public void put(String name, String value) {
		if (fields.containsKey(name))
			fields.put(name, value);
		else
			throw new ConfigException(String.format(
					"%s is not an available config field name", name));
	}

	/**
	 * The domain we are hosting for.
	 * 
	 * @return
	 */
	public String getDomain() {
		return fields.get("domain");
	}

	public String getWithindomain() {
		return fields.get("withindomain");
	}

	private int port = 0;

	public int getPort() {
		return port;
	}

	public String getXmlNamespace() {
		return fields.get("xmlns");
	}

	private Boolean authorization = true;

	public Boolean getAuthorization() {
		return authorization;

	}

	public String getApplationId() {
		return fields.get("applationId");
	}

	public String getSecretKey() {
		return fields.get("secretKey");
	}
}
