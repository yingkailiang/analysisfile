package com.sbox.action;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class DeviceManage extends CommonAction {
	private JSONArray divices;
	private String mac;

	public String getList() {
		User user = (User) getSession(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			SecretKey secretKey = user.getSecretKey();
			String devices = sc.getDevices(secretKey);
			JSONObject object = JSONObject.fromObject(devices);
			int code = object.getInt("code");
			if (code == 200) {
				divices = object.getJSONArray("devices");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "devices";
	}

	public void enabledDevice() {
		User user = (User) getSession(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			SecretKey secretKey = user.getSecretKey();
			String enableDevice = sc.enableDevice(mac, secretKey);
			ajaxBack(enableDevice);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void disabledDevice() {
		User user = (User) getSession(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			SecretKey secretKey = user.getSecretKey();
			String disabledDevice = sc.disabledDevice(mac, secretKey);
			ajaxBack(disabledDevice);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void setDivices(JSONArray divices) {
		this.divices = divices;
	}

	public JSONArray getDivices() {
		return divices;
	}

	public void setMac(String mac) {
		this.mac = mac;
	}

	public String getMac() {
		return mac;
	}

}
