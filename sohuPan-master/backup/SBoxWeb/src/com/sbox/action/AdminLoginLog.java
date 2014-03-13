package com.sbox.action;

import java.text.ParseException;
import java.util.Date;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.SboxAppLog;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxAccount;
import com.sbox.sdk.client.model.SBoxUser;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.Page;
import com.sbox.tools.SessionName;
import com.sbox.tools.TimeUnit;
import com.sbox.tools.ToolsUtil;



public class AdminLoginLog extends CommonAction {

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
	private String userEmail;

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

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
			SboxAppLog sboxAppLog = makeQuerySboxAppLog();
			String getlog = sc.GetAdminUserLoginLog(sboxAppLog.getStartTime(), sboxAppLog.getEndTime(), userEmail, sboxAppLog.getPageIndex(), sboxAppLog.getPagenum(), secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("sboxBusLogList");
			page.setAllMessage((Integer) js.get("total"));
			putSession(SessionName.ADMINLOGINLOGSESSION, page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "success";
	}

	

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String nextPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = (Page) getSession(SessionName.ADMINLOGINLOGSESSION);
			page.nextPage();
			int pindex = page.getNowPage();
			SboxAppLog sboxAppLog = makeQuerySboxAppLog();
			String getlog = sc.GetAdminUserLoginLog(sboxAppLog.getStartTime(), sboxAppLog.getEndTime(), userEmail, sboxAppLog.getPageIndex(), sboxAppLog.getPagenum(), secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("sboxBusLogList");
			page.setAllMessage((Integer) js.get("total"));
			page.setNowPage(pindex);
			putSession(SessionName.ADMINLOGINLOGSESSION, page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "success";
	}

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String prevPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = (Page) getSession(SessionName.ADMINLOGINLOGSESSION);
			page.prevPage();
			int pindex = page.getNowPage();
			SboxAppLog sboxAppLog = makeQuerySboxAppLog();
			String getlog = sc.GetAdminUserLoginLog(sboxAppLog.getStartTime(), sboxAppLog.getEndTime(), userEmail, sboxAppLog.getPageIndex(), sboxAppLog.getPagenum(), secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("sboxBusLogList");
			page.setAllMessage((Integer) js.get("total"));
			page.setNowPage(pindex);
			putSession(SessionName.ADMINLOGINLOGSESSION, page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "success";
	}

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String setPage() {
		try {
			SecretKey secretKey = getSecretKey();
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			page = (Page) getSession(SessionName.ADMINLOGINLOGSESSION);
			page.setNowPage(getNowPage());
			int pindex = page.getNowPage();
			SboxAppLog sboxAppLog = makeQuerySboxAppLog();
			String getlog = sc.GetAdminUserLoginLog(sboxAppLog.getStartTime(), sboxAppLog.getEndTime(), userEmail, sboxAppLog.getPageIndex(), sboxAppLog.getPagenum(), secretKey);
			JSONObject js = JSONObject.fromObject(getlog);
			logs = js.getJSONArray("sboxBusLogList");
			page.setAllMessage((Integer) js.get("total"));
			page.setNowPage(pindex);
			putSession(SessionName.ADMINLOGINLOGSESSION, page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "success";
	}

     protected SboxAppLog makeQuerySboxAppLog() {
		
		SboxAppLog sboxAppLog = new SboxAppLog();
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
		
		sboxAppLog.setStartTime(start);
		sboxAppLog.setEndTime(end);
		sboxAppLog.setPageIndex(String.valueOf(page.getFirst()));
		sboxAppLog.setPagenum(String.valueOf(page.getMaxShow()));
		// status  值
		if(StringUtils.isEmpty(selectorValue))
		{
			//不设置值
		}else
		{
			if("SBoxDeleteObject,SBoxDeleteDir".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("3");
			}
			if("SBoxUploadComplete".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("0");
				sboxAppLog.setResourceType(0);
			}
			if("SBoxCreateDir".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("0");
				sboxAppLog.setResourceType(1);
			}
			if("SBoxRenameObject,SBoxRenameDir".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("1");
			}
			if("SBoxMoveDir,SBoxMoveObject".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("2");
			}
			if("SBoxMovRestoreDir,SBoxMovRestoreObject".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setFlag(1);
			}
			if("shareDir".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("7");
				sboxAppLog.setResourceType(1);
			}
			if("unshareDir".equalsIgnoreCase(selectorValue))
			{
				sboxAppLog.setStatus("8");
				sboxAppLog.setResourceType(1);
			}
			
		}
		
		return sboxAppLog;
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
