package com.sbox.action;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
import com.sbox.tools.SessionName;
import com.sbox.tools.SignatureUtil;
import com.sbox.tools.ToolsUtil;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class OutLink extends CommonAction {
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
	private long date;
	private String downCount;
	private long size;
	private String thumbnailsKey;
	private String outResourceId;
	private String shareType;
	private String sharePrivilege;
	private String language;
	private static long max = 104857600l;//压缩文件预览大小
	
	private static List<String> fileterArr = new ArrayList<String>();
	
	static {
		
		fileterArr.add("jpg");
		fileterArr.add("jpeg");
		fileterArr.add("png");
		fileterArr.add("bmp");
		fileterArr.add("gif");
		fileterArr.add("pdf");
		fileterArr.add("txt");
		fileterArr.add("css");
		fileterArr.add("csv");
		fileterArr.add("java");
		fileterArr.add("c");
		fileterArr.add("cpp");
		fileterArr.add("jsp");
		fileterArr.add("asp");
		fileterArr.add("php");
		fileterArr.add("py");
		fileterArr.add("as");
		fileterArr.add("sh");
		fileterArr.add("doc");
		fileterArr.add("docx");
		fileterArr.add("xls");
		fileterArr.add("xlsx");
		fileterArr.add("ppt");
		fileterArr.add("pps");
		fileterArr.add("pptx");
		fileterArr.add("wps");
		fileterArr.add("mp3");
		fileterArr.add("avi");
		fileterArr.add("swf");
		fileterArr.add("flv");
		fileterArr.add("rar");
		fileterArr.add("zip");
	}

	public String getOutResourceId() {
		return outResourceId;
	}

	public String getSharePrivilege() {
		return sharePrivilege;
	}

	public void setSharePrivilege(String sharePrivilege) {
		this.sharePrivilege = sharePrivilege;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public void setOutResourceId(String outResourceId) {
		this.outResourceId = outResourceId;
	}

	public String getShareType() {
		return shareType;
	}

	public void setShareType(String shareType) {
		this.shareType = shareType;
	}

	public String getThumbnailsKey() {
		return thumbnailsKey;
	}

	public void setThumbnailsKey(String thumbnailsKey) {
		this.thumbnailsKey = thumbnailsKey;
	}

	public long getSize() {
		return size;
	}

	public void setSize(long size) {
		this.size = size;
	}

	public String getDownCount() {
		return downCount;
	}

	public void setDownCount(String downCount) {
		this.downCount = downCount;
	}

	public long getDate() {
		return date;
	}

	public void setDate(long date) {
		this.date = date;
	}

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

	@SuppressWarnings("deprecation")
	public void get() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		String id = getParameter("id");
		String shareType = getParameter("shareType");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String outLink = sbox.getOutLink(id,shareType, secretKey);
			JSONObject json = JSONObject.fromObject(outLink);
			int code = json.getInt("code");
			if (code == 200) {
				HttpServletRequest request = ServletActionContext.getRequest();
				String url = request.getRequestURL().toString();
				String[] urls = url.split("/");
				if (StringUtils.isEmpty(urls[2])) {
					urls = url.split("\\");
				}
				//String sign = json.getString("sign");
				JSONObject chain = json.getJSONObject("outSideChain");
				String outChain = chain.getString("outchainStr");
				//String[] split = outChain.split("OutLink!");
				String[] http = urls[0].split(":");
				outChain = http[0] + "://" + urls[2]  + outChain;
				
				chain.put("outchainStr", outChain);
				json.put("outSideChain", chain);
				ajaxBack(json.toString());
			} else if (code == 500) {
				ajaxBack(outLink);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void getAll() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		String id = getParameter("id");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String outLink = sbox.getUserOutLink(secretKey);
			net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
					.fromObject(outLink);
			JSONArray result = new JSONArray();
			int code = fromObject.getInt("code");
			if (code == 200) {
				JSONArray jsonArray = fromObject
						.getJSONArray("sboxOutchainList");
				for (int i = 0; i < jsonArray.size(); i++) {
					net.sf.json.JSONObject jsonObject = jsonArray
							.getJSONObject(i);
					String sharetype = jsonObject.getString("shareType");
					if ("1".equalsIgnoreCase(sharetype)) {
						
						String resourceId = jsonObject
								.getString("fileLasestId");
						
						net.sf.json.JSONObject f = null;

						String dirInfo = sbox.getDirInfo(resourceId, secretKey);
						net.sf.json.JSONObject dir = net.sf.json.JSONObject
								.fromObject(dirInfo);
						f = dir.getJSONObject("sboxDir");
						if(f.isNullObject())
						{
							continue;
						}

						f.put("outlink", jsonObject.getString("outchainStr"));
						f.put("expiredate", jsonObject.getString("expiredate"));
						f.put("memo", jsonObject.getString("memo"));
						f.put("password", jsonObject.getInt("hasPassword"));
						f.put("shareType", sharetype);
						f.put("shareId", jsonObject.getString("id"));
						f.put("downCount", jsonObject.getString("downCount"));
						f.put("sharePrivilege", jsonObject.getString("sharePrivilege"));
						f.put("language", jsonObject.getString("language"));
						f.put("outchainStr", "");
						String outChain = jsonObject.getString("outchainStr");
						// String[] split = outChain.split("OutLink!");
						HttpServletRequest request = ServletActionContext
								.getRequest();
						String url = request.getRequestURL().toString();
						String[] urls = url.split("/");
						if (StringUtils.isEmpty(urls[2])) {
							urls = url.split("\\");
						}
						String sign = jsonObject.getString("sign");
						String[] http = urls[0].split(":");
						outChain = http[0] + "://" + urls[2] + outChain;
						f.put("outlink", outChain);
						result.add(f);

					}
					
				}
				
				for (int i = 0; i < jsonArray.size(); i++) {
					net.sf.json.JSONObject jsonObject = jsonArray
							.getJSONObject(i);
					String resourceId = jsonObject.getString("fileLasestId");
					String sharetype = jsonObject.getString("shareType");
					net.sf.json.JSONObject f = null;
					if ("0".equalsIgnoreCase(sharetype)) {
						String objectInfo = sbox.getObjectInfo(resourceId,
								secretKey);
						net.sf.json.JSONObject file = net.sf.json.JSONObject
								.fromObject(objectInfo);
						f = file.getJSONObject("objectInfo");

						f.put("outlink", jsonObject.getString("outchainStr"));
						f.put("expiredate", jsonObject.getString("expiredate"));
						f.put("memo", jsonObject.getString("memo"));
						f.put("password", jsonObject.getInt("hasPassword"));
						f.put("shareType", sharetype);
						f.put("shareId", jsonObject.getString("id"));
						f.put("downCount", jsonObject.getString("downCount"));
						f.put("sharePrivilege", jsonObject.getString("sharePrivilege"));
						f.put("language", jsonObject.getString("language"));
						f.put("outchainStr", "");
						String outChain = jsonObject.getString("outchainStr");
						// String[] split = outChain.split("OutLink!");
						HttpServletRequest request = ServletActionContext
								.getRequest();
						String url = request.getRequestURL().toString();
						String[] urls = url.split("/");
						if (StringUtils.isEmpty(urls[2])) {
							urls = url.split("\\");
						}
						String sign = jsonObject.getString("sign");
						String[] http = urls[0].split(":");
						outChain = http[0] + "://" + urls[2] + outChain;
						f.put("outlink", outChain);
						result.add(f);
					}
					
				}
				ajaxBack(result.toString());
			} else {
				ajaxBack("[]");
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	
	public void getAnonymousAll() {
		SecretKey secretKey = getSecretKey();// getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		String id = getParameter("id");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String outLink = sbox.getUserAnonymousOutLink(secretKey);
			net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
					.fromObject(outLink);
			JSONArray result = new JSONArray();
			int code = fromObject.getInt("code");
			if (code == 200) {
				JSONArray jsonArray = fromObject
						.getJSONArray("sboxOutchainList");
				for (int i = 0; i < jsonArray.size(); i++) {
					net.sf.json.JSONObject jsonObject = jsonArray
							.getJSONObject(i);
					String sharetype = jsonObject.getString("shareType");
					if ("2".equalsIgnoreCase(sharetype)) {
						
						String resourceId = jsonObject
								.getString("fileLasestId");
						
						net.sf.json.JSONObject f = null;

						String dirInfo = sbox.getDirInfo(resourceId, secretKey);
						net.sf.json.JSONObject dir = net.sf.json.JSONObject
								.fromObject(dirInfo);
						f = dir.getJSONObject("sboxDir");

						f.put("expiredate", jsonObject.getString("expiredate"));
						f.put("memo", jsonObject.getString("memo"));
						f.put("password", jsonObject.getInt("hasPassword"));
						f.put("shareType", sharetype);
						f.put("shareId", jsonObject.getString("id"));
						f.put("downCount", jsonObject.getString("downCount"));
						f.put("sharePrivilege", jsonObject.getString("sharePrivilege"));
						f.put("language", jsonObject.getString("language"));
						f.put("usedSize", jsonObject.getString("usedSize"));
						f.put("path", jsonObject.getString("path"));
						f.put("outchainStr", "");
						String outChain = jsonObject.getString("outchainStr");
						// String[] split = outChain.split("OutLink!");
						HttpServletRequest request = ServletActionContext
								.getRequest();
						String url = request.getRequestURL().toString();
						String[] urls = url.split("/");
						if (StringUtils.isEmpty(urls[2])) {
							urls = url.split("\\");
						}
						String sign = jsonObject.getString("sign");
						String[] http = urls[0].split(":");
						outChain = http[0] + "://" + urls[2] + outChain;
						f.put("uploadlink", outChain);
						f.put("anonymousUpload", "1");
						result.add(f);

					}
					
				}
				
				ajaxBack(result.toString());
			} else {
				ajaxBack("[]");
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public void delete() {
		SecretKey secretKey = getSecretKey();
		String dirIds = getParameter("dirIds");
		String fileIds = getParameter("fileIds");
		String shareType = getParameter("shareType");
		if (StringUtils.isEmpty(dirIds)&&StringUtils.isEmpty(fileIds)) {
			return;
		}
		if(shareType == null){
			
			shareType = "";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String[] dirStr = dirIds.split(",");
		String[] fileStr = fileIds.split(",");
		net.sf.json.JSONArray array = new JSONArray();
		try {
			
			if(dirStr!=null&&dirStr.length>0)
			{	
				for (String dirId : dirStr) {
					
                    if(StringUtils.isNotEmpty(dirId))
                    {	
                    	String type = "1";
                    	if(StringUtils.isNotEmpty(shareType))
                    	{
                    		type = "2";
                    	}
                    	
						String outLink = sbox.DeleteOutsideChain(dirId,type,secretKey);
						net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
								.fromObject(outLink);
						net.sf.json.JSONObject object = new net.sf.json.JSONObject();
						object.put("id", dirId);
						object.put("result", fromObject);
						object.put("type", "outLink");
						array.add(object);
                    }

				}
			}
			
			if(fileStr!=null&&fileStr.length>0){
				for (String fileId : fileStr) {
					if (StringUtils.isNotEmpty(fileId)) {
						String outLink = sbox.DeleteOutsideChain(fileId, "0",
								secretKey);
						net.sf.json.JSONObject fromObject = net.sf.json.JSONObject
								.fromObject(outLink);
						net.sf.json.JSONObject object = new net.sf.json.JSONObject();
						object.put("id", fileId);
						object.put("result", fromObject);
						object.put("type", "outLink");
						array.add(object);
					}
				}
			}
			ajaxBack(array.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 500);
				jssu.put("message", "API is error!");
				ajaxBack(jssu.toString());
			} catch (IOException e1) {
				e.printStackTrace();
			} catch (JSONException e1) {
				e.printStackTrace();
			}
			return;
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public void create() {
		SecretKey secretKey = getSecretKey();
		String id = getParameter("id");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String expiredate = getParameter("expiredate");
		String password = getParameter("password");
		String note = getParameter("note");
		String shareType = getParameter("shareType");
		String sharePrivilege = getParameter("sharePrivilege");
		String language = getParameter("language");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		if (note!=null&&note.length() > 200) {
			JSONObject jssu = new JSONObject();
			jssu.put("code", 601);
			jssu.put("message", "note is too long");
			try {
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		if(note == null)
		{
			note = "";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			SBoxOutchain sboxOutchain = new SBoxOutchain();
			sboxOutchain.setFileLasestId(id);
			sboxOutchain.setPassword(password);
			sboxOutchain.setMemo(note);
			if (StringUtils.isEmpty(password)) {
				sboxOutchain.setHasPassword(0);
			} else {
				sboxOutchain.setHasPassword(1);
			}
			if(sharePrivilege == null)
			{
				sharePrivilege = "2";
			}
			if(language == null)
			{
				language = "0";
			}
			sboxOutchain.setExpiredate(sdf.parse(expiredate));
			sboxOutchain.setShareType(Integer.valueOf(shareType));
			sboxOutchain.setSharePrivilege(Integer.valueOf(sharePrivilege));
			sboxOutchain.setLanguage(Integer.valueOf(language));
			String outLink = sbox.createOutsideChain(sboxOutchain, secretKey);
			JSONObject json = JSONObject.fromObject(outLink);
			String code = json.getString("code");
			if("200".equalsIgnoreCase(code))
			{
				HttpServletRequest request = ServletActionContext.getRequest();
				String url = request.getRequestURL().toString();
				String[] urls = url.split("/");
				if (StringUtils.isEmpty(urls[2])) {
					urls = url.split("\\");
				}
				String sign = json.getString("sign");
				String chain = json.getString("outSideChain");
				//String[] split = chain.split("OutLink!");
				String[] http = urls[0].split(":");
				chain = http[0] + "://" + urls[2]  + chain;
				json.put("outSideChain", chain);
			}
			ajaxBack(json.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 500);
				jssu.put("message", "API is error!");
				ajaxBack(jssu.toString());
			} catch (IOException e1) {
				e.printStackTrace();
			} catch (JSONException e1) {
				e.printStackTrace();
			}
			return;
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 500);
				jssu.put("message", "expiredate format is error!");
				ajaxBack(jssu.toString());
			} catch (IOException e1) {
				e.printStackTrace();
			} catch (JSONException e1) {
				e.printStackTrace();
			}
			return;
		}
	}

	public void getShareLinks() {
		SecretKey secretKey = getSecretKey();
		String ids = getParameter("ids");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String json = sbox.createshareFile(ids, secretKey);
			ajaxBack(json);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			try {
				ajaxBack("{\"code\":500,\"message\":\"Client is error!\"}");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("deprecation")
	public void update() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 403);
				jssu.put("message", "The authentication information is empty!");
				ajaxBack(jssu.toString());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
			return;
		}
		String id = getParameter("id");
		String shareType = getParameter("shareType");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String expiredate = getParameter("expiredate");
		String password = getParameter("password");
		String note = getParameter("note");
		String sharePrivilege = getParameter("sharePrivilege");
		String language = getParameter("language");
		String needpass = getParameter("needpass");
		if (StringUtils.isEmpty(id)) {
			id = "root";
		}
		if(sharePrivilege == null)
		{
			sharePrivilege = "2";
		}
		if(language == null)
		{
			language = "0";
		}
		if(note == null)
		{
			note = "";
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			SBoxOutchain sboxOutchain = new SBoxOutchain();
			sboxOutchain.setFileLasestId(id);
			if ("1".equals(needpass)) {
				sboxOutchain.setHasPassword(1);
				if (!StringUtils.isEmpty(password)) {
					sboxOutchain.setPassword(password);
				}
			}
			if("2".equalsIgnoreCase(shareType))
			{
				sboxOutchain.setPassword(password);
			}
			sboxOutchain.setMemo(note);
			sboxOutchain.setExpiredate(sdf.parse(expiredate));
			sboxOutchain.setShareType(Integer.valueOf(shareType));
			sboxOutchain.setSharePrivilege(Integer.valueOf(sharePrivilege));
			sboxOutchain.setLanguage(Integer.valueOf(language));
			String outLink = sbox.updateOutLink(sboxOutchain, secretKey);
			ajaxBack(outLink);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 500);
				jssu.put("message", "API is error!");
				ajaxBack(jssu.toString());
			} catch (IOException e1) {
				e.printStackTrace();
			} catch (JSONException e1) {
				e.printStackTrace();
			}
			return;
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
			try {
				JSONObject jssu = new JSONObject();
				jssu.put("code", 500);
				jssu.put("message", "expiredate format is error!");
				ajaxBack(jssu.toString());
			} catch (IOException e1) {
				e.printStackTrace();
			} catch (JSONException e1) {
				e.printStackTrace();
			}
			return;
		}
	}

	public String toPage() {
		HttpServletRequest request = ServletActionContext.getRequest();
		String userId = getParameter("user");
		String fileId = getParameter("fileId");
		String shareType = getParameter("shareType");
		String idstr = genIntegerByString(getParameter("id"));
		String id = "";
		if(StringUtils.isEmpty(fileId)&&(StringUtils.isBlank(idstr)||StringUtils.isEmpty(idstr)))
		{
			return "invalid";
		}
		else
		{
			id = idstr;
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String expire = sbox.checkOutLinkExpire(userId, fileId,id,shareType);
			JSONObject json = JSONObject.fromObject(expire);
			JSONObject jsonObject = json.getJSONObject("sboxFileLatest");
			JSONObject outChain = json.getJSONObject("sboxOutchain");
			int code = json.getInt("code");
			if (code == 200) {
				this.hasPassword = json.getInt("hasPassword");
				this.fileId = jsonObject.getString("id");
				this.userId = outChain.getString("createUserId"); 
				this.fileName = jsonObject.getString("name");
				String shareFileIdAndUserId = this.fileId+this.userId;
				if(this.hasPassword == 1)
				{
					HttpSession session = request.getSession();
					String shareResourceId = (String)session.getAttribute(SessionName.SHAREFILEID);
					if(!shareFileIdAndUserId.equalsIgnoreCase(shareResourceId))
					{
						Date toDay = new Date();
						this.date = toDay.getTime(); 
						Map<String,String> map=new HashMap<String,String>();
						map.put("userId", this.userId);
						map.put("Filelasestid", this.fileId);
						map.put("date", String.valueOf(this.date));
						String nvs = SignatureUtil.toPlaintext(map);
						this.sign = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
						this.shareType = "0";
						//返回的核查密码页面
						return "checkPassword";
					}
					
				}
				
				this.size = jsonObject.getLong("size");
				this.fileSize = ToolsUtil.toSizeStr(this.size);
				this.shareType = "0";
				this.language = outChain.getString("language");
				if(!StringUtils.isBlank(outChain.getString("downCount"))&&!StringUtils.isEmpty(outChain.getString("downCount")))
				{
				   this.downCount = outChain.getString("downCount");
				}
				else
				{
				   this.downCount = "0";
				}
				this.thumbnailsKey = jsonObject.getString("thumbnailsKey");
				// long m = size / (1024 * 1024);
				// long k = size % (1024 * 1024) / 1024;
				// long b = size % 1024;
				// this.fileSize = (m == 0 ? "" : m + "M ")
				// + (k == 0 ? "" : k + "K ") + (b == 0 ? "" : b + "字节");
				//this.fileId = fileId;
				try {
					this.note = json.getString("memo");
					Date toDay = new Date();
					this.date = toDay.getTime(); 
					Map<String,String> map=new HashMap<String,String>();
					map.put("userId", this.userId);
					map.put("Filelasestid", this.fileId);
					map.put("date", String.valueOf(this.date));
					String nvs = SignatureUtil.toPlaintext(map);
					this.sign = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
					
				} catch (JSONException e) {
					e.printStackTrace();
				}
				
				String suffixName = this.fileName.substring((this.fileName.lastIndexOf(".")+1));
				boolean onlineFlag = false;
				if(("rar".equalsIgnoreCase(suffixName)||"zip".equalsIgnoreCase(suffixName)))
				{
					onlineFlag = false;
				}
				else
				{
					for (String name : fileterArr) {
						if(name.equalsIgnoreCase(suffixName))
						{
							onlineFlag = true;
							break;
						}
					}
				}
				
				if(onlineFlag)
				{
					return "online";
				}else
				{
					return "down";
				}
				
			} else {
				
				return "invalid";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return "invalid";
	}

	public String download() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpServletResponse response = ServletActionContext.getResponse();
		try {
			SBoxObject object = sbox.getObject(fileId, userId,
					MD5Util.MD5("666666"), "1",String.valueOf(this.date),sign,outResourceId,"0");
			String error = object.getError();
			if (StringUtils.isEmpty(error)) {
				response.addHeader(
						"Content-Disposition",
						"attachment; filename="
								+ GetFile.getFileName(request, object.getName()));
				response.addHeader("Content-Length", String.valueOf(object.getContentLength()));
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
				if("1".equalsIgnoreCase(language))
				{
					this.message = "Password incorrect";
				}
				else
				{
				    this.message = "密码错误";
				}
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
					return "invalid";
				}
			} else if ("406".endsWith(error)) {
				this.message = "外链超时";
				return "down";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return "invalid";
	}
	
	public String downloadForOnline() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		HttpServletResponse response = ServletActionContext.getResponse();
		try {
			SBoxObject object = sbox.getObject(fileId, userId,
					MD5Util.MD5(password), "1",String.valueOf(this.date),sign,outResourceId,shareType);
			String error = object.getError();
			HttpServletRequest request = ServletActionContext.getRequest();
			if (StringUtils.isEmpty(error)) {
				response.addHeader(
						"Content-Disposition",
						"attachment; filename="
								+ GetFile.getFileName(request, object.getName()));
				response.addHeader("Content-Length", String.valueOf(object.getContentLength()));
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
				return "online";
			} else if ("405".endsWith(error)) {
				if("1".equalsIgnoreCase(language))
				{
					this.message = "Password incorrect";
				}
				else
				{
				    this.message = "密码错误";
				}
				InputStream content = object.getContent();
				StringBuffer sb = new StringBuffer();
				byte[] datas = new byte[1024];
				int size1 = -1;
				while ((size1 = content.read(datas)) > -1) {
					sb.append(new String(Arrays.copyOf(datas, size1), "UTF-8"));
				}
				content.close();
				String expire = sbox.checkOutLinkExpire(userId, outResourceId,"",shareType);
				JSONObject json = JSONObject.fromObject(expire);
				JSONObject outChainIsonObject = json.getJSONObject("sboxOutchain");
				JSONObject fileJsonObject = json.getJSONObject("sboxFileLatest");
				this.hasPassword = json.getInt("hasPassword");
				this.downCount = outChainIsonObject.getString("downCount");
				this.fileSize = ToolsUtil.toSizeStr(fileJsonObject.getLong("size"));
				//this.fileId = fileId;
				int code = json.getInt("code");
				if (code == 200) {
					/*this.userId = userId;
					this.fileName = jsonObject.getString("name");
					long size = jsonObject.getLong("size");
					long m = size / (1024 * 1024);
					long k = size % (1024 * 1024) / 1024;
					long b = size % 1024;
					
					 * this.fileSize = (m == 0 ? "" : m + "M ") + (k == 0 ? "" :
					 * k + "K ") + (b == 0 ? "" : b + "字节");
					 
					this.fileSize = ToolsUtil.toSizeStr(size);
					this.fileId = fileId;
					this.note = json.getString("memo");*/
					return "online";
				} else {
					return "invalid";
				}
			} else if ("406".endsWith(error)) {
				this.message = "外链超时";
				return "online";
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return "invalid";
	}

	
}
