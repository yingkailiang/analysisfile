package com.sbox.action;

import java.io.IOException;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.sbox.action.base.CommonAction;
import com.sbox.tools.SecurityTools;
import com.sbox.tools.SessionName;

/**
 * 
 * 
 * @author Jack.wu.xu
 */
public class LoginPage extends CommonAction {
	private static final Logger logger = Logger.getLogger(Login.class);
	public String to() {
		putSession(SessionName.USER, null);
		HttpSession session = ServletActionContext.getRequest().getSession();
		session.invalidate();
		addCookie(SecurityTools.COOKIE_KEY, "");
		return "ajaxLoginPage";
	}
	public String flash() {
		putSession(SessionName.USER, null);
		HttpSession session = ServletActionContext.getRequest().getSession();
		session.invalidate();
		addCookie(SecurityTools.COOKIE_KEY, "");
		return "flashLoginPage";
	}

}
