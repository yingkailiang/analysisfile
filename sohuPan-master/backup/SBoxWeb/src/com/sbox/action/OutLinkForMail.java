package com.sbox.action;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxObject;
import com.sbox.sdk.client.model.SBoxOutchain;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.MD5Util;
import com.sbox.tools.ToolsUtil;

public class OutLinkForMail extends CommonAction {
	
	private String outlink = "";
	private String userId = "";
	private String fileId = "";
	private String fileSize = "";
	private String password = "";
	private String fileName = "";
	private int hasPassword;
	private String note;
	private String message;
	private String sign;

	public String getSign() {
		return sign;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public int getHasPassword() {
		return hasPassword;
	}

	public void setHasPassword(int hasPassword) {
		this.hasPassword = hasPassword;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getFileId() {
		return fileId;
	}

	public void setFileId(String fileId) {
		this.fileId = fileId;
	}

	public String getFileSize() {
		return fileSize;
	}

	public void setFileSize(String fileSize) {
		this.fileSize = fileSize;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getOutlink() {
		return outlink;
	}

	public void setOutlink(String outlink) {
		this.outlink = outlink;
	}



	private void getString(String string) {
		// TODO Auto-generated method stub

	}
	
	public String toPage() {
		String userId = getParameter("user");
		String fileId = getParameter("fileId");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String expire = sbox.getShareChainMail(fileId);
			JSONObject json = JSONObject.fromObject(expire);
			JSONObject jsonObject = json.getJSONObject("sboxFileLatest");
			int code = json.getInt("code");
			if (code == 200) {
				//this.hasPassword = json.getInt("hasPassword");
				this.fileId = fileId;
				//this.userId = userId;
				this.fileName = jsonObject.getString("name");
				long size = jsonObject.getLong("size");
				this.fileSize = ToolsUtil.toSizeStr(size);
				// long m = size / (1024 * 1024);
				// long k = size % (1024 * 1024) / 1024;
				// long b = size % 1024;
				// this.fileSize = (m == 0 ? "" : m + "M ")
				// + (k == 0 ? "" : k + "K ") + (b == 0 ? "" : b + "字节");
				this.fileId = fileId;
				try {
					//this.note = json.getString("memo");
				} catch (JSONException e) {
					e.printStackTrace();
				}
				return "down";
			} else {
				return "404";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return "404";
	}

	
	public String download() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		HttpServletResponse response = ServletActionContext.getResponse();
		try {
			// sign = getParameter("sign");
			SBoxObject object = sbox.getObjectForEmail(fileId);
			String error = object.getError();
			HttpServletRequest request = ServletActionContext.getRequest();
			if (StringUtils.isEmpty(error)) {
				response.addHeader(
						"Content-Disposition",
						"attachment; filename="
								+ GetFile.getFileName(request, object.getName()));
				ServletOutputStream outputStream = response.getOutputStream();
				InputStream content = object.getContent();
				byte[] bytes = new byte[1024 * 150];
				int size = -1;
				while ((size = content.read(bytes)) != -1) {
					outputStream.write(bytes, 0, size);
					outputStream.flush();
				}
				content.close();
				outputStream.close();
				return "down";
			} else if ("405".endsWith(error)) {
				this.message = "密码错误或者外链超时";
				InputStream content = object.getContent();
				StringBuffer sb = new StringBuffer();
				byte[] datas = new byte[1024];
				int size1 = -1;
				while ((size1 = content.read(datas)) > -1) {
					sb.append(new String(Arrays.copyOf(datas, size1), "UTF-8"));
				}
				content.close();
				String expire = sbox.checkOutLinkExpire(userId, fileId,"","0");
				JSONObject json = JSONObject.fromObject(expire);
				JSONObject jsonObject = json.getJSONObject("sboxFileLatest");
				this.hasPassword = json.getInt("hasPassword");
				this.fileId = fileId;
				int code = json.getInt("code");
				if (code == 200) {
					this.userId = userId;
					this.fileName = jsonObject.getString("name");
					long size = jsonObject.getLong("size");
					long m = size / (1024 * 1024);
					long k = size % (1024 * 1024) / 1024;
					long b = size % 1024;
					/*
					 * this.fileSize = (m == 0 ? "" : m + "M ") + (k == 0 ? "" :
					 * k + "K ") + (b == 0 ? "" : b + "字节");
					 */
					this.fileSize = ToolsUtil.toSizeStr(size);
					this.fileId = fileId;
					this.note = json.getString("memo");
					return "down";
				} else {
					return "404";
				}
			} else if ("406".endsWith(error)) {
				this.message = "密码错误或者外链超时";
				return "down";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "404";
	}
		
}
