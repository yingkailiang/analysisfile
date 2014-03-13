package com.sbox.action;

import java.io.IOException;
import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;


/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class FeedBackAjax extends CommonAction {
	private static final Logger logger = Logger.getLogger(FeedBackAjax.class);

	private String type;

	private String title;

	private String content;

	private String contact;

	private int code;

	public void createFeedBack() {

		SecretKey secretKey = null;

		try {

		HttpServletRequest request = ServletActionContext.getRequest();
		HttpSession session = request.getSession();
		User attribute = (User) session.getAttribute(SessionName.USER);
		try {
			if(attribute != null)
			secretKey = getSecretKey();
		}catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
			if(contact == null)
			{
				contact = "";
			}
			
			String feedBack = sbox.feedBack("1", "", content, contact,
					secretKey);

			ajaxBack(feedBack);
			return;

		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("SBoxClientException e", e);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("IOException e", e);
		}
		
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getContact() {
		return contact;
	}

	public void setContact(String contact) {
		this.contact = contact;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

}
