package com.sbox.action;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.tools.MD5Util;
import com.sbox.tools.SessionName;
import com.sbox.tools.SignatureUtil;

public class ShareCheckPassword extends CommonAction{
	
	private String dirResourceId;

	private String userId;
	
	private String sign;
	
	private String date;
	
	private String password;
	
	private String shareType;
	
	private String fileId;
	
	private String fileName;
	
	private String dirName;
	


	public String getDirName() {
		return dirName;
	}


	public void setDirName(String dirName) {
		this.dirName = dirName;
	}


	public String getDirResourceId() {
		return dirResourceId;
	}


	public void setDirResourceId(String dirResourceId) {
		this.dirResourceId = dirResourceId;
	}


	public String getFileName() {
		return fileName;
	}


	public void setFileName(String fileName) {
		this.fileName = fileName;
	}


	private int hasError; //1为密码错误,0为没有错误
	

	public int getHasError() {
		return hasError;
	}


	public void setHasError(int hasError) {
		this.hasError = hasError;
	}


	public String share() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpServletResponse response = ServletActionContext.getResponse();
		JSONObject flagJsonObject = new JSONObject();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String resourceId = "";
		//校验时间
		Calendar calendar = Calendar.getInstance();
		calendar.setTimeInMillis(Long.valueOf(date));
		calendar.add(Calendar.DAY_OF_MONTH, 1);
		Date verifingDate = calendar.getTime();
		Date today = new Date();
		if(today.after(verifingDate))
		{
			logger.info("ShareCheckPassword verifingDate is expire");
			flagJsonObject.put("code", 501);
			flagJsonObject.put("errorMeaasge", "ShareCheckPassword verifingDate is expire");
		}
		//校验签名
		String md5 = "";
		if("2".equalsIgnoreCase(shareType))
		{
			md5 = genSign(userId, resourceId, date);
		}else if ("0".equalsIgnoreCase(shareType))
		{
			md5 = genSignForFile(userId, fileId, date);
			resourceId = fileId;
		}else
		{
			 shareType = "1";
			 resourceId = dirResourceId;
			 md5 = genSign(userId, userId, date);
		}
		
		if(!sign.equalsIgnoreCase(md5))
		{
			logger.info("ShareCheckPassword verifing sign wrong");
			flagJsonObject.put("code", 501);
			flagJsonObject.put("errorMeaasge", "ShareCheckPassword verifing sign wrong");
		}
		String checkPassword = "" ;
		try {
			checkPassword = sbox.checkOutLinkPassword(userId, resourceId, MD5Util.MD5(password.trim()), shareType);
		} catch (SBoxClientException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		JSONObject json = JSONObject.fromObject(checkPassword);
		int checkPasswordCode = json.getInt("code");
		if(checkPasswordCode == 200)
		{
			String shareLink = json.getString("shareLink");
			HttpSession session = request.getSession();
			String uri = request.getRequestURI();
			String url = request.getRequestURL().toString();
			String host = url.substring(0, url.indexOf(uri));
			String pathUrl = host+shareLink;
			String shareSessionId = resourceId+userId;
			if("0".equalsIgnoreCase(shareType))
			{	
			   session.setAttribute(SessionName.SHAREFILEID, resourceId+userId);
			}
			else if("1".equalsIgnoreCase(shareType))
			{
			   session.setAttribute(SessionName.SHARERESOURCEID, resourceId+userId);
			}
			try {
				response.sendRedirect(pathUrl);
				return null;
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			/*flagJsonObject.put("code", 200);
			flagJsonObject.put("errorMeaasge", "ShareCheckPassword verifing success");*/
		}else
		{
			hasError = 1;
			return "fail";
		}
		
	    return "404";
		
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
	
	private String genSignForFile(String userId, String fileLasestId, String date) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("userId", userId);
		map.put("Filelasestid", fileLasestId);
		map.put("date", date);
		String nvs = SignatureUtil.toPlaintext(map);
		String md5 = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
		return md5;
	}
	
	
	public String getFileId() {
		return fileId;
	}


	public void setFileId(String fileId) {
		this.fileId = fileId;
	}

	public String getUserId() {
		return userId;
	}


	public void setUserId(String userId) {
		this.userId = userId;
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


	public String getShareType() {
		return shareType;
	}


	public void setShareType(String shareType) {
		this.shareType = shareType;
	}
	

}
