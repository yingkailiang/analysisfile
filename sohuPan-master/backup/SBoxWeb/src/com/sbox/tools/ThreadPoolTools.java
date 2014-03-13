package com.sbox.tools;

import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import com.sbox.action.DownloadAssistant;

public class ThreadPoolTools {
	private static ThreadPoolExecutor threadPool = new ThreadPoolExecutor(300,
			100, 356, TimeUnit.DAYS, new SynchronousQueue<Runnable>(),
			new ThreadPoolExecutor.DiscardOldestPolicy());

	public static void execute(Runnable run) {
		threadPool.execute(run);
	}
}
