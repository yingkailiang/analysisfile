package com.sbox.action;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class RenameResource extends CommonAction {

	@SuppressWarnings("deprecation")
	public void rename() throws UnsupportedEncodingException {
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
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String rename = getParameter("rename");// "../";
		String type = getParameter("type");
		try {

			if ("dir".equals(type)) {
				if (!StringUtils.isEmpty(rename)
						&& (rename.startsWith(".") || rename.endsWith("."))) {
					JSONObject jssu = new JSONObject();
					jssu.put("code", 601);
					jssu.put("message", "name is  illegal");
					ajaxBack(jssu.toString());
					return;
				}
				String copyDir = sbox.renameDir(id, rename, secretKey);
				ajaxBack(copyDir);
			} else if ("file".equals(type)) {
				if (!StringUtils.isEmpty(rename) && (rename.endsWith("."))) {
					JSONObject jssu = new JSONObject();
					jssu.put("code", 601);
					jssu.put("message", "name is  illegal");
					ajaxBack(jssu.toString());
					return;
				}
				String renameObject = sbox.renameObject("acb", id, rename, id,
						secretKey);
				ajaxBack(renameObject);
			} else {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 404);
				jssu.put("message", "Resource Type Is not specified");
				ajaxBack(jssu.toString());
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
}
