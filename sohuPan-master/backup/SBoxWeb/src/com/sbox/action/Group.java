package com.sbox.action;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;

import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.Page;
import com.sbox.tools.SessionName;

/**
 * @author :Jack.wu.xu@gmail.com
 * @version :2012-10- 下午3:13:47 类说明 主要用于每个文件的历史版本的管理
 */
public class Group extends CommonAction {
	private JSONArray groupList;
	private String groupId;
	private Page page;
	private int pageNumber;
	private int agn;
	private Long groupSize;

	public Page getPage() {
		return page;
	}

	public void setPage(Page page) {
		this.page = page;
	}

	public int getPageNumber() {
		return pageNumber;
	}

	public void setPageNumber(int pageNumber) {
		this.pageNumber = pageNumber;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public String getAll() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			User user = (User) getSession(SessionName.USER);
			page = new Page();
			String allGroup = sbox.getGroupForPage(page.getFirst(),
					page.getMaxShow(), secretKey);
			JSONObject agp = JSONObject.fromObject(allGroup);
			groupList = agp.getJSONArray("groupList");
			setAgn(agp.getInt("allCount"));
			setGroupSize(user.getAccount().getGroupSize());
			page.setAllMessage(getAgn());
			putSession("Group_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "groupList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public String nextPage() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			User user = (User) getSession(SessionName.USER);
			setGroupSize(user.getAccount().getGroupSize());
			page = (Page) getSession("Group_Session");
			page.nextPage();
			int nowPage = page.getNowPage();
			String allGroup = sbox.getGroupForPage(page.getFirst(),
					page.getMaxShow(), secretKey);
			JSONObject agp = JSONObject.fromObject(allGroup);
			int rLength = agp.getInt("allCount");
			if(rLength!=page.getAllMessage()){
				page.setAllMessage(agp.getInt("allCount"));
				page.setNowPage(nowPage);
				allGroup = sbox.getGroupForPage(page.getFirst(),
						page.getMaxShow(), secretKey);
				agp = JSONObject.fromObject(allGroup);
				
			}
			setAgn(agp.getInt("allCount"));
			groupList = agp.getJSONArray("groupList");
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "groupList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public String prevPage() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			User user = (User) getSession(SessionName.USER);
			setGroupSize(user.getAccount().getGroupSize());
			page = (Page) getSession("Group_Session");
			page.prevPage();
			int nowPage = page.getNowPage();
			String allGroup = sbox.getGroupForPage(page.getFirst(),
					page.getMaxShow(), secretKey);
			JSONObject agp = JSONObject.fromObject(allGroup);
			int rLength = agp.getInt("allCount");
			if(rLength!=page.getAllMessage()){
				page.setAllMessage(agp.getInt("allCount"));
				page.setNowPage(nowPage);
				allGroup = sbox.getGroupForPage(page.getFirst(),
						page.getMaxShow(), secretKey);
				agp = JSONObject.fromObject(allGroup);
			}
			setAgn(agp.getInt("allCount"));
			groupList = agp.getJSONArray("groupList");
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "groupList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public String setPage() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			User user = (User) getSession(SessionName.USER);
			setGroupSize(user.getAccount().getGroupSize());
			page = (Page) getSession("Group_Session");
			page.setNowPage(pageNumber);
			int nowPage = page.getNowPage();
			String allGroup = sbox.getGroupForPage(page.getFirst(),
					page.getMaxShow(), secretKey);
			JSONObject agp = JSONObject.fromObject(allGroup);
			int rLength = agp.getInt("allCount");
			if(rLength!=page.getAllMessage()){
				page.setAllMessage(agp.getInt("allCount"));
				page.setNowPage(nowPage);
				allGroup = sbox.getGroupForPage(page.getFirst(),
						page.getMaxShow(), secretKey);
				agp = JSONObject.fromObject(allGroup);
			}
			setAgn(agp.getInt("allCount"));
			groupList = agp.getJSONArray("groupList");
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "groupList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void getGroupMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String groupId = getParameter("groupId");
		try {
			String allGroup = sbox.getGroupMember(groupId, secretKey);
			ajaxBack(allGroup);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void getGroups() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String allGroup = sbox.getAllGroup(secretKey);
			ajaxBack(allGroup);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public void getGroupsContainMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String allGroup = sbox.getAllGroup(secretKey);
			JSONArray gs = JSONArray.fromObject(allGroup);
			for (Object json : gs) {
				JSONObject jo = (JSONObject) json;
				long id = jo.getLong("id");
				String groupMember = sbox.getGroupMember(id + "", secretKey);
				JSONObject gm = JSONObject.fromObject(groupMember);
				jo.put("members", gm.get("members"));
			}
			String userListByDomain = sbox.getUserListByDomain(
					secretKey.getDomain(), secretKey);
			JSONObject au = JSONObject.fromObject(userListByDomain);
			JSONObject allUsers = new JSONObject();
			allUsers.put("group_name", "全部用户");
			allUsers.put("id", -1l);
			allUsers.put("createTime", "2012-01-01 00:00:00");
			allUsers.put("members", au.get("sboxUserList"));
			gs.add(0, allUsers);
			ajaxBack(gs.toString());
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public void moveToGroups() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String userId = getParameter("userId");
			String groupIds = getParameter("groupIds");
			String rgId = getParameter("rgId");
			ByteArrayInputStream input = new ByteArrayInputStream(
					groupIds.getBytes());
			String moveToGroup = sbox.moveToGroup(rgId, userId, input,
					secretKey);
			ajaxBack(moveToGroup);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public String toMemberList() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			groupId = getParameter("groupId");
			String groupName = getParameter("groupName");
			putSession("GroupName", groupName);
			page = new Page();
			String moveToGroup = sbox.getGroupMemberForPage(groupId,
					page.getFirst(), page.getMaxShow(), secretKey);
			JSONObject members = JSONObject.fromObject(moveToGroup);
			groupList = members.getJSONArray("members");
			page.setAllMessage(members.getInt("allCount"));
			putSession("GroupMember_Session", page);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "userList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public String nextPageMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			groupId = getParameter("groupId");
			page = (Page) getSession("GroupMember_Session");
			page.nextPage();
			int nowPage = page.getNowPage();
			String gMemers = sbox.getGroupMemberForPage(groupId,
					page.getFirst(), page.getMaxShow(), secretKey);
			JSONObject members = JSONObject.fromObject(gMemers);
			int rLength = members.getInt("allCount");
			if(rLength!=page.getAllMessage()){
				page.setAllMessage(members.getInt("allCount"));
				page.setNowPage(nowPage);
				gMemers = sbox.getGroupMemberForPage(groupId,page.getFirst(),
						page.getMaxShow(), secretKey);
				members = JSONObject.fromObject(gMemers);
			}
			groupList = members.getJSONArray("members");
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "userList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public String prevPageMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			groupId = getParameter("groupId");
			page = (Page) getSession("GroupMember_Session");
			page.prevPage();
			int nowPage = page.getNowPage();
			int allPage = page.getAllPage();
			String gMemers = sbox.getGroupMemberForPage(groupId,
					page.getFirst(), page.getMaxShow(), secretKey);
			JSONObject members = JSONObject.fromObject(gMemers);
			int rLength = members.getInt("allCount");
			if(rLength!=page.getAllMessage()){
				page.setAllMessage(members.getInt("allCount"));
				if(allPage!=page.getAllPage()){
				page.setNowPage(nowPage);
				gMemers = sbox.getGroupMemberForPage(groupId,page.getFirst(),
						page.getMaxShow(), secretKey);
				members = JSONObject.fromObject(gMemers);
				}
			}
			groupList = members.getJSONArray("members");
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "userList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public String setPageMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			groupId = getParameter("groupId");
			page = (Page) getSession("GroupMember_Session");
			page.setNowPage(pageNumber);
			int nowPage = page.getNowPage();
			int allPage = page.getAllPage();
			String gMemers = sbox.getGroupMemberForPage(groupId,
					page.getFirst(), page.getMaxShow(), secretKey);
			JSONObject members = JSONObject.fromObject(gMemers);
			int rLength = members.getInt("allCount");
			if(rLength!=page.getAllMessage()){
				page.setAllMessage(members.getInt("allCount"));
				if(allPage!=page.getAllPage()){
					page.setNowPage(pageNumber);
					gMemers = sbox.getGroupMemberForPage(groupId,page.getFirst(),
							page.getMaxShow(), secretKey);
					members = JSONObject.fromObject(gMemers);
				}
			}
			page.setNowPage(pageNumber);
			groupList = members.getJSONArray("members");
		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		return "userList";
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public void deleteGroups() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String groupIds = getParameter("groupIds");
			if (!StringUtils.isEmpty(groupIds)) {
				ByteArrayInputStream input = new ByteArrayInputStream(
						groupIds.getBytes());
				String moveToGroup = sbox.deleteGroups(input, secretKey);
				ajaxBack(moveToGroup);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public void deleteGroupMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String groupId = getParameter("groupId");
			String userIds = getParameter("userIds");
			if (!StringUtils.isEmpty(userIds)) {
				String moveToGroup = sbox.deleteMemberFromGroup(groupId,
						userIds, secretKey);
				ajaxBack(moveToGroup);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public void getGroupNotContainMember() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String groupId = getParameter("groupId");
			if (!StringUtils.isEmpty(groupId)) {
				String moveToGroup = sbox.getGroupNotContainMember(groupId,
						secretKey);
				ajaxBack(moveToGroup);
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	public void renameGroup() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		try {
			String groupId = getParameter("groupId");
			String groupName = getParameter("groupName");
			String moveToGroup = sbox
					.renameGroup(groupId, groupName, secretKey);
			ajaxBack(moveToGroup);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void create() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String name = getParameter("GroupName");
		try {
			String allGroup = sbox.addGroup(name, secretKey);
			JSONObject addGroup = JSONObject.fromObject(allGroup);
			int code = addGroup.getInt("code");
			if (code != 200) {
				ajaxBack(allGroup);
			} else if (code == 200) {
				String members = getParameter("members");
				if (!StringUtils.isEmpty(members)) {
					ByteArrayInputStream input = new ByteArrayInputStream(
							members.getBytes());
					long groupId = addGroup.getLong("groupId");
					String addGroupMember = sbox.addGroupMember(groupId, input,
							secretKey);
					JSONObject groupMember = JSONObject
							.fromObject(addGroupMember);
					int code2 = groupMember.getInt("code");
					if (code2 == 200) {
						ajaxBack(allGroup);
					}
				} else {
					ajaxBack(allGroup);
				}
			}
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void addGroupMembers() {
		SecretKey secretKey = getSecretKey();
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String groupId = getParameter("groupId");
		try {
			String members = getParameter("members");
			ByteArrayInputStream input = new ByteArrayInputStream(
					members.getBytes());
			String addGroupMember = sbox.addGroupMember(
					Long.parseLong(groupId), input, secretKey);
			ajaxBack(addGroupMember);
		} catch (SBoxClientException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public JSONArray getGroupList() {
		return groupList;
	}

	public void setGroupList(JSONArray groupList) {
		this.groupList = groupList;
	}

	public String getGroupId() {
		return groupId;
	}

	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}

	public Long getGroupSize() {
		return groupSize;
	}

	public void setGroupSize(Long groupSize) {
		this.groupSize = groupSize;
	}

	public int getAgn() {
		return agn;
	}

	public void setAgn(int agn) {
		this.agn = agn;
	}
}
