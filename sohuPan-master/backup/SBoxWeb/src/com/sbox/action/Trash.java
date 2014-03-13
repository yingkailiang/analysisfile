package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class Trash extends CommonAction {
	private static final Logger logger = Logger.getLogger(Trash.class);

	public void get() {
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
		try {
			String trash = sbox.getTrash(secretKey);
			JSONObject json = JSONObject.fromObject(trash);
			JSONArray result = new JSONArray();
			JSONArray dirArr = json.getJSONArray("dir");
			JSONArray fileArr = json.getJSONArray("file");
			if (dirArr != null) {
				result.addAll(dirArr);
			}
			if (fileArr != null) {
				result.addAll(fileArr);
			}
			ajaxBack(result.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void regain() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String dirIds = getParameter("dirIds");
		String[] dis = dirIds.split(",");
		String fileIds = getParameter("fileIds");
		String[] fis = fileIds.split(",");
		net.sf.json.JSONArray array = new JSONArray();
		try {
			for (String id : dis) {
				if (!StringUtils.isEmpty(id)) {
					String deleteDir = sbox.RestoreDir(id, secretKey);
					JSONObject fromObject = JSONObject.fromObject(deleteDir);
					JSONObject object = new JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "dir");
					array.add(object);
				}
			}
			for (String id : fis) {
				if (!StringUtils.isEmpty(id)) {
					String deleteObject = sbox.RestoreFile(id, secretKey);
					JSONObject fromObject = JSONObject.fromObject(deleteObject);
					JSONObject object = new JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "file");
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

	public void delete() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String dirIds = getParameter("dirIds");
		String[] dis = dirIds.split(",");
		String fileIds = getParameter("fileIds");
		String[] fis = fileIds.split(",");
		String password = getDeletePassword();
		net.sf.json.JSONArray array = new JSONArray();
		try {
			for (String id : dis) {
				if (!StringUtils.isEmpty(id)) {
					String deleteDir = sbox.deleteDirRecyle(password, id,
							secretKey);
					JSONObject fromObject = JSONObject.fromObject(deleteDir);
					JSONObject object = new JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "dir");
					array.add(object);
				}
			}
			for (String id : fis) {
				if (!StringUtils.isEmpty(id)) {
					String deleteObject = sbox.deleteObjectRecyle(password, id,
							secretKey);
					JSONObject fromObject = JSONObject.fromObject(deleteObject);
					JSONObject object = new JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "file");
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

	public void clear() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String password = getDeletePassword();
		try {
			String clearRecyle = sbox.clearRecyle(password, secretKey);
			JSONObject fromObject = JSONObject.fromObject(clearRecyle);
			if (fromObject.getInt("code") == 200) {
				ajaxBack(clearRecyle);
			} else {
				ajaxBack(clearRecyle);
			}

		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
