package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class UpdateResource extends CommonAction {

	public void update() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		SBox sbox = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String type = getParameter("type");
		String note = getParameter("note");
		String dirSize = getParameter("dirSize");
		try {
			if ("dir".equals(type)) {
				if (StringUtils.isEmpty(dirSize)) {
					if (note != null && note.length() <= 140) {
						String updateDirInfo = sbox.updateDirInfo(id, "", note,
								-2l, secretKey);
						ajaxBack(updateDirInfo);
					} else if (StringUtils.isEmpty(note) || note.length() > 140) {
						JSONObject jssu = new JSONObject();
						jssu.put("code", 601);
						jssu.put("message", "note is too long");
						ajaxBack(jssu.toString());
					}
				} else {
					if(dirSize.contains(".")){
						dirSize = dirSize.substring(0, dirSize.lastIndexOf("."));
					}
					if (StringUtils.isEmpty(note)) {
						String updateDirInfo = sbox.updateDirInfo(id, "", "",
								Long.parseLong(dirSize) * 1024 * 1024,
								secretKey);
						ajaxBack(updateDirInfo);
					} else if (note != null && note.length() <= 140) {
						String updateDirInfo = sbox.updateDirInfo(id, "", "",
								Long.parseLong(dirSize) * 1024 * 1024,
								secretKey);
						ajaxBack(updateDirInfo);
					} else {
						JSONObject jssu = new JSONObject();
						jssu.put("code", 601);
						jssu.put("message", "note is too long");
						ajaxBack(jssu.toString());
					}
				}
			} else if ("file".equals(type)) {
				if (note != null && note.length() <= 140) {
					String updateFile = sbox.updateFileLastest(id, note,
							secretKey);
					ajaxBack(updateFile);
				} else {
					JSONObject jssu = new JSONObject();
					jssu.put("code", 601);
					jssu.put("message", "note is too long");
					ajaxBack(jssu.toString());
				}
			} else {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 404);
				jssu.put("message", "Resource Type Is not specified");
				ajaxBack(jssu.toString());
			}
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		} catch (JSONException e) {
			logger.error("JSONException error", e);
			e.printStackTrace();
		}
	}
}
