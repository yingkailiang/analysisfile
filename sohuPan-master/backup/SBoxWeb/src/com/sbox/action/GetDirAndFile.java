package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;

/**
 * 
 * @author yangwei
 *
 */
public class GetDirAndFile extends CommonAction {
	
	private String userId;
	
	private String id;
	
	private String sign;
	
	private String date;

	public void setDate(String date) {
		this.date = date;
	}

	@SuppressWarnings("deprecation")
	public void getService() {
		
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		JSONObject flagJsonObject = new JSONObject();
		if(StringUtils.isBlank(id)||StringUtils.isEmpty(id))
		{
			flagJsonObject.put("code", 500);
			flagJsonObject.put("errorMessage", "dirResourceId is null");
			try {
				ajaxBack(flagJsonObject.toString());
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		try {
			String service = sbox.noLoginGetService(userId, id, sign, date);
		    JSONObject fromObject = JSONObject
					.fromObject(service);
			int code = fromObject.getInt("code");
			if (code == 200) {
				net.sf.json.JSONArray jsonArray = fromObject
						.getJSONArray("sboxDirList");
				net.sf.json.JSONArray jsonFiles = fromObject
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
	
	
	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getSign() {
		return sign;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getDate() {
		return date;
	}

}
