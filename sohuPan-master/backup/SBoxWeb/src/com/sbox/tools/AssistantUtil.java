package com.sbox.tools;

import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import net.sf.json.JSONObject;

/**
 * @author :horson.ma
 * @version :2012-7-6 下午3:08:27 类说明
 */

public class AssistantUtil {

	private static final SimpleDateFormat sdf = new SimpleDateFormat(
			"yyyy-MM-dd HH:mm:ss");

	private static final String TIME_FORMAT_LONG = "yyyy-MM-dd HH:mm:ss";
	private static final String TIME_FORMAT_SHORT = "yyyy-MM-dd";

	/**
	 * 把JSON数据转换成JAVA对象 description: 函数的目的/功能
	 */
	public static Date setJsonObjData(Object obj, JSONObject data,
			String[] excludes) throws Exception {

		// 反射获取所有方法
		Method[] methods = obj.getClass().getDeclaredMethods();
		if (null != methods) {

			for (Method m : methods) {

				String methodName = m.getName();

				if (methodName.startsWith("set")) {

					methodName = methodName.substring(3);
					// 获取属性名称
					methodName = methodName.substring(0, 1).toLowerCase()
							+ methodName.substring(1);

					if (!methodName.equalsIgnoreCase("class")
							&& !isExistProp(excludes, methodName)) {
						try {
							m
									.invoke(obj, new Object[] { data
											.get(methodName) });
						} catch (IllegalArgumentException e1) {
							if (m.getParameterTypes()[0].getName().equals(
									"java.lang.Long")) {
								m.invoke(obj, new Object[] { Long.valueOf(data
										.get(methodName).toString()) });
							} else if (m.getParameterTypes()[0].getName()
									.equals("java.util.Date")) {
								m.invoke(obj, new Object[] { !data
										.has(methodName) ? sdf.parse(data.get(
										methodName).toString()) : null });
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			}
		}
		return (Date) obj;

	}

	private static boolean isExistProp(String[] excludes, String prop) {
		if (null != excludes) {
			for (String exclude : excludes) {
				if (prop.equals(exclude)) {
					return true;
				}
			}
		}
		return false;
	}

	public static String changeToString(Date date)
			throws java.text.ParseException {
		String hql = date.toString();
		SimpleDateFormat simples = new SimpleDateFormat(
				"EEE MMM dd HH:mm:ss z yyyy", Locale.US);
		Date datenew = simples.parse(hql);
		SimpleDateFormat simple = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		return simple.format(datenew);
	}

}
