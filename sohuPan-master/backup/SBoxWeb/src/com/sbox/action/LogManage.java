package com.sbox.action;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.SboxLog;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.Page;
import com.sbox.tools.TimeUnit;
import com.sbox.tools.ToolsUtil;

/**
 * @author :Jack.wu.xu
 * @version :2012-7-5 下午2:47:09 日志信息管理类，查看各种类型的日志操作记录以及对应的日志信息
 */
public class LogManage extends CommonAction {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private SBoxAccount account = null;
	private SBoxUser suser = null;
	private User User = null;
	private Page page;
	private String errorMessage = null;
	private String startTime = null;
	private String endTime = null;
	private String defaultValue = "SBoxDeleteObject,SBoxDeleteDir,SBoxUploadComplete,SBoxGetObject,"
			+ "SBoxGetObjectVersion,SBoxCreateDir,SBoxMoveDir,SBoxMoveObject,"
			+ "SBoxDeleteOutChain,SBoxCreateOutsideChain";
	private String pageNum = null;
	private String selectorValue = "SBoxDeleteObject,SBoxDeleteDir,SBoxUploadComplete,SBoxGetObject,"
			+ "SBoxGetObjectVersion,SBoxCreateDir,SBoxMoveDir,SBoxMoveObject,"
			+ "SBoxDeleteOutChain,SBoxCreateOutsideChain";
	private JSONArray logs;
	private int nowPage;

	public JSONArray getLogs() {
		return logs;
	}

	public void setLogs(JSONArray logs) {
		this.logs = logs;
	}

	public String toPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = new Page();
			Map<String, Object> map = makeQueryMap();
			String getlog = sc.getLog(map, secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("logs");
			page.setAllMessage((Integer) js.get("totalNum"));
			putSession("Log_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "allLog";
	}

	protected Map<String, Object> makeQueryMap() {
		boolean startFlag = ToolsUtil.isDate(startTime);
		boolean endFlag = ToolsUtil.isDate(endTime);
		Date now = new Date();
		String format = ToolsUtil.Date4.format(now);
		if (!startFlag && startTime != null) {
			startTime = format;
		} else if (startFlag) {
			Date addOrderTime = ToolsUtil.addOrderTime(now, -1, TimeUnit.MONTH);
			try {
				Date parse = ToolsUtil.Date4.parse(startTime);
				if (addOrderTime.after(parse)) {
					startTime = ToolsUtil.Date4.format(addOrderTime);
				}
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		if (!endFlag && endTime != null) {
			endTime = format;
		} else if (endFlag) {
			Date addOrderTime = ToolsUtil.addOrderTime(now, -1, TimeUnit.MONTH);
			addOrderTime = ToolsUtil.addOrderTime(addOrderTime, -1,
					TimeUnit.DYA);
			try {
				Date parse = ToolsUtil.Date4.parse(startTime);
				if (addOrderTime.after(parse)) {
					endTime = ToolsUtil.Date4.format(addOrderTime);
				}
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		String start = ((!StringUtils.isEmpty(startTime) && startFlag) ? startTime
				: ToolsUtil.Date4.format(now))
				+ " 00:00:00";
		if (StringUtils.isEmpty(startTime)) {
			startTime = ToolsUtil.Date4.format(now);
		}
		String end = ((!StringUtils.isEmpty(endTime) && endFlag) ? endTime
				: ToolsUtil.Date4.format(now))
				+ " 23:59:59";
		if (StringUtils.isEmpty(endTime)) {
			endTime = ToolsUtil.Date4.format(now);
		}
		selectorValue = StringUtils.isEmpty(selectorValue) ? defaultValue
				: selectorValue;
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("startTime", start);
		map.put("endTime", end);
		map.put("start", page.getFirst());
		map.put("perPageLines", page.getMaxShow());
		String[] operations = selectorValue.split(",");
		map.put("operation", operations);
		return map;
	}

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String nextPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = (Page) getSession("Log_Session");
			page.nextPage();
			int pindex = page.getNowPage();
			Map<String, Object> map = makeQueryMap();
			String getlog = sc.getLog(map, secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("logs");
			page.setAllMessage((Integer) js.get("totalNum"));
			page.setNowPage(pindex);
			putSession("Log_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "allLog";
	}

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String prevPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = (Page) getSession("Log_Session");
			page.prevPage();
			int pindex = page.getNowPage();
			Map<String, Object> map = makeQueryMap();
			String getlog = sc.getLog(map, secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("logs");
			page.setAllMessage((Integer) js.get("totalNum"));
			page.setNowPage(pindex);
			putSession("Log_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "allLog";
	}

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String setPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = (Page) getSession("Log_Session");
			page.setNowPage(getNowPage());
			int pindex = page.getNowPage();
			Map<String, Object> map = makeQueryMap();
			String getlog = sc.getLog(map, secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("logs");
			page.setAllMessage((Integer) js.get("totalNum"));
			page.setNowPage(pindex);
			putSession("Log_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "allLog";
	}

	// public String getAllLog() {
	// ActionContext context = ActionContext.getContext();
	// Map<String, Object> session = context.getSession();
	// User = (User) session.get(SessionName.USER);
	// SBoxClient sc = SBoxClientInstance.getSboxClient();
	// Map<String, Object> map = new HashMap<String, Object>();
	// String getlog = null;
	// if (User != null) {
	// secretKey = User.getSecretKey();
	// try {
	// suser = User.getUser();
	// DateFormat ft = new SimpleDateFormat("yyyy-MM-dd");// 显示时间格式
	// Calendar cd = Calendar.getInstance();// 取得Calendar实例
	// Date curTime = cd.getTime();// 取得当前时间
	// startTime = getParameter("startTime");
	// if (StringUtils.isEmpty(startTime)) {
	// startTime = ft.format(curTime);
	// }
	// endTime = getParameter("endTime");
	// if (StringUtils.isEmpty(endTime)) {
	// endTime = ft.format(curTime);
	// }
	// if (ft.parse(startTime).after(ft.parse(endTime))) {
	// startTime = endTime;
	// }
	// selectorValue = getParameter("selectorValue");
	// if (StringUtils.isEmpty(selectorValue)) {
	// selectorValue =
	// "SBoxDeleteObject,SBoxDeleteDir,SBoxUploadComplete,SBoxGetObject," +
	// "SBoxGetObjectVersion,SBoxCreateDir,SBoxMoveDir,SBoxMoveObject," +
	// "SBoxDeleteOutChain,SBoxCreateOutsideChain";
	// }
	// if (!StringUtils.isEmpty(startTime)
	// && !StringUtils.isEmpty(startTime)) {
	// map.put("startTime", startTime + " 00:00:00");
	// map.put("endTime", endTime + " 23:59:59");
	// }
	// if (!StringUtils.isEmpty(selectorValue)) {
	// String[] operations = selectorValue.split(",");
	// map.put("operation", operations);
	// }
	// // add-start
	// pageNum = getParameter("pageNum");
	// if (!StringUtils.isEmpty(pageNum)) {
	// map.put("start", (Integer.valueOf(pageNum) - 1)
	// * perPageLines);
	// map.put("perPageLines", perPageLines);
	// } else {
	// pageNum = "1";
	// map.put("start", 0);
	// map.put("perPageLines", perPageLines);
	// }
	// // add-end
	// getlog = sc.getLog(map, secretKey);
	// try {
	// JSONObject js = JSONObject.fromObject(getlog);
	// logs = js.getJSONArray("logs");
	// Integer totalNum = (Integer) js.get("totalNum");
	// int booPageNum = 0;
	// if(totalNum % perPageLines>0){
	// booPageNum=totalNum / perPageLines+ 1;
	// }else{
	// booPageNum=totalNum / perPageLines;
	// }
	// if (Integer.valueOf(pageNum) > booPageNum) {
	// pageNum = "1";
	// map.put("start", 0);
	// map.put("perPageLines", perPageLines);
	// getlog = sc.getLog(map, secretKey);
	// js = JSONObject.fromObject(getlog);
	// logs = js.getJSONArray("logs");
	// }
	// // add--start
	// if (logs.size() > 0) {
	// if (totalNum == null) {
	// totalNum = logs.size();
	// }
	//
	// pageInfo = pageInfo.getPerPage(logs, perPageLines,
	// Integer.valueOf(pageNum), totalNum);
	// }
	//
	//
	// } catch (JSONException e) {
	// e.printStackTrace();
	// errorMessage = "API wrong，请重新登录！";
	// return "index";
	// } catch (Exception e) {
	// e.printStackTrace();
	// errorMessage = "API wrong，请重新登录！";
	// return "index";
	// }
	// } catch (SBoxClientException e) {
	// e.printStackTrace();
	// } catch (ParseException e) {
	// e.printStackTrace();
	// }
	//
	// } else {
	// errorMessage = "系统错误，请重新登录！";
	// return "index";
	// }
	// return "allLog";
	// }

	public static List getUserInfo(List items, SBoxClient sc, List userIds,
			SecretKey secretKey) {
		try {
			String userInfo = sc.batchUserInfo(userIds, secretKey.getDomain(),
					secretKey);
			JSONObject js = JSONObject.fromObject(userInfo);
			JSONArray array = js.getJSONArray("sboxUserList");
			for (int i = 0; i < items.size(); i++) {
				SboxLog item = (SboxLog) items.get(i);
				for (int j = 0; j < array.size(); j++) {
					JSONObject everyJson = array.getJSONObject(j);
					if (everyJson.getLong("id") == item.getOperator()) {
						item.setOperatorName(everyJson.getString("loginName"));
					}
				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return items;
	}

	public static List getFileInfo(List items, SBoxClient sc, List fileIds,
			SecretKey secretKey) {
		try {
			String fileInfo = sc.batchFileInfo(fileIds, secretKey);
			JSONObject js = JSONObject.fromObject(fileInfo);
			JSONArray array = js.getJSONArray("sboxFileLatestList");
			for (int i = 0; i < items.size(); i++) {
				SboxLog item = (SboxLog) items.get(i);
				for (int j = 0; j < array.size(); j++) {
					JSONObject everyJson = array.getJSONObject(j);
					if (everyJson.getString("id").equals(item.getResource1())) {
						item.setFileName(everyJson.getString("name"));
						String fileName = item.getFileName();
						item.setFileType(fileName.substring(fileName
								.lastIndexOf(".") + 1));
						item.setFilePath(everyJson.getString("belongDir"));
					}

				}

			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return items;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}

	public SBoxAccount getAccount() {
		return account;
	}

	public void setAccount(SBoxAccount account) {
		this.account = account;
	}

	public SBoxUser getSuser() {
		return suser;
	}

	public void setSuser(SBoxUser suser) {
		this.suser = suser;
	}

	public User getUser() {
		return User;
	}

	public void setUser(User user) {
		User = user;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getPageNum() {
		return pageNum;
	}

	public void setPageNum(String pageNum) {
		this.pageNum = pageNum;
	}

	public String getSelectorValue() {
		return selectorValue;
	}

	public void setSelectorValue(String selectorValue) {
		this.selectorValue = selectorValue;
	}

	public void setPage(Page page) {
		this.page = page;
	}

	public Page getPage() {
		return page;
	}

	public void setNowPage(int nowPage) {
		this.nowPage = nowPage;
	}

	public int getNowPage() {
		return nowPage;
	}

}
