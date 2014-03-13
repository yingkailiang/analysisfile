package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.Page;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class MessageAction extends CommonAction {

	private JSONArray jsonData;
	private Page page;
	private int type;
	private int sCount = -1;

	@SuppressWarnings("deprecation")
	public void count() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getMessageCount(secretKey);
			ajaxBack(service);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public String getMsg() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			setPage(new Page());
			if (getSCount() == 0) {
				type = 1;
			}
			String service = sbox.getMessages(10, type, secretKey);
			JSONObject fromObject = JSONObject.fromObject(service);
			setJsonData(fromObject.getJSONArray("result"));
			int messageCount = fromObject.getInt("allCount");
			page.setAllMessage(messageCount);
			putSession("Message_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "msgl";
	}

	@SuppressWarnings("deprecation")
	public String getMsgForPage() {
		SecretKey secretKey = getSecretKey();
		String pn = getParameter("pageNumber");
		// String start = getParameter("start");
		// String length = getParameter("length");
		int p = 0;
		if (StringUtils.isNumeric(pn)) {
			p = Integer.parseInt(pn);
		}
		setPage((Page) getSession("Message_Session"));
		page.setNowPage(p);
		// int s = 0;
		// int l = 10;
		// if (StringUtils.isNumeric(start)) {
		// s = Integer.parseInt(start);
		// }
		// if (StringUtils.isNumeric(length)) {
		// l = Integer.parseInt(length);
		// }
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String service = sbox.getMessageForPage(page.getFirst(), page
					.getMaxShow(), type, secretKey);
			JSONObject fromObject = JSONObject.fromObject(service);
			if (fromObject.getInt("code") == 200) {
				setJsonData(fromObject.getJSONArray("result"));
				int messageCount = fromObject.getInt("allCount");
				page.setAllMessage(messageCount);
				page.setNowPage(p);
				putSession("Message_Session", page);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "msgl";
	}

	public void setJsonData(JSONArray jsonData) {
		this.jsonData = jsonData;
	}

	public JSONArray getJsonData() {
		return jsonData;
	}

	public void setPage(Page page) {
		this.page = page;
	}

	public Page getPage() {
		return page;
	}

	public void setType(int type) {
		this.type = type;
	}

	public int getType() {
		return type;
	}

	public void setSCount(int sCount) {
		this.sCount = sCount;
	}

	public int getSCount() {
		return sCount;
	}

}
