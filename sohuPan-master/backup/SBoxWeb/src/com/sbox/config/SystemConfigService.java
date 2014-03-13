package com.sbox.config;

import java.sql.SQLException;


public interface SystemConfigService {

	/**
	 * 得到邮件配置
	 * @return
	 * @throws SQLException
	 */
	EmailConfig getEmailCfg() throws SQLException;
	
	/**
	 * 设置邮件配置
	 * @param cfg
	 * @throws SQLException
	 */
	void setEmailCfg(EmailConfig cfg) throws SQLException;
}
