var h, aa = aa || {}, n = this,
    ba = function () {}, q = function (a) {
        var b = typeof a;
        if ("object" == b)
            if (a) {
                if (a instanceof Array) return "array";
                if (a instanceof Object) return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c) return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
            } else return "null";
            else if ("function" == b && "undefined" == typeof a.call) return "object";
        return b
    }, ca = function (a) {
        var b = q(a);
        return "array" == b || "object" == b && "number" == typeof a.length
    }, r = function (a) {
        return "string" == typeof a
    }, s = function (a) {
        return a[da] || (a[da] = ++ea)
    }, da = "closure_uid_" + (1E9 * Math.random() >>> 0),
    ea = 0,
    fa = function (a, b, c) {
        return a.call.apply(a.bind, arguments)
    }, ga = function (a, b, c) {
        if (!a) throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments,
                2);
            return function () {
                var c = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(c, d);
                return a.apply(b, c)
            }
        }
        return function () {
            return a.apply(b, arguments)
        }
    }, t = function (a, b, c) {
        t = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? fa : ga;
        return t.apply(null, arguments)
    }, u = function (a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.W = b.prototype;
        a.prototype = new c
    };
Function.prototype.bind = Function.prototype.bind || function (a, b) {
    if (1 < arguments.length) {
        var c = Array.prototype.slice.call(arguments, 1);
        c.unshift(this, a);
        return t.apply(null, c)
    }
    return t(this, a)
};
var v = function (a) {
    Error.captureStackTrace ? Error.captureStackTrace(this, v) : this.stack = Error().stack || "";
    a && (this.message = String(a))
};
u(v, Error);
var w = Array.prototype,
    ha = w.indexOf ? function (a, b, c) {
        return w.indexOf.call(a, b, c)
    } : function (a, b, c) {
        c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
        if (r(a)) return r(b) && 1 == b.length ? a.indexOf(b, c) : -1;
        for (; c < a.length; c++)
            if (c in a && a[c] === b) return c;
        return -1
    }, ia = w.forEach ? function (a, b, c) {
        w.forEach.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = r(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a)
    }, ja = w.some ? function (a, b, c) {
        return w.some.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = r(a) ? a.split("") :
                a, f = 0; f < d; f++)
            if (f in e && b.call(c, e[f], f, a)) return !0;
        return !1
    }, la = function (a) {
        var b;
        t: {
            b = ka;
            for (var c = a.length, d = r(a) ? a.split("") : a, e = 0; e < c; e++)
                if (e in d && b.call(void 0, d[e], e, a)) {
                    b = e;
                    break t
                }
            b = -1
        }
        return 0 > b ? null : r(a) ? a.charAt(b) : a[b]
    }, ma = function (a, b) {
        var c = ha(a, b),
            d;
        (d = 0 <= c) && w.splice.call(a, c, 1);
        return d
    }, na = function (a) {
        return w.concat.apply(w, arguments)
    }, oa = function (a) {
        var b = a.length;
        if (0 < b) {
            for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
            return c
        }
        return []
    };
var pa = function (a) {
    var b = [],
        c = 0,
        d;
    for (d in a) b[c++] = a[d];
    return b
}, qa = function (a) {
        var b = [],
            c = 0,
            d;
        for (d in a) b[c++] = d;
        return b
    }, ra = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),
    sa = function (a, b) {
        for (var c, d, e = 1; e < arguments.length; e++) {
            d = arguments[e];
            for (c in d) a[c] = d[c];
            for (var f = 0; f < ra.length; f++) c = ra[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
        }
    };
var x, ta, y, ua, va = function () {
        return n.navigator ? n.navigator.userAgent : null
    };
ua = y = ta = x = !1;
var wa;
if (wa = va()) {
    var xa = n.navigator;
    x = 0 == wa.indexOf("Opera");
    ta = !x && -1 != wa.indexOf("MSIE");
    y = !x && -1 != wa.indexOf("WebKit");
    ua = !x && !y && "Gecko" == xa.product
}
var ya = x,
    A = ta,
    B = ua,
    C = y,
    za = function () {
        var a = n.document;
        return a ? a.documentMode : void 0
    }, Aa;
t: {
    var Ba = "",
        D;
    if (ya && n.opera) var Ca = n.opera.version,
    Ba = "function" == typeof Ca ? Ca() : Ca;
    else if (B ? D = /rv\:([^\);]+)(\)|;)/ : A ? D = /MSIE\s+([^\);]+)(\)|;)/ : C && (D = /WebKit\/(\S+)/), D) var Da = D.exec(va()),
    Ba = Da ? Da[1] : "";
    if (A) {
        var Ea = za();
        if (Ea > parseFloat(Ba)) {
            Aa = String(Ea);
            break t
        }
    }
    Aa = Ba
}
var Fa = Aa,
    Ga = {}, E = function (a) {
        var b;
        if (!(b = Ga[a])) {
            b = 0;
            for (var c = String(Fa).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), d = String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
                var g = c[f] || "",
                    k = d[f] || "",
                    l = RegExp("(\\d*)(\\D*)", "g"),
                    J = RegExp("(\\d*)(\\D*)", "g");
                do {
                    var m = l.exec(g) || ["", "", ""],
                        p = J.exec(k) || ["", "", ""];
                    if (0 == m[0].length && 0 == p[0].length) break;
                    b = ((0 == m[1].length ? 0 : parseInt(m[1], 10)) < (0 == p[1].length ? 0 : parseInt(p[1], 10)) ? -1 : (0 == m[1].length ?
                        0 : parseInt(m[1], 10)) > (0 == p[1].length ? 0 : parseInt(p[1], 10)) ? 1 : 0) || ((0 == m[2].length) < (0 == p[2].length) ? -1 : (0 == m[2].length) > (0 == p[2].length) ? 1 : 0) || (m[2] < p[2] ? -1 : m[2] > p[2] ? 1 : 0)
                } while (0 == b)
            }
            b = Ga[a] = 0 <= b
        }
        return b
    }, Ha = n.document,
    Ia = Ha && A ? za() || ("CSS1Compat" == Ha.compatMode ? parseInt(Fa, 10) : 5) : void 0;
!B && !A || A && A && 9 <= Ia || B && E("1.9.1");
A && E("9");
var Ja = function () {
    var a = document;
    return a.querySelectorAll && a.querySelector ? a.querySelectorAll("WEBVIEW") : a.getElementsByTagName("WEBVIEW")
};
var Ka = "StopIteration" in n ? n.StopIteration : Error("StopIteration"),
    La = function () {};
La.prototype.next = function () {
    throw Ka;
};
La.prototype.xa = function () {
    return this
};
var F = function (a, b) {
    this.h = {};
    this.d = [];
    var c = arguments.length;
    if (1 < c) {
        if (c % 2) throw Error("Uneven number of arguments");
        for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1])
    } else if (a) {
        a instanceof F ? (c = a.n(), d = a.j()) : (c = qa(a), d = pa(a));
        for (var e = 0; e < c.length; e++) this.set(c[e], d[e])
    }
};
h = F.prototype;
h.b = 0;
h.S = 0;
h.j = function () {
    Ma(this);
    for (var a = [], b = 0; b < this.d.length; b++) a.push(this.h[this.d[b]]);
    return a
};
h.n = function () {
    Ma(this);
    return this.d.concat()
};
h.F = function (a) {
    return G(this.h, a)
};
h.remove = function (a) {
    return G(this.h, a) ? (delete this.h[a], this.b--, this.S++, this.d.length > 2 * this.b && Ma(this), !0) : !1
};
var Ma = function (a) {
    if (a.b != a.d.length) {
        for (var b = 0, c = 0; b < a.d.length;) {
            var d = a.d[b];
            G(a.h, d) && (a.d[c++] = d);
            b++
        }
        a.d.length = c
    }
    if (a.b != a.d.length) {
        for (var e = {}, c = b = 0; b < a.d.length;) d = a.d[b], G(e, d) || (a.d[c++] = d, e[d] = 1), b++;
        a.d.length = c
    }
};
F.prototype.get = function (a, b) {
    return G(this.h, a) ? this.h[a] : b
};
F.prototype.set = function (a, b) {
    G(this.h, a) || (this.b++, this.d.push(a), this.S++);
    this.h[a] = b
};
F.prototype.r = function () {
    return new F(this)
};
F.prototype.xa = function (a) {
    Ma(this);
    var b = 0,
        c = this.d,
        d = this.h,
        e = this.S,
        f = this,
        g = new La;
    g.next = function () {
        for (;;) {
            if (e != f.S) throw Error("The map has changed since the iterator was created");
            if (b >= c.length) throw Ka;
            var g = c[b++];
            return a ? g : d[g]
        }
    };
    return g
};
var G = function (a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
};
var Na = function (a) {
    if ("function" == typeof a.j) return a.j();
    if (r(a)) return a.split("");
    if (ca(a)) {
        for (var b = [], c = a.length, d = 0; d < c; d++) b.push(a[d]);
        return b
    }
    return pa(a)
}, Oa = function (a, b, c) {
        if ("function" == typeof a.forEach) a.forEach(b, c);
        else if (ca(a) || r(a)) ia(a, b, c);
        else {
            var d;
            if ("function" == typeof a.n) d = a.n();
            else if ("function" != typeof a.j)
                if (ca(a) || r(a)) {
                    d = [];
                    for (var e = a.length, f = 0; f < e; f++) d.push(f)
                } else d = qa(a);
                else d = void 0;
            for (var e = Na(a), f = e.length, g = 0; g < f; g++) b.call(c, e[g], d && d[g], a)
        }
    };
var Pa = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$"),
    Ra = function (a) {
        if (Qa) {
            Qa = !1;
            var b = n.location;
            if (b) {
                var c = b.href;
                if (c && (c = (c = Ra(c)[3] || null) && decodeURIComponent(c)) && c != b.hostname) throw Qa = !0, Error();
            }
        }
        return a.match(Pa)
    }, Qa = C;
var H = function (a, b) {
    var c;
    if (a instanceof H) this.e = void 0 !== b ? b : a.e, Sa(this, a.A), c = a.R, I(this), this.R = c, c = a.G, I(this), this.G = c, Ta(this, a.Q), c = a.P, I(this), this.P = c, Ua(this, a.g.r()), c = a.O, I(this), this.O = c;
    else if (a && (c = Ra(String(a)))) {
        this.e = !! b;
        Sa(this, c[1] || "", !0);
        var d = c[2] || "";
        I(this);
        this.R = d ? decodeURIComponent(d) : "";
        d = c[3] || "";
        I(this);
        this.G = d ? decodeURIComponent(d) : "";
        Ta(this, c[4]);
        d = c[5] || "";
        I(this);
        this.P = d ? decodeURIComponent(d) : "";
        Ua(this, c[6] || "", !0);
        c = c[7] || "";
        I(this);
        this.O = c ? decodeURIComponent(c) :
            ""
    } else this.e = !! b, this.g = new K(null, 0, this.e)
};
h = H.prototype;
h.A = "";
h.R = "";
h.G = "";
h.Q = null;
h.P = "";
h.O = "";
h.za = !1;
h.e = !1;
h.toString = function () {
    var a = [],
        b = this.A;
    b && a.push(L(b, Va), ":");
    if (b = this.G) {
        a.push("//");
        var c = this.R;
        c && a.push(L(c, Va), "@");
        a.push(encodeURIComponent(String(b)));
        b = this.Q;
        null != b && a.push(":", String(b))
    }
    if (b = this.P) this.G && "/" != b.charAt(0) && a.push("/"), a.push(L(b, "/" == b.charAt(0) ? Wa : Xa));
    (b = this.g.toString()) && a.push("?", b);
    (b = this.O) && a.push("#", L(b, Ya));
    return a.join("")
};
h.r = function () {
    return new H(this)
};
var Sa = function (a, b, c) {
    I(a);
    a.A = c ? b ? decodeURIComponent(b) : "" : b;
    a.A && (a.A = a.A.replace(/:$/, ""))
}, Ta = function (a, b) {
        I(a);
        if (b) {
            b = Number(b);
            if (isNaN(b) || 0 > b) throw Error("Bad port number " + b);
            a.Q = b
        } else a.Q = null
    }, Ua = function (a, b, c) {
        I(a);
        b instanceof K ? (a.g = b, a.g.aa(a.e)) : (c || (b = L(b, Za)), a.g = new K(b, 0, a.e))
    }, I = function (a) {
        if (a.za) throw Error("Tried to modify a read-only Uri");
    };
H.prototype.aa = function (a) {
    this.e = a;
    this.g && this.g.aa(a);
    return this
};
var $a = function (a) {
    return a instanceof H ? a.r() : new H(a, void 0)
}, L = function (a, b) {
        return r(a) ? encodeURI(a).replace(b, ab) : null
    }, ab = function (a) {
        a = a.charCodeAt(0);
        return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16)
    }, Va = /[#\/\?@]/g,
    Xa = /[\#\?:]/g,
    Wa = /[\#\?]/g,
    Za = /[\#\?@]/g,
    Ya = /#/g,
    K = function (a, b, c) {
        this.f = a || null;
        this.e = !! c
    }, N = function (a) {
        if (!a.c && (a.c = new F, a.b = 0, a.f))
            for (var b = a.f.split("&"), c = 0; c < b.length; c++) {
                var d = b[c].indexOf("="),
                    e = null,
                    f = null;
                0 <= d ? (e = b[c].substring(0, d), f = b[c].substring(d + 1)) : e =
                    b[c];
                e = decodeURIComponent(e.replace(/\+/g, " "));
                e = M(a, e);
                a.add(e, f ? decodeURIComponent(f.replace(/\+/g, " ")) : "")
            }
    };
h = K.prototype;
h.c = null;
h.b = null;
h.add = function (a, b) {
    N(this);
    this.f = null;
    a = M(this, a);
    var c = this.c.get(a);
    c || this.c.set(a, c = []);
    c.push(b);
    this.b++;
    return this
};
h.remove = function (a) {
    N(this);
    a = M(this, a);
    return this.c.F(a) ? (this.f = null, this.b -= this.c.get(a).length, this.c.remove(a)) : !1
};
h.F = function (a) {
    N(this);
    a = M(this, a);
    return this.c.F(a)
};
h.n = function () {
    N(this);
    for (var a = this.c.j(), b = this.c.n(), c = [], d = 0; d < b.length; d++)
        for (var e = a[d], f = 0; f < e.length; f++) c.push(b[d]);
    return c
};
h.j = function (a) {
    N(this);
    var b = [];
    if (a) this.F(a) && (b = na(b, this.c.get(M(this, a))));
    else {
        a = this.c.j();
        for (var c = 0; c < a.length; c++) b = na(b, a[c])
    }
    return b
};
h.set = function (a, b) {
    N(this);
    this.f = null;
    a = M(this, a);
    this.F(a) && (this.b -= this.c.get(a).length);
    this.c.set(a, [b]);
    this.b++;
    return this
};
h.get = function (a, b) {
    var c = a ? this.j(a) : [];
    return 0 < c.length ? String(c[0]) : b
};
h.toString = function () {
    if (this.f) return this.f;
    if (!this.c) return "";
    for (var a = [], b = this.c.n(), c = 0; c < b.length; c++)
        for (var d = b[c], e = encodeURIComponent(String(d)), d = this.j(d), f = 0; f < d.length; f++) {
            var g = e;
            "" !== d[f] && (g += "=" + encodeURIComponent(String(d[f])));
            a.push(g)
        }
    return this.f = a.join("&")
};
h.r = function () {
    var a = new K;
    a.f = this.f;
    this.c && (a.c = this.c.r(), a.b = this.b);
    return a
};
var M = function (a, b) {
    var c = String(b);
    a.e && (c = c.toLowerCase());
    return c
};
K.prototype.aa = function (a) {
    a && !this.e && (N(this), this.f = null, Oa(this.c, function (a, c) {
        var d = c.toLowerCase();
        c != d && (this.remove(c), this.remove(d), 0 < a.length && (this.f = null, this.c.set(M(this, d), oa(a)), this.b += a.length))
    }, this));
    this.e = a
};
var O = function () {};
var bb = function () {};
bb.prototype.$ = !1;
bb.prototype.la = function () {
    this.$ || (this.$ = !0, this.p())
};
bb.prototype.p = function () {
    if (this.na)
        for (; this.na.length;) this.na.shift()()
};
var P = function (a, b) {
    this.type = a;
    this.currentTarget = this.target = b
};
h = P.prototype;
h.p = function () {};
h.la = function () {};
h.q = !1;
h.defaultPrevented = !1;
h.ja = !0;
h.preventDefault = function () {
    this.defaultPrevented = !0;
    this.ja = !1
};
var cb = function (a) {
    cb[" "](a);
    return a
};
cb[" "] = ba;
var db = !A || A && 9 <= Ia,
    eb = A && !E("9");
!C || E("528");
B && E("1.9b") || A && E("8") || ya && E("9.5") || C && E("528");
B && !E("8") || A && E("9");
var Q = function (a, b) {
    a && fb(this, a, b)
};
u(Q, P);
h = Q.prototype;
h.target = null;
h.relatedTarget = null;
h.offsetX = 0;
h.offsetY = 0;
h.clientX = 0;
h.clientY = 0;
h.screenX = 0;
h.screenY = 0;
h.button = 0;
h.keyCode = 0;
h.charCode = 0;
h.ctrlKey = !1;
h.altKey = !1;
h.shiftKey = !1;
h.metaKey = !1;
h.ka = null;
var fb = function (a, b, c) {
    var d = a.type = b.type;
    P.call(a, d);
    a.target = b.target || b.srcElement;
    a.currentTarget = c;
    if (c = b.relatedTarget) {
        if (B) {
            var e;
            t: {
                try {
                    cb(c.nodeName);
                    e = !0;
                    break t
                } catch (f) {}
                e = !1
            }
            e || (c = null)
        }
    } else "mouseover" == d ? c = b.fromElement : "mouseout" == d && (c = b.toElement);
    a.relatedTarget = c;
    a.offsetX = C || void 0 !== b.offsetX ? b.offsetX : b.layerX;
    a.offsetY = C || void 0 !== b.offsetY ? b.offsetY : b.layerY;
    a.clientX = void 0 !== b.clientX ? b.clientX : b.pageX;
    a.clientY = void 0 !== b.clientY ? b.clientY : b.pageY;
    a.screenX = b.screenX ||
        0;
    a.screenY = b.screenY || 0;
    a.button = b.button;
    a.keyCode = b.keyCode || 0;
    a.charCode = b.charCode || ("keypress" == d ? b.keyCode : 0);
    a.ctrlKey = b.ctrlKey;
    a.altKey = b.altKey;
    a.shiftKey = b.shiftKey;
    a.metaKey = b.metaKey;
    a.state = b.state;
    a.ka = b;
    b.defaultPrevented && a.preventDefault();
    delete a.q
};
Q.prototype.preventDefault = function () {
    Q.W.preventDefault.call(this);
    var a = this.ka;
    if (a.preventDefault) a.preventDefault();
    else if (a.returnValue = !1, eb) try {
        if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) a.keyCode = -1
    } catch (b) {}
};
Q.prototype.p = function () {};
var gb = "closure_listenable_" + (1E6 * Math.random() | 0),
    hb = 0;
var ib = function (a, b, c, d, e, f) {
    this.k = a;
    this.proxy = b;
    this.src = c;
    this.type = d;
    this.capture = !! e;
    this.v = f;
    this.key = ++hb;
    this.removed = this.w = !1
};
var R = {}, S = {}, T = {}, U = {}, jb = function (a, b, c, d, e) {
        if ("array" == q(b))
            for (var f = 0; f < b.length; f++) jb(a, b[f], c, d, e);
        else if (c = kb(c), a && a[gb]) lb(a, b, c, !1, d, e);
        else t: {
            if (!b) throw Error("Invalid event type");
            d = !! d;
            var g = S;
            b in g || (g[b] = {
                b: 0,
                l: 0
            });
            g = g[b];
            d in g || (g[d] = {
                b: 0,
                l: 0
            }, g.b++);
            var g = g[d],
                f = s(a),
                k;
            g.l++;
            if (g[f]) {
                k = g[f];
                for (var l = 0; l < k.length; l++)
                    if (g = k[l], g.k == c && g.v == e) {
                        if (g.removed) break;
                        k[l].w = !1;
                        break t
                    }
            } else k = g[f] = [], g.b++;
            l = mb();
            g = new ib(c, l, a, b, d, e);
            g.w = !1;
            l.src = a;
            l.k = g;
            k.push(g);
            T[f] || (T[f] = []);
            T[f].push(g);
            a.addEventListener ? a.addEventListener(b, l, d) : a.attachEvent(b in U ? U[b] : U[b] = "on" + b, l);
            R[g.key] = g
        }
    }, mb = function () {
        var a = nb,
            b = db ? function (c) {
                return a.call(b.src, b.k, c)
            } : function (c) {
                c = a.call(b.src, b.k, c);
                if (!c) return c
            };
        return b
    }, ob = function (a, b, c, d, e) {
        if ("array" == q(b))
            for (var f = 0; f < b.length; f++) ob(a, b[f], c, d, e);
        else if (c = kb(c), a && a[gb]) b in a.i && (a = a.i[b], c = pb(a, c, d, e), -1 < c && (e = a[c], delete R[e.key], e.removed = !0, w.splice.call(a, c, 1)));
        else {
            d = !! d;
            t: {
                f = S;
                if (b in f && (f = f[b], d in f && (f =
                    f[d], a = s(a), f[a]))) {
                    a = f[a];
                    break t
                }
                a = null
            }
            if (a)
                for (f = 0; f < a.length; f++)
                    if (a[f].k == c && a[f].capture == d && a[f].v == e) {
                        qb(a[f]);
                        break
                    }
        }
    }, qb = function (a) {
        if ("number" != typeof a && a && !a.removed) {
            var b = a.src;
            if (b && b[gb]) rb(b, a);
            else {
                var c = a.type,
                    d = a.proxy,
                    e = a.capture;
                b.removeEventListener ? b.removeEventListener(c, d, e) : b.detachEvent && b.detachEvent(c in U ? U[c] : U[c] = "on" + c, d);
                b = s(b);
                T[b] && (d = T[b], ma(d, a), 0 == d.length && delete T[b]);
                a.removed = !0;
                a.k = null;
                a.proxy = null;
                a.src = null;
                a.v = null;
                if (d = S[c][e][b]) d.ga = !0, sb(c,
                    e, b, d);
                delete R[a.key]
            }
        }
    }, sb = function (a, b, c, d) {
        if (!d.T && d.ga) {
            for (var e = 0, f = 0; e < d.length; e++) d[e].removed || (e != f && (d[f] = d[e]), f++);
            d.length = f;
            d.ga = !1;
            0 == f && (delete S[a][b][c], S[a][b].b--, 0 == S[a][b].b && (delete S[a][b], S[a].b--), 0 == S[a].b && delete S[a])
        }
    }, ub = function (a, b, c, d, e) {
        var f = 1;
        b = s(b);
        if (a[b]) {
            var g = --a.l,
                k = a[b];
            k.T ? k.T++ : k.T = 1;
            try {
                for (var l = k.length, J = 0; J < l; J++) {
                    var m = k[J];
                    m && !m.removed && (f &= !1 !== tb(m, e))
                }
            } finally {
                a.l = Math.max(g, a.l), k.T--, sb(c, d, b, k)
            }
        }
        return Boolean(f)
    }, tb = function (a, b) {
        var c =
            a.k,
            d = a.v || a.src;
        a.w && qb(a);
        return c.call(d, b)
    }, nb = function (a, b) {
        if (a.removed) return !0;
        var c = a.type,
            d = S;
        if (!(c in d)) return !0;
        var d = d[c],
            e, f;
        if (!db) {
            var g;
            if (!(g = b)) t: {
                g = ["window", "event"];
                for (var k = n; e = g.shift();)
                    if (null != k[e]) k = k[e];
                    else {
                        g = null;
                        break t
                    }
                g = k
            }
            e = g;
            g = !0 in d;
            k = !1 in d;
            if (g) {
                if (0 > e.keyCode || void 0 != e.returnValue) return !0;
                t: {
                    var l = !1;
                    if (0 == e.keyCode) try {
                        e.keyCode = -1;
                        break t
                    } catch (J) {
                        l = !0
                    }
                    if (l || void 0 == e.returnValue) e.returnValue = !0
                }
            }
            l = new Q;
            fb(l, e, this);
            e = !0;
            try {
                if (g) {
                    for (var m = [], p = l.currentTarget; p; p =
                        p.parentNode) m.push(p);
                    f = d[!0];
                    f.l = f.b;
                    for (var z = m.length - 1; !l.q && 0 <= z && f.l; z--) l.currentTarget = m[z], e &= ub(f, m[z], c, !0, l);
                    if (k)
                        for (f = d[!1], f.l = f.b, z = 0; !l.q && z < m.length && f.l; z++) l.currentTarget = m[z], e &= ub(f, m[z], c, !1, l)
                } else e = tb(a, l)
            } finally {
                m && (m.length = 0)
            }
            return e
        }
        c = new Q(b, this);
        return e = tb(a, c)
    }, vb = "__closure_events_fn_" + (1E9 * Math.random() >>> 0),
    kb = function (a) {
        return "function" == q(a) ? a : a[vb] || (a[vb] = function (b) {
            return a.handleEvent(b)
        })
    };
var V = function () {
    this.i = {};
    this.ta = this
};
u(V, bb);
V.prototype[gb] = !0;
h = V.prototype;
h.Z = null;
h.addEventListener = function (a, b, c, d) {
    jb(this, a, b, c, d)
};
h.removeEventListener = function (a, b, c, d) {
    ob(this, a, b, c, d)
};
h.dispatchEvent = function (a) {
    var b, c = this.Z;
    if (c) {
        b = [];
        for (var d = 1; c; c = c.Z) b.push(c), ++d
    }
    c = this.ta;
    d = a.type || a;
    if (r(a)) a = new P(a, c);
    else if (a instanceof P) a.target = a.target || c;
    else {
        var e = a;
        a = new P(d, c);
        sa(a, e)
    }
    var e = !0,
        f;
    if (b)
        for (var g = b.length - 1; !a.q && 0 <= g; g--) f = a.currentTarget = b[g], e = wb(f, d, !0, a) && e;
    a.q || (f = a.currentTarget = c, e = wb(f, d, !0, a) && e, a.q || (e = wb(f, d, !1, a) && e));
    if (b)
        for (g = 0; !a.q && g < b.length; g++) f = a.currentTarget = b[g], e = wb(f, d, !1, a) && e;
    return e
};
h.p = function () {
    V.W.p.call(this);
    var a = 0,
        b;
    for (b in this.i) {
        for (var c = this.i[b], d = 0; d < c.length; d++)++a, delete R[c[d].key], c[d].removed = !0;
        c.length = 0
    }
    this.Z = null
};
var lb = function (a, b, c, d, e, f) {
    var g = a.i[b] || (a.i[b] = []),
        k = pb(g, c, e, f); - 1 < k ? (a = g[k], d || (a.w = !1)) : (a = new ib(c, null, a, b, !! e, f), a.w = d, g.push(a))
}, rb = function (a, b) {
        var c = b.type;
        c in a.i && ma(a.i[c], b) && (delete R[b.key], b.removed = !0)
    }, wb = function (a, b, c, d) {
        if (!(b in a.i)) return !0;
        var e = !0;
        b = oa(a.i[b]);
        for (var f = 0; f < b.length; ++f) {
            var g = b[f];
            if (g && !g.removed && g.capture == c) {
                var k = g.k,
                    l = g.v || g.src;
                g.w && rb(a, g);
                e = !1 !== k.call(l, d) && e
            }
        }
        return e && !1 != d.ja
    }, pb = function (a, b, c, d) {
        for (var e = 0; e < a.length; ++e) {
            var f = a[e];
            if (f.k == b && f.capture == !! c && f.v == d) return e
        }
        return -1
    };
var xb = function (a, b, c) {
    if ("function" == q(a)) c && (a = t(a, c));
    else if (a && "function" == typeof a.handleEvent) a = t(a.handleEvent, a);
    else throw Error("Invalid listener argument");
    return 2147483647 < b ? -1 : n.setTimeout(a, b || 0)
};
var yb = function () {};
yb.prototype.M = null;
var W, zb = function () {};
u(zb, yb);
var Bb = function (a) {
    return (a = Ab(a)) ? new ActiveXObject(a) : new XMLHttpRequest
}, Cb = function (a) {
        var b = {};
        Ab(a) && (b[0] = !0, b[1] = !0);
        return b
    }, Ab = function (a) {
        if (!a.ma && "undefined" == typeof XMLHttpRequest && "undefined" != typeof ActiveXObject) {
            for (var b = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], c = 0; c < b.length; c++) {
                var d = b[c];
                try {
                    return new ActiveXObject(d), a.ma = d
                } catch (e) {}
            }
            throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");
        }
        return a.ma
    };
W = new zb;
var X = function (a) {
    V.call(this);
    this.headers = new F;
    this.s = a || null;
    this.m = !1;
    this.J = this.a = null;
    this.B = this.ba = this.I = "";
    this.o = this.U = this.H = this.V = !1;
    this.C = 0;
    this.K = null;
    this.ca = "";
    this.L = this.oa = !1
};
u(X, V);
var Db = /^https?$/i,
    Eb = ["POST", "PUT"],
    Fb = [],
    Gb = function (a, b, c, d) {
        var e = new X;
        Fb.push(e);
        b && lb(e, "complete", b, !1, void 0, void 0);
        lb(e, "ready", e.ya, !0, void 0, void 0);
        e.send(a, "POST", c, d)
    };
X.prototype.ya = function () {
    this.la();
    ma(Fb, this)
};
X.prototype.send = function (a, b, c, d) {
    if (this.a) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.I + "; newUri=" + a);
    b = b ? b.toUpperCase() : "GET";
    this.I = a;
    this.B = "";
    this.ba = b;
    this.V = !1;
    this.m = !0;
    this.a = this.s ? Bb(this.s) : Bb(W);
    this.J = this.s ? this.s.M || (this.s.M = Cb(this.s)) : W.M || (W.M = Cb(W));
    this.a.onreadystatechange = t(this.da, this);
    try {
        O(Y(this, "Opening Xhr")), this.U = !0, this.a.open(b, a, !0), this.U = !1
    } catch (e) {
        O(Y(this, "Error opening Xhr: " + e.message));
        Hb(this, e);
        return
    }
    a = c || "";
    var f =
        this.headers.r();
    d && Oa(d, function (a, b) {
        f.set(b, a)
    });
    d = la(f.n());
    c = n.FormData && a instanceof n.FormData;
    !(0 <= ha(Eb, b)) || (d || c) || f.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    Oa(f, function (a, b) {
        this.a.setRequestHeader(b, a)
    }, this);
    this.ca && (this.a.responseType = this.ca);
    "withCredentials" in this.a && (this.a.withCredentials = this.oa);
    try {
        Ib(this), 0 < this.C && (this.L = A && E(9) && "number" == typeof this.a.timeout && void 0 !== this.a.ontimeout, O(Y(this, "Will abort after " + this.C + "ms if incomplete, xhr2 " +
            this.L)), this.L ? (this.a.timeout = this.C, this.a.ontimeout = t(this.ea, this)) : this.K = xb(this.ea, this.C, this)), O(Y(this, "Sending request")), this.H = !0, this.a.send(a), this.H = !1
    } catch (g) {
        O(Y(this, "Send error: " + g.message)), Hb(this, g)
    }
};
var ka = function (a) {
    return "content-type" == a.toLowerCase()
};
X.prototype.ea = function () {
    "undefined" != typeof aa && this.a && (this.B = "Timed out after " + this.C + "ms, aborting", Y(this, this.B), this.dispatchEvent("timeout"), this.abort(8))
};
var Hb = function (a, b) {
    a.m = !1;
    a.a && (a.o = !0, a.a.abort(), a.o = !1);
    a.B = b;
    Jb(a);
    Kb(a)
}, Jb = function (a) {
        a.V || (a.V = !0, a.dispatchEvent("complete"), a.dispatchEvent("error"))
    };
X.prototype.abort = function () {
    this.a && this.m && (Y(this, "Aborting"), this.m = !1, this.o = !0, this.a.abort(), this.o = !1, this.dispatchEvent("complete"), this.dispatchEvent("abort"), Kb(this))
};
X.prototype.p = function () {
    this.a && (this.m && (this.m = !1, this.o = !0, this.a.abort(), this.o = !1), Kb(this, !0));
    X.W.p.call(this)
};
X.prototype.da = function () {
    this.$ || (this.U || this.H || this.o ? Lb(this) : this.ua())
};
X.prototype.ua = function () {
    Lb(this)
};
var Lb = function (a) {
    if (a.m && "undefined" != typeof aa)
        if (a.J[1] && 4 == Z(a) && 2 == Mb(a)) Y(a, "Local request error detected and ignored");
        else if (a.H && 4 == Z(a)) xb(a.da, 0, a);
    else if (a.dispatchEvent("readystatechange"), 4 == Z(a)) {
        Y(a, "Request complete");
        a.m = !1;
        try {
            var b = Mb(a),
                c, d;
            t: switch (b) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
                d = !0;
                break t;
            default:
                d = !1
            }
            if (!(c = d)) {
                var e;
                if (e = 0 === b) {
                    var f = Ra(String(a.I))[1] || null;
                    if (!f && self.location) var g = self.location.protocol,
                    f = g.substr(0, g.length - 1);
                    e = !Db.test(f ? f.toLowerCase() : "")
                }
                c = e
            }
            if (c) a.dispatchEvent("complete"), a.dispatchEvent("success");
            else {
                var k;
                try {
                    k = 2 < Z(a) ? a.a.statusText : ""
                } catch (l) {
                    k = ""
                }
                a.B = k + " [" + Mb(a) + "]";
                Jb(a)
            }
        } finally {
            Kb(a)
        }
    }
}, Kb = function (a, b) {
        if (a.a) {
            Ib(a);
            var c = a.a,
                d = a.J[0] ? ba : null;
            a.a = null;
            a.J = null;
            b || a.dispatchEvent("ready");
            try {
                c.onreadystatechange = d
            } catch (e) {}
        }
    }, Ib = function (a) {
        a.a && a.L && (a.a.ontimeout = null);
        "number" == typeof a.K && (n.clearTimeout(a.K), a.K = null)
    }, Z = function (a) {
        return a.a ? a.a.readyState : 0
    }, Mb = function (a) {
        try {
            return 2 <
                Z(a) ? a.a.status : -1
        } catch (b) {
            return -1
        }
    }, Y = function (a, b) {
        return b + " [" + a.ba + " " + a.I + " " + Mb(a) + "]"
    };
var Nb = function (a) {
    return function () {
        throw a;
    }
};
/*
 Portions of this code are from MochiKit, received by
 The Closure Authors under the MIT license. All other code is Copyright
 2005-2009 The Closure Authors. All Rights Reserved.
*/
var Ob = function (a, b) {
    this.D = [];
    this.pa = b || null
};
h = Ob.prototype;
h.t = !1;
h.u = !1;
h.X = !1;
h.qa = !1;
h.fa = !1;
h.ra = 0;
h.ha = function (a, b) {
    this.X = !1;
    this.t = !0;
    this.N = b;
    this.u = !a;
    Pb(this)
};
var Qb = function (a) {
    return ja(a.D, function (a) {
        return "function" == q(a[1])
    })
}, Pb = function (a) {
        a.Y && (a.t && Qb(a)) && (n.clearTimeout(a.Y), delete a.Y);
        a.ia && (a.ia.ra--, delete a.ia);
        for (var b = a.N, c = !1, d = !1; a.D.length && !a.X;) {
            var e = a.D.shift(),
                f = e[0],
                g = e[1],
                e = e[2];
            if (f = a.u ? g : f) try {
                var k = f.call(e || a.pa, b);
                void 0 !== k && (a.u = a.u && (k == b || k instanceof Error), a.N = b = k);
                b instanceof Ob && (d = !0, a.X = !0)
            } catch (l) {
                b = l, a.u = !0, Qb(a) || (c = !0)
            }
        }
        a.N = b;
        d && (d = b, k = t(a.ha, a, !0), f = t(a.ha, a, !1), d.D.push([k, f, void 0]), d.t && Pb(d), b.qa = !0);
        c && (a.Y = n.setTimeout(Nb(b), 0))
    }, Rb = function () {
        v.call(this)
    };
u(Rb, v);
Rb.prototype.message = "Deferred has already fired";
var $ = function (a, b) {
    this.wa = a;
    this.va = b
};
$.prototype.start = function () {
    chrome.experimental.identity.getAuthToken({
        interactive: !1
    }, t(this.Aa, this))
};
$.prototype.a = function (a, b, c) {
    var d = new Ob;
    Gb(a, function () {
        var a;
        try {
            a = this.a ? this.a.responseText : ""
        } catch (b) {
            a = ""
        }
        if (d.t) {
            if (!d.fa) throw new Rb;
            d.fa = !1
        }
        d.t = !0;
        d.N = a;
        d.u = !1;
        Pb(d)
    }, b, {
        Authorization: "Bearer " + c,
        "Content-Type": "application/x-www-form-urlencoded"
    });
    return d
};
$.prototype.sa = function (a) {
    var b = $a("https://accounts.google.com/MergeSession");
    I(b);
    b.g.set("source", "appsv2");
    I(b);
    b.g.set("uberauth", a);
    a = this.wa;
    I(b);
    b.g.set("continue", a);
    this.va(b.toString())
};
$.prototype.Aa = function (a) {
    if (a) {
        var b = "source=" + chrome.runtime.getManifest().oauth2.client_id;
        a = this.a("https://www.google.com/accounts/OAuthLogin?issueuberauth=1", b, a);
        a.D.push([this.sa, null, this]);
        a.t && Pb(a)
    } else throw Error(chrome.runtime.lastError.message);
};
var Sb = function (a, b) {
    a.addEventListener("loadstart", function (a) {
        a.isTopLevel && a.url == b && chrome.app.window.current().close()
    }, !1)
};
window.onload = function () {
    var a = Ja()[0],
        b = $a(location.href).g.get("url"),
        c = $a(location.href).g.get("closeUrl");
    void 0 !== c && Sb(a, c);
    (new $(b, function (b) {
        a.src = b
    })).start()
};