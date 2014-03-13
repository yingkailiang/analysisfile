package com.sbox.action;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.tools.SignatureUtil;
import com.sbox.tools.ToolsUtil;

public class AnonymousWholeUpload extends CommonAction{
	
	private String Filename;
	
	private String length;
	
	private String resourceId;
	
	private String sign;
	
	private String date;
	
	private String password;

	private File Filedata = null;

	

	public void sendFile() {
		
		
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		
		try {
			String anonymousPutObject = sbox.anonymousPutObject(Filename,length,resourceId,"-1",ToolsUtil.Date2.format(new Date()),ToolsUtil.Date2.format(new Date()),date,sign,password,getFiledata());
			JSONObject json = JSONObject.fromObject(anonymousPutObject);
			//int code = json.getInt("code");
				
			try {
				ajaxBack(anonymousPutObject);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
				
	
			
			
		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

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
	
	public String getFilename() {
		return Filename;
	}

	public void setFilename(String filename) {
		Filename = filename;
	}

	public String getLength() {
		return length;
	}

	public void setLength(String length) {
		this.length = length;
	}

	public String getResourceId() {
		return resourceId;
	}

	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}

	public File getFiledata() {
		return Filedata;
	}

	public void setFiledata(File filedata) {
		Filedata = filedata;
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

	public void setDate(String date) {
		this.date = date;
	}
	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}


}
