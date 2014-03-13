package com.sbox.action;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionContext;
import com.sbox.action.base.CommonAction;
import com.sbox.action.base.SBoxClientInstance;
import com.sbox.model.User;
import com.sbox.sdk.client.SBoxClient;
import com.sbox.sdk.client.model.SBoxUserProfile;
import com.sbox.sdk.exception.SBoxClientException;
import com.sbox.sdk.security.SecretKey;
import com.sbox.tools.SessionName;
import com.sohu.sendcloud.Message;
import com.sohu.sendcloud.SendCloud;
import com.sohu.sendcloud.exception.BlankException;

/**
 * 账户Action
 * 
 * @author Jack.wu.xu
 */
public class SendEmail extends CommonAction {

	private User User = null;
	private SBoxUserProfile userPro = null;
	private static String[] filterList = {"sohu.com","17173.com","sogou.com","vip.sohu.com","chinaren.com"};
	
	@SuppressWarnings("deprecation")
	public void send() {
		SecretKey secretKey = getSecretKey();
		if (secretKey == null) {
			try {
				ajaxBack(403, "The authentication information is empty!");
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		User = (User) session.get(SessionName.USER);
		if (User == null) {
			try {
				ajaxBack(403, "The authentication information is empty!");
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			userPro = User.getUserPro();
		}
		String shareType = getParameter("shareType");
		SBoxClient sbox = SBoxClientInstance.getSboxClient();
		String title = getParameter("title");

		String id = getParameter("id");
		String email = getParameter("email");
		String type = getParameter("type");
		String body = getParameter("body");
		String fileName = "";
		String nickName = "";
		String outChainStr = "";
		String password = "";
		String expireDate = "";
		String[] emails = email.split(";");
		try {
			String outLink = sbox.getOutLink(id, shareType, secretKey);
			JSONObject json = JSONObject.fromObject(outLink);
			outChainStr = json.getJSONObject("outSideChain").getString(
					"outchainStr");
			password = json.getJSONObject("outSideChain").getString("password");
			expireDate = json.getJSONObject("outSideChain").getString(
					"expiredate");
			HttpServletRequest request = ServletActionContext.getRequest();
			String[] split = outChainStr.split("OutLink!");
			String url = request.getRequestURL().toString();
			String[] urls = url.split("/");
			if (StringUtils.isEmpty(urls[2])) {
				urls = url.split("\\");
			}
			String sign = json.getString("sign");
			String[] http = urls[0].split(":");
			// outChainStr = http[0]+"://" + urls[2] + "/OutLink!" + split[1]+
			// "&sign=" + sign;
			outChainStr = http[0] + "://" + urls[2] + outChainStr;
			nickName = userPro.getNickName();
			if (StringUtils.isEmpty(title) && "0".equalsIgnoreCase(shareType)) {
				title = nickName + "用搜狐企业网盘与您分享文件";
			} else {
				title = nickName + "用搜狐企业网盘与您分享文件夹";
			}
			SBoxClient sc = SBoxClientInstance.getSboxClient();
			// List<String> fileIds = new ArrayList();
			String resourceId = json.getJSONObject("outSideChain").getString(
					"fileLasestId");
			// fileIds.add(fileId);
			if ("0".equalsIgnoreCase(shareType)) {
				String fileInfo = sc.getObjectInfo(resourceId, secretKey);
				JSONObject js = JSONObject.fromObject(fileInfo);
				JSONObject file = js.getJSONObject("objectInfo");
				fileName = file.getString("name");
			} else {
				String dirInfo = sc.getDirInfo(resourceId, secretKey);
				JSONObject js = JSONObject.fromObject(dirInfo);
				JSONObject file = js.getJSONObject("sboxDir");
				fileName = file.getString("name");
			}

		} catch (SBoxClientException e) {
			e.printStackTrace();
		}
		for (int i = 0; i < emails.length; i++) {
			if (!StringUtils.isEmpty(emails[i])) {
				/*
				 * try { EmailManager .sendEmail( emails[i], title,
				 * collectHtmlContent(emails[i], nickName, body, outChainStr,
				 * fileName, password, expireDate).toString()); } catch
				 * (EmailSendException e) { e.printStackTrace(); }
				 */

				String bodys = collectHtmlContent(emails[i], nickName, body,
						outChainStr, fileName, password, expireDate, shareType)
						.toString();
				try {
					Message message = new Message("service@pan.sohu.net",
							title, bodys);
					
					//PAN-1363 MODIFY BY Hd
					int index = emails[i].lastIndexOf('@');
					boolean flag = true;
					if (index > 0) {
						String appendix = emails[i].substring(index+1);
						for (String filter:filterList) {
							if ( StringUtils.equals(filter, appendix) ) {
								message.setFromName("Sohu企业网盘");
								flag = false;
								break;
							}
						}
					}

					if (flag) {
						message.setFromName("搜狐企业网盘");
					}
					//PAN-1363 MODIFY BY Hd end
					
					message.addRecipient(emails[i]);
					SendCloud sendCloud = new SendCloud("postmaster@panservice.sendcloud.org", "TdXZzqXv",
							false, message);
					sendCloud.send();
				} catch (BlankException e) {
					e.printStackTrace();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		JSONObject jssu = new JSONObject();
		jssu.put("code", 200);
		jssu.put("message", "send email is success!");
		try {
			ajaxBack(jssu.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private static StringBuffer collectHtmlContent(String email,
			String nickName, String body, String outChainStr, String fileName,
			String password, String expireDate, String shareType) {
		HttpServletRequest request = ServletActionContext.getRequest();
		String url = request.getRequestURL().toString();
		String[] urls = url.split("/");
		if (StringUtils.isEmpty(urls[2])) {
			urls = url.split("\\");
		}
		StringBuffer emailContent = new StringBuffer();
		try {
			emailContent = emailModelUp(emailContent);
			emailContent
					.append("<strong style='font-size:14px;'>您好：</strong>  ");
			if ("0".equalsIgnoreCase(shareType)) {
				emailContent
						.append("<p style='font-size:12px; margin:15px 0;'>"
								+ nickName + " 用搜狐企业网盘与您分享了文件！</p>");
				emailContent
						.append("<p style='font-size:12px; margin:15px 0;'>文件：<a style='color:#2C71BE; font-size:14px;' href='"
								+ outChainStr
								+ "'>"
								+ fileName +"</a>"
								+ " （点击立即访问）</p>");
			} else {
				emailContent
						.append("<p style='font-size:12px; margin:15px 0;'>"
								+ nickName + " 用搜狐企业网盘与您分享了文件夹！</p>");
				emailContent
						.append("<p style='font-size:12px; margin:15px 0;'>文件夹：<a style='color:#2C71BE; font-size:14px;' href='"
								+ outChainStr
								+ "'>"
								+ fileName +"</a>"
								+ " （点击立即访问）</p>");
			}

			if (StringUtils.isNotBlank(password)
					&& StringUtils.isNotEmpty(password)) {
				emailContent
						.append("<p style='font-size:12px; margin:15px 0;'>下载密码："
								+ password + "</p>");
			}
			emailContent
					.append("<p style='font-size:12px; margin:15px 0;'>失效时间："
							+ expireDate + "</p>");
			if (StringUtils.isNotBlank(body) && StringUtils.isNotEmpty(body)) {
				emailContent
						.append("<p style='font-size:12px; margin:15px 0;'>留言："
								+ body + "</p>");
			}
			emailContent.append("<br/>");
			emailContent
					.append("<p style='font-size:12px; margin:10px 0; color:#919191;'>（如果链接无法点击，请将此链接复制到浏览器地址栏后访问。 此为系统邮件，请勿回复。 如有任何疑问请<a href='mailto:pan@sohu.net' style='color:#2C71BE;'>联系我们</a>。)</p>");
			emailContent = emailModelDown(emailContent);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return emailContent;
	}
}
