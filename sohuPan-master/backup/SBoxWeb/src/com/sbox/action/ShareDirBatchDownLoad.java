package com.sbox.action;

import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.Platform;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxObject;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.MD5Util;
/**
 * 
 * @author yangwei
 *
 */
public class ShareDirBatchDownLoad  extends CommonAction{
	
	
	private static final Logger logger = Logger.getLogger(ShareDirBatchDownLoad.class);
	
	private String ids;
	
	private String firstName;
	
	private int fileNum;
	
	private String resourceId;

	private String userId;
	
	private String sign;
	
	private String date;
	
	private String sid;  //外链id
	
	private String fileId; //文件id
	
	private String password;


	public void getFiles(){
		
		JSONObject flagJsonObject = new JSONObject();
		String shareId = genIntegerByString(sid);
		SecretKey secretKey = null;
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		
		String userInfo = null;
		try {
			userInfo = sbox.getUserByUserId(userId, sign, date);
		} catch (SBoxClientException e3) {
			// TODO Auto-generated catch block
			e3.printStackTrace();
		}
		
		JSONObject userInfoObject = JSONObject.fromObject(userInfo);
		int userInfoCode = userInfoObject.getInt("code");
		if(userInfoCode == 200)
		{
			JSONObject userObject = userInfoObject.getJSONObject("user");
			secretKey = new SecretKey(userObject.getString("domain"),userId, userObject.getString("secretToken"));
		}else
		{
			return;
		}
		
		String outChainStr = null;
		try {
			outChainStr = sbox.getOutChain(shareId, secretKey);
		} catch (SBoxClientException e3) {
			// TODO Auto-generated catch block
			e3.printStackTrace();
		}
		try {
			//校验密码
			JSONObject outChainObject = JSONObject.fromObject(outChainStr);
			int outChainCode = outChainObject.getInt("code");
			if(outChainCode == 200)
			{
				JSONObject outSideChainJson = userInfoObject.getJSONObject("outSideChain");
				int hasPassWord = outSideChainJson.getInt("hasPassword");
				if(hasPassWord == 1 &&(StringUtils.isBlank(password)||StringUtils.isEmpty(password)))
				{
					flagJsonObject.put("code", 500);
					flagJsonObject.put("errorMeaasge", "must password");
					try {
						ajaxBack(flagJsonObject.toString());
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}else if(hasPassWord == 1 &&(StringUtils.isNotBlank(password)||StringUtils.isNotEmpty(password))){
					
					String resourceId = outSideChainJson.getString("fileLasestId");
					String checkPassword = "" ;
					try {
						checkPassword = sbox.checkOutLinkPassword(userId, resourceId, MD5Util.MD5(password), "1");
					} catch (SBoxClientException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
					JSONObject json = JSONObject.fromObject(checkPassword);
					int checkPasswordCode = json.getInt("code");
				    if(checkPasswordCode != 200)
					{
						flagJsonObject.put("code", 500);
						flagJsonObject.put("errorMeaasge", "CheckShareDirPassword fail");
						try {
							ajaxBack(flagJsonObject.toString());
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						return;
					}
					
				}
			}
		} catch (Exception e3) {
			// TODO Auto-generated catch block
			e3.printStackTrace();
		}
		
			
		if((StringUtils.isBlank(fileId)||StringUtils.isEmpty(fileId))&&(StringUtils.isBlank(resourceId)||StringUtils.isEmpty(resourceId))&&(StringUtils.isBlank(ids)||StringUtils.isEmpty(ids)))
			return;
		
		//更新下载次数
				try {
					if(StringUtils.isNotBlank(sid)&&StringUtils.isNotEmpty(sid))
					{
					   sbox.updateOutChainCount(shareId, secretKey);
					}
				} catch (SBoxClientException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
		//文件下载
		if(StringUtils.isNotBlank(fileId)&&StringUtils.isNotEmpty(fileId))
		{
			HttpServletRequest request = ServletActionContext.getRequest();
			HttpServletResponse response = ServletActionContext.getResponse();
			try {
				SBoxObject object = sbox.getObject(fileId, "", secretKey);
				if (object != null) {
					String fileName = object.getName();
					response.setContentType("application/x-msdownload");
					// 设置文件大小
					response.setHeader("Content-Disposition",
							"attachment; filename="
									+ getFileName(request, fileName));
					//response.setHeader("Range", range);
					response.setHeader("Content-Length", object.getContentLength()
							+ "");
					response.setContentLength(new Long(object.getContentLength())
							.intValue());
					// response.setHeader("Accept-Ranges", "none");
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
				}
			} catch (SBoxClientException e) {
				logger.error("SBox API error", e);
				e.printStackTrace();
			} catch (IOException e) {
				logger.error("IOException error", e);
				e.printStackTrace();
			}
			
		}
		else
		{   //文件夹压缩包下载
		
		JSONArray jsonArray = null;
		String zipName = "";
		if(StringUtils.isNotBlank(resourceId)&&StringUtils.isNotEmpty(resourceId))
		{
			jsonArray = new JSONArray();
			String services = null;
			try {
				services = sbox.getService(resourceId, secretKey);
			} catch (SBoxClientException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				logger.error("getService SBoxClientException"+ids, e);
			}
			
			JSONObject fromObject = JSONObject.fromObject(services);
			int code = fromObject.getInt("code");
			if(code == 200)
			{
				JSONArray sboxjsonArray = fromObject.getJSONArray("sboxDirList");
				JSONArray jsonFiles = fromObject.getJSONArray("sboxFileLatestList");
				if (null != sboxjsonArray && sboxjsonArray.size() > 0) {
					for (int i = 0; i < sboxjsonArray.size(); i++) {
						JSONObject dirJsonObject = new JSONObject();
						dirJsonObject.put("resourceId", sboxjsonArray
								.getJSONObject(i).getString("id"));
						dirJsonObject.put("flag", 1);
						jsonArray.add(dirJsonObject);
					}
				}
				if (null != jsonFiles && jsonFiles.size() > 0) {
					for (int j = 0; j < jsonFiles.size(); j++) {
						JSONObject fileJsonObject = new JSONObject();
						fileJsonObject.put("resourceId", jsonFiles
								.getJSONObject(j).getString("id"));
						fileJsonObject.put("flag", 0);
						jsonArray.add(fileJsonObject);
					}
				}
			
			}
			
			String dir = null;
			try {
				dir = sbox.getDirInfo(resourceId, secretKey);
			} catch (SBoxClientException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			String name = "";
			try {
				JSONObject dirObject = JSONObject.fromObject(dir).getJSONObject("sboxDir");
				name = dirObject.getString("name");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			zipName =  name+".zip";
			
		}
		else
		{
		
			try {
				jsonArray = JSONArray.fromObject(ids);
			} catch (Exception e2) {
				// TODO Auto-generated catch block
				e2.printStackTrace();
				logger.error("JSONArray fromObject exception"+ids, e2);
			}
			
			if(jsonArray!=null&&jsonArray.size()>1)
			{
			     zipName = firstName+"等.zip";
			}
			else
			{
				 zipName = firstName+".zip";
			}
		}
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpServletResponse response = ServletActionContext.getResponse();
		
		response.reset();
		response.setContentType("application/octet-stream");
	
		try {
			response.setHeader("Content-Disposition","attachment; filename=" + getFileName(request,zipName));
			//response.setHeader("Content-Disposition","attachment; filename=" + URLEncoder.encode(zipName, "UTF-8").replaceAll("\\+", " "));
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			logger.error("ShareDirBatchDownLoad setHeader"+ids, e1);
		}
		
		ZipOutputStream out = null;
		try {
			  out = new ZipOutputStream(new DataOutputStream(response.getOutputStream()));
			  
			  out.setEncoding("GBK");
			 
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("ZipOutputStream io exception"+ids, e);
		}
		
		for (int i = 0; i < jsonArray.size(); i++) {
			
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			
			String flag = jsonObject.getString("flag");
			
			String resourceId = jsonObject.getString("resourceId");
			
			if("0".equalsIgnoreCase(flag))
			{
				try {
					SBoxObject object = sbox.getObject(resourceId, "", secretKey);
					if (object != null) {
						out.putNextEntry(new ZipEntry(object.getName()));
						int c;
						while ((c = object.getContent().read()) != -1) {
							out.write(c);
						}
						object.getContent().close();
					}
					else
					{
						return;
					}
				} catch (SBoxClientException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					logger.error("getObject SBoxClientException"+ids, e);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					logger.error("getObject IOException",e);
				}
			}else
			{
				
			 outZipDir(secretKey, sbox, out, resourceId,"");
				
			}
			
		}
		
		try {
			out.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("out close IOException"+ids, e);
		}
		
		}
		
		
		return;
	}


	private void outZipDir(SecretKey secretKey, SBoxClient sbox,
			ZipOutputStream out, String resourceId,String suffix) {
		String dir = null;
		try {
			dir = sbox.getDirInfo(resourceId, secretKey);
		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		  JSONObject dirObject = JSONObject.fromObject(dir).getJSONObject("sboxDir");
		  String name = dirObject.getString("name");
		  
		  try {
			if(StringUtils.isEmpty(suffix))  
			out.putNextEntry(new ZipEntry(name+"/"));
			else
			{
				out.putNextEntry(new ZipEntry(suffix+name+"/"));
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("out.putNextEntry IOException"+suffix, e);
		}
		  
		String services = null;
		try {
			services = sbox.getService(resourceId, secretKey);
		} catch (SBoxClientException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("getService SBoxClientException"+ids, e);
		}
		
		JSONObject fromObject = JSONObject.fromObject(services);
		int code = fromObject.getInt("code");
		
		if(code == 200)
		{
		    JSONArray sboxjsonArray = fromObject.getJSONArray("sboxDirList");
			JSONArray jsonFiles = fromObject.getJSONArray("sboxFileLatestList");
			if(sboxjsonArray!=null)
			{
				  for (int i = 0; i < sboxjsonArray.size(); i++) {
					  
					  JSONObject jsonObject = sboxjsonArray.getJSONObject(i);
					  
					  String id = jsonObject.getString("id");
					  
					  outZipDir(secretKey, sbox, out, id,(suffix+name+"/").trim());
					
				}
			}
			
			if(jsonFiles != null)
			{
				 for (int i = 0; i < jsonFiles.size(); i++) {
					 
					 JSONObject jsonObject = jsonFiles.getJSONObject(i); 
					 try {
							SBoxObject object = sbox.getObject(jsonObject.getString("id"), "", secretKey);
							if (object != null) {
								if (StringUtils.isEmpty(suffix))
									out.putNextEntry(new ZipEntry(name + "/"
											+ object.getName()));
								else {
									out.putNextEntry(new ZipEntry(suffix + name
											+ "/" + object.getName()));
								}
								int c;
								while ((c = object.getContent().read()) != -1) {
									out.write(c);
								}
								object.getContent().close();
							}
							else
							{
								return;
							}
						} catch (SBoxClientException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
							logger.error("jsonFiles SBoxClientException"+ids, e);
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
							logger.error("jsonFiles IOException"+ids, e);
						}
				}
			}
			
		}
	}
	
	public static String getFileName(HttpServletRequest request, String fileName) {
		String downloadName = fileName;
		try {
			String header = request.getHeader("User-Agent");
			header = (header == null ? "" : header.toLowerCase());
			if (Platform.isWindows()) {// Server is Windows
				if (header.indexOf("msie") > -1) {
					downloadName = URLEncoder.encode(downloadName, "UTF8").replaceAll("\\+", "%20");
					downloadName = new String(downloadName.getBytes("utf-8"),"ISO8859-1");
				} else if (header.indexOf("mozilla") > -1) {
					downloadName = new String(downloadName.getBytes(),
							"ISO8859-1");
				} else if (header.indexOf("opera") > -1) {
					// downloadName = downloadName.replaceAll(" ", "_");
					downloadName = new String(downloadName.getBytes(),
							"ISO8859-1");
				} else {
					// downloadName = downloadName.replaceAll(" ", "_");
					downloadName = new String(downloadName.getBytes(),
							"ISO8859-1");
				}
			} else {// Server is Linux
				if (header.indexOf("msie") > -1) {
					downloadName = URLEncoder.encode(downloadName, "UTF8");
				} else if (header.indexOf("mozilla") > -1) {
					downloadName = downloadName.replaceAll(" ", "_");
					downloadName = new String(fileName.getBytes("UTF-8"),
							"ISO8859-1");
				} else if (header.indexOf("opera") > -1) {
					downloadName = downloadName.replaceAll(" ", "_");
					downloadName = new String(downloadName.getBytes(),
							"ISO8859-1");
				} else {
					downloadName = downloadName.replaceAll(" ", "_");
					downloadName = new String(downloadName.getBytes(),
							"ISO8859-1");
				}
			}
		} catch (Exception e) {
		}
		return "\"" + downloadName + "\"";
	}
	
	public String getResourceId() {
		return resourceId;
	}


	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}
	
	
	public int getFileNum() {
		return fileNum;
	}


	public void setFileNum(int fileNum) {
		this.fileNum = fileNum;
	}
	
	public String getFirstName() {
		return firstName;
	}


	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}


	public String getIds() {
		return ids;
	}


	public void setIds(String ids) {
		this.ids = ids;
	}
	
	public String getUserId() {
		return userId;
	}


	public void setUserId(String userId) {
		this.userId = userId;
	}


	public String getSign() {
		return sign;
	}


	public void setSign(String sign) {
		this.sign = sign;
	}
	
	public String getDate() {
		return date;
	}


	public void setDate(String date) {
		this.date = date;
	}
	
	public String getSid() {
		return sid;
	}


	public String getPassword() {
		return password;
	}


	public void setPassword(String password) {
		this.password = password;
	}


	public void setSid(String sid) {
		this.sid = sid;
	}
	
	public String getFileId() {
		return fileId;
	}


	public void setFileId(String fileId) {
		this.fileId = fileId;
	}


}
