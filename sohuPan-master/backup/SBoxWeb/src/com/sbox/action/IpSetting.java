package com.sbox.action;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class IpSetting extends CommonAction {
	private static final Logger logger = Logger.getLogger(IpSetting.class);

	private String userIds;
	private String ips;
	private int isSet;

	public void getIpSetUsers() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String ipSetUsers = sbox.getIpSetUsers(secretKey);
			ajaxBack(ipSetUsers);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public String isSet() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String ipSetUsers = sbox.getIpSetUsers(secretKey);
			JSONObject fromObject = JSONObject.fromObject(ipSetUsers);
			if (fromObject.getInt("code") == 200) {
				JSONArray jsonArray = fromObject.getJSONArray("ips");
				if (jsonArray != null && jsonArray.size() == 0) {
					this.isSet = 1;
				} else if (jsonArray != null && jsonArray.size() > 0) {
					this.isSet = 0;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "IpSetPage";
	}

	public void setIpSet() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String ipss = ips.trim();
			String[] split = ipss.split(";");
			Set<String> sips = new HashSet<String>();
			for (String ip : split) {
				String i = ip.trim();
				if (!StringUtils.isEmpty(i)) {
					sips.add(i);
				}
			}
			ips = Arrays.toString(sips.toArray());
			String ipSetUsers = sbox.setIpSets(userIds, ips.substring(1, ips
					.length() - 1), secretKey);
			ajaxBack(ipSetUsers);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void getSetIps() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String ipSetUsers = sbox.setIpSets(userIds, ips, secretKey);
			ajaxBack(ipSetUsers);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void cancel() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String ipSetUsers = sbox.cancelIpSets(secretKey);
			ajaxBack(ipSetUsers);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void setUserIds(String userIds) {
		this.userIds = userIds;
	}

	public String getUserIds() {
		return userIds;
	}

	public void setIps(String ips) {
		this.ips = ips;
	}

	public String getIps() {
		return ips;
	}

	public void setIsSet(int isSet) {
		this.isSet = isSet;
	}

	public int getIsSet() {
		return isSet;
	}

}
