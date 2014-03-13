package com.sbox.action;

import java.io.InputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.config.IExcelService;
import com.sbox.config.impl.ExcelServiceImpl;
import com.sbox.model.SboxLog;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.AssistantUtil;
import com.sbox.tools.SessionName;

public class ExcelAction extends CommonAction {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	InputStream excelStream;
	private User User = null;
	private Date startTime = null;
	private Date endTime = null;
	private String errorMessage = null;
	private SecretKey secretKey = null;
	private String selectorValue = null;

	@SuppressWarnings( { "unchecked", "rawtypes" })
	public String execute() {
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		SBoxClient sc = SBoxClientInstance.getSboxClient();
		Map<String, Object> map = new HashMap<String, Object>();
		String getlog = null;
		List<SboxLog> logList = null;
		if (User != null) {
			secretKey = User.getSecretKey();
			try {
				DateFormat ft = new SimpleDateFormat("yyyy-MM-dd");// 显示时间格式
				Calendar cd = Calendar.getInstance();// 取得Calendar实例
				Date d = cd.getTime();// 取得当前时间
				System.out.println(ft.format(d));// 显示当前时间
				String startTime1 = getParameter("startTime");
				if (!StringUtils.isEmpty(startTime1)) {
					cd.set(Integer.valueOf(startTime1.substring(0, 4)), Integer
							.valueOf(startTime1.substring(5, 7)) - 1, Integer
							.valueOf(startTime1.substring(8, 10)), 0, 0, 0);// 设置时间
					d = cd.getTime();// 重新取得设置的时间
					startTime = d;
				} else {
					startTime = d;
				}
				String endTime1 = getParameter("endTime");
				if (!StringUtils.isEmpty(endTime1)) {
					cd.set(Integer.valueOf(endTime1.substring(0, 4)), Integer
							.valueOf(endTime1.substring(5, 7)) - 1, Integer
							.valueOf(endTime1.substring(8, 10)), 23, 59, 59);// 设置时间
					d = cd.getTime();// 重新取得设置的时间
					endTime = cd.getTime();
				} else {
					endTime = d;
				}
				selectorValue = getParameter("selectorValue");
				if (StringUtils.isEmpty(selectorValue)) {
					selectorValue = "SBoxCreateDir";
				}
				map.put("startTime", ft.format(startTime));
				map.put("endTime", ft.format(endTime));
				map.put("operation", selectorValue);
				getlog = sc.getLog(map, secretKey);
				try {
					logList = new ArrayList();
					JSONObject js = JSONObject.fromObject(getlog);

					JSONArray array = js.getJSONArray("logs");
					for (int i = 0; i < array.size(); i++) {
						SboxLog sboxlog = new SboxLog();
						JSONObject everyJson = array.getJSONObject(i);
						JSONObject date = everyJson
								.getJSONObject("operationTime");
						Date sboxdate = new Date();
						sboxdate = AssistantUtil.setJsonObjData(sboxdate, date,
								null);
						if (sboxdate != null) {
							sboxlog.setOperationTime(sboxdate);
						}
						sboxlog.setId((long) everyJson.getLong("id"));
						sboxlog.setOperator((long) everyJson
								.getLong("operator"));
						sboxlog.setOperation(everyJson.getString("operation"));
						sboxlog.setResource1(everyJson.getString("resource1"));
						logList.add(i, sboxlog);
						sboxlog = null;
					}
					System.out.println(logList.size());
					if (logList.size() > 0) {

						List<String> userIds = new ArrayList();
						List<String> fileIds = new ArrayList();
						for (int k = 0; k < logList.size(); k++) {
							userIds.add(k, String.valueOf(logList.get(k)
									.getOperator()));
							fileIds.add(k, logList.get(k).getResource1());
						}
						logList = LogManage.getUserInfo(logList, sc, userIds,
								secretKey);
						logList = LogManage.getFileInfo(logList, sc, fileIds,
								secretKey);
					} else {
						errorMessage = "没有查找到相应的记录";
					}

				} catch (JSONException e) {
					e.printStackTrace();
					errorMessage = "API wrong，请重新登录！";
					return "login";
				} catch (Exception e) {
					e.printStackTrace();
					errorMessage = "API wrong，请重新登录！";
					return "login";
				}
			} catch (SBoxClientException e) {
				e.printStackTrace();
			}

		} else {
			errorMessage = "系统错误，请重新登录！";
			return "login";
		}
		IExcelService es = new ExcelServiceImpl();
		excelStream = es.getExcelInputStream(logList);
		return "excel";
	}

	public InputStream getExcelStream() {
		return excelStream;
	}

	public void setExcelStream(InputStream excelStream) {
		this.excelStream = excelStream;
	}

	public User getUser() {
		return User;
	}

	public void setUser(User user) {
		User = user;
	}

}
