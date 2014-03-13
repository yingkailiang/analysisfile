package com.sbox.tools;

public class SecurityResult {
	private boolean isSuccess = false;
	private String loginName = "";
	private String password = "";
	private String failureReason  = "";

	public void setSuccess(boolean isSuccess) {
		this.isSuccess = isSuccess;
	}

	public boolean isSuccess() {
		return isSuccess;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPassword() {
		return password;
	}

	public void setLoginName(String loginName) {
		this.loginName = loginName;
	}

	public String getLoginName() {
		return loginName;
	}

	public void setFailureReason(String failureReason) {
		this.failureReason = failureReason;
	}

	public String getFailureReason() {
		return failureReason;
	}

}
