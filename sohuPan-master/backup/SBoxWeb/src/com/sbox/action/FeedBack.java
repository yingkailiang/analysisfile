package com.sbox.action;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.Platform;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.config.ConfigManager;
import com.sbox.config.GeneralConfig;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxObject;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.ToolsUtil;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class FeedBack extends CommonAction {
	private static final Logger logger = Logger.getLogger(FeedBack.class);

	private String type;

	private String title;

	private String content;

	private String contact;

	private int code;

	public String createFeedBack() {

		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String feedBack = sbox.feedBack(type, title, content, contact,
					secretKey);
			JSONObject feedBackjson = JSONObject.fromObject(feedBack);
			// int feedBackCode = feedBackjson.getInt("code");

			if (StringUtils.isNotEmpty(feedBack)) {

				try {
					code = feedBackjson.getInt("code");
				} catch (Exception e) {
					e.printStackTrace();
					return "404";
				}
				return "success";

			}

		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("SBoxClientException e", e);
		}

		return "404";

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
