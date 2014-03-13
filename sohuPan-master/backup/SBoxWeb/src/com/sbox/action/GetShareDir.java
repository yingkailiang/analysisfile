package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

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
public class GetShareDir extends CommonAction {
	private static final Logger logger = Logger.getLogger(GetShareDir.class);

	public void getTree() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("id");
		String uid = getParameter("uid");
		try {
			if (StringUtils.isEmpty(uid) && StringUtils.isEmpty(resourceId)) {
				String shareMember = sbox.shareMember(secretKey);
				JSONObject fromObject = JSONObject.fromObject(shareMember);
				JSONArray jsonArray = fromObject.getJSONArray("shareUserList");
				ajaxBack(jsonArray.toString());
			} else if (!StringUtils.isEmpty(uid)
					&& StringUtils.isEmpty(resourceId)) {
				String shareDirByMember = sbox.shareDirByMember(uid, secretKey);
				JSONObject fromObject = JSONObject.fromObject(shareDirByMember);
				JSONArray jsonArray = fromObject.getJSONArray("SboxDirList");
				ajaxBack(jsonArray.toString());
			} else {
				if (StringUtils.isEmpty(resourceId)) {
					String objectLock = sbox.getShareService(secretKey);
					JSONObject fromObject = JSONObject.fromObject(objectLock);
					int code = fromObject.getInt("code");
					if (code == 200) {
						ajaxBack(fromObject.getJSONArray("SboxDirList")
								.toString());
					} else {
						ajaxBack("[]");
					}
				} else {
					String allNodes = sbox.getAllNodes(resourceId, secretKey);
					net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
							.fromObject(allNodes);
					if (fromObject.getInt("code") == 200) {
						JSONArray jsonArray = fromObject
								.getJSONArray("sboxDirList");
						ajaxBack(jsonArray.toString());
					} else {
						ajaxBack("[]");
					}
				}
			}
			// ajaxBack(objectLock);
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}

	public void getNodes() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String resourceId = getParameter("id");
		String uid = getParameter("uid");
		String acl = getParameter("acl");
		try {
			if (StringUtils.isEmpty(uid) && "root".equals(resourceId)) {
				String shareMember = sbox.shareMember(secretKey);
				JSONObject fromObject = JSONObject.fromObject(shareMember);
				JSONArray jsonArray = fromObject.getJSONArray("shareUserList");
				ajaxBack(jsonArray.toString());
				return;
			}
			if (!StringUtils.isEmpty(uid) && "root".equals(resourceId)) {
				String shareDirByMember = sbox.shareDirByMember(uid, secretKey);
				JSONObject fromObject = JSONObject.fromObject(shareDirByMember);
				JSONArray jsonArray = fromObject.getJSONArray("SboxDirList");
				ajaxBack(jsonArray.toString());
				return;
			}
			if (StringUtils.isEmpty(resourceId) || "root".equals(resourceId)) {
				String objectLock = sbox.getShareService(secretKey);
				JSONObject fromObject = JSONObject.fromObject(objectLock);
				int code = fromObject.getInt("code");
				if (code == 200) {
					ajaxBack(fromObject.getJSONArray("SboxDirList").toString());
				} else {
					ajaxBack("[]");
				}
			} else {

				String service = sbox.getService(resourceId, secretKey);
				JSONObject fromObject = JSONObject.fromObject(service);
				JSONArray jsonArray = fromObject.getJSONArray("sboxDirList");
				JSONArray jsonFiles = fromObject
						.getJSONArray("sboxFileLatestList");
				JSONArray array = new JSONArray();
//				if ("5".equals(acl)) {
//					array.addAll(jsonArray);
//					User user = (User) getSession(SessionName.USER);
//					Long id = user.getUser().getId();
//					for (int i = 0, length = jsonFiles.size(); i < length; i++) {
//						JSONObject file = jsonFiles.getJSONObject(i);
//						long createId = file.getLong("creatorId");
//						if (id.equals(createId)) {
//							array.add(file);
//						}
//					}
//				} else {
					array.addAll(jsonArray);
					array.addAll(jsonFiles);
//				}
				ajaxBack(array.toString());
			}
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}
}
