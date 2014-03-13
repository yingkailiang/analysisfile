package com.sbox.action;

import com.opensymphony.xwork2.ActionSupport;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;

/**
 *账户Action
 *
 * @author Jack.wu.xu
 */
public class MoveFile extends ActionSupport {

	@SuppressWarnings("deprecation")
	public void getService() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
	}
}
