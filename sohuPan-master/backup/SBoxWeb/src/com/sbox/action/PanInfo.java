package com.sbox.action;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

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
public class PanInfo extends Login {
	private static final Logger logger = Logger.getLogger(PanInfo.class);
	private int openNumber;
	private int groupNumber;
	private long spaceUsed;
	private String spaceUsedStr;
	private String allSpace;
	private String title = "管理后台";

	@SuppressWarnings("unchecked")
	public String get() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String login = sbox.login(secretKey);
			JSONObject js = JSONObject.fromObject(login);
			loadUserInfo(js);
			String panIfo = sbox.getPanInfo(secretKey);
			JSONObject panObject = JSONObject.fromObject(panIfo);
			JSONObject jMap = panObject.getJSONObject("result");
			openNumber = jMap.getInt("OpenNumber");
			groupNumber = jMap.getInt("AlreadyCreateGroups");
			Long usedSzie = jMap.getLong("UsedSapce");
			Long buySize = jMap.getLong("BuySpace");
			double result = (double) usedSzie / (double) buySize;
			BigDecimal b = new BigDecimal(result);
			result = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
			spaceUsed = new Double(result * 100l).longValue();
			allSpace = ToolsUtil.toSizeStr(buySize);
			spaceUsedStr = ToolsUtil.toSizeStr(usedSzie) + " / " + allSpace;
		} catch (SBoxClientException e) {
			logger.error("SBox API error", e);
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "panInfo";
	}

	public void setOpenNumber(int openNumber) {
		this.openNumber = openNumber;
	}

	public int getOpenNumber() {
		return openNumber;
	}

	public void setGroupNumber(int groupNumber) {
		this.groupNumber = groupNumber;
	}

	public int getGroupNumber() {
		return groupNumber;
	}

	public void setSpaceUsed(long spaceUsed) {
		this.spaceUsed = spaceUsed;
	}

	public long getSpaceUsed() {
		return spaceUsed;
	}

	public void setSpaceUsedStr(String spaceUsedStr) {
		this.spaceUsedStr = spaceUsedStr;
	}

	public String getSpaceUsedStr() {
		return spaceUsedStr;
	}

	public void setAllSpace(String allSpace) {
		this.allSpace = allSpace;
	}

	public String getAllSpace() {
		return allSpace;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
}
