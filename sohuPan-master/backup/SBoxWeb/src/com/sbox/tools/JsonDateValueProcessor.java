package com.sbox.tools;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import net.sf.json.processors.JsonValueProcessor;

public class JsonDateValueProcessor implements JsonValueProcessor {

	private String format = "yyyy-MM-dd HH:mm:ss";

	private Object process(Object value) {
		if (value instanceof Date) {
			SimpleDateFormat sdf = new SimpleDateFormat(format, Locale.UK);
			return sdf.format(value);
		}
		return value == null ? "" : value.toString();
	}

	public Object processArrayValue(Object arg0, net.sf.json.JsonConfig arg1) {
		return process(arg0);
	}

	public Object processObjectValue(String arg0, Object arg1,
			net.sf.json.JsonConfig arg2) {
		return process(arg1);
	}
}


		
	
