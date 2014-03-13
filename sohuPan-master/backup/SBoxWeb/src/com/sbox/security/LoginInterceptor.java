//package com.sbox.security;
//
//import java.util.Map;
//
//import com.opensymphony.xwork2.ActionContext;
//import com.opensymphony.xwork2.ActionInvocation;
//import com.opensymphony.xwork2.interceptor.Interceptor;
//import com.sbox.security.contans.SessionKey;
//import com.sohu.apps.api.user.User;
//
//public class LoginInterceptor implements Interceptor {
//
//	@Override
//	public void destroy() {
//
//	}
//
//	@Override
//	public void init() {
//		// TODO Auto-generated method stub
//
//	}
//
//	@Override
//	public String intercept(ActionInvocation arg) throws Exception {
//		ActionContext context = ActionContext.getContext();
//		Map<String, Object> session = context.getSession();
//		User user = (User) session.get(SessionKey.USER);
//		
//		try {
//			if (user != null) {
//				return arg.invoke();
//			} else {
//				return StrutsActionMap.LOGIN;
//			}
//		} catch (Exception e) {
//			return "error";
//		}
//	}
//
//}
