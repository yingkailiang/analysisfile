function init() {
	var b = $("toggleBtn");
	var d = $("pinAll");
	var j = chrome.i18n.getMessage("toggleBtnText");
	var m = $("captureWebpageItem");
	var a = $("captureWindowItem");
	var h = $("captureAreaItem");
	var g = $("preferences");
	var k = $("visit");
	var c = $$("#menu .huaban")[0];
	var f = $$("#menu .huabanShopping")[0];
	m.getElementsByTagName("span")[0].innerHTML = chrome.i18n.getMessage("captureWebpage");
	a.getElementsByTagName("span")[0].innerHTML = chrome.i18n.getMessage("captureWindow");
	h.getElementsByTagName("span")[0].innerHTML = chrome.i18n.getMessage("captureArea");
	g.title = chrome.i18n.getMessage("preferences");
	k.innerHTML = chrome.i18n.getMessage("visit") + ":";
	c.innerHTML = chrome.i18n.getMessage("siteName");
	f.innerHTML = chrome.i18n.getMessage("shoppingName");
	d.getElementsByTagName("span")[0].innerHTML = chrome.i18n.getMessage("pinText");
	$("extName").innerHTML = chrome.i18n.getMessage("extName"); (function l() {
		var o = document.getElementsByTagName("a");
		for (var p = 0; o[p]; p++) {
			o[p].addEventListener("click",
			function() {
				if (this.href && !~this.href.indexOf("chrome-extension")) {
					window.open(this.href)
				}
				return false
			})
		}
	})();
	var n = $$("#menu .capture");
	for (var e = 0; e < n.length; e++) {
		if (!n[e].classList.contains("disabled")) {
			n[e].classList.add("disabled")
		}
	}
	b.addEventListener("click",
	function() {
		chrome.extension.sendRequest({
			msg: "toggle"
		},
		function(i) {
			var o = i.isToggleOn;
			var p = b.getElementsByTagName("span")[0];
			p.setAttribute("class", o ? "checked": "unchecked")
		});
		chrome.extension.sendRequest({
			msg: "ga",
			type: "popup item",
			value: "toggleBtn"
		},
		function() {})
	});
	d.addEventListener("click",
	function() {
		if (this.classList.contains("disabled")) {
			return false
		}
		chrome.tabs.getSelected(null,
		function(i) {
			var o = i.url;
			o = o.replace(/^https?:\/\/(www)?/, "");
			if (o.indexOf(DOMAIN) == 0) {
				return
			}
			chrome.tabs.sendRequest(i.id, {
				msg: "showValidImages"
			},
			function(p) {})
		});
		chrome.extension.sendRequest({
			msg: "ga",
			type: "popup item",
			value: "pinAll"
		},
		function() {});
		setTimeout(function() {
			window.close()
		},
		100)
	});
	m.addEventListener("click",
	function() {
		if (this.classList.contains("disabled")) {
			return false
		}
		chrome.extension.sendRequest({
			msg: "ga",
			type: "popup item",
			value: "captureWebpage"
		},
		function() {});
		var i = chrome.extension.getBackgroundPage();
		i.screenshot.captureWebpage();
		window.close()
	});
	a.addEventListener("click",
	function() {
		if (this.classList.contains("disabled")) {
			return false
		}
		chrome.extension.sendRequest({
			msg: "ga",
			type: "popup item",
			value: "captureWindow"
		},
		function() {});
		var i = chrome.extension.getBackgroundPage();
		i.screenshot.captureWindow();
		window.close()
	});
	h.addEventListener("click",
	function() {
		if (this.classList.contains("disabled")) {
			return false
		}
		chrome.extension.sendRequest({
			msg: "ga",
			type: "popup item",
			value: "captureArea"
		},
		function() {});
		var i = chrome.extension.getBackgroundPage();
		i.screenshot.showSelectionArea();
		window.close()
	});
	chrome.extension.sendRequest({
		msg: "isToggleOn"
	},
	function(i) {
		var o = i.isToggleOn;
		var p = b.getElementsByTagName("span")[0];
		p.innerHTML = j;
		p.setAttribute("class", o ? "checked": "unchecked")
	});
	chrome.tabs.getSelected(null,
	function(p) {
		var i = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
		if (i > 26) {
			var o = chrome.tabs.connect(p.id);
			o.onMessage.addListener(function(q) {
				if (q.msg == "capturable") {
					$("captureWindowItem").classList.remove("disabled");
					$("captureAreaItem").classList.remove("disabled");
					$("captureWebpageItem").classList.remove("disabled")
				} else {
					if (q.msg == "uncapturable") {
						$("captureWindowItem").classList.add("disabled");
						$("captureAreaItem").classList.add("disabled");
						$("captureWebpageItem").classList.add("disabled")
					}
				}
				if (q.msg == "pinable") {
					$("pinAll").classList.remove("disabled")
				} else {
					if (q.msg == "unpinable") {
						$("pinAll").classList.add("disabled")
					}
				}
			});
			o.postMessage({
				msg: "is_page_capturable"
			});
			o.postMessage({
				msg: "is_page_pinable"
			})
		} else {
			chrome.tabs.sendRequest(p.id, {
				msg: "is_page_capturable"
			},
			function(q) {
				if (q.msg == "capturable") {
					$("captureWindowItem").classList.remove("disabled");
					$("captureAreaItem").classList.remove("disabled");
					$("captureWebpageItem").classList.remove("disabled")
				} else {
					$("captureWindowItem").classList.add("disabled");
					$("captureAreaItem").classList.add("disabled");
					$("captureWebpageItem").classList.add("disabled")
				}
			});
			chrome.tabs.sendRequest(p.id, {
				msg: "is_page_pinable"
			},
			function(q) {
				if (q.msg == "pinable") {
					$("pinAll").classList.remove("disabled")
				} else {
					$("pinAll").classList.add("disabled")
				}
			})
		}
	});
	chrome.tabs.executeScript(null, {
		file: "js/isload.js"
	})
}
document.addEventListener("DOMContentLoaded", init);
chrome.extension.onRequest.addListener(function(c, b, a) {
	if (c.msg == "page_capturable") {
		$("captureWindowItem").classList.remove("disabled");
		$("captureAreaItem").classList.remove("disabled");
		$("captureWebpageItem").classList.remove("disabled")
	} else {
		if (c.msg == "page_uncapturable") {
			$("captureWindowItem").classList.add("disabled");
			$("captureAreaItem").classList.add("disabled");
			$("captureWebpageItem").classList.add("disabled")
		}
	}
});
function resizeDivWidth(b, a) {
	$(b).style.width = a + "px"
};
