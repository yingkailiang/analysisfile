(function() {
	const a = "huaban.com";
	const e = "b3541fbd2abe443f87cb";
	const i = "https://" + a + "/oauth/authorize";
	const c = "token";
	const j = "http://" + a + "/bobobee_callback.html";
	const h = "http://api." + a + "/users/me";
	const g = "http://api." + a + "/boards";
	const f = "http://api." + a + "/pins/";
	const d = "Huaban_Bobobee_Boundary";
	var b = window.Huaban = {
		siteId: "huaban",
		currentUserId: null,
		redirectUrl: j,
		accessTokenCallback: null,
		getAccessToken: function(l) {
			b.accessTokenCallback = l;
			var k = i + "?client_id=" + e + "&redirect_uri=" + j + "&response_type=" + c;
			chrome.tabs.create({
				url: k
			})
		},
		parseRedirectUrl: function(n) {
			var k = false;
			if (n.indexOf(j) == 0) {
				var q = n.split("#")[1];
				if (q) {
					var r = q.split("&");
					var p = {};
					r.forEach(function(s) {
						p[s.split("=")[0]] = s.split("=")[1]
					});
					var m = p.access_token;
					var l = p.expires_in;
					if (m && l) {
						k = {
							accessToken: m,
							expires: l
						}
					} else {
						k = "bad_redirect_url"
					}
				} else {
					var o = n.split("?")[1];
					if (o.indexOf("error=") == 0) {
						k = o.substr(6)
					}
				}
			}
			return k
		},
		isRedirectUrl: function(k) {
			return b.parseRedirectUrl(k) != false
		},
		parseAccessToken: function(m) {
			var l = b.parseRedirectUrl(m);
			if (l && typeof l == "object") {
				var k = new User({
					accessToken: l.accessToken,
					expires: new Date().getTime() + l.expires * 1000
				});
				b.accessTokenCallback("success", k)
			} else {
				b.accessTokenCallback("failure", l)
			}
			b.accessTokenCallback = null
		},
		getBoards: function(k, m) {
			var l = "bearer " + k.accessToken;
			ajax({
				url: g,
				headers: {
					Authorization: l,
				},
				parameters: {
					extra: "recommend_tags"
				},
				success: function(n) {
					if (n.err) {
						return m("failure", n)
					}
					var o = n.boards.filter(function(p) {
						return p.is_private != 2
					});
					return m("success", o)
				}
			})
		},
		createBoard: function(m, o) {
			var k = Account.getUser(Huaban.siteId, Huaban.currentUserId);
			var n = "bearer " + k.accessToken;
			var l = "title=" + encodeURIComponent(m);
			ajax({
				method: "POST",
				url: g,
				headers: {
					Authorization: n,
					"Content-Type": "application/x-www-form-urlencoded",
				},
				data: l,
				success: function(p) {
					o("success", p)
				}
			})
		},
		getUserInfo: function(k, m) {
			var l = "bearer " + k.accessToken;
			ajax({
				url: h,
				headers: {
					Authorization: l,
				},
				parameters: {},
				success: function(o) {
					if (!o.user) {
						m("failure", "failed_to_get_user_info");
						return
					}
					var n = o.user.user_id;
					var p = o.user.username;
					k.id = n;
					k.name = p;
					k.urlname = o.user.urlname;
					k.avatar = o.user.avatar;
					k.bindings = o.user.bindings;
					ajax({
						url: g,
						headers: {
							Authorization: l,
						},
						parameters: {},
						success: function(q) {
							m("success", k, q.boards)
						}
					})
				},
				status: {
					404 : function() {
						m("failure", "failed_to_get_user_info")
					}
				}
			})
		},
		upload: function(l, u, q, n, k, t) {
			var o = Account.getUser(Huaban.siteId, Huaban.currentUserId);
			var p = "Bearer " + o.accessToken;
			var s = new Date().getTime() + ".png";
			var m = {
				Authorization: p,
			};
			var r = {
				boundary: d,
				data: k,
				value: s,
				type: "image/png"
			};
			ajax({
				url: f,
				headers: m,
				multipartData: r,
				parameters: {
					via: 7,
					board_id: l,
					text: u,
					link: q,
					media_type: 2,
					weibo: n ? n: ""
				},
				success: function(v) {
					if (v.pin) {
						t("success", v.pin)
					} else {
						t("failure", v.msg || v)
					}
				},
				status: {
					413 : function(v) {
						t("failure", "Entity Too Large", 413)
					},
					others: function(v, w) {
						t("failure", v, w)
					}
				}
			})
		},
		postPin: function(m, o) {
			var l = Account.getUser(b.siteId, b.currentUserId);
			var n = "bearer " + l.accessToken;
			var k = "";
			for (key in m) {
				k += key + "=" + encodeURIComponent(m[key]) + "&"
			}
			k += "via=7";
			ajax({
				method: "POST",
				url: f,
				headers: {
					Authorization: n,
					"Content-Type": "application/x-www-form-urlencoded",
				},
				data: k,
				success: function(p) {
					o("success", p)
				},
				status: {
					others: function(p, q) {
						o("failure", q)
					}
				}
			})
		},
		logout: function(k) {
			k()
		}
	}
})();
