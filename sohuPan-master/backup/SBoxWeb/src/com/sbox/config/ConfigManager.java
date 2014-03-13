/**
 * 
 */
package com.sbox.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;
import org.apache.commons.configuration.tree.ConfigurationNode;

/**
 * @author Jack
 * 
 */
public class ConfigManager {
	// private volatile static Map<String, ConfigManager> instances = new
	// HashMap<String, ConfigManager>();
	private volatile static ConfigManager instance = null;
	private boolean registed = false;
	private String prefix = "";
	private XMLConfiguration xmlconf = new XMLConfiguration();
	private Map<Class<? extends IConfig>, String> registry = new HashMap<Class<? extends IConfig>, String>();
	private Map<Class<? extends IConfig>, IConfig> configs = new HashMap<Class<? extends IConfig>, IConfig>();

	public ConfigManager(String prefix) {
		this.prefix = prefix;
	}

	public static ConfigManager getInstance() {
		if (null == instance) {
			instance = new ConfigManager("");
		}
		return instance;
	}


	/**
	 * Register a configuration
	 * 
	 * @param clazz
	 *            config file for this configuration
	 * @param path
	 *            config file for this configuration
	 */
	public void register(Class<? extends IConfig> clazz) {
		if (null == clazz)
			throw new IllegalArgumentException();

		ConfigFilePath anotation = clazz.getAnnotation(ConfigFilePath.class);
		if (null == anotation)
			throw new IllegalArgumentException(
					new ConfigException(
							"Config class must be decorated by @ConfigFilePath(\"path/to/config/file\") anotation."));

		String path = anotation.value();
		if (null == path || 0 == path.length())
			throw new ConfigException("@ConfigFilePath has a value.");

		if (registry.containsKey(clazz))
			throw new ConfigException(String
					.format("%s was registered.", clazz));

		registry.put(clazz, getPrefix() + path);
	}

	/**
	 * Unregister a configuration
	 * 
	 * @param clazz
	 */
	public void unregister(Class<? extends IConfig> clazz) {
		configs.remove(clazz);
		registry.remove(clazz);
	}

	/**
	 * 
	 * @param clazz
	 * @return
	 */
	public Boolean isRegistered(Class<? extends IConfig> clazz) {
		return registry.containsKey(clazz);
	}
	
	@SuppressWarnings("unchecked")
	public static <T extends IConfig> T Get(Class<? extends IConfig> clazz) {
		return (T)ConfigManager.getInstance().get(clazz);
	}

	/**
	 * Get an instance of a configuration
	 * 
	 * @param clazz
	 * @return the instance
	 */
	@SuppressWarnings("unchecked")
	public <T extends IConfig> T get(Class<? extends IConfig> clazz) {
		IConfig conf = configs.get(clazz);
		if (null == conf) {
			conf = this.load(clazz);
			configs.put(clazz, conf);
		}
		return (T)conf;
	}

	/**
	 * Refresh the instance of a configuration
	 * 
	 * @param clazz
	 * @return the instance
	 */
	@SuppressWarnings("unchecked")
	public <T extends IConfig> T refresh(Class<? extends IConfig> clazz) {
		IConfig conf = this.load(clazz);
		configs.put(clazz, conf);
		return (T)conf;
	}

	@SuppressWarnings("unchecked")
	private synchronized <T extends IConfig> T load(Class<? extends IConfig> clazz) throws ConfigException {

		IConfig conf = null;
		String path = registry.get(clazz);

		if (null == path) {
			throw new ConfigException(String.format("%s is not registered",
					clazz.getName()));
		}

		try {
			xmlconf.clear();
			xmlconf.load(path);
			List<ConfigurationNode> nodes = xmlconf.getRoot().getChildren();
			for (ConfigurationNode n : nodes)
				System.out.printf("%s - %s\n", n.getName(), n.getValue());
		} catch (ConfigurationException e) {
			throw new ConfigException(String.format(
					"Fail to load config file '%s' for %s.", path, clazz
							.getName()));
		}

		try {
			conf = clazz.newInstance();
		} catch (InstantiationException e) {
			throw new ConfigException(String.format("Fail to instantiate %s",
					clazz.getName()), e);
		} catch (IllegalAccessException e) {
			throw new ConfigException(String.format(
					"Can not access the constructor of %s", clazz.getName()), e);
		}

		conf.parse(xmlconf);
		return (T)conf;
	}

	/**
	 * @return the prefix
	 */
	public String getPrefix() {
		return prefix;
	}

	/**
	 * @param prefix
	 *            the prefix to set
	 */
	public void setPrefix(String prefix) {
		this.prefix = prefix;
		if (null == this.prefix)
			this.prefix = "";
	}

	public boolean isRegisted() {
		return registed;
	}

	public void setRegisted(boolean registed) {
		this.registed = registed;
	}

}
