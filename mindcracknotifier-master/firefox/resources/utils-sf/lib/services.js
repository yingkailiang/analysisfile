/**
 * @author christophe
 */
const Chrome = require("chrome");
const xpcom = require("xpcom");
const Cc = Chrome.Cc;
const Ci = Chrome.Ci;
const Cu = Chrome.Cu;

const Services = Cu['import']("resource://gre/modules/Services.jsm").Services;

try {
	xpcom.utils.defineLazyGetter(Services, "resProt", function() {
		return Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
	});
} catch(err) {
}

try {
	xpcom.utils.defineLazyServiceGetter(Services, "idle", "@mozilla.org/widget/idleservice;1", "nsIIdleService");
} catch(err) {
}

try {

	xpcom.utils.defineLazyServiceGetter(Services, "appshell", "@mozilla.org/appshell/appShellService;1", "nsIAppShellService");
} catch(err) {
}

try {
	xpcom.utils.defineLazyServiceGetter(Services, "pbs", "@mozilla.org/privatebrowsing;1", "nsIPrivateBrowsingService");
} catch(err) {
}

try {
	xpcom.utils.defineLazyServiceGetter(Services, "cs", "@mozilla.org/cookieService;1", "nsICookieService");
} catch(err) {
}

try {
	xpcom.utils.defineLazyServiceGetter(Services, "cookie", "@mozilla.org/cookiemanager;1", "nsICookieManager2");
	//xpcom.utils.defineLazyServiceGetter(Services, "history", "@mozilla.org/browser/nav-history-service;1", "nsINavHistoryService");
} catch(err) {
}

try {
	xpcom.utils.defineLazyServiceGetter(Services, "favicon", "@mozilla.org/browser/favicon-service;1", "nsIFaviconService");
} catch(err) {
}

try {
	xpcom.utils.defineLazyGetter(Services, "history", function() {
		//"@mozilla.org/browser/nav-history-service;1", "nsINavHistoryService");
		var c = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
		c.QueryInterface(Ci.nsIBrowserHistory);
		c.QueryInterface(Ci.nsIGlobalHistory2);
		try {// fix for FF9 https://bugzilla.mozilla.org/show_bug.cgi?id=568971
			c.QueryInterface(Ci.nsIGlobalHistory3);
		} catch(err) {

		}
		return c;
	})
} catch(err) {
}

Services.am = Cu['import']("resource://gre/modules/AddonManager.jsm").AddonManager;

Services.utils = {
get mainWindow() {
	return Services.ww.activeWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
}
}

module.exports = Services;
