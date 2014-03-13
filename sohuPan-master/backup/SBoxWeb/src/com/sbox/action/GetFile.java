package com.sbox.action;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.Platform;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxObject;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SignatureUtil;
import com.sbox.tools.ToolsUtil;
/*import com.sbox.AppendToFile;*/

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class GetFile extends CommonAction {
	private static final Logger logger = Logger.getLogger(GetFile.class);
	private String resourceId;
	private String version;
	private String fileName;
	private String onLineUrl;
	private String length;
	private String shareType;
	private String userId;
	private String date;
	private String sign;
	private String sharePrivilege = "3";
	private String outResourceId;
	private String language;
	private int hasPassword;
	private String acl = "0";
	private String splitId;

	public void getFile() {
		logger.error("time:" + System.currentTimeMillis());
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();

		HttpServletRequest request = ServletActionContext.getRequest();
		HttpServletResponse response = ServletActionContext.getResponse();
		
		String resourceId = getParameter("resourceId");
		//resourceId是提前判断
		if (StringUtils.isEmpty(resourceId)) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		String length = getParameter("length");// 获取文件总长度，去掉
		String range = getHeader("Range");

//		PAN-772: COMMENT BY HD
//		logger.error("range1:"+range);  
//		logger.error("length:"+length); 
//		// 处理不合理range "bytes=xx1-xx2" xx1=xx2
//		// 过滤掉断点续传"xx-"
//		// range可能形式：null;"";"bytes=xx-";"bytes=xx-xx"
//		if (range != null && range != "" && !range.endsWith("-")) {
//			String rangeBytes = range.replace("bytes=", "");
//			String[] rangeArr = rangeBytes.trim().split("-");
//			long begin = Long.parseLong(rangeArr[0]);
//			long end = Long.parseLong(rangeArr[1]);
//			if (begin == end)
//				range = "";
//		}
//		PAN-772:COMMENT END

//		PAN-772: COMMENT BY HD
//		if (length != null) {
//			long fileLenth = Long.parseLong(length);
//			long rangeEnd = fileLenth - 1;
//			if (range != null && range.endsWith("-")) {
//				if ("".equals(range)) {
//					range = "bytes=0-" + rangeEnd;
//					// range = "bytes=0-" + length;
//				} else {
//					// range = range + length;
//					range = range + rangeEnd;
//					response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
//				}
//			} else if (range == null) {
//				range = "bytes=0-" + rangeEnd;
//				// range = "bytes=0-" + length;
//			}
//		}
//		
//		logger.error("range2:"+range); 
//		PAN-772:COMMENT END

		try {
//		PAN-772:ADD BY HD
			logger.info("web request range: " + range);
			if (range != null) {
				range = range.replaceAll("bytes", "byte");
			}
			logger.info("after repalce bytes web request range: " + range);
			SBoxObject object = sbox.getObject(resourceId, range, secretKey);
			//无法获取内容时，返回404
			if (object == null) {
				logger.info("not found");
				response.setStatus(HttpServletResponse.SC_FORBIDDEN);
				ServletOutputStream outputStream = response.getOutputStream();
				String noteToClient = "Please Check Your Access Right And The Download File Status";
				outputStream.write(noteToClient.getBytes("UTF-8"));
				outputStream.close();
				return;
			}
			
			//正常获取内容
			//续传必须参数
			//从第一个分片开始下载
			String judeFlag = object.getDownFromBegin();
			if (judeFlag != null && judeFlag.equals("0")) {
				response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
			} else {
				response.setStatus(HttpServletResponse.SC_OK);
			}
			//。。。。 服务器返回500，Restlet 拦截Range:Bytes=请求。。。。
			if (object.getStatusCode() != HttpServletResponse.SC_PARTIAL_CONTENT
					&& object.getStatusCode() != HttpServletResponse.SC_OK) {
				InputStream errContent = object.getContent();
				BufferedReader in = new BufferedReader(new InputStreamReader(errContent));
				StringBuffer strBuffer = new StringBuffer();
				String line = "";
				while((line = in.readLine()) != null) {
					strBuffer.append(line);
				}
				logger.info("server return not 200 or 206: " + strBuffer.toString());
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			response.setContentType("application/octet-stream");
			response.setHeader("Accept-Ranges", "bytes");
			response.setHeader("Content-Disposition","attachment; filename=" + getFileName(request,object.getName()));
			response.setHeader("Content-Length", String.valueOf(object.getContentLength()) );
			response.setHeader("Last-Modified", object.getLastModified());
			response.setHeader("Content-Range", object.getContentRange());
			response.setHeader("ETag",object.getETag());
			response.setHeader("Content-MD5", object.getContentMD5());
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
//		PAN-772:ADD END
			
//		PAN-772:COMMENT BY HD
/*			if (object != null) {
				String fileName = object.getName();
				response.setContentType("application/octet-stream");
				// // 设置文件大小
				response.setHeader("Content-Disposition",
						"attachment; filename="
								+ getFileName(request, fileName));
				// 传输文件的范围和文件总长度
				if (range != null) {
					logger.error("range:" + range.toString());
					String rangeBytes = range.replace("bytes=", "");
					String[] rangeArr = rangeBytes.trim().split("-");
					if (rangeArr != null && rangeArr.length > 0) {
						try {
							long begin = Long.parseLong(rangeArr[0]);
							long end = Long.parseLong(rangeArr[1]);
							// TO-DO:"Content-Length" 需要加处理
							String contentRange = new StringBuffer("bytes ")
									.append(begin).append("-").append(end)
									.append("/").append(length).toString();
							response.setHeader("Content-Range", contentRange);
							response.setHeader("Content-Length", String
									.valueOf(end + 1 - begin));
						} catch (NumberFormatException e) {
							e.printStackTrace();
						}
					}
				} else {// 空字段
					response.setHeader("Content-Range", range);
					response.setHeader("Content-Length", length);
				}
				response.setHeader("Accept-Ranges", "bytes");
				//
				String etag = URLEncoder.encode(fileName, "UTF-8");
				response.setHeader("ETag", etag);

				ServletOutputStream outputStream = response.getOutputStream();
				InputStream content = object.getContent();
				byte[] bytes = new byte[1024 * 128];
				int size = -1;
				while ((size = content.read(bytes)) != -1) {
					outputStream.write(bytes, 0, size);
					outputStream.flush();
				}
				content.close();
				outputStream.close();
			}*/
//		PAN-772:COMMENT END
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (IOException e) {
			logger.error("IOException error", e);
			e.printStackTrace();
		}
	}

	public void getManual() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpServletResponse response = ServletActionContext.getResponse();
		response.addHeader("Content-Disposition", "attachment; filename="
				+ getFileName(request, "搜狐企业网盘使用手册.pdf"));
		response.setContentType("application/octet-stream");
		ServletOutputStream outputStream;
		try {
			outputStream = response.getOutputStream();
			InputStream content = new FileInputStream(ToolsUtil.getManualFile());
			byte[] bytes = new byte[1024 * 150];
			int size = -1;
			while ((size = content.read(bytes)) != -1) {
				outputStream.write(bytes, 0, size);
				outputStream.flush();
			}
			content.close();
			outputStream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void getImportExecl() {
		HttpServletRequest request = ServletActionContext.getRequest();
		HttpServletResponse response = ServletActionContext.getResponse();
		response.addHeader("Content-Disposition", "attachment; filename="
				+ getFileName(request, "用户导入模板.xlsx"));
		response.setContentType("application/octet-stream");
		ServletOutputStream outputStream;
		try {
			outputStream = response.getOutputStream();
			InputStream content = new FileInputStream(ToolsUtil
					.getImportExecl());
			byte[] bytes = new byte[1024 * 150];
			int size = -1;
			while ((size = content.read(bytes)) != -1) {
				outputStream.write(bytes, 0, size);
				outputStream.flush();
			}
			content.close();
			outputStream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public String getFileOnLineLink() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String fileOnLineLink = sbox.getFileOnLineLink(resourceId, version,splitId,
					secretKey);
			try {
				String uAcl = sbox.getAcl(resourceId, secretKey);
				JSONObject acls = JSONObject.fromObject(uAcl);
				if (acls.getInt("code") == 200) {
					acl = acls.getString("acl");
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			JSONObject fromObject = JSONObject.fromObject(fileOnLineLink);
			fileName = fromObject.getString("filename");
			String url = fromObject.getString("fileLink");
			String[] split = url.split("\\?");
			String urlhead = split[0].substring(0, split[0].lastIndexOf("/"));
			String urlmidd = split[0].substring(split[0].lastIndexOf("/") + 1);
			setOnLineUrl(urlhead + "/" + URLEncoder.encode(urlmidd, "UTF-8")
					+ "?" + URLEncoder.encode(split[1], "UTF-8"));
			return "onLineView";
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return "resource_deleted";
	}

	public String getFileOnLineLinkForOutLink() {

		// 校验签名
		if (StringUtils.isEmpty(sign) || StringUtils.isEmpty(shareType)
				|| StringUtils.isEmpty(userId)
				|| StringUtils.isEmpty(resourceId) || StringUtils.isEmpty(date)) {
			return "resource_deleted";
		}

		if ("0".equalsIgnoreCase(shareType)) {
			String md5 = genSignForFile(userId, resourceId, date);

			if (!md5.equalsIgnoreCase(sign)) {
				return "resource_deleted";
			}

			outResourceId = resourceId;

		} else {

			String md5 = genSignForDir(userId, userId, date);

			if (!md5.equalsIgnoreCase(sign)) {
				return "resource_deleted";
			}
		}
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String userInfo = null;
		try {
			Date today = new Date();
			userInfo = sbox.getUserByUserId(userId, genSignForDir(userId,
					userId, String.valueOf(today.getTime())), String
					.valueOf(today.getTime()));
		} catch (SBoxClientException e3) {
			// TODO Auto-generated catch block
			e3.printStackTrace();
		}

		SecretKey secretKey = null;

		JSONObject userInfoObject = JSONObject.fromObject(userInfo);
		int userInfoCode = userInfoObject.getInt("code");
		if (userInfoCode == 200) {
			JSONObject userObject = userInfoObject.getJSONObject("user");
			secretKey = new SecretKey(userObject.getString("domain"), userId,
					userObject.getString("secretToken"));
		} else {
			return "resource_deleted";
		}

		try {
			String outLink = sbox.getOutLink(outResourceId, shareType,
					secretKey);
			JSONObject fromObject = JSONObject.fromObject(outLink);
			int code = fromObject.getInt("code");
			if (code == 200) {
				JSONObject outLinkJson = fromObject
						.getJSONObject("outSideChain");
				sharePrivilege = outLinkJson.getString("sharePrivilege");
				language = outLinkJson.getString("language");
				hasPassword = outLinkJson.getInt("hasPassword");
				String fileOnLineLink = sbox.getFileOnLineLink(resourceId,
						version,null,secretKey);
				JSONObject onlinefromObject = JSONObject
						.fromObject(fileOnLineLink);
				fileName = onlinefromObject.getString("filename");
				String url = onlinefromObject.getString("fileLink");
				String[] split = url.split("\\?");
				String urlhead = split[0].substring(0, split[0]
						.lastIndexOf("/"));
				String urlmidd = split[0]
						.substring(split[0].lastIndexOf("/") + 1);
				setOnLineUrl(urlhead + "/"
						+ URLEncoder.encode(urlmidd, "UTF-8") + "?"
						+ URLEncoder.encode(split[1], "UTF-8"));
				return "onLineView";

			} else {
				return "resource_deleted";
			}

		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return "resource_deleted";
	}

	public static String getFileName(HttpServletRequest request, String fileName) {
		String downloadName = fileName;
		try {
			String header = request.getHeader("User-Agent");
			header = (header == null ? "" : header.toLowerCase());
			if (Platform.isWindows()) {// Server is Windows
				if (header.indexOf("msie") > -1) {
					downloadName = downloadName.replaceAll(" ", " ");
					downloadName = new String(downloadName.getBytes(""),
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

	private String genSignForFile(String userId, String fileLasestId,
			String date) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("userId", userId);
		map.put("Filelasestid", fileLasestId);
		map.put("date", date);
		String nvs = SignatureUtil.toPlaintext(map);
		String md5 = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
		return md5;
	}

	private String genSignForDir(String userId, String fileLasestId, String date) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("userId", userId);
		map.put("Resourceid", fileLasestId);
		map.put("date", date);
		String nvs = SignatureUtil.toPlaintext(map);
		String md5 = SignatureUtil.MD5(SignatureUtil.SECRETKEY, nvs, "GBK");
		return md5;
	}

	public String getResourceId() {
		return resourceId;
	}

	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getOnLineUrl() {
		return onLineUrl;
	}

	public void setOnLineUrl(String onLineUrl) {
		this.onLineUrl = onLineUrl;
	}

	public void setLength(String length) {
		this.length = length;
	}

	public String getLength() {
		return length;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getShareType() {
		return shareType;
	}

	public void setShareType(String shareType) {
		this.shareType = shareType;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getSign() {
		return sign;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getSharePrivilege() {
		return sharePrivilege;
	}

	public void setSharePrivilege(String sharePrivilege) {
		this.sharePrivilege = sharePrivilege;
	}

	public String getOutResourceId() {
		return outResourceId;
	}

	public void setOutResourceId(String outResourceId) {
		this.outResourceId = outResourceId;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public int getHasPassword() {
		return hasPassword;
	}

	public void setHasPassword(int hasPassword) {
		this.hasPassword = hasPassword;
	}

	public void setAcl(String acl) {
		this.acl = acl;
	}

	public String getAcl() {
		return acl;
	}
	
	public String getSplitId() {
		return splitId;
	}

	public void setSplitId(String splitId) {
		this.splitId = splitId;
	}

}
