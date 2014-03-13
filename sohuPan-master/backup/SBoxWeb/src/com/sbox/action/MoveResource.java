package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
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
public class MoveResource extends CommonAction {

	@SuppressWarnings("deprecation")
	public void move() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String targetId = getParameter("targetId");
		String dirId = getParameter("dirIds");
		String fileIds = getParameter("fileIds");
		String[] dids = dirId.split(",");
		String[] fids = fileIds.split(",");
		net.sf.json.JSONArray array = new JSONArray();
		try {
			for (String id : dids) {
				if (!StringUtils.isEmpty(id)) {
					String deleteDir = sbox.moveDir(id, targetId, secretKey);
					JSONObject fromObject = JSONObject
							.fromObject(deleteDir);
					JSONObject object = new JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "dir");
					int code = fromObject.getInt("code");
					if(code == 200)
					{
					   object.put("name", fromObject.getString("name"));
					}
					array.add(object);
				}
			}
			for (String id : fids) {
				if (!StringUtils.isEmpty(id)) {
					String moveObject = sbox.moveObject( id, targetId,
							secretKey);
					net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
							.fromObject(moveObject);
					net.sf.json.JSONObject object = new net.sf.json.JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "file");
					int code = fromObject.getInt("code");
					if(code == 200)
					{
					   object.put("name", fromObject.getString("name"));
					}
					array.add(object);
				}
			}
			ajaxBack(array.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
