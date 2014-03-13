package com.sbox.action;

import java.io.IOException;
import java.util.Map;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;

/**
 * 
 * @author horson.ma
 * 
 */
public class AccountManage extends CommonAction {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String usedSize = "13.34M";
	private String allSize = "52.0G";
	private Long id = 0l;
	private String realName = "";
	private String errorMessage = "";
	private String email = "";
	private String nickName = "";
	private String oldPassword = "";
	private String newPassword = "";
	private String idePassword = "";
	private String companyname = "";
	private String category = "";
	private String contactperson = "";
	private String contactphone = "";
	private SBoxAccount account = null;
	private SBoxUser suser = null;
	private SBoxUserProfile userPro = null;
	private User User = null;
	private Integer manger = 0;
	private String isSuccess = "fail";
	private String province = "";
	private String city = "";
	private String individDomain = "";

	/*
	 * get personal information include email ,loginName date:2012-7-5
	 */
	public void individSetting() {
		try {
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			SecretKey secretKey = getSecretKey();
			String individSet = sc.individSet(individDomain, secretKey);
			JSONObject jon = JSONObject.fromObject(individSet);
			if (jon.getInt("code") == 200) {
				User user = (User) getSession(SessionName.USER);
				SBoxAccount account2 = user.getAccount();
				account2.setSelfDomain(individDomain);
				account2.setTimes(account2.getTimes() + 1);
			}
			ajaxBack(individSet);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
			try {
				ajaxBack("{\"code\":405,\"message\":\"api is occur.\"}");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}
	}

	public void domainSet() {
		try {
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			SecretKey secretKey = getSecretKey();
			String individSet = sc.domainSet(individDomain, secretKey);
			JSONObject fromObject = JSONObject.fromObject(individSet);
			if (fromObject.getInt("code") == 200) {
				User session = (User) getSession(SessionName.USER);
				session.getAccount().setIndividDomain(individDomain);
			}
			ajaxBack(individSet);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/*
	 * get personal information include email ,loginName date:2012-7-5
	 */
	public String getaccountinfo() {
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		try {
			if (secretKey != null) {
				String login;
				login = sc.login(secretKey);
				if (!StringUtils.isEmpty(login)) {
					JSONObject js = JSONObject.fromObject(login);
					loadUserInfo(js);
				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "account1";
	}

	// public String modifyPassword() {
	// nickName = getParameter("nickName");
	// ActionContext context = ActionContext.getContext();
	// Map<String, Object> session = context.getSession();
	// User = (User) session.get(SessionName.USER);
	// SBoxClient sc = SBoxClientInstance.getSboxClient();
	// try {
	// if (User != null) {
	// suser = User.getUser();
	// userPro = User.getUserPro();
	// account = User.getAccount();
	// userPro.setNickName(nickName);
	// String updateUser = sc.updateUser(userPro, User.getSecretKey());
	// JSONObject result = JSONObject.fromObject(updateUser);
	// int code = result.getInt("code");
	// if (code == 200) {
	// errorMessage = "信息修改成功";
	// isSuccess = "success";
	// return "account1";
	// } else if (code == 503) {
	// errorMessage = "昵称重复，请使用\"姓名<部门>\"重命名.如：张三<市场部>";
	// isSuccess = "failure";
	// return "account1";
	// }
	// } else {
	// errorMessage = "超时，请重新登录";
	// return "index";
	// }
	// } catch (SBoxClientException e) {
	// e.printStackTrace();
	// }
	// errorMessage = "信息修改成功";
	// isSuccess = "success";
	// return "account1";
	// }

	/*
	 * modify personal information :include password and loginName; date
	 * :2012-7-5
	 */
	public String modifyNickName() {
		nickName = getParameter("nickName");
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		try {
			if (User != null) {
				suser = User.getUser();
				userPro = User.getUserPro();
				account = User.getAccount();
				String rName = userPro.getNickName();
				userPro.setNickName(nickName);
				String updateUser = sc.updateUser(userPro, User.getSecretKey());
				userPro.setNickName(rName);
				JSONObject result = JSONObject.fromObject(updateUser);
				int code = result.getInt("code");
				if (code == 200) {
					userPro.setNickName(nickName);
					errorMessage = "信息修改成功";
					isSuccess = "success";
					return "account1";
				} else if (code == 302) {
					errorMessage = "用户名已存在，请使用\"姓名_部门\"，如：张三_市场部";
					isSuccess = "failure";
					return "account1";
				}
			} else {
				errorMessage = "超时，请重新登录";
				return "index";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		errorMessage = "信息修改成功";
		isSuccess = "success";
		return "account1";
	}

	public String modifyPassword() {
		oldPassword = getParameter("oldPassword");
		newPassword = getParameter("newPassword");
		idePassword = getParameter("idePassword");
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		if (User != null) {
			suser = User.getUser();
			userPro = User.getUserPro();
			account = User.getAccount();
			if (account == null) {
				manger = 1;
			}
			if (!StringUtils.isEmpty(newPassword)
					&& !StringUtils.isEmpty(newPassword)
					&& !StringUtils.isEmpty(idePassword)) {
				if (newPassword.equals(idePassword)) {
					SecretKey secretKey = User.getSecretKey();
					try {
						String resetPassword = sc.ResetPassword(oldPassword,
								newPassword, "", secretKey);
						JSONObject js = JSONObject.fromObject(resetPassword);
						String code = js.getString("code");
						if (!StringUtils.isEmpty(code) && code.equals("200")) {
							errorMessage = "重设密码成功";
						} else {
							errorMessage = js.getString("errorMessage");
							if (errorMessage
									.equals("SBoxResetPassword password is not match")) {
								errorMessage = "原始密码错误";
							} else {
								errorMessage = "原始密码错误";
							}
							return "account2";
						}
					} catch (SBoxClientException e) {
						e.printStackTrace();
						errorMessage = "服务器错误，联系管理员";
						return "account1";
					} catch (JSONException e) {
						e.printStackTrace();
						errorMessage = "服务器错误，联系管理员";
						return "account2";
					}

				} else {
					errorMessage = "新密码与确认密码不一致，请重新输入";
					return "account2";
				}
			}
		} else {
			errorMessage = "系统错误，请重新登录";
			return "index";
		}
		User.setUser(suser);
		User.setUserPro(userPro);
		putSession(SessionName.USER, User);
		errorMessage = "信息修改成功";
		isSuccess = "success";
		return "account2";
	}

	/*
	 * modify personal information :include password and loginName; date
	 * :2012-7-5
	 */
	public String modifyaccountNew() {
		nickName = getParameter("nickName");
		oldPassword = getParameter("oldPassword");
		newPassword = getParameter("newPassword");
		idePassword = getParameter("idePassword");
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		if (User != null) {
			suser = User.getUser();
			userPro = User.getUserPro();
			if (!StringUtils.isEmpty(nickName)) {
				if (StringUtils.isEmpty(newPassword)
						&& StringUtils.isEmpty(newPassword)
						&& StringUtils.isEmpty(idePassword)) {
					// 此处指修改用户名，密码可以没有
					SecretKey secretKey = User.getSecretKey();
					try {
						String resetPassword = sc.ResetPassword(null, null,
								nickName, secretKey);
						JSONObject js = JSONObject.fromObject(resetPassword);
						String code = js.getString("code");
						if (!StringUtils.isEmpty(code) && code.equals("200")) {
							errorMessage = "修改信息成功";// js.getString("errorMessage");
						} else {
							errorMessage = js.getString("errorMessage");
							return "account1";
						}
					} catch (SBoxClientException e) {
						e.printStackTrace();
						errorMessage = "服务器错误，联系管理员";
						return "account1";
					} catch (JSONException e) {
						e.printStackTrace();
						errorMessage = "服务器错误，联系管理员";
						return "account1";
					}

				} else {
					// 此处修改用户名和密码，用户名必须有
					if (!StringUtils.isEmpty(newPassword)
							&& !StringUtils.isEmpty(newPassword)
							&& !StringUtils.isEmpty(idePassword)) {

						if (newPassword.equals(idePassword)) {
							SecretKey secretKey = User.getSecretKey();
							try {
								String resetPassword = sc.ResetPassword(
										oldPassword, newPassword, nickName,
										secretKey);
								JSONObject js = JSONObject
										.fromObject(resetPassword);
								String code = js.getString("code");
								if (!StringUtils.isEmpty(code)
										&& code.equals("200")) {
									errorMessage = "信息修改成功";
									js.getString("errorMessage");
								} else {
									errorMessage = "信息修改失败";
									return "account1";
								}
							} catch (SBoxClientException e) {
								e.printStackTrace();
								errorMessage = "系统错误，请重新登录";
								return "account1";
							} catch (JSONException e) {
								e.printStackTrace();
								errorMessage = "系统错误，请重新登录";
								return "account1";
							}
						} else {
							errorMessage = "新密码与确认密码不一致";
							return "account1";
						}
					} else {
						if (StringUtils.isEmpty(oldPassword)) {
							errorMessage = "请输入旧密码";
						} else if (StringUtils.isEmpty(newPassword)) {
							errorMessage = "请输入新密码";
						} else {
							errorMessage = "请输入确认密码";
						}
						return "account1";
					}
				}
			} else {
				errorMessage = "用户名不能为空";
				return "account1";
			}
		} else {
			errorMessage = "系统错误，请重新登录";
			return "index";
		}
		userPro.setNickName(nickName);
		User.setUser(suser);
		User.setUserPro(userPro);
		if (account == null) {
			manger = 1;
		}
		putSession(SessionName.USER, User);
		errorMessage = "信息修改成功";
		return "account1";
	}

	/*
	 * get the company information include company name, contact person,contact
	 * phone number,the category of the company date:2012-7-5
	 */
	public String getcompanyinfo() {
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		if (User == null) {
			errorMessage = "系统错误，请重新登陆";
			return "index";
		} else {
			account = User.getAccount();
			suser = User.getUser();
			userPro = User.getUserPro();
		}
		return "company2";
	}

	/*
	 * modify the information of the company date:2012-7-5
	 */
	public String modifycompany() {
		companyname = getParameter("companyname");
		category = getParameter("category");
		contactperson = getParameter("contactperson");
		contactphone = getParameter("contactphone");
		province = getParameter("province");
		city = getParameter("city");
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		if (User != null) {
			userPro = User.getUserPro();
			String userProfileid = "";
			if (userPro != null) {
				userProfileid = String.valueOf(userPro.getId());
			} else {
				errorMessage = "userPro is wrong";
				return "company2";
			}

			SecretKey secretKey = User.getSecretKey();
			if (!StringUtils.isEmpty(companyname)
					&& !StringUtils.isEmpty(category)
					&& !StringUtils.isEmpty(contactperson)
					&& !StringUtils.isEmpty(contactphone)
					&& !StringUtils.isEmpty(province)
					&& !StringUtils.isEmpty(city)) {
				try {
					String messageProfile = sc.createOrUpdateUserProfile(
							userProfileid, companyname, category,
							contactperson, contactphone, province, city,
							secretKey);
					// System.out.println(messageProfile);
					JSONObject js = JSONObject.fromObject(messageProfile);
					String code = js.getString("code");
					if (!StringUtils.isEmpty(code) && code.equals("200")) {
						errorMessage = js.getString("message");
					} else {
						errorMessage = js.getString("message");
						return "company2";
					}
				} catch (SBoxClientException e) {
					e.printStackTrace();
					errorMessage = "系统错误，请重新提交";
					return "company2";
				} catch (JSONException e) {
					e.printStackTrace();
					errorMessage = "Login API is Error!";
					return "company2";
				}
			} else {
				if (StringUtils.isEmpty(companyname)) {
					errorMessage = "请输入公司名称";
				} else if (StringUtils.isEmpty(category)) {
					errorMessage = "请选择行业";
				} else if (StringUtils.isEmpty(contactperson)) {
					errorMessage = "请输入联系人";
				} else if (StringUtils.isEmpty(province)) {
					errorMessage = "请输入省份";
				} else if (StringUtils.isEmpty(city)) {
					errorMessage = "请输入城市";
				} else {
					errorMessage = "请输入联系方式";
				}
				return "company2";
			}
		} else {
			errorMessage = "提交失败,请重新登录";
			return "index";
		}
		userPro.setRealName(contactperson);
		userPro.setPhoneNum(contactphone);
		userPro.setCompany(companyname);
		userPro.setCategory(category);
		userPro.setProvince(province);
		userPro.setCity(city);
		User.setUserPro(userPro);
		putSession(SessionName.USER, User);
		errorMessage = "信息提交成功";
		isSuccess = "success";
		return "company2";
	}

	public String getUsedSize() {
		return usedSize;
	}

	public void setUsedSize(String usedSize) {
		this.usedSize = usedSize;
	}

	public String getAllSize() {
		return allSize;
	}

	public void setAllSize(String allSize) {
		this.allSize = allSize;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCompanyname() {
		return companyname;
	}

	public void setCompanyname(String companyname) {
		this.companyname = companyname;
	}

	public String getContactperson() {
		return contactperson;
	}

	public void setContactperson(String contactperson) {
		this.contactperson = contactperson;
	}

	public String getContactphone() {
		return contactphone;
	}

	public void setContactphone(String contactphone) {
		this.contactphone = contactphone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getNickName() {
		return nickName;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}

	public String getOldPassword() {
		return oldPassword;
	}

	public void setOldPassword(String oldPassword) {
		this.oldPassword = oldPassword;
	}

	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}

	public String getIdePassword() {
		return idePassword;
	}

	public void setIdePassword(String idePassword) {
		this.idePassword = idePassword;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getRealName() {
		return realName;
	}

	public void setRealName(String realName) {
		this.realName = realName;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public SBoxAccount getAccount() {
		return account;
	}

	public void setAccount(SBoxAccount account) {
		this.account = account;
	}

	public SBoxUser getSuser() {
		return suser;
	}

	public void setSuser(SBoxUser suser) {
		this.suser = suser;
	}

	public SBoxUserProfile getUserPro() {
		return userPro;
	}

	public void setUserPro(SBoxUserProfile userPro) {
		this.userPro = userPro;
	}

	public User getUser() {
		return User;
	}

	public void setUser(User user) {
		User = user;
	}

	public Integer getManger() {
		return manger;
	}

	public void setManger(Integer manger) {
		this.manger = manger;
	}

	public String getIsSuccess() {
		return isSuccess;
	}

	public void setIsSuccess(String isSuccess) {
		this.isSuccess = isSuccess;
	}

	public String getProvince() {
		return province;
	}

	public void setProvince(String province) {
		this.province = province;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public void setIndividDomain(String individDomain) {
		this.individDomain = individDomain;
	}

	public String getIndividDomain() {
		return individDomain;
	}

}
