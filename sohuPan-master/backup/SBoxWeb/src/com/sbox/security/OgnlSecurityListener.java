package com.sbox.security;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import ognl.OgnlRuntime;

public class OgnlSecurityListener implements ServletContextListener {

	public void contextDestroyed(ServletContextEvent arg0) {

	}

	public void contextInitialized(ServletContextEvent arg0) {
		OgnlRuntime.setSecurityManager(null);
	}

}

