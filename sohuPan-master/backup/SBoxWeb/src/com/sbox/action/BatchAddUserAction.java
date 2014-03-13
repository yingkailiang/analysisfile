/**
 * 
 */
package com.sbox.action;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JsonConfig;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.ExeclTools;
import com.sbox.tools.UserInfoModel;

/**
 * @author danhan
 *
 */
public class BatchAddUserAction extends CommonAction {
    private File file = null;
    private String filename = null;
    private String spaceSizeStr = null;
    private int spaceSize = -1;
    private long fileSize = -1l;
    private int code;

    public void setFileFileName(String filename) {
       this.filename = filename;
    }
	
	public String execute() throws Exception {
		String checkRes = checkParamValid();
		if (checkRes != null) {
			putSession("importMessage",checkRes);
			return "importReturn";
		}
		
		//读取文件
		List<String> lines = ExeclTools.importCSVIEL(file);
		if (lines == null) {
			putSession("importMessage",getJsonStr(500,"File reader catch error"));
			return "importReturn";
		}
		//文件非空行数为0
		if (lines.size() == 0) {
			putSession("importMessage",getJsonStr(402,"The file is empty"));
			return "importReturn";
		}
		//判断文件表头
		String line = lines.get(0);
		if ( ExeclTools.checkHeader(line) == false ) {
			putSession("importMessage",getJsonStr(403,"Execl file format error"));
			return "importReturn";
		}
		//只有表头一行数据
		if (lines.size() == 1) {
			putSession("importMessage",getJsonStr(402,"The file is empty"));
			return "importReturn";
		}
		
		//创建用户信息对象列表
		UserInfoModel user = null;
		long spaceSize = Integer.parseInt(spaceSizeStr)*1024l*1024l*1024l;
		List<UserInfoModel> userList = new ArrayList<UserInfoModel>();
		for (int i = 1; i < lines.size(); ++i) {
			user = new UserInfoModel();
			user.setSettledSpaceSize(spaceSize);
			line = lines.get(i);
			String[] params = line.split(",");
			//获取前四列属性
			for (int j = 0;j < params.length && j < 4; ++j) {
				switch (j) {
					case 0:user.setEmail(params[0]);break;
					case 1:user.setNickName(params[1]);break;
					case 2:user.setDepPath(params[2]);break;
					case 3:user.setPhone(params[3]);break;
					default:break;
				}
			}
			userList.add(user);	
		}
		JSONArray listJsonArr = JSONArray.fromObject(userList);
		
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		SecretKey secretKey = getSecretKey();
		String handleRes = sbox.batchAddUser(listJsonArr.toString(),secretKey);
		//处理结果分离errList，便于写入session
		writeToSession(handleRes);
		return "importReturn";
	}
	
	/**
	 * 检查传入各项参数是否符合基本原则:
	 * 非空 && 空间大小属于[1,10] && 文件后缀为*.csv && 文件大小为(0,1M]
	 * @return
	 * 300： 空间参数为空<br>
	 * 301：未上传文件<br>
	 * 302：文件后缀不为csv<br>
	 * 303：web temp文件访问失败<br>
	 * 304:web temp文件属性错误<br>
	 * 400：空间大小不合法<br>
	 * 401：文件大小超过1M<br>
	 * 402：文件内容为空<br>
	 * null：参数正常<br>
	 */
	public String checkParamValid() {

		if ( StringUtils.isBlank(spaceSizeStr) ) {
			return getJsonStr(300,"Space Size Is Empty");
		}
		
		if ( file == null ) {
			return getJsonStr(301,"No File Has Been Getted");
		}
		
		//文件后缀格式错误 TODO:是否可以获取这个参数
		if ( filename.endsWith(".csv") == false ) {
			return getJsonStr(302,"File Appendix Is Not csv");
		}
		
		if (StringUtils.isNotBlank(spaceSizeStr)
				&& file != null) {	
			try {
				spaceSize = Integer.parseInt(spaceSizeStr);
			} catch (NumberFormatException e) {
				return getJsonStr(400,"Space Size Is Not An Integer");
			}
			//分配空间大小不在[1,10]内
			if ( spaceSize > 10 
					|| spaceSize < 1 ) {
				return getJsonStr(400,"The Default Space Allocation Size Is Error");
			}
			
			//文件大小检查
			try {
				fileSize = file.length();
			}catch (SecurityException e) {
				logger.error(e);
				return getJsonStr(303,"File Cant Be Read Because Of Security Reason");
			}
			//文件属性系统信息记录错误导致大小为负
			if ( fileSize < 0 ) {
				return getJsonStr(304,"File Size Error");
			}
			//文件大小超过设置
			if ( fileSize > 1*1024*1024) {
				return getJsonStr(401,"The File Size Is Too Large");
			}
			//文件大小为0
			if ( fileSize == 0 ) {
				return getJsonStr(402,"The File Is Empty");
			}

		}
		
		return null;
	}

	
	public void downloadAddRes(){
		try {
			HttpServletResponse response = ServletActionContext.getResponse();
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("application/octet-stream");
			response.setHeader("Accept-Ranges", "bytes");
			response.setHeader("Content-Disposition","attachment; filename=批量导入失败详情.csv");
			ServletOutputStream outputStream = response.getOutputStream();
			if (getSession("errListNum") == null) {
				outputStream.close();
				return;
			}
			int sum = (Integer) getSession("errListNum");
			byte[] resByte = new byte[sum*512*1024];
			int j = 0;
			for (int i = 0; i < sum; ++i) {
				byte[] temp = (byte[]) getSession("errList"+i);
				System.arraycopy(temp,0, resByte, j, temp.length);
				j += temp.length;
			}
			
			String res = new String(resByte,0,j,"UTF-8");
			JSONArray jsonArr = JSONArray.fromObject(res);
			List<UserInfoModel> userList = jsonArr.toList(jsonArr,new UserInfoModel(),new JsonConfig());
			List<List<String>> writeBack = new ArrayList<List<String>>();
			List<String> line = new ArrayList<String>();
			line.add("账号邮箱,");
			line.add("姓名,");
			line.add("所属部门,");
			line.add("办公电话,");
			line.add("失败原因");
			writeBack.add(line);
			for (UserInfoModel user:userList) {
				line = new ArrayList<String>();
				//"账号邮箱","姓名","所属部门","办公电话"
				line.add(user.getEmail()+",");
				line.add(user.getNickName()+",");
				line.add(user.getDepPath()+",");
				line.add(user.getPhone()+",");
				line.add(user.getErrReason());
				writeBack.add(line);
			}
			line = new ArrayList<String>();
			line.add("总共有" +(writeBack.size()-1)+"个用户导入失败");
			String writeRes = writeBack.toString();
			resByte = writeRes.getBytes("UTF-8");

			outputStream.write(resByte);
			outputStream.flush();
			outputStream.close();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	
	private String getJsonStr(int code,String message) {
		JSONObject json = new JSONObject();
		json.put("code", code);
		json.put("message",message);
		return json.toString();
	}
	
	/**
	 * showNum:错误数提示
	 * errList:错误用户列表
	 * code:
	 * message:
	 * @param res
	 */
	private void writeToSession(String res) {
		if (res == null) {
			putSession("importMessage",res);
			return;
		}
		JSONObject json = JSONObject.fromObject(res);
		int code = json.getInt("code");
		if ( code == 201 || code == 202 ) {
			String errUsers = json.getString("errList");
			if (StringUtils.isBlank(errUsers)) {
				putSession("importMessage",res);
				return;
			}
			try {
				byte[] writeBytes = errUsers.getBytes("UTF-8");
				int max_size = 512*1024;
				byte[] tempBytes = null;
				int length = writeBytes.length;
				int copyLen = max_size;
				int splitNums = 0;
				for(int i = 0; i < length; ++splitNums) {
					if ( i + max_size > length ) {
						copyLen = length -i;
					}
					tempBytes = new byte[copyLen];
					System.arraycopy(writeBytes, i, tempBytes, 0, copyLen);
					putSession("errList"+splitNums,tempBytes);
					i += max_size;
				}
				putSession("errListNum",splitNums);
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
		}
		
		JSONObject temp = new JSONObject();
		temp.put("code", code);
		temp.put("showNum", json.getString("showNum"));
		temp.put("message", json.getString("message"));
		putSession("importMessage",temp.toString());
		return;
	}
	/**
	 * @return the file
	 */
	public File getFile() {
		return file;
	}

	/**
	 * @param file the file to set
	 */
	public void setFile(File file) {
		this.file = file;
	}

	/**
	 * @return the spaceSizeStr
	 */
	public String getSpaceSizeStr() {
		return spaceSizeStr;
	}

	/**
	 * @param spaceSizeStr the spaceSizeStr to set
	 */
	public void setSpaceSizeStr(String spaceSizeStr) {
		this.spaceSizeStr = spaceSizeStr;
	}

	/**
	 * @return the spaceSize
	 */
	public int getSpaceSize() {
		return spaceSize;
	}

	/**
	 * @param spaceSize the spaceSize to set
	 */
	public void setSpaceSize(int spaceSize) {
		this.spaceSize = spaceSize;
	}

	/**
	 * @return the fileSize
	 */
	public long getFileSize() {
		return fileSize;
	}

	/**
	 * @param fileSize the fileSize to set
	 */
	public void setFileSize(long fileSize) {
		this.fileSize = fileSize;
	}

	/**
	 * @return the filename
	 */
	public String getFilename() {
		return filename;
	}

	/**
	 * @param filename the filename to set
	 */
	public void setUploadFilename(String filename) {
		this.filename = filename;
	}
	
}
