package com.sbox.tools;

import java.security.NoSuchAlgorithmException;
import java.util.Calendar;
import java.util.Date;

import javax.servlet.ServletContext;

import org.apache.struts2.ServletActionContext;

public class SecurityTools {
	public static final String COOKIE_KEY = "ibox";
	public static final String PASSWORD = "@#com1983";
	public static final String SALT = "pandmain";
	public static final String OUTPERIOD = "loginouttime";
	public static final String DELETE_KEY = "delete_key";

	public static void main(String[] args) throws NoSuchAlgorithmException {
		String createSecretKeyId = createSecretKeyId("jack.wu.xu@gmail.com",
				"@#com1983");
		System.out.println(createSecretKeyId);
		SecurityResult author = author(createSecretKeyId);
		if (author.isSuccess()) {
			System.out.println(author.getLoginName());
			System.out.println(author.getPassword());
		}
	}

	public static String createSecretKeyId(String loginName, String password) {
		try {
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(new Date());
			calendar.add(Calendar.WEEK_OF_MONTH, 2);
			Date time = calendar.getTime();
			String format = ToolsUtil.Date2.format(time);
			System.out.println(format);
			StringBuffer sb = new StringBuffer();
			sb.append(loginName + "\n");
			sb.append(time.getTime() + "\n");
			sb.append(password + "\n");
			sb.append(getIp() + "\n");
			byte[] encrypt = PBECode.encrypt(sb.toString().getBytes(),
					PASSWORD, SALT.getBytes());
			return PBECode.parseByte2HexStr(encrypt);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "";
	}

	protected static String getIp() {
		String ip = ServletActionContext.getRequest().getHeader(
				"X-Forwarded-For");
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = ServletActionContext.getRequest().getHeader("Proxy-Client-IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = ServletActionContext.getRequest().getHeader(
					"WL-Proxy-Client-IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = ServletActionContext.getRequest().getHeader("HTTP_CLIENT_IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = ServletActionContext.getRequest().getHeader(
					"HTTP_X_FORWARDED_FOR");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = ServletActionContext.getRequest().getRemoteAddr();
		}
		return ip;
	}

	public static SecurityResult author(String secretKey) {
		SecurityResult sr = new SecurityResult();
		try {
			byte[] decryption = PBECode.decrypt(PBECode
					.parseHexStr2Byte(secretKey), PASSWORD, SALT.getBytes());
			String login = new String(decryption);
			String[] split = login.split("\n");
			if (split.length == 4) {
				String password = split[2];
				String loginName = split[0];
				String expirdate = split[1];
				String ip = split[3];
				long expirtime = Long.parseLong(expirdate);
				if (expirtime < System.currentTimeMillis()) {
					sr.setFailureReason("免登陆已经超期");
				} else if (ip.equals("")) {
					sr.setFailureReason("网络环境变化，请重新登陆");
				} else {
					sr.setSuccess(true);
					sr.setLoginName(loginName);
					sr.setPassword(password);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return sr;
	}
}
