package com.sbox.action;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.Edo_view;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;
import com.sbox.tools.ToolsUtil;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class Upload extends CommonAction {
	private static Map<Integer, List<byte[]>> files = new HashMap<Integer, List<byte[]>>();
	private static final Logger logger = Logger.getLogger(Upload.class);
	public final static long MAX_SIZE = 10485760; // 10M
	private File Filedata = null;
	private String importMessage;
	
   private static List<String> fileterArr = new ArrayList<String>();
	
	static {
		
		fileterArr.add("mp3");
		fileterArr.add("wma");
		fileterArr.add("rm");
		fileterArr.add("wav");
		fileterArr.add("avi");
		fileterArr.add("rmvb");
		fileterArr.add("mov");
		fileterArr.add("mp4");
		fileterArr.add("swf");
		fileterArr.add("flv");
		fileterArr.add("mpg");
		fileterArr.add("wmv");
		
	}

	public void createUploadCode() {
		try {
			SBoxClient sbox = SBoxClientInstance.getSboxClient();
			SecretKey secretKey = getSecretKey();
			String dir = getParameter("dirId");
			String uploadCode = sbox.createUploadCode(dir, secretKey);
			ajaxBack(uploadCode);
		} catch (IOException e) {
			e.printStackTrace();
			try {
				ajaxBack("{\"code\":500,\"message\":\"server is error.\"}");
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}
	}

	public String uploadCodePage() {
		try {
			SBoxClient sbox = SBoxClientInstance.getSboxClient();
			SecretKey secretKey = getSecretKey();
			String dir = getParameter("dirId");
			String uploadCode = sbox.createUploadCode(dir, secretKey);
			ajaxBack(uploadCode);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return "uploadCodePage";
	}

	public String uploadLoginLogo() {
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		
		try {
			String uploadLogo = sbox.uploadLoginLogo(Filedata, secretKey);
			JSONObject fromObject = JSONObject.fromObject(uploadLogo);
			if(fromObject.getInt("code")==200){
				User session = (User) getSession(SessionName.USER);
				session.getAccount().setLogoImage(fromObject.getString("logokey"));
			}
			setImportMessage(uploadLogo);
		} catch (SBoxClientException e) {
			e.printStackTrace();
			setImportMessage("{\"code\":302,\"\":\"Api is error.\"}");
		}
		putSession("importMessage", importMessage);
		return "uploadLogoReturn";
	}

	public void upload() {
		String dirId = getParameter("dirId");
		String filename = getParameter("Filename");
		String length = getParameter("length");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		try {
			long length2 = Long.parseLong(length);
			long initStart = System.currentTimeMillis();
			String initializedUpload = sbox.initializedUpload(filename, dirId,
					length2, "", "", ToolsUtil.Date2.format(new Date()),
					ToolsUtil.Date2.format(new Date()), "", null, secretKey);
			long initEnd = System.currentTimeMillis();
			logger.info("init : " + (initEnd - initStart) + "ms");
			JSONObject fromObject = JSONObject.fromObject(initializedUpload);
			int code = fromObject.getInt("code");
			if (code == 200) {
				JSONObject jsonObject = fromObject
						.getJSONObject("sboxFileVersion");
				String filePos = jsonObject.getString("filePos");
				if (StringUtils.isEmpty(filePos)) {
					filePos = "0";
				}
				String fileLasestId = fromObject.getString("fileLasestId");
				String splitId = fromObject.getString("splitId");
				// FileInputStream fis = new FileInputStream(getFiledata());
				long putStart = System.currentTimeMillis();
				String putObject = "";
				try {
					putObject = sbox.putObject3(filename, length, dirId,
							splitId, null, filePos, secretKey, "",
							getFiledata());
				} catch (Exception e) {
					e.printStackTrace();
					logger.error("upload fail", e);
				}
				long putEnd = System.currentTimeMillis();
				logger.info("result:" + putObject);
				logger.info("put : " + (putEnd - putStart) + "ms");
				JSONObject putjson = JSONObject.fromObject(putObject);
				int putCode = putjson.getInt("code");
				if (putCode == 200) {
					long completeStart = System.currentTimeMillis();
					String uploadComplete = sbox.uploadComplete(dirId,
							fileLasestId, splitId, "", secretKey);
					long completeEnd = System.currentTimeMillis();
					logger.info("complete : " + (completeEnd - completeStart)
							+ "ms");
					JSONObject uploadCompleteObject = JSONObject.fromObject(uploadComplete);
					int completeCode = uploadCompleteObject.getInt("code");
					if(completeCode == 200 || completeCode == 201)
					{	
						JSONObject completejsonObject = uploadCompleteObject.getJSONObject("resultSboxFileVersion");
						Long size = Long.valueOf(completejsonObject.getString("size"));
						int nameIndex = filename.lastIndexOf(".");
						String suffixName = filename.substring(nameIndex+1);
						if(fileterArr.contains(suffixName)||size.longValue() <= MAX_SIZE)
						{
							String fileOnLineLink = sbox.getFileOnLineLink(completejsonObject.getString("uniqueFileSign"), completejsonObject.getString("versionNumber"),jsonObject.getString("splitId"), secretKey);
							JSONObject filenameFromObject = JSONObject.fromObject(fileOnLineLink);
							filename = filenameFromObject.getString("filename");
							String url = filenameFromObject.getString("fileLink");
							String[] split = url.split("\\?");
							String urlhead = split[0].substring(0, split[0].lastIndexOf("/"));
							String urlmidd = split[0].substring(split[0].lastIndexOf("/") + 1);
							String onlineUrl = urlhead + "/" + URLEncoder.encode(urlmidd, "UTF-8")+ "?" + URLEncoder.encode(split[1], "UTF-8");
							Edo_view view=Edo_view.getInstance();
							view.setUrl(onlineUrl);
							view.start();
						}
					}
					ajaxBack(uploadComplete);
				} else {
					ajaxBack(putObject);
				}
			} else {
				ajaxBack(initializedUpload);
			}
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private String getSavePath() {
		return ServletActionContext.getServletContext().getRealPath("/images");
	}

	public void range() {

		SecretKey secretKey = getSecretKey();
		String uploadid = getHeader("uploadid");
		logger.info("start upload id is :" + uploadid);
		String pos = getHeader("pos");
		String index = getHeader("index");
		logger.info("start upload pos is :" + uploadid);
		String resourceId = getHeader("dirId");
		logger.info("start upload dir is :" + resourceId);
		String totalSize = getHeader("TotalSize");
		logger.info("start upload allSize is :" + totalSize);
		String fileName = getHeader("filename");
		logger.info("start upload filename is :" + fileName);
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		HttpServletRequest request = ServletActionContext.getRequest();
		ServletInputStream inputStream;
		try {
			inputStream = request.getInputStream();
			logger.info("$start put Object %:" + inputStream.hashCode());
			logger.info("upload id invoke api splitId:" + uploadid + "pos:"
					+ pos);
			String putObject = sbox.putObject(fileName, totalSize, resourceId,
					uploadid, null, pos, secretKey, index, inputStream);
			logger.info("putObject" + putObject);
			ajaxBack(putObject);
		} catch (IOException e) {
			e.printStackTrace();
		} /*
		 * catch (SBoxClientException e) { e.printStackTrace(); }
		 */catch (SBoxClientException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings("unused")
	// public void range() {
	// String filePath = getHeader("uploadid");
	// String fileName = getHeader("filename");
	// String index = getHeader("index");
	// HttpServletRequest request = ServletActionContext.getRequest();
	// try {
	// ServletInputStream inputStream = request.getInputStream();
	// FileOutputStream outputStream = new FileOutputStream(new File(
	// "D:/temp/" + fileName), true);
	// byte[] bytes = new byte[1024 * 8];
	// int v;
	// byte[] result = new byte[0];
	// List<byte[]> bs = new ArrayList<byte[]>();
	// while ((v = inputStream.read(bytes)) > -1) {
	// outputStream.write(bytes, 0, v);
	// // result = ToolsUtil.concat(result, Arrays.copyOf(bytes, v));
	// }
	// // bs.add(result);
	// // logger.info("put bytes index : " + index);
	// // files.put(Integer.parseInt(index), bs);
	// outputStream.flush();
	// outputStream.close();
	// inputStream.close();
	// } catch (IOException e) {
	// e.printStackTrace();
	// }
	// }
	public void complete() {
		SecretKey secretKey = getSecretKey();
		String uploadid = getParameter("uploadId");
		String resourceId = getParameter("dirId");
		String fileName = getParameter("filename");
		String uniqueFileSign = getParameter("uniqueFileSign");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String etag = getParameter("Etag");
			String uploadComplete = sbox.uploadComplete(resourceId,
					uniqueFileSign, uploadid, etag, secretKey);
			JSONObject uploadCompleteObject = JSONObject.fromObject(uploadComplete);
			int completeCode = uploadCompleteObject.getInt("code");
			if(completeCode == 200 || completeCode == 201)
			{	
				JSONObject jsonObject = uploadCompleteObject.getJSONObject("resultSboxFileVersion");
				Long size = Long.valueOf(jsonObject.getString("size"));
				int nameIndex = fileName.lastIndexOf(".");
				String suffixName = fileName.substring(nameIndex+1);
				if(fileterArr.contains(suffixName)||size.longValue() <= MAX_SIZE)
				{
					String fileOnLineLink = sbox.getFileOnLineLink(jsonObject.getString("uniqueFileSign"), jsonObject.getString("versionNumber"),jsonObject.getString("splitId"), secretKey);
					JSONObject fromObject = JSONObject.fromObject(fileOnLineLink);
					fileName = fromObject.getString("filename");
					String url = fromObject.getString("fileLink");
					String[] split = url.split("\\?");
					String urlhead = split[0].substring(0, split[0].lastIndexOf("/"));
					String urlmidd = split[0].substring(split[0].lastIndexOf("/") + 1);
					String onlineUrl = urlhead + "/" + URLEncoder.encode(urlmidd, "UTF-8")+ "?" + URLEncoder.encode(split[1], "UTF-8");
					Edo_view view=Edo_view.getInstance();
					view.setUrl(onlineUrl);
					view.start();
				}
			}
			ajaxBack(uploadComplete);
		} catch (IOException e) {
			e.printStackTrace();
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
	}

	public void cancel() {
		SecretKey secretKey = getSecretKey();
		String splitId = getParameter("uploadId");
		String fileId = getParameter("uniqueFileSign");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String cancelUpload = sbox.cancelUpload(fileId, splitId, secretKey);
			ajaxBack(cancelUpload);
		} catch (IOException e) {
			e.printStackTrace();
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
	}

	public void setFiledata(File filedata) {
		Filedata = filedata;
	}

	public File getFiledata() {
		return Filedata;
	}

	public void setImportMessage(String importMessage) {
		this.importMessage = importMessage;
	}

	public String getImportMessage() {
		return importMessage;
	}
}
