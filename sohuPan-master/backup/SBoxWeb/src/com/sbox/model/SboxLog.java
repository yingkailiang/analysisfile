package com.sbox.model;

import java.util.Date;

/**
 * SboxLog entity.
 * 
 * @author MyEclipse Persistence Tools
 */

public class SboxLog implements java.io.Serializable {

	// Fields

	private Long id;
	private Long operator;
	private String ip;
	private String mac;
	private String terminal;
	private String operation;
	private String resource1;
	private String resource2;
	private String resource3;
	private String logText;
	private Date operationTime = new Date();
	private String description;
	private Byte operationResult = 1;
	private String domain;
	private String fileName="";
	private String filePath="";
	private String operatorName="";
	private String fileType;
	private String strTime;
	// Constructors

	public String getDomain() {
		return domain;
	}

	/** default constructor */
	public SboxLog() {
	}

	/** minimal constructor */
	public SboxLog(Long id, Long operator, String ip, String mac,
			String operation, String resource1, String resource2,
			String resource3, String logText, Date operationTime,
			String description, Byte operationResult) {
		this.id = id;
		this.operator = operator;
		this.ip = ip;
		this.mac = mac;
		this.operation = operation;
		this.resource1 = resource1;
		this.resource2 = resource2;
		this.resource3 = resource3;
		this.logText = logText;
		this.operationTime = operationTime;
		this.description = description;
		this.operationResult = operationResult;
	}

	/** full constructor */
	public SboxLog(Long id, Long operator, String ip, String mac,
			String terminal, String operation, String resource1,
			String resource2, String resource3, String logText,
			Date operationTime, String description, Byte operationResult) {
		this.id = id;
		this.operator = operator;
		this.ip = ip;
		this.mac = mac;
		this.terminal = terminal;
		this.operation = operation;
		this.resource1 = resource1;
		this.resource2 = resource2;
		this.resource3 = resource3;
		this.logText = logText;
		this.operationTime = operationTime;
		this.description = description;
		this.operationResult = operationResult;
	}

	// Property accessors

	public Long getId() {
		return this.id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getOperator() {
		return this.operator;
	}

	public void setOperator(Long operator) {
		this.operator = operator;
	}

	public String getIp() {
		return this.ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public String getMac() {
		return this.mac;
	}

	public void setMac(String mac) {
		this.mac = mac;
	}

	public String getTerminal() {
		return this.terminal;
	}

	public void setTerminal(String terminal) {
		this.terminal = terminal;
	}

	public String getOperation() {
		return this.operation;
	}

	public void setOperation(String operation) {
		this.operation = operation;
	}

	public String getResource1() {
		return this.resource1;
	}

	public void setResource1(String resource1) {
		this.resource1 = resource1;
	}

	public String getResource2() {
		return this.resource2;
	}

	public void setResource2(String resource2) {
		this.resource2 = resource2;
	}

	public String getResource3() {
		return this.resource3;
	}

	public void setResource3(String resource3) {
		this.resource3 = resource3;
	}

	public String getLogText() {
		return this.logText;
	}

	public void setLogText(String logText) {
		this.logText = logText;
	}

	public Date getOperationTime() {
		return this.operationTime;
	}

	public void setOperationTime(Date operationTime) {
		this.operationTime = operationTime;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Byte getOperationResult() {
		return this.operationResult;
	}

	public void setOperationResult(Byte operationResult) {
		this.operationResult = operationResult;
	}

	public void setDomain(String domain) {
		this.domain = domain;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getFilePath() {
		return filePath;
	}

	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

	public String getOperatorName() {
		return operatorName;
	}

	public void setOperatorName(String operatorName) {
		this.operatorName = operatorName;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public String getStrTime() {
		return strTime;
	}

	public void setStrTime(String strTime) {
		this.strTime = strTime;
	}

	
}