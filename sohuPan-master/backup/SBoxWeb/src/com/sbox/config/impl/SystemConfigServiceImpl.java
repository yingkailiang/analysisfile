package com.sbox.config.impl;

import java.sql.SQLException;

import com.sbox.config.EmailConfig;
import com.sbox.config.SystemConfigService;


/**
 * 系统配置实现类
 * @author Jack.wu.xu
 */
public class SystemConfigServiceImpl implements SystemConfigService {

	public EmailConfig getEmailCfg() throws SQLException {
		return init();
	}

	private EmailConfig init() {
		return null;
	}

	public void setEmailCfg(EmailConfig cfg) throws SQLException {
	}

}
