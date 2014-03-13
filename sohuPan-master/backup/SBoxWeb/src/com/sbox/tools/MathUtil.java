package com.sbox.tools;

import java.math.BigDecimal;

public class MathUtil {
	public static Double addDoubles(Double value, Double addValue) {
		BigDecimal sum = new BigDecimal(0.0D);
		if (value != null) {
			sum = new BigDecimal(value.toString());
		}
		if (addValue != null) {
			sum = sum.add(new BigDecimal(addValue.toString()));
		}
		return new Double(sum.doubleValue());
	}

	public static Double multiply(Object value1, Object value2) {
		if ((value1 == null) || (value2 == null)) {
			return new Double(0.0D);
		}
		BigDecimal val1 = new BigDecimal(value1.toString());
		BigDecimal val2 = new BigDecimal(value2.toString());

		return new Double(val1.multiply(val2).doubleValue());
	}

	public static Integer addInteger(Integer value, Integer addValue) {
		int sum = 0;
		if (value != null) {
			sum = value.intValue();
		}
		if (addValue != null) {
			sum += addValue.intValue();
		}
		return new Integer(sum);
	}
}