package com.sbox.action;

import org.apache.log4j.Logger;

import com.sbox.action.base.CommonAction;

/**
 * @author :horson.ma
 * @version :2012-8-9 下午3:06:03
 * 类说明
 */
public class Transfer extends CommonAction {
	private static final Logger logger = Logger.getLogger(Login.class);
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public String file(){
		return "index";
	}
	public String info(){
		return "info";
	}
	public String login(){
		return "login";
	}
	public String error(){
		return "error";
	}
}
