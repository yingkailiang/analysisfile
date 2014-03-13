package com.sbox;

import com.sbox.action.base.SBoxClientInstance;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.security.credentials.SBoxCredentials;
import com.sbox.tools.MD5Util;

public class Main {
	public static void main(String[] args){
		String id1 = MD5Util.MD5("1020");
		String id2 = MD5Util.MD5("1021");
		System.out.println("id1 : " + id1);
		System.out.println("id2 : " + id2);
//		SBoxClient sbox = SBoxClientInstance.getSboxClient();
//		SBoxCredentials secretKey;
//		sbox.getObject("be444163-ba44-4091-9b82-d06d6d893384", "bytes=1024-", secretKey);
	}
}
