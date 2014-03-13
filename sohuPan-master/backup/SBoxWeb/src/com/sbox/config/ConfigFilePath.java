/**
 * Copyright Sohu Inc. 2012
 */
package com.sbox.config;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Jack
 * 
 */
@Target(java.lang.annotation.ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ConfigFilePath {
	String value();
}
