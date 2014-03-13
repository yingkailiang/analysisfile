package com.sbox.action;

import java.io.IOException;

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
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class OrganManage extends CommonAction {
	private static final Logger logger = Logger.getLogger(CopyResource.class);
	private String organId;
	private String id;
	private String parent;
	private String name;
	private String space;
	private String userId;
	private String userIds;
	private String phone;
	private String email;
	private String deleteWay;
	private String shiftEmail;

	/**
	 * 根据organId 获取下一级别的Organ。
	 * 
	 * @param String
	 *            organId
	 */
	public void getOrgans() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.getOrgans(StringUtils.isEmpty(id) ? "" : id,
					secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}

	/**
	 * 获取域内所有节点
	 */
	public void getAllOrgans() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.getAllOrgans(
					StringUtils.isEmpty(id) ? "" : id, secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}

	/**
	 * 设置为部门管理员
	 */
	public void setOrganAdmin() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String setOrganAdmin = sbox.setOrganAdmin(userId, secretKey);
			ajaxBack(setOrganAdmin);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 设置为部门管理员
	 */
	public void cancelOrganAdmin() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String setOrganAdmin = sbox.cancelOrganAdmin(userId, secretKey);
			ajaxBack(setOrganAdmin);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 更新User信息
	 */
	public void updateUser() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String updateUser = sbox.updateOrganUser(userId, name, parent,
					phone, space, secretKey);
			ajaxBack(updateUser);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 添加User信息
	 */
	public void addUser() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String updateUser = sbox.addOrganUser(email, name, parent, phone,
					space, secretKey);
			ajaxBack(updateUser);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 根据organId 获取下一级别的Organ。
	 * 
	 * @param String
	 *            organId
	 */
	public void updateOrgan() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			if (!StringUtils.isEmpty(organId) && !StringUtils.isEmpty(parent)
					&& !StringUtils.isEmpty(name)) {
				String organs = sbox.updateOrgan(organId, parent, name, 
						secretKey);
				ajaxBack(organs);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (Exception e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}

	/**
	 * 根据organId 获取下一级别的Organ。
	 * 
	 * @param String
	 *            organId
	 */
	public void deleteOrganUser() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.deleteOrganUser(userId, deleteWay,
					getShiftEmail(), secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (Exception e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}

	/**
	 * 根据organId 获取下一级别的Organ。
	 * 
	 * @param String
	 *            organId
	 */
	public void deleteOrgan() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.deleteOrgan(organId, secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}
	public void moveUsersToOrgan() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.moveUsersToOrgan(userIds, parent, secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}
	public void createOrgan() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.createOrgan(parent, name, secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}

	public void reSendEmail() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.reSendActiveEmail(id, secretKey);
			ajaxBack(organs);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
			try {
				JSONObject json = new JSONObject();
				json.put("code", 500);
				json.put("message", "api is error.");
				ajaxBack(json.toString());
			} catch (JSONException e1) {
				e1.printStackTrace();
			} catch (IOException es) {
				es.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
			logger.info(e.getMessage());
		}
	}

	public void setOrganId(String organId) {
		this.organId = organId;
	}

	public String getOrganId() {
		return organId;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setParent(String parent) {
		this.parent = parent;
	}

	public String getParent() {
		return parent;
	}

	public void setSpace(String space) {
		this.space = space;
	}

	public String getSpace() {
		return space;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUserId() {
		return userId;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getId() {
		return id;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getEmail() {
		return email;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPhone() {
		return phone;
	}

	public void setDeleteWay(String deleteWay) {
		this.deleteWay = deleteWay;
	}

	public String getDeleteWay() {
		return deleteWay;
	}

	public void setShiftEmail(String shiftEmail) {
		this.shiftEmail = shiftEmail;
	}

	public String getShiftEmail() {
		return shiftEmail;
	}

	public void setUserIds(String userIds) {
		this.userIds = userIds;
	}

	public String getUserIds() {
		return userIds;
	}

}
