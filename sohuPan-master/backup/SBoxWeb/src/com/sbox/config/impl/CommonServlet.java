package com.sbox.config.impl;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.ServletActionContext;

import com.sbox.model.User;
import com.sbox.tools.SecurityResult;

public class CommonServlet {
	public String getCookieValue(HttpServletRequest request, String name) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		String result = null;
		for (Cookie cookie : cookies) {
			if (cookie.getName().equals(name)) {
				result = cookie.getValue();
				break;
			}
		}
		return result;
	}

	public User loginUsedAuthor(SecurityResult author) {
		return null;
	}
}
