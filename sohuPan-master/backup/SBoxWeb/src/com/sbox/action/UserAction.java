package com.sbox.action;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.EmailSendException;
import com.sbox.tools.ExeclTools;
import com.sbox.tools.MD5Util;
import com.sbox.tools.PBECode;
import com.sbox.tools.Page;
import com.sbox.tools.PageInfo;
import com.sbox.tools.SecurityTools;
import com.sbox.tools.SessionName;
import com.sbox.tools.ToolsUtil;
import com.sun.jndi.toolkit.url.UrlUtil;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class UserAction extends CommonAction {
	private JSONArray jsonArray = null;
	private Boolean canAddUser = true;
	private String pageNum = null;
	private String addWay = "";
	private String importMessage = "";
	private String newAdminId;
	private String deletePassword = "";// delete密码第一次输入
	private String rdeletePassword = "";// 确认密码
	private String sdeletePassword = "";// 原始密码
	PageInfo pageInfo = new PageInfo();
	private File Filedata = null;
	private Page page;
	private String loginPassword;
	private String email;
	private String path;
	private String organId;
	private Integer start = 0;
	private Integer length = 10;
	private String type = "0";
	private JSONObject rootDepartmentInfo;
	private String title = "部门管理";

	public Boolean getCanAddUser() {
		return canAddUser;
	}

	public String dpUpdate() {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		try {
			if (secretKey != null) {
				String login;
				login = sc.login(secretKey);
				if (!StringUtils.isEmpty(login)) {
					JSONObject js = JSONObject.fromObject(login);
					// int code = js.getInt("code");
					// if (code == 200) {
					loadUserInfo(js);
					// }
				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "dpUpdate";
	}

	public void setCanAddUser(Boolean canAddUser) {
		this.canAddUser = canAddUser;
	}

	public JSONArray getJsonArray() {
		return jsonArray;
	}

	public void setJsonArray(JSONArray jsonArray) {
		this.jsonArray = jsonArray;
	}

	public void switchAdmin() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String switchAdmin = sbox.switchAdmin(getNewAdminId(), secretKey);
			ajaxBack(switchAdmin);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void getUsersByOrgan() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String users = sbox.getUsersByOrgan(organId, start, length,
					secretKey);
			ajaxBack(users);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void getUsersByOrganLimit() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String users = sbox.getUsersByOrganLimit(organId, start, length,
					secretKey);
			ajaxBack(users);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public String toShareLogin() {
		User user = (User) getSession(SessionName.USER);
		// PAN-1263:begin
		// try {
		// path = UrlUtil.decode(path, "UTF-8");
		// } catch (Exception e) {
		// e.printStackTrace();
		// }
		// PAN-1263:end
		if (user == null) {
			return "login";
		} else {
			if (email.equals(user.getUser().getLoginName())) {
				return "index";
			} else {
				putSession(SessionName.USER, null);
				return "login";
			}
		}
	}

	public void isExists() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			User session = (User) getSession(SessionName.USER);
			if (!session.getUser().getLoginName().equals(email)) {
				String isExist = sbox.isExists(email);
				ajaxBack(isExist);
			} else {
				JSONObject json = new JSONObject();
				json.put("code", 303);
				json.put("message", "this email is yourself.");
				ajaxBack(json.toString());
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void setDeletePassword() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			if (ToolsUtil.checkPassword(rdeletePassword)
					&& rdeletePassword.equals(deletePassword)) {
				String result = sbox.setDeletePassword(secretKey,
						loginPassword, deletePassword);
				JSONObject fromObject = JSONObject.fromObject(result);
				if (fromObject.getInt("code") == 200) {
					User session = (User) getSession(SessionName.USER);
					session.getUser().setOpenDp((byte) 1);
				}
				ajaxBack(result);
			} else {
				JSONObject result = new JSONObject();
				result.put("code", 303);
				result.put("message", "password is Illegal. ");
				ajaxBack(result.toString());
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void cancelDeletePassword() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String result = sbox
					.cancelDeletePassword(deletePassword, secretKey);
			JSONObject fromObject = JSONObject.fromObject(result);
			if (fromObject.getInt("code") == 200) {
				User session = (User) getSession(SessionName.USER);
				session.getUser().setOpenDp((byte) 0);
			}
			ajaxBack(result);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void confirmDeletePassword() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String result = sbox.confirmDeletePassword(deletePassword,
					secretKey);
			JSONObject fromObject = JSONObject.fromObject(result);
			if (fromObject.getInt("code") == 200) {
				String deleteKey = SecurityTools.createSecretKeyId("", MD5Util
						.MD5(deletePassword));
				putSession(SecurityTools.DELETE_KEY, deleteKey);
			}
			ajaxBack(result);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void forgetDeletePassword() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String result = sbox.forgetDeletePassword(secretKey);
			ajaxBack(result);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void updateDeletePassword() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			if (!ToolsUtil.checkPassword(deletePassword)) {
				JSONObject result = new JSONObject();
				result.put("code", 303);
				result.put("message", "new password is Illegal. ");
				ajaxBack(result.toString());
				return;
			}
			if (!deletePassword.equals(rdeletePassword)) {
				JSONObject result = new JSONObject();
				result.put("code", 304);
				result.put("message", "new password is inconsistent. ");
				ajaxBack(result.toString());
				return;
			}
			String result = sbox.updateDeletePassword(secretKey,
					sdeletePassword, deletePassword);
			ajaxBack(result);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public String toPage() {
		SecretKey secretKey = getSecretKey();
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User user = (User) session.get(SessionName.USER);
		Map<String, Object> map = new HashMap<String, Object>();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		setPage(getUserPage());
		try {
			Integer start = 1;
			if (StringUtils.isNumeric(pageNum)) {
				start = Integer.valueOf(pageNum);
				map.put("start", (start - 1) * page.getMaxShow());
				map.put("perPageLines", page.getMaxShow());
			} else {
				pageNum = "1";
				map.put("start", 0);
				map.put("perPageLines", page.getMaxShow());
			}
			String userList = sbox.getUserList(map, secretKey);
			JSONObject rels = JSONObject.fromObject(userList);
			JSONArray js = rels.getJSONArray("result");
			Integer totalNum = rels.getInt("totalNum");
			page.setAllMessage(totalNum);
			if (js.size() <= 0 && totalNum != 0) {
				page.setNowPage(start);
				map.put("start", page.getFirst());
				map.put("perPageLines", page.getMaxShow());
				userList = sbox.getUserList(map, secretKey);
				rels = JSONObject.fromObject(userList);
				js = rels.getJSONArray("result");
			}
			page.setNowPage(start);
			boolean has = rels.has("code");
			if (has) {
				int code = rels.getInt("code");
				if (code == 200) {
					jsonArray = js;
					SBoxAccount account = user.getAccount();
					if (account != null) {
						Long buyNumber = account.getBuyNumber();
						if (buyNumber != null) {
							// if (buyNumber <= jsonArray.size()) {
							if (buyNumber <= totalNum) {
								canAddUser = false;
							}
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "userList";
	}

	private Page getUserPage() {
		Page session = (Page) getSession("User_Session");
		if (session == null) {
			session = new Page();
		}
		return session;
	}

	public void getSpace() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String userUsedSpace = sbox.userUsedSpace(secretKey);
			JSONObject result = JSONObject.fromObject(userUsedSpace);
			User user = (User) getSession(SessionName.USER);
			SBoxUserProfile userPro = user.getUserPro();
			userPro.setSettingSize(result.getLong("userTotalSpace"));
			result.put("allSpace", userPro.getSettingSize());
			ajaxBack(result.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public void delete() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String deleteWay = getParameter("deleteWay");
		try {
			String deleteUser = sbox.deleteUser(Long.parseLong(id), deleteWay,
					secretKey);
			JSONObject user = JSONObject.fromObject(deleteUser);
			if (user.getInt("code") == 200) {
				long rsize = user.getLong("recycSize");
				User suser = (User) getSession(SessionName.USER);
				SBoxUserProfile userPro = suser.getUserPro();
				userPro.setSettingSize(userPro.getSettingSize() + rsize);
			}
			ajaxBack(deleteUser);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 使用userIds 删除用户
	 */
	@SuppressWarnings("deprecation")
	public void deleteUsers() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String deleteWay = getParameter("deleteWay");
		try {
			String deleteUser = sbox.deleteUser(Long.parseLong(id), deleteWay,
					secretKey);
			JSONObject user = JSONObject.fromObject(deleteUser);
			if (user.getInt("code") == 200) {
				long rsize = user.getLong("recycSize");
				User suser = (User) getSession(SessionName.USER);
				SBoxUserProfile userPro = suser.getUserPro();
				userPro.setSettingSize(userPro.getSettingSize() + rsize);
			}
			ajaxBack(deleteUser);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public void add() {
		SecretKey secretKey = getSecretKey();
		String loginName = getParameter("loginName");
		String email = getParameter("email");
		if (!StringUtils.isEmpty(email)) {
			loginName = email;
		}
		String nickName = getParameter("nickName");
		String settingSize = getParameter("settingSize");
		Double setSize = Double.parseDouble(settingSize) * 1024 * 1024 * 1024;
		String password = getParameter("password");
		String phone = getParameter("phone");
		try {
			if (!StringUtils.isEmpty(password) && password.length() <= 50) {
				long size = setSize.longValue();
				String addUser = addUser(secretKey, loginName, nickName,
						password, size, phone);
				ajaxBack(addUser);
			} else {
				ajaxBack("{\"code\":202,\"message\":\"password is Illegal.\"}");
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private String addUser(SecretKey secretKey, String loginName,
			String nickName, String password, long size, String phone)
			throws SBoxClientException {
		SBox sbox = SBoxClientInstance.getSboxClient();
		String addUser = sbox.addUser(loginName, size + "", nickName, password,
				getOrganId(), phone, secretKey);
		JSONObject fromObject = JSONObject.fromObject(addUser);

		if (fromObject.getInt("code") == 200) {
			// String domain = fromObject.getString("domain");
			// String accessKeyId = fromObject.getString("id");
			// String key = fromObject.getString("SecretKey");
			// SecretKey secret = new SecretKey(domain, accessKeyId, key);
			User user = (User) getSession(SessionName.USER);
			SBoxUserProfile userPro = user.getUserPro();
			userPro.setSettingSize(userPro.getSettingSize()
					- fromObject.getLong("allocSize"));
			// long userId = fromObject.getLong("userId");
			// uploadManual(userId, secret);
		}
		return addUser;
	}

	@SuppressWarnings("unused")
	public String organs() {
		User user = (User) getSession(SessionName.USER);
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String organs = sbox.getRootOrganProfile(secretKey, type);
			JSONObject organ = JSONObject.fromObject(organs);
			if (organ.getInt("code") == 200) {
				JSONObject result = organ.getJSONObject("result");
				// 修改空间显示为负数的bug PAN-1230：start
				long usedSpace = result.getLong("allSpace")
						- result.getLong("space");
				result.put("usedSpace", usedSpace >= 0 ? usedSpace : 0);
				// 修改空间显示为负数的bug PAN-1230：end

				// 修改用户数显示，添加溢出时，避免可添加用户数位负，直接置为购买用户数
				long usedUsers = result.getLong("usedUsers");
				long allUsers = result.getLong("allUsers");
				if (usedUsers > allUsers) {
					result.put("usedUsers", allUsers);
				}
				setRootDepartmentInfo(result);
			}
		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		/* PAN-1287 type=1表示为企业通讯录，type=0为用户管理 */
		/* Begin */
		if (type.equals("0")) {
			return "userList";
		} else {
			return "addressInfo";
		}
		/* End */
	}

	// @SuppressWarnings("unused")
	// public String rootOrgans() {
	// User user = (User) getSession(SessionName.USER);
	// SecretKey secretKey = getSecretKey();
	// SBoxClient sbox = SBoxClientInstance.getSboxClient();
	// try {
	// String organs = sbox.getRootOrganProfile(secretKey);
	// JSONObject organ = JSONObject.fromObject(organs);
	// if (organ.getInt("code") == 200) {
	// JSONObject result = organ.getJSONObject("result");
	// result.put("usedSpace", result.getLong("allSpace")
	// - result.getLong("space"));
	// setRootDepartmentInfo(result);
	// }
	// } catch (SBoxClientException e) {
	// // TODO Auto-generated catch block
	// e.printStackTrace();
	// }
	// return "addressInfo";
	// }

	private void uploadManual(Long userId, SecretKey secretKey) {
		String dirId = userId + "";
		String filename = "shqywpsysc.pdf";
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		File input = ToolsUtil.getManualFile();
		long length = input.length();
		try {
			long initStart = System.currentTimeMillis();
			String initializedUpload = sbox.initializedUpload(filename, dirId,
					length, "", "", ToolsUtil.Date2.format(new Date()),
					ToolsUtil.Date2.format(new Date()), "", null, secretKey);
			long initEnd = System.currentTimeMillis();
			logger.info("init : " + (initEnd - initStart) + "ms");
			JSONObject fromObject = JSONObject.fromObject(initializedUpload);
			int code = fromObject.getInt("code");
			if (code == 200) {
				JSONObject jsonObject = fromObject
						.getJSONObject("sboxFileVersion");
				String filePos = jsonObject.getString("filePos");
				if (StringUtils.isEmpty(filePos)) {
					filePos = "0";
				}
				String fileLasestId = fromObject.getString("fileLasestId");
				String splitId = fromObject.getString("splitId");
				// FileInputStream fis = new FileInputStream(getFiledata());
				long putStart = System.currentTimeMillis();
				String putObject = "";
				try {

					putObject = sbox.putObject3(filename, length + "", dirId,
							splitId, null, filePos, secretKey, "", input);
				} catch (Exception e) {
					e.printStackTrace();
					logger.error("upload fail", e);
				}
				long putEnd = System.currentTimeMillis();
				logger.info("result:" + putObject);
				logger.info("put : " + (putEnd - putStart) + "ms");
				JSONObject putjson = JSONObject.fromObject(putObject);
				int putCode = putjson.getInt("code");
				if (putCode == 200) {
					long completeStart = System.currentTimeMillis();
					String uploadComplete = sbox.uploadComplete(dirId,
							fileLasestId, splitId, "", secretKey);
					long completeEnd = System.currentTimeMillis();
					logger.info("complete : " + (completeEnd - completeStart)
							+ "ms");
					// ajaxBack(uploadComplete);
				} else {
					// ajaxBack(putObject);
				}
			} else {
				// ajaxBack(initializedUpload);
			}
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} /*
		 * catch (IOException e) { e.printStackTrace(); }
		 */
	}

	public void updateSize() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String settingSize = getParameter("settingSize");
		try {
			long size = (long) (Double.parseDouble(settingSize) * 1024 * 1024 * 1024l);
			String copyDir = sbox.updateUserSize(Long.parseLong(id), size,
					secretKey);
			JSONObject fromObject = JSONObject.fromObject(copyDir);
			if (fromObject.getInt("code") == 200) {
				User user = (User) getSession(SessionName.USER);
				SBoxUserProfile userPro = user.getUserPro();
				userPro.setSettingSize(fromObject.getLong("remainSize"));
			}
			ajaxBack(copyDir);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public void updateGuideStatus() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String id = getParameter("id");
		String guideStatus = getParameter("guideStatus");

		try {
			Integer guide;
			if ("1".equals(guideStatus) || "0".equals(guideStatus)) {
				guide = Integer.parseInt(guideStatus);
			} else {
				JSONObject result = new JSONObject();
				result.put("code", 302);
				result.put("message", "params is illega.");
				ajaxBack(result.toString());
				return;
			}
			User user = (User) getSession(SessionName.USER);
			SBoxUserProfile userPro = user.getUserPro();
			userPro.setGuide(guide);
			String uResult = sbox.updateUser(userPro, secretKey);
			JSONObject object = JSONObject.fromObject(uResult);
			int code = object.getInt("code");
			if (code == 200) {
				userPro.setGuide(guide);
			}
			ajaxBack(uResult);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void freeSpace() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String userUsedSpace = sbox.userAllocSpace(secretKey);
			JSONObject result = JSONObject.fromObject(userUsedSpace);
			User user = (User) getSession(SessionName.USER);
			result.put("freeSpace", user.getUserPro().getSettingSize()
					- result.getLong("usedAllocSpace"));
			ajaxBack(result.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	protected static StringBuffer collectHtmlContent(String loginName,
			String password) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String url = request.getRequestURL().toString();
		String[] urls = url.split("/");
		if (StringUtils.isEmpty(urls[2])) {
			urls = url.split("\\");
		}
		String[] http = urls[0].split(":");
		StringBuffer emailContent = new StringBuffer();
		try {
			emailContent = emailModelUp(emailContent);
			emailContent.append("<strong style='font-size:14px;'>您好，"
					+ loginName + "：</strong>  ");
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'>您的密码已重置，系统随机生成新密码："
							+ password
							+ "，请登录<a style='color:#2C71BE; font-size:14px;' href='"
							+ http[0]
							+ "://"
							+ urls[2]
							+ "'>搜狐企业网盘</a>后修改密码。</p>");
			emailContent.append("<br/>");
			emailContent
					.append("<p style='font-size:12px; margin:10px 0; color:#919191;'>(此为系统邮件，请勿回复。 如有任何疑问请<a href='mailto:pan@sohu.net' style='color:#2C71BE;'>联系我们</a>。)</p>");
			emailContent = emailModelDown(emailContent);
		} catch (Exception e) {
		}
		return emailContent;
	}

	public String getPageNum() {
		return pageNum;
	}

	public void setPageNum(String pageNum) {
		this.pageNum = pageNum;
	}

	public PageInfo getPageInfo() {
		return pageInfo;
	}

	public void setPageInfo(PageInfo pageInfo) {
		this.pageInfo = pageInfo;
	}

	public void setPage(Page page) {
		this.page = page;
	}

	public Page getPage() {
		return page;
	}

	@SuppressWarnings("unchecked")
	public String addUsers() throws IOException {
		JSONObject result = new JSONObject();
		try {
			if (checkOverRequestSize(1024 * 1024 + 1024)) {
				result.put("code", 308);
				result.put("message", "file size over 1M");
				putSession("importMessage", result.toString());
				return "importReturn";
			}
			SecretKey key = getSecretKey();
			List<List> readCells = getExeclData(Filedata);
			int sCount = readCells.size();
			/*
			 * for (int length = Math.min(sCount, 100) - 1; length >= 0;
			 * length--) { List l = readCells.get(length); Object o1 = l.get(0);
			 * Object o2 = l.get(1); Object o3 = l.get(2); Object o4 = l.get(3);
			 * if (o1 == null && o2 == null && o3 == null && o4 == null) {
			 * readCells.remove(length); } else { break; } }
			 */
			sCount = readCells.size();
			JSONArray ja = new JSONArray();
			int s = 0;
			int f = 0;
			// if (sCount <= 50) {
			for (int i = 0, length = Math.min(sCount, 100); i < length; i++) {
				List l = readCells.get(i);
				Object o1 = l.get(0);
				Object o2 = l.get(1);
				Object o3 = l.get(2);
				Object o4 = l.get(3);
				String nickName = "";
				if (o1 instanceof String) {
					nickName = (String) o1;
				} else if (o1 instanceof Double) {
					nickName = ((Double) o1).longValue() + "";
				}
				String email = "";
				if (o2 instanceof String) {
					email = (String) o2;
				}
				String password = "";
				if (o3 instanceof String) {
					password = (String) o3;
				} else if (o3 instanceof Double) {
					password = ((Double) o3).longValue() + "";
				}
				long size = -1l;
				if (o4 instanceof Double) {
					double gs = ((Double) o4) * 1024 * 1024 * 1024;
					size = Double.valueOf(gs).longValue();
				} else if (o4 instanceof Long) {
					double gs = ((Long) o4) * 1024 * 1024 * 1024;
					size = Double.valueOf(gs).longValue();
				} else if (o4 instanceof Integer) {
					double gs = ((Integer) o4) * 1024 * 1024 * 1024;
					size = Double.valueOf(gs).longValue();
				} else if (o4 instanceof String) {
					String o42 = ((String) o4).trim();
					if (isNum(o42)) {
						double gs = Double.parseDouble(o42) * 1024 * 1024 * 1024;
						size = Double.valueOf(gs).longValue();
					}
				}
				if (!ToolsUtil.checkNickName(nickName)) {
					f++;
					JSONObject json = new JSONObject();
					json.put("nickName", nickName);
					json.put("email", email);
					json.put("code", 306);
					json.put("message", "nickName format is error");
					ja.add(json);
				} else if (!ToolsUtil.checkEmail(email)) {
					f++;
					JSONObject json = new JSONObject();
					json.put("nickName", nickName);
					json.put("email", email);
					json.put("code", 305);
					json.put("message", "email format is error");
					ja.add(json);

				} else if (!ToolsUtil.checkPassword(password)) {
					f++;
					JSONObject json = new JSONObject();
					json.put("nickName", nickName);
					json.put("email", email);
					json.put("code", 307);
					json.put("message", "Password format is error");
					ja.add(json);
				} else if (size <= 0) {
					f++;
					JSONObject json = new JSONObject();
					json.put("nickName", nickName);
					json.put("email", email);
					json.put("code", 309);
					json.put("message", "Size is error!");
					ja.add(json);
				} else {
					String addUser = addUser(key, email, nickName, password,
							size, "");
					JSONObject json = JSONObject.fromObject(addUser);
					int code = json.getInt("code");
					if (code == 200) {
						s++;
					} else {
						f++;
					}
					json.put("nickName", nickName);
					json.put("email", email);
					ja.add(json);
					if (code == 304) {
						break;
					}
				}
			}
			result.put("code", 200);
			result.put("successNumber", s);
			// if (sCount >= 100) {
			// result.put("failNumber", f + (sCount - 100));
			// } else {
			result.put("failNumber", f);
			// }
			result.put("allCount", sCount);
			result.put("result", ja);
			// } else {
			// result.put("code", 203);
			// result.put("successNumber", s);
			// result.put("failNumber", f);
			// result.put("allCount", sCount);
			// result.put("result", ja);
			// }

		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (Exception e) {
			importMessage = "{\"code\":505,\"message\":\"Execl format is error.\"}";
			putSession("importMessage", result.toString());
			return "importReturn";
		}
		putSession("importMessage", result.toString());
		return "importReturn";
	}

	private boolean isNum(String o42) {
		Pattern EmailRegex = Pattern.compile("^(\\.|[0-9])+$");
		Matcher matcher = EmailRegex.matcher(o42);
		return matcher.matches();
	}

	@SuppressWarnings("unchecked")
	private List<List> getExeclData(File filedata) {
		Object execl = ExeclTools.importExcel(filedata);
		if (execl == null) {
			execl = ExeclTools.importExcelHSSFWorkbook(filedata);
		}
		int rowIndex = 0;
		List<List> readCells = null;
		if (execl instanceof XSSFWorkbook) {
			XSSFWorkbook ex = (XSSFWorkbook) execl;
			rowIndex = ExeclTools.getRowIndex(0, ex);
			// modifyByHd:检查表头形式
			int flag = ExeclTools.checkSheetHeader(0, rowIndex + 1, ex);
			if (flag == 0)// 预留逻辑待区分处理显示不同错误
				readCells = ExeclTools.readCell(0, 1, rowIndex, ex);
		} else if (execl instanceof HSSFWorkbook) {
			HSSFWorkbook ex = (HSSFWorkbook) execl;
			rowIndex = ExeclTools.getRowIndexHSSFWorkbook(0, ex);
			readCells = ExeclTools.readCellHSSFWorkbook(0, 1, rowIndex, ex);
		}
		if (readCells == null) {
			readCells = ExeclTools.importCSV(filedata);
		}
		return readCells;
	}

	private boolean checkOverRequestSize(int size) {
		HttpServletRequest request = ServletActionContext.getRequest();
		if (request.getContentLength() >= size) {
			return true;
		}
		return false;
	}

	public void setFiledata(File filedata) {
		Filedata = filedata;
	}

	public File getFiledata() {
		return Filedata;
	}

	public void setAddWay(String addWay) {
		this.addWay = addWay;
	}

	public String getAddWay() {
		return addWay;
	}

	public void setImportMessage(String importMessage) {
		this.importMessage = importMessage;
	}

	public String getImportMessage() {
		return importMessage;
	}

	public void setDeletePassword(String deletePassword) {
		this.deletePassword = deletePassword;
	}

	public String getDeletePassword() {
		return deletePassword;
	}

	public void setLoginPassword(String loginPassword) {
		this.loginPassword = loginPassword;
	}

	public String getLoginPassword() {
		return loginPassword;
	}

	public void setRdeletePassword(String rdeletePassword) {
		this.rdeletePassword = rdeletePassword;
	}

	public String getRdeletePassword() {
		return rdeletePassword;
	}

	public void setSdeletePassword(String sdeletePassword) {
		this.sdeletePassword = sdeletePassword;
	}

	public String getSdeletePassword() {
		return sdeletePassword;
	}

	public void setNewAdminId(String newAdminId) {
		this.newAdminId = newAdminId;
	}

	public String getNewAdminId() {
		return newAdminId;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getEmail() {
		return email;
	}

	public void setOrganId(String organId) {
		this.organId = organId;
	}

	public String getOrganId() {
		return organId;
	}

	public void setStart(Integer start) {
		this.start = start;
	}

	public Integer getStart() {
		return start;
	}

	public void setLength(Integer length) {
		this.length = length;
	}

	public Integer getLength() {
		return length;
	}

	public void setRootDepartmentInfo(JSONObject rootDepartmentInfo) {
		this.rootDepartmentInfo = rootDepartmentInfo;
	}

	public JSONObject getRootDepartmentInfo() {
		return rootDepartmentInfo;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getPath() {
		return path;
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

}
