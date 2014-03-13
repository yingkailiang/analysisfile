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
    }, r = function (a) {
        return void 0 !== a
    }, ca = function (a) {
        var b = q(a);
        return "array" == b || "object" == b && "number" == typeof a.length
    }, t = function (a) {
        return "string" == typeof a
    }, da = function (a) {
        return "function" == q(a)
    }, ea = function (a) {
        var b = typeof a;
        return "object" == b && null != a || "function" == b
    }, ha = function (a) {
        return a[fa] || (a[fa] = ++ga)
    }, fa = "closure_uid_" + (1E9 * Math.random() >>> 0),
    ga = 0,
    ia = function (a, b, c) {
        return a.call.apply(a.bind, arguments)
    }, ja = function (a, b, c) {
        if (!a) throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);
            return function () {
                var c = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(c, d);
                return a.apply(b, c)
            }
        }
        return function () {
            return a.apply(b, arguments)
        }
    }, u = function (a, b, c) {
        u = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ia : ja;
        return u.apply(null, arguments)
    }, ka = function (a, b) {
        var c = Array.prototype.slice.call(arguments,
            1);
        return function () {
            var b = Array.prototype.slice.call(arguments);
            b.unshift.apply(b, c);
            return a.apply(this, b)
        }
    }, la = Date.now || function () {
        return +new Date
    }, v = function (a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.S = b.prototype;
        a.prototype = new c
    };
Function.prototype.bind = Function.prototype.bind || function (a, b) {
    if (1 < arguments.length) {
        var c = Array.prototype.slice.call(arguments, 1);
        c.unshift(this, a);
        return u.apply(null, c)
    }
    return u(this, a)
};
var x = function (a) {
    Error.captureStackTrace ? Error.captureStackTrace(this, x) : this.stack = Error().stack || "";
    a && (this.message = String(a))
};
v(x, Error);
x.prototype.name = "CustomError";
var na = function () {
    var a = ma;
    return /^[\s\xa0]*$/.test(null == a ? "" : String(a))
}, ta = function (a) {
        if (!oa.test(a)) return a; - 1 != a.indexOf("&") && (a = a.replace(pa, "&amp;")); - 1 != a.indexOf("<") && (a = a.replace(qa, "&lt;")); - 1 != a.indexOf(">") && (a = a.replace(ra, "&gt;")); - 1 != a.indexOf('"') && (a = a.replace(sa, "&quot;"));
        return a
    }, pa = /&/g,
    qa = /</g,
    ra = />/g,
    sa = /\"/g,
    oa = /[&<>\"]/,
    ua = function (a) {
        return Array.prototype.join.call(arguments, "")
    };
var va = function () {};
var y = Array.prototype,
    wa = y.indexOf ? function (a, b, c) {
        return y.indexOf.call(a, b, c)
    } : function (a, b, c) {
        c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
        if (t(a)) return t(b) && 1 == b.length ? a.indexOf(b, c) : -1;
        for (; c < a.length; c++)
            if (c in a && a[c] === b) return c;
        return -1
    }, xa = y.forEach ? function (a, b, c) {
        y.forEach.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = t(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a)
    }, ya = function (a, b) {
        for (var c = t(a) ? a.split("") : a, d = a.length - 1; 0 <= d; --d) d in c && b.call(void 0, c[d], d, a)
    }, za = y.map ?
        function (a, b, c) {
            return y.map.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = Array(d), f = t(a) ? a.split("") : a, g = 0; g < d; g++) g in f && (e[g] = b.call(c, f[g], g, a));
        return e
    }, Aa = y.some ? function (a, b, c) {
        return y.some.call(a, b, c)
    } : function (a, b, c) {
        for (var d = a.length, e = t(a) ? a.split("") : a, f = 0; f < d; f++)
            if (f in e && b.call(c, e[f], f, a)) return !0;
        return !1
    }, Ba = function (a, b) {
        var c;
        t: {
            c = a.length;
            for (var d = t(a) ? a.split("") : a, e = 0; e < c; e++)
                if (e in d && b.call(void 0, d[e], e, a)) {
                    c = e;
                    break t
                }
            c = -1
        }
        return 0 > c ? null : t(a) ? a.charAt(c) : a[c]
    },
    Ca = function (a, b) {
        var c = wa(a, b),
            d;
        (d = 0 <= c) && y.splice.call(a, c, 1);
        return d
    }, Da = function (a) {
        return y.concat.apply(y, arguments)
    }, Ea = function (a) {
        var b = a.length;
        if (0 < b) {
            for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
            return c
        }
        return []
    }, Fa = function (a, b, c) {
        return 2 >= arguments.length ? y.slice.call(a, b) : y.slice.call(a, b, c)
    };
var Ga = "StopIteration" in n ? n.StopIteration : Error("StopIteration"),
    Ha = function () {};
Ha.prototype.next = function () {
    throw Ga;
};
Ha.prototype.eb = function () {
    return this
};
var Ia = function (a, b) {
    for (var c in a) b.call(void 0, a[c], c, a)
}, Ja = function (a) {
        var b = [],
            c = 0,
            d;
        for (d in a) b[c++] = a[d];
        return b
    }, Ka = function (a) {
        var b = [],
            c = 0,
            d;
        for (d in a) b[c++] = d;
        return b
    }, La = function (a, b, c) {
        if (b in a) throw Error('The object already contains the key "' + b + '"');
        a[b] = c
    }, Ma = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),
    Na = function (a, b) {
        for (var c, d, e = 1; e < arguments.length; e++) {
            d = arguments[e];
            for (c in d) a[c] = d[c];
            for (var f = 0; f < Ma.length; f++) c =
                Ma[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
        }
    };
var z = function (a, b) {
    this.l = {};
    this.d = [];
    var c = arguments.length;
    if (1 < c) {
        if (c % 2) throw Error("Uneven number of arguments");
        for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1])
    } else if (a) {
        a instanceof z ? (c = a.B(), d = a.q()) : (c = Ka(a), d = Ja(a));
        for (var e = 0; e < c.length; e++) this.set(c[e], d[e])
    }
};
h = z.prototype;
h.b = 0;
h.ja = 0;
h.q = function () {
    Oa(this);
    for (var a = [], b = 0; b < this.d.length; b++) a.push(this.l[this.d[b]]);
    return a
};
h.B = function () {
    Oa(this);
    return this.d.concat()
};
h.M = function (a) {
    return A(this.l, a)
};
h.remove = function (a) {
    return A(this.l, a) ? (delete this.l[a], this.b--, this.ja++, this.d.length > 2 * this.b && Oa(this), !0) : !1
};
var Oa = function (a) {
    if (a.b != a.d.length) {
        for (var b = 0, c = 0; b < a.d.length;) {
            var d = a.d[b];
            A(a.l, d) && (a.d[c++] = d);
            b++
        }
        a.d.length = c
    }
    if (a.b != a.d.length) {
        for (var e = {}, c = b = 0; b < a.d.length;) d = a.d[b], A(e, d) || (a.d[c++] = d, e[d] = 1), b++;
        a.d.length = c
    }
};
z.prototype.get = function (a, b) {
    return A(this.l, a) ? this.l[a] : b
};
z.prototype.set = function (a, b) {
    A(this.l, a) || (this.b++, this.d.push(a), this.ja++);
    this.l[a] = b
};
z.prototype.t = function () {
    return new z(this)
};
z.prototype.eb = function (a) {
    Oa(this);
    var b = 0,
        c = this.d,
        d = this.l,
        e = this.ja,
        f = this,
        g = new Ha;
    g.next = function () {
        for (;;) {
            if (e != f.ja) throw Error("The map has changed since the iterator was created");
            if (b >= c.length) throw Ga;
            var g = c[b++];
            return a ? g : d[g]
        }
    };
    return g
};
var A = function (a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
};
var Pa = function (a) {
    if ("function" == typeof a.q) return a.q();
    if (t(a)) return a.split("");
    if (ca(a)) {
        for (var b = [], c = a.length, d = 0; d < c; d++) b.push(a[d]);
        return b
    }
    return Ja(a)
}, Qa = function (a, b, c) {
        if ("function" == typeof a.forEach) a.forEach(b, c);
        else if (ca(a) || t(a)) xa(a, b, c);
        else {
            var d;
            if ("function" == typeof a.B) d = a.B();
            else if ("function" != typeof a.q)
                if (ca(a) || t(a)) {
                    d = [];
                    for (var e = a.length, f = 0; f < e; f++) d.push(f)
                } else d = Ka(a);
                else d = void 0;
            for (var e = Pa(a), f = e.length, g = 0; g < f; g++) b.call(c, e[g], d && d[g], a)
        }
    };
var B, Ra, Sa, Ta, Ua = function () {
        return n.navigator ? n.navigator.userAgent : null
    };
Ta = Sa = Ra = B = !1;
var Va;
if (Va = Ua()) {
    var Wa = n.navigator;
    B = 0 == Va.indexOf("Opera");
    Ra = !B && -1 != Va.indexOf("MSIE");
    Sa = !B && -1 != Va.indexOf("WebKit");
    Ta = !B && !Sa && "Gecko" == Wa.product
}
var Xa = B,
    C = Ra,
    D = Ta,
    E = Sa,
    Ya = n.navigator,
    Za = -1 != (Ya && Ya.platform || "").indexOf("Mac"),
    $a = function () {
        var a = n.document;
        return a ? a.documentMode : void 0
    }, ab;
t: {
    var bb = "",
        cb;
    if (Xa && n.opera) var db = n.opera.version,
    bb = "function" == typeof db ? db() : db;
    else if (D ? cb = /rv\:([^\);]+)(\)|;)/ : C ? cb = /MSIE\s+([^\);]+)(\)|;)/ : E && (cb = /WebKit\/(\S+)/), cb) var eb = cb.exec(Ua()),
    bb = eb ? eb[1] : "";
    if (C) {
        var fb = $a();
        if (fb > parseFloat(bb)) {
            ab = String(fb);
            break t
        }
    }
    ab = bb
}
var gb = ab,
    hb = {}, F = function (a) {
        var b;
        if (!(b = hb[a])) {
            b = 0;
            for (var c = String(gb).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), d = String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
                var g = c[f] || "",
                    k = d[f] || "",
                    l = RegExp("(\\d*)(\\D*)", "g"),
                    p = RegExp("(\\d*)(\\D*)", "g");
                do {
                    var m = l.exec(g) || ["", "", ""],
                        s = p.exec(k) || ["", "", ""];
                    if (0 == m[0].length && 0 == s[0].length) break;
                    b = ((0 == m[1].length ? 0 : parseInt(m[1], 10)) < (0 == s[1].length ? 0 : parseInt(s[1], 10)) ? -1 : (0 == m[1].length ?
                        0 : parseInt(m[1], 10)) > (0 == s[1].length ? 0 : parseInt(s[1], 10)) ? 1 : 0) || ((0 == m[2].length) < (0 == s[2].length) ? -1 : (0 == m[2].length) > (0 == s[2].length) ? 1 : 0) || (m[2] < s[2] ? -1 : m[2] > s[2] ? 1 : 0)
                } while (0 == b)
            }
            b = hb[a] = 0 <= b
        }
        return b
    }, ib = n.document,
    jb = ib && C ? $a() || ("CSS1Compat" == ib.compatMode ? parseInt(gb, 10) : 5) : void 0;
var G = function () {};
G.prototype.ia = !1;
G.prototype.w = function () {
    this.ia || (this.ia = !0, this.j())
};
G.prototype.j = function () {
    if (this.Pa)
        for (; this.Pa.length;) this.Pa.shift()()
};
var kb = function (a) {
    a && "function" == typeof a.w && a.w()
};
var H = function (a, b) {
    this.type = a;
    this.currentTarget = this.target = b
};
h = H.prototype;
h.j = function () {};
h.w = function () {};
h.I = !1;
h.defaultPrevented = !1;
h.Ia = !0;
h.preventDefault = function () {
    this.defaultPrevented = !0;
    this.Ia = !1
};
var lb = function (a) {
    lb[" "](a);
    return a
};
lb[" "] = ba;
var mb = !C || C && 9 <= jb,
    nb = C && !F("9");
!E || F("528");
D && F("1.9b") || C && F("8") || Xa && F("9.5") || E && F("528");
D && !F("8") || C && F("9");
var I = function (a, b) {
    a && ob(this, a, b)
};
v(I, H);
h = I.prototype;
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
h.ua = null;
var ob = function (a, b, c) {
    var d = a.type = b.type;
    H.call(a, d);
    a.target = b.target || b.srcElement;
    a.currentTarget = c;
    if (c = b.relatedTarget) {
        if (D) {
            var e;
            t: {
                try {
                    lb(c.nodeName);
                    e = !0;
                    break t
                } catch (f) {}
                e = !1
            }
            e || (c = null)
        }
    } else "mouseover" == d ? c = b.fromElement : "mouseout" == d && (c = b.toElement);
    a.relatedTarget = c;
    a.offsetX = E || void 0 !== b.offsetX ? b.offsetX : b.layerX;
    a.offsetY = E || void 0 !== b.offsetY ? b.offsetY : b.layerY;
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
    a.ua = b;
    b.defaultPrevented && a.preventDefault();
    delete a.I
};
I.prototype.preventDefault = function () {
    I.S.preventDefault.call(this);
    var a = this.ua;
    if (a.preventDefault) a.preventDefault();
    else if (a.returnValue = !1, nb) try {
        if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) a.keyCode = -1
    } catch (b) {}
};
I.prototype.j = function () {};
var pb = "closure_listenable_" + (1E6 * Math.random() | 0),
    qb = 0;
var rb = function (a, b, c, d, e, f) {
    this.r = a;
    this.proxy = b;
    this.src = c;
    this.type = d;
    this.capture = !! e;
    this.O = f;
    this.key = ++qb;
    this.removed = this.Q = !1
};
var sb = {}, J = {}, K = {}, L = {}, tb = function (a, b, c, d, e) {
        if ("array" == q(b))
            for (var f = 0; f < b.length; f++) tb(a, b[f], c, d, e);
        else c = ub(c), a && a[pb] ? vb(a, b, c, !1, d, e) : wb(a, b, c, !1, d, e)
    }, wb = function (a, b, c, d, e, f) {
        if (!b) throw Error("Invalid event type");
        e = !! e;
        var g = J;
        b in g || (g[b] = {
            b: 0,
            s: 0
        });
        g = g[b];
        e in g || (g[e] = {
            b: 0,
            s: 0
        }, g.b++);
        var g = g[e],
            k = ha(a),
            l;
        g.s++;
        if (g[k]) {
            l = g[k];
            for (var p = 0; p < l.length; p++)
                if (g = l[p], g.r == c && g.O == f) {
                    if (g.removed) break;
                    d || (l[p].Q = !1);
                    return
                }
        } else l = g[k] = [], g.b++;
        p = xb();
        g = new rb(c, p, a, b, e, f);
        g.Q = d;
        p.src = a;
        p.r = g;
        l.push(g);
        K[k] || (K[k] = []);
        K[k].push(g);
        a.addEventListener ? a.addEventListener(b, p, e) : a.attachEvent(b in L ? L[b] : L[b] = "on" + b, p);
        sb[g.key] = g
    }, xb = function () {
        var a = yb,
            b = mb ? function (c) {
                return a.call(b.src, b.r, c)
            } : function (c) {
                c = a.call(b.src, b.r, c);
                if (!c) return c
            };
        return b
    }, zb = function (a, b, c, d, e) {
        if ("array" == q(b))
            for (var f = 0; f < b.length; f++) zb(a, b[f], c, d, e);
        else c = ub(c), a && a[pb] ? vb(a, b, c, !0, d, e) : wb(a, b, c, !0, d, e)
    }, Ab = function (a, b, c, d, e) {
        if ("array" == q(b))
            for (var f = 0; f < b.length; f++) Ab(a, b[f], c, d,
                e);
        else if (c = ub(c), a && a[pb]) b in a.m && (a = a.m[b], c = Bb(a, c, d, e), -1 < c && (e = a[c], delete sb[e.key], e.removed = !0, y.splice.call(a, c, 1)));
        else {
            d = !! d;
            t: {
                f = J;
                if (b in f && (f = f[b], d in f && (f = f[d], a = ha(a), f[a]))) {
                    a = f[a];
                    break t
                }
                a = null
            }
            if (a)
                for (f = 0; f < a.length; f++)
                    if (a[f].r == c && a[f].capture == d && a[f].O == e) {
                        Cb(a[f]);
                        break
                    }
        }
    }, Cb = function (a) {
        if ("number" != typeof a && a && !a.removed) {
            var b = a.src;
            if (b && b[pb]) Db(b, a);
            else {
                var c = a.type,
                    d = a.proxy,
                    e = a.capture;
                b.removeEventListener ? b.removeEventListener(c, d, e) : b.detachEvent && b.detachEvent(c in
                    L ? L[c] : L[c] = "on" + c, d);
                b = ha(b);
                K[b] && (d = K[b], Ca(d, a), 0 == d.length && delete K[b]);
                a.removed = !0;
                a.r = null;
                a.proxy = null;
                a.src = null;
                a.O = null;
                if (d = J[c][e][b]) d.Ga = !0, Eb(c, e, b, d);
                delete sb[a.key]
            }
        }
    }, Eb = function (a, b, c, d) {
        if (!d.ka && d.Ga) {
            for (var e = 0, f = 0; e < d.length; e++) d[e].removed || (e != f && (d[f] = d[e]), f++);
            d.length = f;
            d.Ga = !1;
            0 == f && (delete J[a][b][c], J[a][b].b--, 0 == J[a][b].b && (delete J[a][b], J[a].b--), 0 == J[a].b && delete J[a])
        }
    }, Gb = function (a, b, c, d, e) {
        var f = 1;
        b = ha(b);
        if (a[b]) {
            var g = --a.s,
                k = a[b];
            k.ka ? k.ka++ : k.ka =
                1;
            try {
                for (var l = k.length, p = 0; p < l; p++) {
                    var m = k[p];
                    m && !m.removed && (f &= !1 !== Fb(m, e))
                }
            } finally {
                a.s = Math.max(g, a.s), k.ka--, Eb(c, d, b, k)
            }
        }
        return Boolean(f)
    }, Fb = function (a, b) {
        var c = a.r,
            d = a.O || a.src;
        a.Q && Cb(a);
        return c.call(d, b)
    }, yb = function (a, b) {
        if (a.removed) return !0;
        var c = a.type,
            d = J;
        if (!(c in d)) return !0;
        var d = d[c],
            e, f;
        if (!mb) {
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
                    } catch (p) {
                        l = !0
                    }
                    if (l || void 0 == e.returnValue) e.returnValue = !0
                }
            }
            l = new I;
            ob(l, e, this);
            e = !0;
            try {
                if (g) {
                    for (var m = [], s = l.currentTarget; s; s = s.parentNode) m.push(s);
                    f = d[!0];
                    f.s = f.b;
                    for (var w = m.length - 1; !l.I && 0 <= w && f.s; w--) l.currentTarget = m[w], e &= Gb(f, m[w], c, !0, l);
                    if (k)
                        for (f = d[!1], f.s = f.b, w = 0; !l.I && w < m.length && f.s; w++) l.currentTarget = m[w], e &= Gb(f, m[w], c, !1, l)
                } else e = Fb(a, l)
            } finally {
                m && (m.length = 0)
            }
            return e
        }
        c = new I(b, this);
        return e = Fb(a, c)
    }, Hb = "__closure_events_fn_" +
        (1E9 * Math.random() >>> 0),
    ub = function (a) {
        return da(a) ? a : a[Hb] || (a[Hb] = function (b) {
            return a.handleEvent(b)
        })
    };
var M = function () {
    this.m = {};
    this.Va = this
};
v(M, G);
M.prototype[pb] = !0;
h = M.prototype;
h.va = null;
h.addEventListener = function (a, b, c, d) {
    tb(this, a, b, c, d)
};
h.removeEventListener = function (a, b, c, d) {
    Ab(this, a, b, c, d)
};
h.dispatchEvent = function (a) {
    var b, c = this.va;
    if (c) {
        b = [];
        for (var d = 1; c; c = c.va) b.push(c), ++d
    }
    c = this.Va;
    d = a.type || a;
    if (t(a)) a = new H(a, c);
    else if (a instanceof H) a.target = a.target || c;
    else {
        var e = a;
        a = new H(d, c);
        Na(a, e)
    }
    var e = !0,
        f;
    if (b)
        for (var g = b.length - 1; !a.I && 0 <= g; g--) f = a.currentTarget = b[g], e = Ib(f, d, !0, a) && e;
    a.I || (f = a.currentTarget = c, e = Ib(f, d, !0, a) && e, a.I || (e = Ib(f, d, !1, a) && e));
    if (b)
        for (g = 0; !a.I && g < b.length; g++) f = a.currentTarget = b[g], e = Ib(f, d, !1, a) && e;
    return e
};
h.j = function () {
    M.S.j.call(this);
    var a = 0,
        b;
    for (b in this.m) {
        for (var c = this.m[b], d = 0; d < c.length; d++)++a, delete sb[c[d].key], c[d].removed = !0;
        c.length = 0
    }
    this.va = null
};
var vb = function (a, b, c, d, e, f) {
    var g = a.m[b] || (a.m[b] = []),
        k = Bb(g, c, e, f); - 1 < k ? (a = g[k], d || (a.Q = !1)) : (a = new rb(c, null, a, b, !! e, f), a.Q = d, g.push(a))
}, Db = function (a, b) {
        var c = b.type;
        c in a.m && Ca(a.m[c], b) && (delete sb[b.key], b.removed = !0)
    }, Ib = function (a, b, c, d) {
        if (!(b in a.m)) return !0;
        var e = !0;
        b = Ea(a.m[b]);
        for (var f = 0; f < b.length; ++f) {
            var g = b[f];
            if (g && !g.removed && g.capture == c) {
                var k = g.r,
                    l = g.O || g.src;
                g.Q && Db(a, g);
                e = !1 !== k.call(l, d) && e
            }
        }
        return e && !1 != d.Ia
    }, Bb = function (a, b, c, d) {
        for (var e = 0; e < a.length; ++e) {
            var f = a[e];
            if (f.r == b && f.capture == !! c && f.O == d) return e
        }
        return -1
    };
var Jb = function (a) {
    return function () {
        return a
    }
}, Kb = function (a) {
        return function () {
            throw a;
        }
    };
/*
 Portions of this code are from MochiKit, received by
 The Closure Authors under the MIT license. All other code is Copyright
 2005-2009 The Closure Authors. All Rights Reserved.
*/
var N = function (a, b) {
    this.ha = [];
    this.Fa = a;
    this.Da = b || null
};
h = N.prototype;
h.P = !1;
h.U = !1;
h.qa = !1;
h.Ua = !1;
h.ta = !1;
h.fa = 0;
h.cancel = function (a) {
    if (this.P) this.T instanceof N && this.T.cancel();
    else {
        if (this.A) {
            var b = this.A;
            delete this.A;
            a ? b.cancel(a) : (b.fa--, 0 >= b.fa && b.cancel())
        }
        this.Fa ? this.Fa.call(this.Da, this) : this.ta = !0;
        this.P || this.C(new Lb)
    }
};
h.Ea = function (a, b) {
    this.qa = !1;
    Mb(this, a, b)
};
var Mb = function (a, b, c) {
    a.P = !0;
    a.T = c;
    a.U = !b;
    Nb(a)
}, Pb = function (a) {
        if (a.P) {
            if (!a.ta) throw new Ob;
            a.ta = !1
        }
    };
N.prototype.e = function (a) {
    Pb(this);
    Mb(this, !0, a)
};
N.prototype.C = function (a) {
    Pb(this);
    Mb(this, !1, a)
};
var Qb = function (a, b, c) {
    O(a, b, null, c)
}, O = function (a, b, c, d) {
        a.ha.push([b, c, d]);
        a.P && Nb(a)
    }, Rb = function (a) {
        return Aa(a.ha, function (a) {
            return da(a[1])
        })
    }, Nb = function (a) {
        a.ra && (a.P && Rb(a)) && (n.clearTimeout(a.ra), delete a.ra);
        a.A && (a.A.fa--, delete a.A);
        for (var b = a.T, c = !1, d = !1; a.ha.length && !a.qa;) {
            var e = a.ha.shift(),
                f = e[0],
                g = e[1],
                e = e[2];
            if (f = a.U ? g : f) try {
                var k = f.call(e || a.Da, b);
                r(k) && (a.U = a.U && (k == b || k instanceof Error), a.T = b = k);
                b instanceof N && (d = !0, a.qa = !0)
            } catch (l) {
                b = l, a.U = !0, Rb(a) || (c = !0)
            }
        }
        a.T = b;
        d && (O(b,
            u(a.Ea, a, !0), u(a.Ea, a, !1)), b.Ua = !0);
        c && (a.ra = n.setTimeout(Kb(b), 0))
    }, Sb = function (a) {
        var b = new N;
        b.e(a);
        return b
    }, Tb = function (a, b) {
        if (a instanceof N) {
            var c = new N;
            O(a, c.e, c.C, c);
            c.A = a;
            a.fa++;
            Qb(c, b, void 0)
        } else Qb(Sb(a), b, void 0)
    }, Ob = function () {
        x.call(this)
    };
v(Ob, x);
Ob.prototype.message = "Deferred has already fired";
Ob.prototype.name = "AlreadyCalledError";
var Lb = function () {
    x.call(this)
};
v(Lb, x);
Lb.prototype.message = "Deferred was canceled";
Lb.prototype.name = "CanceledError";
var Vb = function (a) {
    this.N = {};
    this.pa = {};
    this.sa = {};
    this.H = {};
    this.Ha = {};
    this.Ba = {};
    this.Ca = a ? a.Ca : new M;
    this.Sa = !a;
    this.V = null;
    a ? (this.V = a, this.sa = a.sa, this.H = a.H, this.pa = a.pa, this.Ha = a.Ha) : la();
    a = Ub(this);
    this != a && (a.ga ? a.ga.push(this) : a.ga = [this])
};
v(Vb, G);
var Ub = function (a) {
    for (; a.V;) a = a.V;
    return a
};
Vb.prototype.get = function (a) {
    var b;
    t: {
        for (b = this; b; b = b.V) {
            if (b.N[a]) {
                b = b.N[a][0];
                break t
            }
            if (b.Ba[a]) break
        }
        if (b = this.sa[a]) {
            b = b(this);
            if (!b) throw Error("Factory method for service " + a + " returned null or undefined.");
            Wb(this, a, b)
        } else b = null
    }
    if (!b) throw new Xb(a);
    return b
};
var Wb = function (a, b, c) {
    if (a.ia) kb(c);
    else {
        a.N[b] = [c, !0];
        c = Yb(a, a, b);
        for (var d = 0; d < c.length; d++) c[d].e(null);
        delete a.pa[b]
    }
}, Yb = function (a, b, c) {
        var d = [],
            e = a.H[c];
        e && (ya(e, function (a) {
            var c;
            t: {
                for (c = a.Xa; c;) {
                    if (c == b) {
                        c = !0;
                        break t
                    }
                    c = c.V
                }
                c = !1
            }
            c && (d.push(a.ib), Ca(e, a))
        }), 0 == e.length && delete a.H[c]);
        return d
    }, Zb = function (a, b) {
        a.H && Qa(a.H, function (a, d, e) {
            ya(a, function (d) {
                d.Xa == b && Ca(a, d)
            });
            0 == a.length && delete e[d]
        })
    };
Vb.prototype.j = function () {
    if (Ub(this) == this) {
        var a = this.ga;
        if (a)
            for (; a.length;) a[0].w()
    } else
        for (var a = Ub(this).ga, b = 0; b < a.length; b++)
            if (a[b] == this) {
                a.splice(b, 1);
                break
            } for (var c in this.N) a = this.N[c], a[1] && "undefined" != typeof a[0].w && a[0].w();
    this.N = null;
    this.Sa && this.Ca.w();
    Zb(this, this);
    this.H = null;
    kb(this.Ta);
    this.Ba = this.Ta = null;
    Vb.S.j.call(this)
};
var Xb = function (a) {
    x.call(this);
    this.id = a;
    this.message = 'Service for "' + a + '" is not registered'
};
v(Xb, x);
var $b = function () {
    this.Qa = la()
};
new $b;
$b.prototype.set = function (a) {
    this.Qa = a
};
$b.prototype.get = function () {
    return this.Qa
};
var P = function (a) {
    this.hb = a
};
P.prototype.A = null;
P.prototype.ya = null;
P.prototype.getName = function () {
    return this.hb
};
P.prototype.getChildren = function () {
    this.ya || (this.ya = {});
    return this.ya
};
var ac = function () {}, bc = {}, cc = null,
    Q = function (a) {
        cc || (cc = new P(""), bc[""] = cc);
        var b;
        if (!(b = bc[a])) {
            b = new P(a);
            var c = a.lastIndexOf("."),
                d = a.substr(c + 1),
                c = Q(a.substr(0, c));
            c.getChildren()[d] = b;
            b.A = c;
            bc[a] = b
        }
        return b
    };
var dc = function (a, b) {
    this.width = a;
    this.height = b
};
dc.prototype.t = function () {
    return new dc(this.width, this.height)
};
dc.prototype.floor = function () {
    this.width = Math.floor(this.width);
    this.height = Math.floor(this.height);
    return this
};
var ec = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$"),
    gc = function (a) {
        if (fc) {
            fc = !1;
            var b = n.location;
            if (b) {
                var c = b.href;
                if (c && (c = (c = gc(c)[3] || null) && decodeURIComponent(c)) && c != b.hostname) throw fc = !0, Error();
            }
        }
        return a.match(ec)
    }, fc = E;
var R = function (a, b) {
    var c;
    if (a instanceof R) this.h = r(b) ? b : a.h, hc(this, a.p), c = a.G, S(this), this.G = c, c = a.o, S(this), this.o = c, ic(this, a.L), c = a.k, S(this), this.k = c, jc(this, a.g.t()), c = a.F, S(this), this.F = c;
    else if (a && (c = gc(String(a)))) {
        this.h = !! b;
        hc(this, c[1] || "", !0);
        var d = c[2] || "";
        S(this);
        this.G = d ? decodeURIComponent(d) : "";
        d = c[3] || "";
        S(this);
        this.o = d ? decodeURIComponent(d) : "";
        ic(this, c[4]);
        d = c[5] || "";
        S(this);
        this.k = d ? decodeURIComponent(d) : "";
        jc(this, c[6] || "", !0);
        c = c[7] || "";
        S(this);
        this.F = c ? decodeURIComponent(c) :
            ""
    } else this.h = !! b, this.g = new kc(null, 0, this.h)
};
h = R.prototype;
h.p = "";
h.G = "";
h.o = "";
h.L = null;
h.k = "";
h.F = "";
h.fb = !1;
h.h = !1;
h.toString = function () {
    var a = [],
        b = this.p;
    b && a.push(lc(b, mc), ":");
    if (b = this.o) {
        a.push("//");
        var c = this.G;
        c && a.push(lc(c, mc), "@");
        a.push(encodeURIComponent(String(b)));
        b = this.L;
        null != b && a.push(":", String(b))
    }
    if (b = this.k) this.o && "/" != b.charAt(0) && a.push("/"), a.push(lc(b, "/" == b.charAt(0) ? nc : oc));
    (b = this.g.toString()) && a.push("?", b);
    (b = this.F) && a.push("#", lc(b, pc));
    return a.join("")
};
h.t = function () {
    return new R(this)
};
var hc = function (a, b, c) {
    S(a);
    a.p = c ? b ? decodeURIComponent(b) : "" : b;
    a.p && (a.p = a.p.replace(/:$/, ""))
}, qc = function (a) {
        return !!a.p
    }, ic = function (a, b) {
        S(a);
        if (b) {
            b = Number(b);
            if (isNaN(b) || 0 > b) throw Error("Bad port number " + b);
            a.L = b
        } else a.L = null
    }, jc = function (a, b, c) {
        S(a);
        b instanceof kc ? (a.g = b, a.g.xa(a.h)) : (c || (b = lc(b, rc)), a.g = new kc(b, 0, a.h))
    }, S = function (a) {
        if (a.fb) throw Error("Tried to modify a read-only Uri");
    };
R.prototype.xa = function (a) {
    this.h = a;
    this.g && this.g.xa(a);
    return this
};
var sc = function (a) {
    return a instanceof R ? a.t() : new R(a, void 0)
}, lc = function (a, b) {
        return t(a) ? encodeURI(a).replace(b, tc) : null
    }, tc = function (a) {
        a = a.charCodeAt(0);
        return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16)
    }, mc = /[#\/\?@]/g,
    oc = /[\#\?:]/g,
    nc = /[\#\?]/g,
    rc = /[\#\?@]/g,
    pc = /#/g,
    kc = function (a, b, c) {
        this.i = a || null;
        this.h = !! c
    }, U = function (a) {
        if (!a.c && (a.c = new z, a.b = 0, a.i))
            for (var b = a.i.split("&"), c = 0; c < b.length; c++) {
                var d = b[c].indexOf("="),
                    e = null,
                    f = null;
                0 <= d ? (e = b[c].substring(0, d), f = b[c].substring(d + 1)) :
                    e = b[c];
                e = decodeURIComponent(e.replace(/\+/g, " "));
                e = T(a, e);
                a.add(e, f ? decodeURIComponent(f.replace(/\+/g, " ")) : "")
            }
    };
h = kc.prototype;
h.c = null;
h.b = null;
h.add = function (a, b) {
    U(this);
    this.i = null;
    a = T(this, a);
    var c = this.c.get(a);
    c || this.c.set(a, c = []);
    c.push(b);
    this.b++;
    return this
};
h.remove = function (a) {
    U(this);
    a = T(this, a);
    return this.c.M(a) ? (this.i = null, this.b -= this.c.get(a).length, this.c.remove(a)) : !1
};
h.M = function (a) {
    U(this);
    a = T(this, a);
    return this.c.M(a)
};
h.B = function () {
    U(this);
    for (var a = this.c.q(), b = this.c.B(), c = [], d = 0; d < b.length; d++)
        for (var e = a[d], f = 0; f < e.length; f++) c.push(b[d]);
    return c
};
h.q = function (a) {
    U(this);
    var b = [];
    if (a) this.M(a) && (b = Da(b, this.c.get(T(this, a))));
    else {
        a = this.c.q();
        for (var c = 0; c < a.length; c++) b = Da(b, a[c])
    }
    return b
};
h.set = function (a, b) {
    U(this);
    this.i = null;
    a = T(this, a);
    this.M(a) && (this.b -= this.c.get(a).length);
    this.c.set(a, [b]);
    this.b++;
    return this
};
h.get = function (a, b) {
    var c = a ? this.q(a) : [];
    return 0 < c.length ? String(c[0]) : b
};
h.toString = function () {
    if (this.i) return this.i;
    if (!this.c) return "";
    for (var a = [], b = this.c.B(), c = 0; c < b.length; c++)
        for (var d = b[c], e = encodeURIComponent(String(d)), d = this.q(d), f = 0; f < d.length; f++) {
            var g = e;
            "" !== d[f] && (g += "=" + encodeURIComponent(String(d[f])));
            a.push(g)
        }
    return this.i = a.join("&")
};
h.t = function () {
    var a = new kc;
    a.i = this.i;
    this.c && (a.c = this.c.t(), a.b = this.b);
    return a
};
var T = function (a, b) {
    var c = String(b);
    a.h && (c = c.toLowerCase());
    return c
};
kc.prototype.xa = function (a) {
    a && !this.h && (U(this), this.i = null, Qa(this.c, function (a, c) {
        var d = c.toLowerCase();
        c != d && (this.remove(c), this.remove(d), 0 < a.length && (this.i = null, this.c.set(T(this, d), Ea(a)), this.b += a.length))
    }, this));
    this.h = a
};
var uc = function (a) {
    this.Ja = a
};
uc.prototype.getName = function () {
    return this.Ja.name
};
var vc = function (a, b, c, d, e) {
    this.Ya = a;
    this.name = b;
    this.La = c;
    this.Ka = d;
    this.wa = e
};
vc.prototype.toString = function () {
    var a = {};
    La(a, "galleryId", this.Ya);
    La(a, "name", this.name);
    this.wa && La(a, "deviceId", this.wa);
    this.La && La(a, "isRemovable", this.La);
    this.Ka && La(a, "isMediaDevice", this.Ka);
    return n.JSON.stringify(a)
};
var V = function () {
    this.n = [];
    this.W = {}
};
v(V, G);
V.prototype.Oa = 1;
V.prototype.la = 0;
V.prototype.ma = function (a, b) {
    var c = this.W[a];
    if (c) {
        this.la++;
        for (var d = Fa(arguments, 1), e = 0, f = c.length; e < f; e++) {
            var g = c[e];
            this.n[g + 1].apply(this.n[g + 2], d)
        }
        this.la--;
        if (this.X && 0 == this.la)
            for (; c = this.X.pop();)
                if (0 != this.la) this.X || (this.X = []), this.X.push(c);
                else if (d = this.n[c])(d = this.W[d]) && Ca(d, c), delete this.n[c], delete this.n[c + 1], delete this.n[c + 2]
    }
};
V.prototype.j = function () {
    V.S.j.call(this);
    delete this.n;
    delete this.W;
    delete this.X
};
var wc = function () {
    V.call(this)
};
v(wc, V);
var xc = function (a) {
    this.Ma = a.get("ha");
    chrome.mediaGalleriesPrivate.onDeviceAttached.addListener(u(this.$a, this));
    chrome.mediaGalleriesPrivate.onDeviceDetached.addListener(u(this.ab, this))
};
xc.prototype.getMediaFileSystems = function (a) {
    var b = new N;
    chrome.mediaGalleries.getMediaFileSystems({
        interactive: a ? "yes" : "no"
    }, u(function (a) {
        b.e(za(a, function (a) {
            return new uc(a)
        }))
    }, this));
    return b
};
var yc = function (a, b) {
    var c = new N;
    Qb(a.getMediaFileSystems(), function (a) {
        a = Ba(a, function (a) {
            "c" == (r(chrome.mediaGalleries.getMediaFileSystemMetadata) ? "d" : "c") ? (a = n.JSON.parse(a.getName()), a = new vc(a.galleryId, a.name, r(a.isRemovable) ? a.isRemovable : r(a.deviceId), !! a.isMediaDevice, a.deviceId)) : (a = chrome.mediaGalleries.getMediaFileSystemMetadata(a.Ja), a = new vc(a.galleryId, a.name, a.isRemovable, a.isMediaDevice, a.deviceId));
            return a.wa == b
        });
        c.e(null !== a)
    }, a);
    return c
};
xc.prototype.$a = function (a) {
    Qb(yc(this, a.deviceId), function (b) {
        this.Ma.ma(b ? "f" : "g", a.deviceName)
    }, this)
};
xc.prototype.ab = function (a) {
    this.Ma.ma("e", a.deviceName)
};
var zc = function (a, b, c) {
    var d = new N;
    a.get(b, function (a) {
        var f = chrome.runtime ? chrome.runtime.lastError : void 0;
        f ? d.C(f) : (a = a[b], d.e(r(a) ? a : c))
    });
    return d
};
var Ac = function (a, b) {
    V.call(this);
    this.Za = a || chrome.storage.local;
    this.bb = b || chrome.storage.sync;
    (a || b || chrome.storage.onChanged).addListener(u(this.cb, this))
};
v(Ac, V);
var Bc = {
    jb: "settingsEnableAutoCuration",
    kb: "settingsHasCompletedFirstRun",
    lb: "settingsPhotoUploadSize"
}, Dc = function (a) {
        var b = Cc;
        t: {
            for (var c in Bc)
                if (Bc[c] == a) {
                    a = !0;
                    break t
                }
            a = !1
        }
        return a ? b.bb : b.Za
    };
Ac.prototype.cb = function (a) {
    for (var b in a) {
        var c = a[b];
        c.oldValue !== c.newValue && (this.ma(b, {
            type: b,
            oldValue: c.oldValue,
            newValue: c.newValue
        }), this.ma("k", this))
    }
};
var Ec = function (a, b, c) {
    if (da(a)) c && (a = u(a, c));
    else if (a && "function" == typeof a.handleEvent) a = u(a.handleEvent, a);
    else throw Error("Invalid listener argument");
    return 2147483647 < b ? -1 : n.setTimeout(a, b || 0)
};
var Fc = null;
var Gc = function () {};
Gc.prototype.ea = null;
var Hc, Ic = function () {};
v(Ic, Gc);
var Kc = function (a) {
    return (a = Jc(a)) ? new ActiveXObject(a) : new XMLHttpRequest
}, Lc = function (a) {
        var b = {};
        Jc(a) && (b[0] = !0, b[1] = !0);
        return b
    }, Jc = function (a) {
        if (!a.Na && "undefined" == typeof XMLHttpRequest && "undefined" != typeof ActiveXObject) {
            for (var b = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], c = 0; c < b.length; c++) {
                var d = b[c];
                try {
                    return new ActiveXObject(d), a.Na = d
                } catch (e) {}
            }
            throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");
        }
        return a.Na
    };
Hc = new Ic;
var W = function (a) {
    M.call(this);
    this.headers = new z;
    this.K = a || null;
    this.v = !1;
    this.$ = this.a = null;
    this.za = this.ca = "";
    this.J = 0;
    this.u = "";
    this.D = this.na = this.Z = this.oa = !1;
    this.R = 0;
    this.aa = null;
    this.Y = "";
    this.ba = this.Ra = !1
};
v(W, M);
W.prototype.gb = Q("goog.net.XhrIo");
var Mc = /^https?$/i,
    Nc = ["POST", "PUT"];
W.prototype.send = function (a, b, c, d) {
    if (this.a) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.ca + "; newUri=" + a);
    b = b ? b.toUpperCase() : "GET";
    this.ca = a;
    this.u = "";
    this.J = 0;
    this.za = b;
    this.oa = !1;
    this.v = !0;
    this.a = this.K ? Kc(this.K) : Kc(Hc);
    this.$ = this.K ? this.K.ea || (this.K.ea = Lc(this.K)) : Hc.ea || (Hc.ea = Lc(Hc));
    this.a.onreadystatechange = u(this.Aa, this);
    try {
        ac(X(this, "Opening Xhr")), this.na = !0, this.a.open(b, a, !0), this.na = !1
    } catch (e) {
        ac(X(this, "Error opening Xhr: " + e.message));
        Oc(this,
            e);
        return
    }
    a = c || "";
    var f = this.headers.t();
    d && Qa(d, function (a, b) {
        f.set(b, a)
    });
    d = Ba(f.B(), Pc);
    c = n.FormData && a instanceof n.FormData;
    !(0 <= wa(Nc, b)) || (d || c) || f.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    Qa(f, function (a, b) {
        this.a.setRequestHeader(b, a)
    }, this);
    this.Y && (this.a.responseType = this.Y);
    "withCredentials" in this.a && (this.a.withCredentials = this.Ra);
    try {
        Qc(this), 0 < this.R && (this.ba = C && F(9) && "number" == typeof this.a.timeout && r(this.a.ontimeout), ac(X(this, "Will abort after " +
            this.R + "ms if incomplete, xhr2 " + this.ba)), this.ba ? (this.a.timeout = this.R, this.a.ontimeout = u(this.da, this)) : this.aa = Ec(this.da, this.R, this)), ac(X(this, "Sending request")), this.Z = !0, this.a.send(a), this.Z = !1
    } catch (g) {
        ac(X(this, "Send error: " + g.message)), Oc(this, g)
    }
};
var Pc = function (a) {
    return "content-type" == a.toLowerCase()
};
W.prototype.da = function () {
    "undefined" != typeof aa && this.a && (this.u = "Timed out after " + this.R + "ms, aborting", this.J = 8, X(this, this.u), this.dispatchEvent("timeout"), this.abort(8))
};
var Oc = function (a, b) {
    a.v = !1;
    a.a && (a.D = !0, a.a.abort(), a.D = !1);
    a.u = b;
    a.J = 5;
    Rc(a);
    Sc(a)
}, Rc = function (a) {
        a.oa || (a.oa = !0, a.dispatchEvent("complete"), a.dispatchEvent("error"))
    };
W.prototype.abort = function (a) {
    this.a && this.v && (X(this, "Aborting"), this.v = !1, this.D = !0, this.a.abort(), this.D = !1, this.J = a || 7, this.dispatchEvent("complete"), this.dispatchEvent("abort"), Sc(this))
};
W.prototype.j = function () {
    this.a && (this.v && (this.v = !1, this.D = !0, this.a.abort(), this.D = !1), Sc(this, !0));
    W.S.j.call(this)
};
W.prototype.Aa = function () {
    this.ia || (this.na || this.Z || this.D ? Tc(this) : this.Wa())
};
W.prototype.Wa = function () {
    Tc(this)
};
var Tc = function (a) {
    if (a.v && "undefined" != typeof aa)
        if (a.$[1] && 4 == Uc(a) && 2 == Vc(a)) X(a, "Local request error detected and ignored");
        else if (a.Z && 4 == Uc(a)) Ec(a.Aa, 0, a);
    else if (a.dispatchEvent("readystatechange"), 4 == Uc(a)) {
        X(a, "Request complete");
        a.v = !1;
        try {
            if (Wc(a)) a.dispatchEvent("complete"), a.dispatchEvent("success");
            else {
                a.J = 6;
                var b;
                try {
                    b = 2 < Uc(a) ? a.a.statusText : ""
                } catch (c) {
                    b = ""
                }
                a.u = b + " [" + Vc(a) + "]";
                Rc(a)
            }
        } finally {
            Sc(a)
        }
    }
}, Sc = function (a, b) {
        if (a.a) {
            Qc(a);
            var c = a.a,
                d = a.$[0] ? ba : null;
            a.a = null;
            a.$ = null;
            b ||
                a.dispatchEvent("ready");
            try {
                c.onreadystatechange = d
            } catch (e) {}
        }
    }, Qc = function (a) {
        a.a && a.ba && (a.a.ontimeout = null);
        "number" == typeof a.aa && (n.clearTimeout(a.aa), a.aa = null)
    }, Wc = function (a) {
        var b = Vc(a),
            c;
        t: switch (b) {
        case 200:
        case 201:
        case 202:
        case 204:
        case 206:
        case 304:
        case 1223:
            c = !0;
            break t;
        default:
            c = !1
        }
        if (!c) {
            if (b = 0 === b) a = gc(String(a.ca))[1] || null, !a && self.location && (a = self.location.protocol, a = a.substr(0, a.length - 1)), b = !Mc.test(a ? a.toLowerCase() : "");
            c = b
        }
        return c
    }, Uc = function (a) {
        return a.a ? a.a.readyState :
            0
    }, Vc = function (a) {
        try {
            return 2 < Uc(a) ? a.a.status : -1
        } catch (b) {
            return -1
        }
    }, Xc = function (a) {
        try {
            if (!a.a) return null;
            if ("response" in a.a) return a.a.response;
            switch (a.Y) {
            case "":
            case "text":
                return a.a.responseText;
            case "arraybuffer":
                if ("mozResponseArrayBuffer" in a.a) return a.a.mozResponseArrayBuffer
            }
            return null
        } catch (b) {
            return null
        }
    };
W.prototype.getResponseHeader = function (a) {
    return this.a && 4 == Uc(this) ? this.a.getResponseHeader(a) : void 0
};
var X = function (a, b) {
    return b + " [" + a.za + " " + a.ca + " " + Vc(a) + "]"
};
var Yc = !C || C && 9 <= jb;
!D && !C || C && C && 9 <= jb || D && F("1.9.1");
C && F("9");
var Zc = function (a, b) {
    var c;
    c = a.className;
    c = t(c) && c.match(/\S+/g) || [];
    for (var d = Fa(arguments, 1), e = c.length + d.length, f = c, g = 0; g < d.length; g++) 0 <= wa(f, d[g]) || f.push(d[g]);
    a.className = c.join(" ");
    return c.length == e
};
var ad = function (a, b) {
    Ia(b, function (b, d) {
        "style" == d ? a.style.cssText = b : "class" == d ? a.className = b : "for" == d ? a.htmlFor = b : d in $c ? a.setAttribute($c[d], b) : 0 == d.lastIndexOf("aria-", 0) || 0 == d.lastIndexOf("data-", 0) ? a.setAttribute(d, b) : a[d] = b
    })
}, $c = {
        cellpadding: "cellPadding",
        cellspacing: "cellSpacing",
        colspan: "colSpan",
        frameborder: "frameBorder",
        height: "height",
        maxlength: "maxLength",
        role: "role",
        rowspan: "rowSpan",
        type: "type",
        usemap: "useMap",
        valign: "vAlign",
        width: "width"
    }, cd = function (a, b, c) {
        var d = arguments,
            e = document,
            f = d[0],
            g = d[1];
        if (!Yc && g && (g.name || g.type)) {
            f = ["<", f];
            g.name && f.push(' name="', ta(g.name), '"');
            if (g.type) {
                f.push(' type="', ta(g.type), '"');
                var k = {};
                Na(k, g);
                delete k.type;
                g = k
            }
            f.push(">");
            f = f.join("")
        }
        f = e.createElement(f);
        g && (t(g) ? f.className = g : "array" == q(g) ? Zc.apply(null, [f].concat(g)) : ad(f, g));
        2 < d.length && bd(e, f, d);
        return f
    }, bd = function (a, b, c) {
        function d(c) {
            c && b.appendChild(t(c) ? a.createTextNode(c) : c)
        }
        for (var e = 2; e < c.length; e++) {
            var f = c[e];
            !ca(f) || ea(f) && 0 < f.nodeType ? d(f) : xa(dd(f) ? Ea(f) : f, d)
        }
    }, dd =
        function (a) {
            if (a && "number" == typeof a.length) {
                if (ea(a)) return "function" == typeof a.item || "string" == typeof a.item;
                if (da(a)) return "function" == typeof a.item
            }
            return !1
    };
var ed, Y = sc("jspb_parser.html");
Q("pulsar.jspb");
var fd = new z,
    gd = function (a) {
        a = a.ua.data;
        var b = a.response;
        fd.M(b);
        var c = fd.get(b);
        "parsed" in a ? c.e(a.parsed) : c.C(a.error);
        fd.remove(b)
    }, hd = function () {
        var a = new N;
        hd = Jb(a);
        var b = sc("/"),
            c = b.t(),
            d = !! Y.p;
        d ? hc(c, Y.p) : d = !! Y.G;
        if (d) {
            var e = Y.G;
            S(c);
            c.G = e
        } else d = !! Y.o;
        d ? (e = Y.o, S(c), c.o = e) : d = null != Y.L;
        e = Y.k;
        if (d) ic(c, Y.L);
        else if (d = !! Y.k)
            if ("/" != e.charAt(0) && (b.o && !b.k ? e = "/" + e : (b = c.k.lastIndexOf("/"), -1 != b && (e = c.k.substr(0, b + 1) + e))), ".." == e || "." == e) e = "";
            else if (-1 != e.indexOf("./") || -1 != e.indexOf("/.")) {
            for (var b =
                0 == e.lastIndexOf("/", 0), e = e.split("/"), f = [], g = 0; g < e.length;) {
                var k = e[g++];
                "." == k ? b && g == e.length && f.push("") : ".." == k ? ((1 < f.length || 1 == f.length && "" != f[0]) && f.pop(), b && g == e.length && f.push("")) : (f.push(k), b = !0)
            }
            e = f.join("/")
        }
        d ? (b = e, S(c), c.k = b) : d = "" !== Y.g.toString();
        d ? jc(c, Y.g.toString() ? decodeURIComponent(Y.g.toString()) : "") : d = !! Y.F;
        d && (d = Y.F, S(c), c.F = d);
        S(c);
        d = Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ la()).toString(36);
        S(c);
        c.g.set("zx", d);
        ed = cd("IFRAME", {
            src: c.toString()
        });
        ed.style.display = "none";
        zb(ed, "load", ka(a.e, ed), !1, a);
        zb(ed, "error", a.C, !1, a);
        c = document;
        (E || "CSS1Compat" != c.compatMode ? c.body : c.documentElement).appendChild(ed);
        tb(n, "message", gd);
        return a
    };
zb(n, "load", function () {
    !n.opener || hd()
});
var Z = 1;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
Z++;
(function () {}).prototype.gb = Q("pulsar.base.NetHelper");
var id = function (a) {
    va(!qc(sc(a)));
    var b = new N,
        c = new W;
    c.addEventListener("complete", function () {
        if (Wc(c)) {
            var a = new Uint8Array(Xc(c)),
                e = r(void 0) ? void 0 : c.getResponseHeader("Content-Type");
            if (!ca(a)) throw Error("encodeByteArray takes an array as a parameter");
            if (!Fc) {
                Fc = {};
                for (var f = 0; 65 > f; f++) Fc[f] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(f)
            }
            for (var f = Fc, g = [], k = 0; k < a.length; k += 3) {
                var l = a[k],
                    p = k + 1 < a.length,
                    m = p ? a[k + 1] : 0,
                    s = k + 2 < a.length,
                    w = s ? a[k + 2] : 0,
                    qd = l >> 2,
                    l = (l & 3) <<
                        4 | m >> 4,
                    m = (m & 15) << 2 | w >> 6,
                    w = w & 63;
                s || (w = 64, p || (m = 64));
                g.push(f[qd], f[l], f[m], f[w])
            }
            b.e(ua("data:", e, ";base64,", g.join("")))
        } else b.C({
            code: c.J,
            error: t(c.u) ? c.u : String(c.u),
            status: Vc(c)
        });
        c.w()
    });
    c.Y = "arraybuffer";
    c.send(a, "GET");
    return b
};
var ma;
Q("pulsar.ui.notifications");
var jd = function () {
    if (!na()) return Sb(ma);
    var a = new N,
        b = "resources/100_percent/notify_icon.png";
    1 < window.devicePixelRatio && (b = "resources/200_percent/notify_icon.png");
    O(id(b), function (b) {
        ma = b;
        a.e(b)
    }, function () {
        a.e("")
    });
    return a
}, ld = function (a, b) {
        var c = ka(kd, "MEDIA_DEVICE"),
            d = new N;
        O(jd(), function (e) {
            var f = window.webkitNotifications.createNotification(e, a, b);
            c && (f.onclick = function () {
                c();
                f.cancel()
            });
            f.show();
            f.da = Ec(function () {
                f.da = null;
                f.cancel()
            }, 3E4);
            d.e(f)
        }, function (a) {
            d.C(a)
        })
    };
Q("pulsar.background");
var md = new dc(1280, 768),
    nd = new dc(1280, 768),
    od = null,
    Cc = new Ac,
    pd = !1,
    sd = function (a) {
        if (!pd) {
            pd = !0;
            var b = {
                frame: "chrome",
                id: "Google+Photos"
            }; - 1 != (Ua() || "").indexOf("CrOS") ? (b.minHeight = md.height, b.minWidth = md.width, a = rd(a)) : (b.minHeight = nd.height, b.minWidth = nd.width, b.maxHeight = b.minHeight, b.maxWidth = b.minWidth, a = "pulsar_ui.html");
            Tb(a, function (a) {
                chrome.app.window.create(a, b, function (a) {
                    pd = !1;
                    od = a
                })
            })
        }
    }, rd = function (a) {
        var b = new N;
        Qb(zc(Dc("settingsHasCompletedFirstRun"), "settingsHasCompletedFirstRun", !1), function (c) {
            var d = new R("pulsar_ui.html");
            S(d);
            d.g.set("hasCompletedFirstRun", c);
            S(d);
            d.g.set("launchReason", a);
            b.e(d.toString())
        });
        return b
    }, kd = function (a) {
        od && !od.contentWindow.closed ? od.focus() : sd(a)
    }, td = new Vb,
    $ = new wc;
Wb(td, "ha", $);
new xc(td);
var ud = $.W.f;
ud || (ud = $.W.f = []);
var vd = $.Oa;
$.n[vd] = "f";
$.n[vd + 1] = function (a) {
    -1 != (Ua() || "").indexOf("CrOS") && (od && !od.contentWindow.closed || Za || O(zc(Dc("settingsLaunchOnDeviceAttach"), "settingsLaunchOnDeviceAttach", !0), function (b) {
        if (b) kd("MEDIA_DEVICE");
        else {
            b = chrome.i18n.getMessage("8675112326850410714");
            var c = chrome.i18n.getMessage("163532554661203916", [r(chrome.runtime) ? chrome.runtime.getManifest().name : "Google+ Photos", a]);
            ld(b, c)
        }
    }, function () {
        kd("MEDIA_DEVICE")
    }))
};
$.n[vd + 2] = void 0;
$.Oa = vd + 3;
ud.push(vd);
chrome.app.runtime.onLaunched.addListener(ka(kd, "USER"));