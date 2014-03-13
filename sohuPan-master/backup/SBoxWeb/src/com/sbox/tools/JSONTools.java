package com.sbox.tools;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

public class JSONTools {
	protected static final Logger logger = Logger.getLogger(JSONTools.class);

	public static <T extends Object> Object toModel(Class<T> classType,
			JSONObject json) {
		T newInstance = null;
		try {
			newInstance = classType.newInstance();
		} catch (InstantiationException e1) {
			e1.printStackTrace();
		} catch (IllegalAccessException e1) {
			e1.printStackTrace();
		}
		Field fields[] = classType.getDeclaredFields();

		for (int i = 0; i < fields.length; i++) {
			Field field = fields[i];
			String fieldName = field.getName();
			try {
				if (!"serialVersionUID".equals(fieldName)) {
					String firstLetter = fieldName.substring(0, 1)
							.toUpperCase();
					String setMethodName = "set" + firstLetter
							+ fieldName.substring(1);
					// 获得和属性对应的 setXXX()方法
					Method setMethod = null;
					Class<?> type = field.getType();
					setMethod = classType.getMethod(setMethodName,
							new Class[] { type });
					// 调用原对象的 setXXX()方法
					Object obj = json.get(fieldName);
					if ("java.lang.Long".endsWith(type.getName())) {
						if (obj instanceof Integer) {
							obj = new Long((Integer) obj);
						}
					} else if ("java.lang.Integer".endsWith(type.getName())) {
						if (obj instanceof Integer) {
							obj = (Integer) obj;
						}
					} else if ("java.lang.Byte".endsWith(type.getName())) {
						if (obj instanceof Integer) {
							obj = ((Integer) obj).byteValue();
						}
					}
					if ("java.util.Date".endsWith(type.getName())
							&& (obj instanceof String)) {
						// SimpleDateFormat Date2 = new SimpleDateFormat(
						// "yyyy-MM-dd HH:mm:ss");
						obj = ToolsUtil.Date2.parse(obj.toString());
					}
					if (obj != null)
						setMethod.invoke(newInstance, new Object[] { obj });
				}
			} catch (IllegalArgumentException e) {
				logger.debug("json exception:", e);
			} catch (IllegalAccessException e) {
				logger.debug("json exception:", e);
			} catch (InvocationTargetException e) {
				logger.debug("json exception:", e);
			} catch (SecurityException e) {
				logger.debug("json exception:", e);
			} catch (NoSuchMethodException e) {
				logger.debug("json exception:", e);
			} catch (JSONException e) {
				logger.debug("json exception:", e);
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		return newInstance;
	}
}
