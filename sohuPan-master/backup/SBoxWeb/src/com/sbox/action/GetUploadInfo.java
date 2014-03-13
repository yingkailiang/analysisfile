package com.sbox.action;

import java.io.IOException;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class GetUploadInfo extends CommonAction {

	public void getUploadInfo() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				ajaxBack(403, "The authentication information is empty!");
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		String uploadId = getParameter("uploadId");
		String resourceId = getParameter("dirId");
		String summaryMd5 = getParameter("summaryMd5");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			logger.info("uploadId is " + uploadId);
			String uploadinfos = sbox.getUploadPer(resourceId,uploadId,secretKey);
			JSONObject fromObject = net.sf.json.JSONObject
					.fromObject(uploadinfos);
			JSONObject jsonArray = fromObject.getJSONObject("sboxFileVersion");
			String filePos = jsonArray.getString("filePos");
			if (StringUtils.isEmpty(filePos)) {
				ajaxBack("0");
			} else {
				ajaxBack(filePos);
			}
			// for (int i = 0; i < jsonArray.size(); i++) {
			// JSONObject jsonObject = jsonArray.getJSONObject(i);
			// String splitId = jsonObject.getString("splitId");
			// if (splitId.equals(uploadId)) {
			// String filePos = jsonObject.getString("filePos");
			// if (StringUtils.isEmpty(filePos)) {
			// ajaxBack("0");
			// }else{
			// ajaxBack(filePos);
			// }
			// return;
			// }
			// }
		} catch (SBoxClientException e) {
			try {
				ajaxBack(500, e.getMessage());
			} catch (IOException ex) {
				ex.printStackTrace();
			}
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
