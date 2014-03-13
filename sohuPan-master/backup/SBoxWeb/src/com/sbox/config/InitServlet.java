package com.sbox.config;


import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

public class InitServlet extends HttpServlet {
	private static final long serialVersionUID = 6781338971014083043L;
	protected static final ConfigManager INSTANCE = ConfigManager.getInstance();

	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		String con = config.getInitParameter("conPath");
		initConfig(con);
	}

	private void initConfig(String config) {
		if (!INSTANCE.isRegisted()) {
			INSTANCE.setPrefix(config);
			if (!INSTANCE.isRegistered(GeneralConfig.class))
				INSTANCE.register(GeneralConfig.class);
			INSTANCE.setRegisted(true);
		}
	}

}
