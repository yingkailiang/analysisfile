(function() {
	function d(q) {
		if (arguments.length < 1 || q.constructor != Object) {
			throw new Error("Bad parameter.")
		}
		var j = q.url;
		var u = q.success;
		var k = q.complete;
		if (!j || !(u || k)) {
			throw new Error("Parameter url and success or complete are required.")
		}
		var v = q.parameters || {};
		var h = q.method || "GET";
		var n = q.status;
		var m = q.headers || {};
		var p = q.data || null;
		var t = q.multipartData;
		var i = c(v);
		if (t) {
			var l = t.boundary || "XMLHttpRequest2";
			h = "POST";
			var r;
			var s = m["Content-Type"] || "multipart/form-data";
			if (s.indexOf("multipart/form-data") == 0) {
				r = b(t, l, v);
				p = r
			} else {
				if (s.indexOf("multipart/related") == 0) {
					m["Content-Type"] = "multipart/related; boundary=" + l;
					r = e(l, t.dataList);
					p = a(r)
				}
			}
		} else {
			if (i) {
				j += "?" + i
			}
		}
		var w = new XMLHttpRequest();
		w.open(h, j, true);
		w.onreadystatechange = function() {
			if (w.readyState == 4) {
				var x = w.status;
				var y = f(w);
				if (k) {
					k(x, y)
				}
				if (u && (x == 200 || x == 304)) {
					u(y)
				} else {
					if (n) {
						if (n[x]) {
							n[x](y)
						} else {
							if (n.others) {
								n.others(y, x)
							}
						}
					}
				}
			}
		};
		var g = q.progress;
		if (g) {
			w.upload.addEventListener("progress",
			function(x) {
				if (x.lengthComputable) {
					g(x.loaded, x.total)
				}
			},
			false)
		}
		for (var o in m) {
			w.setRequestHeader(o, m[o])
		}
		w.send(p)
	}
	function c(h) {
		var j = [];
		for (var g in h) {
			var i = h[g];
			if (i.constructor == Array) {
				i.forEach(function(k) {
					j.push(g + "=" + k)
				})
			} else {
				j.push(g + "=" + i)
			}
		}
		return j.join("&")
	}
	function f(h) {
		var g = h.getResponseHeader("content-type");
		if (typeof g == "string") {
			if (g.indexOf("xml") >= 0) {
				return h.responseXML
			} else {
				if (g.indexOf("json") >= 0) {
					return JSON.parse(h.responseText)
				}
			}
		}
		return h.responseText
	}
	function a(j, m) {
		var g = j.length;
		var k = new Uint8Array(g);
		for (var h = 0; h < g; h++) {
			k[h] = j.charCodeAt(h)
		}
		var l = new Blob([k.buffer], {
			type: "image/png"
		});
		return l
	}
	function b(o, g, n) {
		var h = new FormData();
		var p = "Content-Disposition: form-data; ";
		var k = [];
		for (var q in n) {
			k.push("--" + g + "\r\n");
			k.push(p);
			k.push('name="' + q + '"\r\n\r\n' + n[q] + "\r\n");
			h.append(q, n[q])
		}
		var l = o.data.length;
		var k = new Uint8Array(l);
		for (var j = 0; j < l; j++) {
			k[j] = o.data.charCodeAt(j)
		}
		var m = new Blob([k.buffer], {
			type: "image/png"
		});
		h.append((o.name || "binaryfilename"), m, o.value);
		return h;
		k.push("--" + g + "\r\n");
		k.push(p);
		k.push('name="' + (o.name || "binaryfilename") + '"; ');
		k.push('filename="' + o.value + '"\r\n');
		k.push("Content-type: " + o.type + "\r\n\r\n");
		k.push(o.data + "\r\n");
		k.push("--" + g + "--\r\n");
		return k.join("")
	}
	function e(i, h) {
		var g = [];
		h.forEach(function(j) {
			g.push("--" + i + "\r\n");
			g.push("Content-Type: " + j.contentType + "\r\n\r\n");
			g.push(j.data + "\r\n")
		});
		g.push("--" + i + "--\r\n");
		return g.join("")
	}
	d.encodeForBinary = function(g) {
		g = encodeURI(g).replace(/%([A-Z0-9]{2})/g, "%u00$1");
		return unescape(g)
	};
	d.convertEntityString = function(g) {
		var h = ["<", ">", "&", '"', "'"];
		var i = ["&lt;", "&gt;", "&amp;", "&quot;", "&apos;"];
		h.forEach(function(k, j) {
			g = g.replace(k, i[j])
		});
		return g
	};
	d.constructBlobData = a;
	window.ajax = d
})();
