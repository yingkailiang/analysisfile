/**
 * 
 */
package com.sbox.tools;

import java.io.Serializable;

/**
 * @description 此类作为批量导入用户时的用户模型
 * @author danhan
 * 
 */
public class UserInfoModel implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String email;
	private String nickName;
	private String depPath;
	private String phone;
	private long settledSpaceSize;
	
	/**
	 * @description 此用户添加错误原因
	 */
	private String errReason;
	/**
	 * @return the email
	 */
	public String getEmail() {
		return email;
	}
	/**
	 * @param email the email to set
	 */
	public void setEmail(String email) {
		this.email = email;
	}
	/**
	 * @return the nickName
	 */
	public String getNickName() {
		return nickName;
	}
	/**
	 * @param nickName the nickName to set
	 */
	public void setNickName(String nickName) {
		this.nickName = nickName;
	}

	/**
	 * @return the department
	 */
	public String getDepPath() {
		return depPath;
	}
	/**
	 * @param department the department to set
	 */
	public void setDepPath(String department) {
		this.depPath = department;
	}
	/**
	 * @return the phone
	 */
	public String getPhone() {
		return phone;
	}
	/**
	 * @param phone the phone to set
	 */
	public void setPhone(String phone) {
		this.phone = phone;
	}
	/**
	 * @return the errReason
	 */
	public String getErrReason() {
		return errReason;
	}
	/**
	 * @param errReason the errReason to set
	 */
	public void setErrReason(String errReason) {
		this.errReason = errReason;
	}
	/**
	 * @return the settledSpaceSize
	 */
	public long getSettledSpaceSize() {
		return settledSpaceSize;
	}
	/**
	 * @param settledSpaceSize the settledSpaceSize to set
	 */
	public void setSettledSpaceSize(long settledSpaceSize) {
		this.settledSpaceSize = settledSpaceSize;
	}
	
}
