package com.sbox.action;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import net.sf.json.JSONArray;
import net.sf.json.JSONNull;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.ACLConts;
import com.sbox.sdk.client.model.SBoxAcl;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class ShareDir extends CommonAction {

	public void share() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String acl = getParameter("acl");
		String dirId = getParameter("dirId");
		try {
			List<SBoxAcl> acls = new ArrayList<SBoxAcl>();
			JSONArray jacl = JSONArray.fromObject(acl);
			for (int i = 0, length = jacl.size(); i < length; i++) {
				JSONObject jsonObject = jacl.getJSONObject(i);
				SBoxAcl a = new SBoxAcl();
				a.setResource(dirId);
				a.setDomain(secretKey.getDomain());
				long userId = jsonObject.getLong("id");
				a.setType(jsonObject.getString("type"));
				a.setUserid(userId);
				a.setEffective(jsonObject.getInt("effective"));
				a.setIsOutDomain(jsonObject.getInt("isOutDomain"));
				if (jsonObject.has("email")) {
					a.setEmail(jsonObject.getString("email"));
				} else {
					a.setEmail("");
				}
				a.setAcl(jsonObject.getInt("aclCode") + "");
				if (jsonObject.has("times")) {
					Object times = jsonObject.get("times");
					if (times != null && !(times instanceof JSONNull)) {
						a.setTimes(jsonObject.getLong("times"));
					} else {
						a.setTimes(0l);
					}
				} else {
					a.setTimes(0l);
				}
				// if (1 == jsonObject.getInt("aclCode")) {
				// a.putAcl(ACLConts.GETOBJECT);
				// a.putAcl(ACLConts.GETOBJECTBYVERSION);
				// a.putAcl(ACLConts.GETOBJECTINFO);
				// a.putAcl(ACLConts.GETLOG);
				// } else if (2 == jsonObject.getInt("aclCode")) {
				// a.putAcl(ACLConts.GETOBJECT);
				// a.putAcl(ACLConts.GETOBJECTBYVERSION);
				// a.putAcl(ACLConts.GETOBJECTINFO);
				// a.putAcl(ACLConts.INITIALIZEDUPLOAD);
				// a.putAcl(ACLConts.GETLOG);
				// a.putAcl(ACLConts.PUTOBJECT);
				// a.putAcl(ACLConts.DELETEDIR);
				// a.putAcl(ACLConts.DELETEOBJECT);
				// a.putAcl(ACLConts.UPLOADCOMPLETE);
				// a.putAcl(ACLConts.CREATEDIR);
				// } else if (3 == jsonObject.getInt("aclCode")) {
				// a.setAcl("11111111111111111111111111111111111111");
				// a.setDomain(secretKey.getDomain());
				// }
				acls.add(a);
			}
			// sbox.deleteAcl(dirId, secretKey);
			String putAcl = sbox.putAcl(dirId, acls, secretKey);
			ajaxBack(putAcl);
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("Response IOException error", e);
			e.printStackTrace();
		}
	}

	public void quit() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String dirIds = getParameter("dirIds");
		String[] ids = dirIds.split(",");
		try {
			JSONArray array = new JSONArray();
			for (String id : ids) {
				if (!StringUtils.isEmpty(id)) {
					String quitAcl = sbox.quitAcl(id, secretKey);
					net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
							.fromObject(quitAcl);
					net.sf.json.JSONObject object = new net.sf.json.JSONObject();
					object.put("id", id);
					object.put("result", fromObject);
					object.put("type", "dir");
					array.add(object);
				}
			}
			ajaxBack(array.toString());
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
