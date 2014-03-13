/**
 * 
 */
package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * @author danhan
 *
 */
public class Contacts extends CommonAction {

	/**
	 *  获取域外top 50最近联系人信息和所有top 9最近联系人信息
	 */
	public void getContactList() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		try {
			String contactList = sbox.getContactList(secretKey);
			ajaxBack(contactList);
		}  catch (SBoxClientException e) {
			logger.error(e);
		} catch (IOException e) {
			logger.error(e);
		}
	}
	
	public void modifyContact() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		SecretKey seretKey = getSecretKey();
		String contactList = getParameter("acl");
		try {
			String res = sbox.modifyContactList(seretKey, contactList);
			ajaxBack(res);
		} catch (SBoxClientException e) {
			logger.error(e);
		} catch (IOException e) {
			logger.error(e);
		}
	}
}
