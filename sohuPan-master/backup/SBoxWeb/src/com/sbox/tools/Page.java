package com.sbox.tools;

/**
 * 
 * @author Jack 此类专为查询数据库分页所用。
 */
public class Page implements java.io.Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int first;
	private int maxShow = 10;
	private boolean order;// true 为升序、false为降序。
	private String properties;// 排序的依据
	private int allMessage;
	private int allPage;
	private int nowPage = 1;

	public Page(int allMessage) {
		setAllMessage(allMessage);
	}

	public Page() {
	}

	public int getFirst() {
		return first;
	}

	public void setFirst(int first) {
		this.first = first;
	}

	public int getMaxShow() {
		return maxShow;
	}

	public void setMaxShow(int maxShow) {
		this.maxShow = maxShow;
	}

	public boolean isOrder() {
		return order;
	}

	public void setOrder(boolean order) {
		this.order = order;
	}

	public String getProperties() {
		return properties;
	}

	public void setProperties(String properties) {
		this.properties = properties;
	}

	public void setAllMessage(int allMessage) {
		this.allMessage = allMessage;
		this.allPage = allMessage / maxShow;
		if (allMessage % maxShow != 0) {
			this.allPage++;
		}
//		if (this.allMessage != 0)
//			this.nowPage = 1;
	}

	public int getAllMessage() {
		return allMessage;
	}

	// private void setAllPage(int allPage) {
	// this.allPage = allPage;
	// }

	public int getAllPage() {
		return allPage;
	}

	public void setNowPage(int nowPage) {
		if (0 < nowPage && nowPage <= this.allPage) {
			this.nowPage = nowPage;
		}else if (0 >= nowPage){
			this.nowPage = 1;
		}else if(nowPage > this.allPage) {
			this.nowPage = this.allPage;
		}
		this.first = (this.nowPage - 1) * maxShow;
	}

	public int getNowPage() {
		return nowPage;
	}

	public void nextPage() {
		if (this.nowPage < this.allPage) {
			this.nowPage++;
		}
		this.first = (this.nowPage - 1) * maxShow;
	}

	public void prevPage() {
		if (this.nowPage > 1) {
			this.nowPage--;
		}
		this.first = (this.nowPage - 1) * maxShow;
	}
}
