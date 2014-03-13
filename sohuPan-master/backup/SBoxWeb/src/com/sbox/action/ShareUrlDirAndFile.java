package com.sbox.action;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.tools.SessionName;
import com.sbox.tools.SignatureUtil;

/**
 * 
 * @author yangwei
 *
 */
public class ShareUrlDirAndFile extends CommonAction {
	
	private String id;
	
	private String userId;
	
	private String dirResourceId;
	
	private String sign;
	
	private String date;
	
	private String hasPassword;
	
	private String dirName;
	
	private long size;
	
	private String downCount;
	
	private String sharePrivilege;
	
	private String language;
	
	private String shareType;
	
	public String getShareType() {
		return shareType;
	}


	public void setShareType(String shareType) {
		this.shareType = shareType;
	}


	@SuppressWarnings("deprecation")
	public String view() {
		HttpServletRequest request = ServletActionContext.getRequest();
		if(StringUtils.isBlank(id)||StringUtils.isEmpty(id))
		{
			return "invalid";
		}
		
		String shareId ="";
		shareId = genIntegerByString(id);
		
		if(StringUtils.isBlank(shareId)||StringUtils.isEmpty(shareId))
		{
			return "invalid";
		}
		
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
	    
		try {
			String expire = sbox.checkOutLinkExpire("", "",shareId,"1");
			JSONObject json = JSONObject.fromObject(expire);
			JSONObject jsonObject = json.getJSONObject("sboxDir");
			JSONObject outChain = json.getJSONObject("sboxOutchain");
			int code = json.getInt("code");
			if (code == 200) {
				
				 this.shareType = "1";
				 this.dirName = jsonObject.getString("name");
				 this.dirResourceId = jsonObject.getString("id");
				 this.userId = outChain.getString("createUserId");
				 Date today = new Date();
				 this.date = String.valueOf(today.getTime());
				 this.sign = genSign(userId, userId, date);
				if (!StringUtils.isBlank(outChain.getString("downCount"))
						&& !StringUtils
								.isEmpty(outChain.getString("downCount"))) {
					this.downCount = outChain.getString("downCount");
				} else {
					this.downCount = "0";
				}
				this.hasPassword = outChain.getString("hasPassword");
				if("1".equalsIgnoreCase(this.hasPassword))
				{
					HttpSession session = request.getSession();
					String shareResourceIdAndUserId = this.dirResourceId+this.userId; 
					String shareResourceId = (String)session.getAttribute(SessionName.SHARERESOURCEID);
					if(!shareResourceIdAndUserId.equalsIgnoreCase(shareResourceId))
					{
						Date toDay = new Date();
						this.date = String.valueOf(toDay.getTime()); 
						this.sign = genSign(userId, userId, date);
						//返回核查密码页面
						return "checkPassword";
					}
					
				}
				this.sharePrivilege = outChain.getString("sharePrivilege");
				this.language = outChain.getString("language");
				
				return "success";
				
			}
			
		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return "invalid";
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

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getDate() {
		return date;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getHasPassword() {
		return hasPassword;
	}

	public void setHasPassword(String hasPassword) {
		this.hasPassword = hasPassword;
	}

	public String getDirName() {
		return dirName;
	}

	public void setDirName(String dirName) {
		this.dirName = dirName;
	}

	public long getSize() {
		return size;
	}

	public void setSize(long size) {
		this.size = size;
	}

	public String getDownCount() {
		return downCount;
	}

	public void setDownCount(String downCount) {
		this.downCount = downCount;
	}

	public void setDate(String date) {
		this.date = date;
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
	
	public String getSharePrivilege() {
		return sharePrivilege;
	}


	public void setSharePrivilege(String sharePrivilege) {
		this.sharePrivilege = sharePrivilege;
	}
	
	public String getLanguage() {
		return language;
	}


	public void setLanguage(String language) {
		this.language = language;
	}

}
