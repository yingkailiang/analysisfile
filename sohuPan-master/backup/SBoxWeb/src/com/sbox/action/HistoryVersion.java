package com.sbox.action;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxFileVersion;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;
import com.sbox.tools.ToolsUtil;

/**
 * @author :horson.ma
 * @version :2012-7-10 下午3:13:47 类说明 主要用于每个文件的历史版本的管理
 */
public class HistoryVersion extends CommonAction {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private SBoxUser suser = null;
	private SecretKey secretKey = null;
	private User User = null;
	private String errorMessage = null;
	private String resourceId = null;
	private String versionNum = null;
	private String parentDir = null;
	private String fileName = null;
	@SuppressWarnings({ "unchecked", "rawtypes" })
	List<SBoxFileVersion> historyVersion = new ArrayList();

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public String getHistory() {

		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		if (User != null) {
			secretKey = User.getSecretKey();
			resourceId = getParameter("resourceId");
			try {
				String checkVersion = sc
						.checkVersionList(resourceId, secretKey);
				JSONObject js = JSONObject.fromObject(checkVersion);
				String code = "";
				try {
					code = js.getString("code");
				} catch (Exception e) {
					errorMessage = "Login API is Error!";
				}
				if (StringUtils.isEmpty(code)) {
					JSONArray array = js.getJSONArray("fileVersions");

					List<String> operatorIds = new ArrayList();
					List<String> fileIds = new ArrayList();
					if (array.size() > 0) {
						for (int i = 0; i < array.size(); i++) {
							SBoxFileVersion sboxFileVersion = new SBoxFileVersion();
							JSONObject everyJson = array
									.getJSONObject(i);
							sboxFileVersion.setId(everyJson.getString("id"));
							sboxFileVersion.setSize(everyJson.getLong("size"));
							long size = everyJson.getLong("size");
							sboxFileVersion.setStrSize(ToolsUtil
									.toSizeStr(size));
							sboxFileVersion.setVersionNumber(everyJson
									.getString("versionNumber"));
							sboxFileVersion.setParentDir((String) everyJson
									.get("parentDir"));
							String dateStr = everyJson.getString("modifyTime");
							sboxFileVersion.setModifyDate(dateStr);
							sboxFileVersion.setUniqueFileSign(everyJson
									.getString("uniqueFileSign"));
							sboxFileVersion.setOperator(everyJson
									.getLong("operator"));
							sboxFileVersion.setTable(everyJson.getString("nicKName"));
							String name = everyJson.getString("name");
							if(StringUtils.isEmpty(name)){
								name = "这不是个bug.txt";
							}
							sboxFileVersion.setFileName(name);
							sboxFileVersion.setSplitId(everyJson.getString("splitId"));
							operatorIds.add(i, String.valueOf(everyJson
									.getLong("operator")));
							fileIds.add(i, sboxFileVersion.getUniqueFileSign());
							if(i==0){
								sboxFileVersion.setIsNewVesion(1);
							}else{
								sboxFileVersion.setIsNewVesion(0);
							}
							sboxFileVersion.setFileType(name.substring(name
									.lastIndexOf(".") + 1).toLowerCase());
							
							String thumbnailsKey = everyJson.getString("thumbnailsKey");
							sboxFileVersion.setThumbnailsKey(thumbnailsKey);
							historyVersion.add(i, sboxFileVersion);
							sboxFileVersion = null;
						}
						versionNum =historyVersion.get(0).getVersionNumber();
						fileName = historyVersion.get(0).getFileName();
						parentDir = historyVersion.get(0).getParentDir();
					}
				} else if (!StringUtils.isEmpty(code) && code.equals("404")) {
					errorMessage = js.getString("message");
					return "history";
				}
			} catch (SBoxClientException e) {
				e.printStackTrace();
				errorMessage = "API is wrong";
				return "history";
			} catch (Exception e) {
				e.printStackTrace();
			}
		} else {
			errorMessage = "请登录";
			return "index";
		}
		return "history";
	}

	public static List getUserInfo(List items, SBoxClient sc, List userIds,
			SecretKey secretKey) {
		try {
			String userInfo = sc.batchUserInfo(userIds, secretKey.getDomain(),
					secretKey);
			JSONObject js = JSONObject.fromObject(userInfo);
			JSONArray array = js.getJSONArray("sboxUserList");
			for (int i = 0; i < items.size(); i++) {
				SBoxFileVersion item = (SBoxFileVersion) items.get(i);
				for (int j = 0; j < array.size(); j++) {
					JSONObject everyJson = array.getJSONObject(j);
					if (everyJson.getLong("id") == item.getOperator()) {
						item.setTable(everyJson.getString("loginName"));
					}
				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return items;
	}

	public static List getFileInfo(List items, SBoxClient sc, List fileIds,
			SecretKey secretKey) {
		try {
			String userInfo = sc.batchFileInfo(fileIds, secretKey);
			JSONObject js = JSONObject.fromObject(userInfo);
			JSONArray array = js.getJSONArray("sboxFileLatestList");
			for (int i = 0; i < items.size(); i++) {
				SBoxFileVersion item = (SBoxFileVersion) items.get(i);
				for (int j = 0; j < array.size(); j++) {
					JSONObject everyJson = array.getJSONObject(j);
					if (item.getUniqueFileSign().equals(
							everyJson.getString("id"))) {
						item.setFileName(everyJson.getString("name"));
						String fileName = item.getFileName();
						item.setFileType(fileName.substring(fileName
								.lastIndexOf(".") + 1));
						if (item.getVersionNumber().equals(
								everyJson.getString("versionNumber"))) {
							item.setIsNewVesion(1);
							if (i > 0) {
								SBoxFileVersion temp = (SBoxFileVersion) items
										.get(0);
								items.remove(0);
								items.add(0, item);
								items.remove(i);
								items.add(i, temp);
								temp = null;
							}
						} else {
							item.setIsNewVesion(0);
						}
					}

				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return items;

	}

	public SBoxUser getSuser() {
		return suser;
	}

	public void setSuser(SBoxUser suser) {
		this.suser = suser;
	}

	public SecretKey getSecretKey() {
		return secretKey;
	}

	public void setSecretKey(SecretKey secretKey) {
		this.secretKey = secretKey;
	}

	public User getUser() {
		return User;
	}

	public void setUser(User user) {
		User = user;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public void setHistoryVersion(List<SBoxFileVersion> historyVersion) {
		this.historyVersion = historyVersion;
	}

	public List<SBoxFileVersion> getHistoryVersion() {
		return historyVersion;
	}

	public String getResourceId() {
		return resourceId;
	}

	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}

	public String getVersionNum() {
		return versionNum;
	}

	public void setVersionNum(String versionNum) {
		this.versionNum = versionNum;
	}

	public String getParentDir() {
		return parentDir;
	}

	public void setParentDir(String parentDir) {
		this.parentDir = parentDir;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

}
