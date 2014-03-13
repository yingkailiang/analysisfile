var User = function(a) {
	for (var b in a) {
		this[b] = a[b];
	}
};
var Account = {
	getUsers: function(a) {
		var c = localStorage.getItem(a + "_userInfo");
		if (c) {
			c = JSON.parse(c);
			for (var b in c) {
				if (Account.isExpires(c[b])) {
					delete c[b];
				}
			}
			localStorage.setItem(a + "_userInfo", JSON.stringify(c));
			return c;
		}
		return {};
	},
	getUser: function(c, b) {
		var d = Account.getUsers(c);
		var a = d[b];
		if (a && Account.isExpires(a)) {
			Account.removeUser(c, b);
			return null;
		} else {
			return a;
		}
	},
	addUser: function(c, a) {
		var d = Account.getUsers(c);
		var b = a.id;
		if (!d[b]) {
			d[b] = a;
			d = JSON.stringify(d);
			localStorage.setItem(c + "_userInfo", d);
		}
	},
	updateUser: function(c, a) {
		var d = Account.getUsers(c);
		var b = a.id;
		if (d && d[b]) {
			d[b] = a;
			d = JSON.stringify(d);
			localStorage.setItem(c + "_userInfo", d);
		}
	},
	removeUser: function(b, a) {
		var c = Account.getUsers(b);
		delete c[a];
		c = JSON.stringify(c);
		localStorage.setItem(b + "_userInfo", c);
	},
	isExpires: function(b) {
		var a = b.expires;
		if (a) {
			return new Date().getTime() >= a;
		}
		return false;
	}
};
