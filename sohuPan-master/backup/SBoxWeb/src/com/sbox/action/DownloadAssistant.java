package com.sbox.action;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sbox.action.base.Platform;
import com.sbox.sdk.client.model.SBoxObject;

public class DownloadAssistant implements Runnable {

	private SBoxObject object;
	private HttpServletResponse response;
	private HttpServletRequest request;

	public DownloadAssistant(SBoxObject object, HttpServletResponse response,
			HttpServletRequest request, String range) {
		super();
		this.object = object;
		this.response = response;
		this.request = request;
		this.range = range;
	}

	private String range;

	@Override
	public void run() {
		ServletOutputStream outputStream = null;
		InputStream content = null;
		try {
			if (object != null) {
				String fileName = object.getName();
				response.setContentType("application/x-msdownload");
				// 设置文件大小
				response.setHeader("Content-Disposition",
						"attachment; filename="
								+ GetFile.getFileName(request, fileName));
				response.setHeader("Range", range);
				response.setHeader("Content-Length", object.getContentLength()
						+ "");
				response.setContentLength(new Long(object.getContentLength())
						.intValue());
				// response.setHeader("Accept-Ranges", "none");
				outputStream = response.getOutputStream();
				content = object.getContent();
				byte[] bytes = new byte[1024 * 150];
				int size = -1;
				while ((size = content.read(bytes)) != -1) {
					outputStream.write(bytes, 0, size);
				}
				outputStream.flush();
			}
		} catch (IOException e) {
			// logger.error("IOException error", e);
			e.printStackTrace();
		} finally {
			try {
				outputStream.close();
				content.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

}
