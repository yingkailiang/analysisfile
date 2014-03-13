package com.sbox;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import net.sf.json.JSONObject;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.JUnitCore;
import org.junit.runner.Request;

public class DirTest {
	private static final Logger logger = Logger.getLogger(DirTest.class);
	public static ExecutorService exec = Executors.newFixedThreadPool(20);

	class DirRun implements Runnable {

		public void run() {
			HttpClient httpclient = new DefaultHttpClient();
			HttpPost post = new HttpPost(
					"http://localhost/fs/mkdir?user_id=897&parent_id=897&name=newfile8&platform=web");
			HttpResponse response = null;
			try {
				response = httpclient.execute(post);
				if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
					System.err.println(JSONObject.fromObject(EntityUtils
							.toString(response.getEntity())));
					// logger.warn(JSONObject.fromObject(EntityUtils.toString(response.getEntity())));
				}
				post.releaseConnection();
			} catch (ClientProtocolException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}

	}

	public static void setUpBeforeClass() {

	}

	public void tearDown() throws Exception {
	}

	@Test
	public void testrun() {
		HttpClient httpclient = new DefaultHttpClient();
		HttpPost post = new HttpPost(
				"http://localhost/fs/mkdir?user_id=897&parent_id=897&name=newfile&platform=web");
		HttpResponse response = null;
		try {
			response = httpclient.execute(post);
			if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				logger.warn(JSONObject.fromObject(EntityUtils.toString(response
						.getEntity())));
			}
			post.releaseConnection();
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	public void test() {
		// DirTest dt=new DirTest();
		// for(int i=0;i<1;i++)
		// exec.execute(dt.new DirRun());
		DirTest dt = new DirTest();
		DirRun dr = dt.new DirRun();
		for (int i = 0; i < 30; i++)
			new Thread(dr).run();
	}

	public static void main(String[] args) {
		for (int i = 0; i < 50; i++) {
			new Thread() {
				public void run() {
					new JUnitCore().run(Request.method(DirTest.class, "testrun"));
				}
			}.start();
		}
	}

}
