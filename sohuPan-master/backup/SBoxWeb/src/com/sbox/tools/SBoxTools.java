package com.sbox.tools;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;

public class SBoxTools {
	private static SBoxTools Tools_Util = new SBoxTools();
	public static SimpleDateFormat Date1 = new SimpleDateFormat(
			"yyyy-MM-dd HH:mm");
	public static SimpleDateFormat Date2 = new SimpleDateFormat(
			"yyyy-MM-dd HH:mm:ss");
	public static SimpleDateFormat Date3 = new SimpleDateFormat("yyyyMM");
	public static SimpleDateFormat Date4 = new SimpleDateFormat("yyyy-MM-dd");
	public static SimpleDateFormat Date5 = new SimpleDateFormat("yyyy-MM");
	private static String[] Number = new String[] { "0", "1", "2", "3", "4",
			"5", "6", "7", "8", "9" };
	private static long version = 0;
	private static String check = "\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*";
	private static Pattern EmailRegex = Pattern.compile(check);

	public static SBoxTools getInstanse() {
		return Tools_Util;
	}

	public static File getManualFile() {
		String configFile = SBoxTools.class.getResource("/").getPath();
		configFile = configFile.substring(0, configFile.indexOf("WEB-INF"))
				+ "download/搜狐企业网盘使用手册.pdf";
		File file = new File(configFile);
		return file;
	}

	public static File getImportExecl() {
		String configFile = SBoxTools.class.getResource("/").getPath();
		configFile = configFile.substring(0, configFile.indexOf("WEB-INF"))
				+ "download/dryhmb.xlsx";
		File file = new File(configFile);
		return file;
	}

	public String getResource(String fileName) throws Exception {
		String resource = this.getClass().getResource("/").getPath();
		String filePath = resource.replaceAll("classes/", "");
		return filePath + fileName;
	}

	public static Object[] concat(Object[] array1, Object[] array2) {
		if (array1 == null && array2 == null) {
			return new Object[0];
		}
		if (array1 == null) {
			return array2;
		}
		if (array2 == null) {
			return array1;
		}
		int length1 = array1.length;
		int length2 = array2.length;
		Object[] concatArray = new Object[length1 + length2];
		System.arraycopy(array1, 0, concatArray, 0, length1);
		System.arraycopy(array2, 0, concatArray, length1, length2);
		return concatArray;
	}

	public static void main(String[] args) {

		Integer[] s = { 1, 2, 3 };
		Integer[] x = { 4, 5 };
		Object[] concat = SBoxTools.concat(s, x);
		System.out.println(concat.length + "\n");
		for (Object o : concat) {
			System.out.println(o);
		}

	}

	public static void wirteFile(byte[] verifyPicture, String fileName) {
		File file = new File(fileName);
		FileOutputStream out = null;
		try {
			out = new FileOutputStream(file);
			out.write(verifyPicture);
			out.flush();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (out != null) {
				try {
					out.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

	}

	public static void wirteFile(InputStream is, String fileName) {
		File file = new File(fileName);
		FileOutputStream out = null;
		try {
			out = new FileOutputStream(file);
			StringBuffer sb = new StringBuffer(256);
			int c = 0;
			while ((c = is.read()) != -1)
				sb.append(c);
			out.write(sb.toString().getBytes());
			out.flush();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (out != null) {
				try {
					out.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

	}

	public static String readString(InputStream is) {
		StringBuffer sb = new StringBuffer(128);
		try {
			InputStreamReader ir = new InputStreamReader(is);
			LineNumberReader input = new LineNumberReader(ir);
			String s = input.readLine();
			sb.append(s);
			while ((s = input.readLine()) != null) {
				sb.append("\n").append(s);
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (is != null) {
				try {
					is.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return sb.toString();

	}

	public static String getFileTxtContent(String fileName) {
		LineNumberReader reader;
		try {
			reader = new LineNumberReader(new FileReader(fileName));
			String s = null;
			StringBuffer sb = new StringBuffer();
			while ((s = reader.readLine()) != null) {
				sb.append(s).append("\n");
			}
			return sb.toString();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public static byte[] concat(byte[] result, byte[] d) {
		if (result == null && d == null) {
			return new byte[0];
		}
		if (result == null || result.length == 0) {
			return d;
		}
		if (d == null || d.length == 0) {
			return result;
		}
		int length1 = result.length;
		int length2 = d.length;
		byte[] concatArray = new byte[length1 + length2];
		System.arraycopy(result, 0, concatArray, 0, length1);
		System.arraycopy(d, 0, concatArray, length1, length2);
		return concatArray;
	}

	public static String toVersionNumber(String name) {
		return Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)] + "_"
				+ (new Date().getTime()) + "v." + (version++);
	}

	public static String createPassowrd() {
		return Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)] + "";
	}

	public static String createDomain() {
		return Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)]
				+ Number[new Random().nextInt(9)];
	}

	public static String toSizeStr(Long calculate) {
		if (calculate == null) {
			return "0 M";
		}
		if (calculate / (1024 * 1024 * 1024) > 0) {
			double result = calculate / (1024 * 1024 * 1024d);
			BigDecimal b = new BigDecimal(result);
			result = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
			return result + " GB";
		} else if (calculate / (1024 * 1024) > 0) {
			double result = calculate / (1024 * 1024d);
			BigDecimal b = new BigDecimal(result);
			result = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
			return result + " MB";
		} else if (calculate / (1024) > 0) {
			double result = calculate / (1024d);
			BigDecimal b = new BigDecimal(result);
			result = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
			return result + " KB";
		} else {
			double result = calculate;
			BigDecimal b = new BigDecimal(result);
			result = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
			return result + " B";
		}
	}

	public static String createLogsTable() {
		Date date = new Date();
		String format = Date3.format(date);
		return "sbox_log_" + format;
	}

	public static String createLogsTableUpMonth() {
		Date date = new Date();
		String format = Date3.format(date);
		String year = format.substring(0, 4);
		String month = format.substring(4, 6);
		int y = Integer.parseInt(year);
		if ("01".equals(month)) {
			return "sbox_log_" + (y - 1) + "12";
		} else if (month.startsWith("0")) {
			int m = Integer.parseInt(month.substring(1));
			return "sbox_log_" + y + "0" + (m - 1);
		} else if ("10".equals(month)) {
			return "sbox_log_" + y + "09";
		} else {
			int m = Integer.parseInt(month);
			return "sbox_log_" + y + (m - 1);
		}
	}

	public static Date addOrderTime(Date closeDate, int addTime, int time) {
		if (TimeUnit.DYA == time) {
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(closeDate);
			calendar.add(Calendar.DAY_OF_MONTH, addTime);
			return calendar.getTime();
		} else if (TimeUnit.MONTH == time) {
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(closeDate);
			calendar.add(Calendar.MONTH, addTime);
			return calendar.getTime();
		} else if (TimeUnit.YEAR == time) {
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(closeDate);
			calendar.add(Calendar.YEAR, addTime);
			return calendar.getTime();
		}
		return closeDate;
	}

	public static boolean isSameMonth(Date closeDate, Date date) {
		String c = Date3.format(closeDate);
		String d = Date3.format(date);
		if (c.equals(d)) {
			return true;
		}
		return false;
	}

	public static boolean isDate(String timestr) {
		try {
			Date4.parse(timestr);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public static boolean checkEmail(String email) {
		Matcher matcher = EmailRegex.matcher(email);
		return matcher.matches();
	}

	public static boolean checkNickName(String nickName) {
		if (StringUtils.isEmpty(nickName)) {
			return false;
		} else if (nickName.length() > 10) {
			return false;
		}
		return true;
	}

	public static boolean checkPassword(String password) {
		if (!StringUtils.isEmpty(password) && password.length() >= 6
				&& password.length() <= 16) {
			return true;
		}
		return false;
	}
}
