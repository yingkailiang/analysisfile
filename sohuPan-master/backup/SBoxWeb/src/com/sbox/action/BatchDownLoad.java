package com.sbox.action;

import java.io.DataOutputStream;
import java.io.IOException;
import java.net.URLEncoder;

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
/**
 * 
 * @author yangwei
 *
 */
public class BatchDownLoad  extends CommonAction{
	
	
	private static final Logger logger = Logger.getLogger(BatchDownLoad.class);
	
	private String ids;
	
	private String firstName;
	
	private int fileNum;
	
	private String resourceId;

	public void getFiles(){
		
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		
		if((StringUtils.isBlank(resourceId)||StringUtils.isEmpty(resourceId))&&(StringUtils.isBlank(ids)||StringUtils.isEmpty(ids)))
			return;
		
		JSONArray jsonArray = null;
		String zipName = "";
		if(null!= resourceId)
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
						dirJsonObject.put("flag", 0);
						jsonArray.add(dirJsonObject);
					}
				}
				if (null != jsonFiles && jsonFiles.size() > 0) {
					for (int j = 0; j < jsonFiles.size(); j++) {
						JSONObject fileJsonObject = new JSONObject();
						fileJsonObject.put("resourceId", jsonFiles
								.getJSONObject(j).getString("id"));
						fileJsonObject.put("flag", 1);
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
				response.setHeader("Tansfer-Encoding", "chunked");
				response.setCharacterEncoding("ISO8859-1");
				//response.setHeader("Content-Disposition","attachment; filename=" + URLEncoder.encode(zipName, "UTF-8").replaceAll("\\+", " "));
		    } catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
				logger.error("BatchDownLoad setHeader"+ids, e1);
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
			
			if("1".equalsIgnoreCase(flag))
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
			response.getOutputStream().close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			logger.error("out close IOException"+ids, e);
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
		    JSONArray sboxjsonArray = fromObject
					.getJSONArray("sboxDirList");
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
					//downloadName = downloadName.replaceAll("\\+", "%20");
					downloadName = URLEncoder.encode(downloadName, "UTF8").replaceAll("\\+", "%20");
					downloadName = new String(downloadName.getBytes("utf-8"),
							"ISO8859-1");
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
					downloadName = URLEncoder.encode(downloadName, "UTF-8");
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

}
