package com.sbox.model;

import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.security.SecretKey;

public class User implements java.io.Serializable {

	private SBoxAccount account = null;
	private SBoxUser user = null;
	private SBoxUserProfile userPro = null;
	private SecretKey secretKey = null;

	public SecretKey getSecretKey() {
		return secretKey;
	}

	protected void setSecretKey(SecretKey secretKey) {
		this.secretKey = secretKey;
	}

	public User(SBoxAccount account, SBoxUser user, SBoxUserProfile userPro) {
		super();
		this.account = account;
		this.user = user;
		this.secretKey = new SecretKey(user.getDomain(), user.getId() + "",
				user.getSecretToken());
		this.userPro = userPro;
	}

	public SBoxAccount getAccount() {
		return account;
	}

	public void setAccount(SBoxAccount account) {
		this.account = account;
	}

	public SBoxUser getUser() {
		return user;
	}

	public void setUser(SBoxUser user) {

		this.user = user;
		Long id = user.getId();
		String secretToken = user.getSecretToken();
		if (id != null && secretToken != null) {
			this.secretKey = new SecretKey(user.getDomain(), id + "",
					secretToken);
		}
	}

	public SBoxUserProfile getUserPro() {
		return userPro;
	}

	public void setUserPro(SBoxUserProfile userPro) {
		this.userPro = userPro;
	}
}
