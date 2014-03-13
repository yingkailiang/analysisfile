package com.sbox.action;

import java.io.IOException;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBox;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class DeleteUser extends CommonAction {

	@SuppressWarnings("deprecation")
	public void deleteUser() {
		SecretKey secretKey = getSecretKey();
		SBox sbox = SBoxClientInstance.getSboxClient();
		String ids = getParameter("id");
		String deleteWay = getParameter("deleteWay");
		if (StringUtils.isEmpty(ids)) {
			try {
				ajaxBack(404, "user id is need.");
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		Long id = Long.parseLong(ids);
		try {
			String deleteUser = sbox.deleteUser(id,deleteWay, secretKey);
			ajaxBack(deleteUser);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
