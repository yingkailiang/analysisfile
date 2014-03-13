package com.sbox.action;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.apache.commons.lang3.StringUtils;

import net.sf.json.JSONObject;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;

/**
 * 
 * @author Jack.wu.xu
 */
public class UploadInitialization extends CommonAction {

	@SuppressWarnings("deprecation")
	public void initialization() throws UnsupportedEncodingException {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String key = getParameter("FileName");
		String resourceId = getParameter("DirId");
		if ("root".equals(resourceId)) {
			resourceId = secretKey.getSBoxAccessKeyId();
		}
		String len = getParameter("Length");
		Long length = Long.parseLong(len == null ? "0" : len);
		String note = getParameter("note");
		String createTime = getParameter("CreateTime");
		String modifyTime = getParameter("ModifyTime");
		String etag = getParameter("Etag");
		String fileId = getParameter("FileId");
		try {
			String initializedUpload = "";
			if (fileId != null && !"null".equals(fileId) && !"".equals(fileId)) {
				initializedUpload = sbox.initializedUpload(key, null, length,
						note, etag, createTime, modifyTime, "", fileId,
						secretKey);
			} else {
				initializedUpload = sbox.initializedUpload(key, resourceId,
						length, note, etag, createTime, modifyTime, "", null,
						secretKey);
			}
			System.out.println(initializedUpload);
			JSONObject fromObject = JSONObject.fromObject(initializedUpload);
			int code = fromObject.getInt("code");
			/*if (code == 501) {
				ajaxBack(code + ":" + fromObject.getString("errorMessage"));
			} else if (code == 503) {
				ajaxBack(code + ":" + fromObject.getString("errorMessage"));
			} else if (code == 200) {
				JSONObject jsonObject = fromObject
						.getJSONObject("sboxFileVersion");
				String filePos = jsonObject.getString("filePos");
				if (StringUtils.isEmpty(filePos)) {
					filePos = "0";
				}
				ajaxBack(code + ":" + fromObject.getString("splitId") + ":"
						+ fromObject.getString("fileLasestId") + ":" + filePos);
			}*/
			
			if(code == 200){
				JSONObject jsonObject = fromObject
						.getJSONObject("sboxFileVersion");
				String filePos = jsonObject.getString("filePos");
				if (StringUtils.isEmpty(filePos)) {
					filePos = "0";
				}
				ajaxBack(code + ":" + fromObject.getString("splitId") + ":"
						+ fromObject.getString("fileLasestId") + ":" + filePos);
				
			}
			else
			{
				String message = "";
				try {
					if(StringUtils.isNotEmpty(fromObject.getString("errorMessage")))
					{
						message = fromObject.getString("errorMessage");
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				try {
					if(StringUtils.isNotEmpty(fromObject.getString("message")))
					{
						message = fromObject.getString("message");
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				ajaxBack(code + ":" + message);
			}
			
			
			
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}
}
