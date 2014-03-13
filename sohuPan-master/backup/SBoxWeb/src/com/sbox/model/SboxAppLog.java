package com.sbox.model;

public class SboxAppLog {
	
	
	private String startTime;

	private String endTime;
	
	private String status;
	
	private String pageIndex;
	
	private String pagenum;
	
	private int resourceType = -1; //0是文件 1是文件夹   -1代表全部
	
	private int flag =0 ;//还原标志位

	public int getResourceType() {
		return resourceType;
	}

	public void setResourceType(int resourceType) {
		this.resourceType = resourceType;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getPageIndex() {
		return pageIndex;
	}

	public void setPageIndex(String pageIndex) {
		this.pageIndex = pageIndex;
	}

	public String getPagenum() {
		return pagenum;
	}

	public void setPagenum(String pagenum) {
		this.pagenum = pagenum;
	}
	
	public int getFlag() {
		return flag;
	}

	public void setFlag(int flag) {
		this.flag = flag;
	}
	

}
