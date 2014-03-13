package com.sbox.action;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.tools.SignatureUtil;

public class AnonymousUpload extends CommonAction{
	
	private String id;
	
	private String date;
	
	private String dirName;
	
	private String ownerName;
	
	private String userId;
	
	private String dirResourceId;
	
	private String sign;
	
	private String expireDate;


	public String getAnonymousUpload() {
		
		String idstr = genIntegerByString(getParameter("id"));
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		
		try {
			String outLinkExpire = sbox.checkOutLinkExpire("", "",idstr,"3");
			JSONObject json = JSONObject.fromObject(outLinkExpire);
			JSONObject jsonObject = json.getJSONObject("sboxDir");
			JSONObject outChain = json.getJSONObject("sboxOutchain");
			int code = json.getInt("code");
			if (code == 200) {
				
				 this.dirName = jsonObject.getString("name");
				 this.dirResourceId = jsonObject.getString("id");
				 this.userId = outChain.getString("createUserId");
				 this.expireDate = outChain.getString("expiredate");
				 this.ownerName = json.getString("ownerName");
				 Date today = new Date();
				 this.date = String.valueOf(today.getTime());
				 this.sign = genSign(userId, dirResourceId, date);
				
				return "success";
				
			}
			
			
		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return "invalid";

	}
	
	private String genSign(String userId, String fileLasestId, String date) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("userId", userId);
		map.put("Resourceid", fileLasestId);
		map.put("date", date);
		String nvs = SignatureUtil.toPlaintext(map);
		String md5 = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
		return md5;
	}
	
	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getDirResourceId() {
		return dirResourceId;
	}

	public void setDirResourceId(String dirResourceId) {
		this.dirResourceId = dirResourceId;
	}

	public String getSign() {
		return sign;
	}
	
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getDirName() {
		return dirName;
	}

	public void setDirName(String dirName) {
		this.dirName = dirName;
	}

	public String getOwnerName() {
		return ownerName;
	}

	public void setOwnerName(String ownerName) {
		this.ownerName = ownerName;
	}
	
	public void setSign(String sign) {
		this.sign = sign;
	}
	
	public String getExpireDate() {
		return expireDate;
	}

	public void setExpireDate(String expireDate) {
		this.expireDate = expireDate;
	}
	
	

}
