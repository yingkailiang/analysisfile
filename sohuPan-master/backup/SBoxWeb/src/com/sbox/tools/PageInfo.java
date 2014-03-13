// Decompiled by Jad v1.5.8e2. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://kpdus.tripod.com/jad.html
// Decompiler options: packimports(3) fieldsfirst ansi space 
// Source File Name:   PageInfo.java

package com.sbox.tools;

import com.sbox.tools.MathUtil;

import java.util.ArrayList;
import java.util.List;

public class PageInfo {

	public static final Integer DEFAULT_PAGESIZE = new Integer(10);
	private Integer pageNum;
	private Integer pageSize;
	private Integer totalRows;
	private List items;
	private List pageList;

	public PageInfo() {
		pageNum = null;
		pageSize = null;
	}

	public List getItems() {
		return items;
	}

	public void setItems(List items) {
		this.items = items;
	}

	public List getPageList() {
		return pageList;
	}

	public void setPageList(List pageList) {
		this.pageList = pageList;
	}

	public Integer getNextPageNum() {
		Integer totalPages = getTotalPages();
		Integer pageNum = getPageNum();
		if (totalPages.intValue() == pageNum.intValue())
			return new Integer(0);
		else
			return MathUtil.addInteger(pageNum, new Integer(1));
	}

	public Integer getLastPageNum() {
		Integer totalPages = getTotalPages();
		Integer pageNum = getPageNum();
		PageNew pagenew = null;
		if (pageList.size() > 0) {
			pagenew = (PageNew) pageList.get(pageList.size() - 1);
		}
		if (totalPages.intValue() == pageNum.intValue())
			return new Integer(0);
		else {
			if (Integer.valueOf(pagenew.getPageId()) < totalPages) {
				return totalPages;
			} else {
				return new Integer(0);
			}
		}
	}

	public Integer getPageNum() {
		if (getTotalRows().intValue() <= 0)
			return new Integer(0);
		if (pageNum == null || pageNum.intValue() <= 0)
			return new Integer(1);
		Integer totalPages = getTotalPages();
		if (totalPages.compareTo(pageNum) < 0)
			return totalPages;
		else
			return pageNum;
	}

	public int getFirstResult() {
		return (getPageNum().intValue() - 1) * getPageSize().intValue();
	}

	public Integer getFirstPageNum() {
		if (getTotalRows().intValue() > 0 && getPageNum().intValue() != 1
				&& pageList.size() > 0) {
			PageNew pagenew = (PageNew) pageList.get(0);
			if (Integer.valueOf(pagenew.getPageId()) > 1) {
				return new Integer(1);
			} else {
				return new Integer(0);
			}
		} else
			return new Integer(0);
	}

	public void setPageNum(Integer pageNum) {
		this.pageNum = pageNum;
	}

	public Integer getPageSize() {
		if (pageSize == null)
			return DEFAULT_PAGESIZE;
		else
			return pageSize;
	}

	public void setPageSize(Integer pageSize) {
		this.pageSize = pageSize;
	}

	public Integer getPrePageNum() {
		Integer pageNum = getPageNum();
		if (pageNum.intValue() > 1)
			return MathUtil.addInteger(pageNum, new Integer(-1));
		else
			return new Integer(0);
	}

	public Integer getTotalPages() {
		Integer pageSize = getPageSize();
		return new Integer((new Double(Math.ceil(getTotalRows().doubleValue()
				/ pageSize.doubleValue()))).intValue());
	}

	public Integer getTotalRows() {
		if (totalRows == null)
			return new Integer(0);
		else
			return totalRows;
	}

	public void setTotalRows(Integer totalNum) {
		totalRows = totalNum;
	}

	public Integer getPageRows() {
		Integer totalPages = getTotalPages();
		Integer pageNum = getPageNum();
		Integer pageSize = getPageSize();
		if (totalPages.intValue() == pageNum.intValue()) {
			Integer modValue = getTotalRows().intValue() % pageSize.intValue();
			if (modValue == 0) {
				return new Integer(modValue + 1);
			} else {
				return new Integer(modValue);
			}
		} else {
			return pageSize;
		}
	}

	public String toString() {
		StringBuffer sb = new StringBuffer();
		sb.append("<pagelist totalpages=\"");
		sb.append(getTotalPages());
		sb.append("\" totalrecords=\"");
		sb.append(getTotalRows());
		sb.append("\" currentpage=\"");
		sb.append(getPageNum());
		sb.append("\" pagesize=\"");
		sb.append(getPageSize());
		sb.append("\" firstpage=\"");
		sb.append(getFirstPageNum());
		sb.append("\" prepage=\"");
		sb.append(getPrePageNum());
		sb.append("\" nextpage=\"");
		sb.append(getNextPageNum());
		sb.append("\" lastpage=\"");
		sb.append(getLastPageNum());
		sb.append("\" pagerecords=\"");
		sb.append(getPageRows());
		sb.append("\"/>");
		return sb.toString();
	}

	public PageInfo getPerPage(List arrayList, int perNum, int curNum) {
		PageInfo pageInfo = new PageInfo();
		pageInfo.setPageNum(curNum);
		pageInfo.setTotalRows(arrayList.size());
		pageInfo.setPageSize(perNum);
		if (curNum * perNum < arrayList.size()) {
			pageInfo.setItems(arrayList.subList((curNum - 1) * perNum, curNum
					* perNum));
		} else {
			pageInfo.setItems(arrayList.subList((curNum - 1) * perNum,
					arrayList.size()));
		}
		Integer allPages = pageInfo.getTotalPages();
		pageList = new ArrayList();
		pageList = getPageNumber(allPages, curNum, 5);
		pageInfo.setPageList(pageList);
		pageInfo.toString();
		return pageInfo;
	}

	public PageInfo getPerPage(List arrayList, int perNum, int curNum,
			int totalNum) {
		PageInfo pageInfo = new PageInfo();
		pageInfo.setPageNum(curNum);
		pageInfo.setTotalRows(totalNum);
		pageInfo.setPageSize(perNum);
		if (arrayList.size() > perNum) {
			pageInfo.setItems(arrayList.subList(0, perNum));
		} else {
			pageInfo.setItems(arrayList);
		}
		Integer allPages = pageInfo.getTotalPages();
		pageList = new ArrayList();
		pageList = getPageNumber(allPages, curNum, 5);
		pageInfo.setPageList(pageList);
		pageInfo.toString();
		return pageInfo;
	}

	/*
	 * allpages 是总共的页数 curNum是当前页数 maxPage是底部显示的最多页面数
	 */
	public List getPageNumber(Integer allPages, Integer curNum, Integer maxPage) {
		pageList = new ArrayList();

		if (allPages < maxPage + 1) {
			for (int i = 0; i < allPages; i++) {
				PageNew pagenew = new PageNew();
				pagenew.setPageId(String.valueOf(i + 1));
				pageList.add(i, pagenew);
				pagenew = null;
			}
		} else if (allPages - (maxPage / 2 - 1) > curNum) {
			for (int i = 0; i < maxPage; i++) {
				PageNew pagenew = new PageNew();
				if (curNum > maxPage / 2) {
					pagenew.setPageId(String.valueOf(curNum - maxPage / 2 + i));
				} else {
					pagenew.setPageId(String.valueOf(i + 1));
				}
				pageList.add(i, pagenew);
				pagenew = null;
			}
		} else {
			for (int i = 0; i < maxPage; i++) {
				PageNew pagenew = new PageNew();
				pagenew.setPageId(String.valueOf(allPages - maxPage + 1 + i));
				pageList.add(i, pagenew);
				pagenew = null;
			}
		}
		return pageList;
	}
}
