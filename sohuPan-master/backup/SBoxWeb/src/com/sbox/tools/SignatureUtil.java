package com.sbox.tools;

import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

/**
 * 对称Md5签名工具类
 * 
 * @author yangwei
 * 
 */
public class SignatureUtil {
	
	public static final String SECRETKEY = "souhuUser2012";

	private final static Logger logger = Logger.getLogger(SignatureUtil.class);

	private static final String ALL_CHAR = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

	/**
	 * 随机生成密钥
	 * 
	 * @param length
	 *            密钥长度
	 * @return
	 */
	public static String randomSecret(int length) {
		StringBuilder sb = new StringBuilder();
		Random random = new Random();
		for (int i = 0; i < length; i++) {
			sb.append(ALL_CHAR.charAt(random.nextInt(ALL_CHAR.length())));
		}
		return sb.toString();
	}

	/**
	 * MD5结果转大写
	 * 
	 * @param secret
	 *            密钥
	 * @param plaintext
	 *            明文
	 * @param encoding
	 *            编码
	 * @return
	 */
	public static String MD5(String secret, String plaintext, String encoding) {
		if (StringUtils.isBlank(secret) || StringUtils.isBlank(plaintext))
			return null;

		secret = StringUtils.trim(secret);
		plaintext = secret + StringUtils.trim(plaintext) + secret;

		if (StringUtils.isBlank(encoding)) {
			return DigestUtils.md5Hex(plaintext.getBytes()).toUpperCase();
		} else {
			try {
				return DigestUtils.md5Hex(plaintext.getBytes(encoding))
						.toUpperCase();
			} catch (UnsupportedEncodingException e) {
				logger.info("UnsupportedEncodingException:", e.getCause());
			}
		}
		return null;
	}

	/**
	 * 验证签名
	 * 
	 * @param md5
	 *            被验证的MD5字符串
	 * @param secret
	 *            密钥
	 * @param plaintext
	 *            明文
	 * @param encoding
	 *            编码
	 * @return
	 */
	public static boolean verifySignature(String md5, String secret,
			String plaintext, String encoding) {
		return StringUtils.isNotBlank(md5)
				&& StringUtils.trim(md5).equalsIgnoreCase(
						MD5(secret, plaintext, encoding));
	}


	/**
	 * 将Map整理成待处理明文： 根据Key字母排序整理
	 * 
	 * @param map
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static String toPlaintext(Map<String, String> map) {
		if (map == null || map.isEmpty())
			return null;

		Object[] array = map.entrySet().toArray();

		/**
		 * 字母排列比较器
		 */
		class LetterComparator implements Comparator<Object> {
			public int compare(Object o1, Object o2) {
				Entry<String, String> e1 = (Entry<String, String>) o1;
				Entry<String, String> e2 = (Entry<String, String>) o2;
				return e1.getKey().toLowerCase().compareTo(
						e2.getKey().toLowerCase());
			}
		}

		Arrays.sort(array, new LetterComparator());

		StringBuffer params = new StringBuffer();
		for (int i = 0; i < array.length; i++) {
			Entry<String, String> entry = (Entry<String, String>) array[i];
			params.append(entry.getKey());
			if (entry.getValue() != null)
				params.append(entry.getValue());
		}
		return params.toString();
	}
	

	public static void main(String[] args) {
		String secret = SignatureUtil.randomSecret(128);
		//String sign = "C3958589AFA72700BD69F53089BAC3FA";

		Map<String,String> map=new HashMap<String,String>();
		map.put("userId", "1005");
		map.put("Expiredate", "2012-07-18 20:20:23");
		String nvs = SignatureUtil.toPlaintext(map);
		//String md5 = SignatureUtil.MD5(com.sbox.tools.Constants.SECRETKEY, nvs, "GBK");
		/*sun.misc.BASE64Encoder encoder = new sun.misc.BASE64Encoder();
		System.out.println("ACCESS_ID=" + encoder.encode("FAKE_ACCESS_ID_00002".getBytes()));
		System.out.println("ACCESSKEY=" + encoder.encode("FACKE_ACCESS_SECRET_KEY_!!!!!!_###_00002".getBytes()));*/
		/*System.out.println("md5=" + md5);*/
		/*System.out.println("secret=" + secret);
		System.out.println("plaintext=" + nvs);
		System.out.println("md5=" + md5);
		System.out.println("verifySignature="
				+ SignatureUtil.verifySignature(sign, secret, nvs, "GBK"));

		Map<String, String> map = new HashMap<String, String>();
		map.put("company", "taobao");
		map.put("isdeleted", "false");
		map.put("count", "10");
		map.put("ccc", null);*/
		/*System.out.println("map plaintext=" + SignatureUtil.toPlaintext(map));*/
	}
	
	


}
