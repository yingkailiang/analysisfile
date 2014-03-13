/*
 Copyright 2013, KISSY UI Library v1.20
 MIT Licensed
 build time: Jan 28 17:15
 */
/*
 * a seed where KISSY grows up from , KISS Yeah !
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, undefined) {
    /**
     * @namespace KISSY
     */

    var host = this,
        meta = {
            /**
             * Copies all the properties of s to r.
             * @param deep {boolean} whether recursive mix if encounter object
             * @return {Object} the augmented object
             */
            mix:function (r, s, ov, wl, deep) {
                if (!s || !r) {
                    return r;
                }
                if (ov === undefined) {
                    ov = true;
                }
                var i, p, len;

                if (wl && (len = wl.length)) {
                    for (i = 0; i < len; i++) {
                        p = wl[i];
                        if (p in s) {
                            _mix(p, r, s, ov, deep);
                        }
                    }
                } else {
                    for (p in s) {
                        _mix(p, r, s, ov, deep);
                    }
                }
                return r;
            }
        },

        _mix = function (p, r, s, ov, deep) {
            if (ov || !(p in r)) {
                var target = r[p], src = s[p];
                // prevent never-end loop
                if (target === src) {
                    return;
                }
                // 鏉ユ簮鏄暟缁勫拰瀵硅薄锛屽苟涓旇姹傛繁搴� mix
                if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                    // 鐩爣鍊间负瀵硅薄鎴栨暟缁勶紝鐩存帴 mix
                    // 鍚﹀垯 鏂板缓涓€涓拰婧愬€肩被鍨嬩竴鏍风殑绌烘暟缁�/瀵硅薄锛岄€掑綊 mix
                    var clone = target && (S.isArray(target) || S.isPlainObject(target)) ?
                        target :
                        (S.isArray(src) ? [] : {});
                    r[p] = S.mix(clone, src, ov, undefined, true);
                } else if (src !== undefined) {
                    r[p] = s[p];
                }
            }
        },

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
        seed = (host && host[S]) || {},

        guid = 0,
        EMPTY = '';

    // The host of runtime environment. specify by user's seed or <this>,
    // compatibled for  '<this> is null' in unknown engine.
    host = seed.__HOST || (seed.__HOST = host || {});

    // shortcut and meta for seed.
    // override previous kissy
    S = host[S] = meta.mix(seed, meta);

    S.mix(S, {
        configs:{},
        // S.app() with these members.
        __APP_MEMBERS:['namespace'],
        __APP_INIT_METHODS:['__init'],

        /**
         * The version of the library.
         * @type {String}
         */
        version:'1.20',

        buildTime:'20130128171456',

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge:function () {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; i++) {
                S.mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment:function (/*r, s1, s2, ..., ov, wl*/) {
            var args = S.makeArray(arguments),
                len = args.length - 2,
                r = args[0],
                ov = args[len],
                wl = args[len + 1],
                i = 1;

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }
            if (!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for (; i < len; i++) {
                S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param {Object} [sx] static properties to add/override
         * @return r {Object}
         */
        extend:function (r, s, px, sx) {
            if (!s || !r) {
                return r;
            }

            var create = Object.create ?
                    function (proto, c) {
                        return Object.create(proto, {
                            constructor:{
                                value:c
                            }
                        });
                    } :
                    function (proto, c) {
                        function F() {
                        }

                        F.prototype = proto;

                        var o = new F();
                        o.constructor = c;
                        return o;
                    },
                sp = s.prototype,
                rp;

            // add prototype chain
            rp = create(sp, r);
            r.prototype = S.mix(rp, r.prototype);
            r.superclass = create(sp, s);

            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }

            return r;
        },

        /****************************************************************************************

         *                            The KISSY System Framework                                *

         ****************************************************************************************/

        /**
         * Initializes KISSY
         */
        __init:function () {
            this.Config = this.Config || {};
            this.Env = this.Env || {};

            // NOTICE: '@DEBUG@' will replace with '' when compressing.
            // So, if loading source file, debug is on by default.
            // If loading min version, debug is turned off automatically.
            this.Config.debug = '@DEBUG@';
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * S.namespace('TB.app.Shop', true); // returns TB.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace:function () {
            var args = S.makeArray(arguments),
                l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === true && l--);

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app:function (name, sx) {
            var isStr = S.isString(name),
                O = isStr ? host[name] || {} : name,
                i = 0,
                len = S.__APP_INIT_METHODS.length;

            S.mix(O, this, true, S.__APP_MEMBERS);
            for (; i < len; i++) {
                S[S.__APP_INIT_METHODS[i]].call(O);
            }

            S.mix(O, S.isFunction(sx) ? sx() : sx);
            isStr && (host[name] = O);

            return O;
        },


        config:function (c) {
            var configs, cfg, r;
            for (var p in c) {
                if (c.hasOwnProperty(p)) {
                    if ((configs = this['configs']) &&
                        (cfg = configs[p])) {
                        r = cfg(c[p]);
                    }
                }
            }
            return r;
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param {String} [cat] the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param {String} [src] the source of the the message (opt)
         */
        log:function (msg, cat, src) {
            if (S.Config.debug) {
                if (src) {
                    msg = src + ': ' + msg;
                }
                if (host['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
        },

        /**
         * Throws error message.
         */
        error:function (msg) {
            if (S.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param {String} [pre] guid prefix
         * @return {String} the guid
         */
        guid:function (pre) {
            return (pre || EMPTY) + guid++;
        }
    });

    S.__init();
    return S;

})('KISSY', undefined);
/**
 * @module  lang
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can run in any ecmascript compliant environment
 */
(function (S, undefined) {

    var host = S.__HOST,
        TRUE = true,
        FALSE = false,
        OP = Object.prototype,
        toString = OP.toString,
        hasOwnProperty = OP.hasOwnProperty,
        AP = Array.prototype,
        indexOf = AP.indexOf,
        lastIndexOf = AP.lastIndexOf,
        filter = AP.filter,
        every = AP.every,
        some = AP.some,
    //reduce = AP.reduce,
        trim = String.prototype.trim,
        map = AP.map,
        EMPTY = '',
        HEX_BASE = 16,
        CLONE_MARKER = '__~ks_cloned',
        COMPARE_MARKER = '__~ks_compared',
        STAMP_MARKER = '__~ks_stamped',
        RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
        encode = encodeURIComponent,
        decode = decodeURIComponent,
        SEP = '&',
        EQ = '=',
    // [[Class]] -> type pairs
        class2type = {},
    // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
        htmlEntities = {
            '&amp;':'&',
            '&gt;':'>',
            '&lt;':'<',
            '&#x60;':'`',
            '&#x2F;':'/',
            '&quot;':'"',
            '&#x27;':"'"
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg,
    // - # $ ^ * ( ) + [ ] { } | \ , . ?
        escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
    (function () {
        for (var k in htmlEntities) {
            if (htmlEntities.hasOwnProperty(k)) {
                reverseEntities[htmlEntities[k]] = k;
            }
        }
    })();

    function getEscapeReg() {
        if (escapeReg) {
            return escapeReg
        }
        var str = EMPTY;
        S.each(htmlEntities, function (entity) {
            str += entity + '|';
        });
        str = str.slice(0, -1);
        return escapeReg = new RegExp(str, "g");
    }

    function getUnEscapeReg() {
        if (unEscapeReg) {
            return unEscapeReg
        }
        var str = EMPTY;
        S.each(reverseEntities, function (entity) {
            str += entity + '|';
        });
        str += '&#(\\d{1,5});';
        return unEscapeReg = new RegExp(str, "g");
    }


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return true.
        return nullOrUndefined(val) || (t !== 'object' && t !== 'function');
    }

    S.mix(S, {

        /**
         * stamp a object by guid
         * @return guid associated with this object
         */
        stamp:function (o, readOnly, marker) {
            if (!o) {
                return o
            }
            marker = marker || STAMP_MARKER;
            var guid = o[marker];
            if (guid) {
                return guid;
            } else if (!readOnly) {
                try {
                    guid = o[marker] = S.guid(marker);
                }
                catch (e) {
                    guid = undefined;
                }
            }
            return guid;
        },

        noop:function () {
        },

        /**
         * Determine the internal JavaScript [[Class]] of an object.
         */
        type:function (o) {
            return nullOrUndefined(o) ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },

        isNullOrUndefined:nullOrUndefined,

        isNull:function (o) {
            return o === null;
        },

        isUndefined:function (o) {
            return o === undefined;
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject:function (o) {
            for (var p in o) {
                if (p !== undefined) {
                    return FALSE;
                }
            }
            return TRUE;
        },

        /**
         * Checks to see if an object is a plain object (created using "{}"
         * or "new Object()" or "new FunctionClass()").
         * Ref: http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
         */
        isPlainObject:function (o) {
            /**
             * note by yiminghe
             * isPlainObject(node=document.getElementById("xx")) -> false
             * toString.call(node) : ie678 == '[object Object]',other =='[object HTMLElement]'
             * 'isPrototypeOf' in node : ie678 === false ,other === true
             */

            return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
        },


        /**
         * 涓や釜鐩爣鏄惁鍐呭鐩稿悓
         *
         * @param a 姣旇緝鐩爣1
         * @param b 姣旇緝鐩爣2
         * @param [mismatchKeys] internal use
         * @param [mismatchValues] internal use
         */
        equals:function (a, b, /*internal use*/mismatchKeys, /*internal use*/mismatchValues) {
            // inspired by jasmine
            mismatchKeys = mismatchKeys || [];
            mismatchValues = mismatchValues || [];

            if (a === b) {
                return TRUE;
            }
            if (a === undefined || a === null || b === undefined || b === null) {
                // need type coercion
                return nullOrUndefined(a) && nullOrUndefined(b);
            }
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() == b.getTime();
            }
            if (S.isString(a) && S.isString(b)) {
                return (a == b);
            }
            if (S.isNumber(a) && S.isNumber(b)) {
                return (a == b);
            }
            if (typeof a === "object" && typeof b === "object") {
                return compareObjects(a, b, mismatchKeys, mismatchValues);
            }
            // Straight check
            return (a === b);
        },

        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         * 绋嶅井鏀规敼灏卞拰瑙勮寖涓€鏍蜂簡 :)
         * @param input
         * @param {Function} filter filter function
         * @refer http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
         */
        clone:function (input, filter) {
            // Let memory be an association list of pairs of objects,
            // initially empty. This is used to handle duplicate references.
            // In each pair of objects, one is called the source object
            // and the other the destination object.
            var memory = {},
                ret = cloneInternal(input, filter, memory);
            S.each(memory, function (v) {
                // 娓呯悊鍦ㄦ簮瀵硅薄涓婂仛鐨勬爣璁�
                v = v.input;
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        S.log("delete CLONE_MARKER error : ");
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            memory = null;
            return ret;
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim:trim ?
            function (str) {
                return nullOrUndefined(str) ? EMPTY : trim.call(str);
            } :
            function (str) {
                return nullOrUndefined(str) ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
            },

        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         */
        substitute:function (str, o, regexp) {
            if (!S.isString(str)
                || !S.isPlainObject(o)) {
                return str;
            }

            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? EMPTY : o[name];
            });
        },

        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param {Object} [context]
         */
        each:function (object, fn, context) {
            if (object) {
                var key,
                    val,
                    i = 0,
                    length = object && object.length,
                    isObj = length === undefined || S.type(object) === 'function';

                context = context || host;

                if (isObj) {
                    for (key in object) {
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === FALSE) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0];
                         i < length && fn.call(context, val, i, object) !== FALSE; val = object[++i]) {
                    }
                }
            }
            return object;
        },

        /**
         * Search for a specified value within an array.
         */
        indexOf:indexOf ?
            function (item, arr) {
                return indexOf.call(arr, item);
            } :
            function (item, arr) {
                for (var i = 0, len = arr.length; i < len; ++i) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },

        /**
         * Returns the index of the last item in the array
         * that contains the specified value, -1 if the
         * value isn't found.
         */
        lastIndexOf:(lastIndexOf) ?
            function (item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function (item, arr) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] === item) {
                        break;
                    }
                }
                return i;
            },

        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of uniques for
         * @param override {Boolean}
         *        if override is true, S.unique([a, b, a]) => [b, a]
         *        if override is false, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         */
        unique:function (a, override) {
            var b = a.slice();
            if (override) {
                b.reverse();
            }
            var i = 0,
                n,
                item;

            while (i < b.length) {
                item = b[i];
                while ((n = S.lastIndexOf(item, b)) !== i) {
                    b.splice(n, 1);
                }
                i += 1;
            }

            if (override) {
                b.reverse();
            }
            return b;
        },

        /**
         * Search for a specified value index within an array.
         */
        inArray:function (item, arr) {
            return S.indexOf(item, arr) > -1;
        },

        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned true for.
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param context {Object} optional context object
         * @return {Array} The items on which the supplied function
         *         returned true. If no items matched an empty array is
         *         returned.
         */
        filter:filter ?
            function (arr, fn, context) {
                return filter.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var ret = [];
                S.each(arr, function (item, i, arr) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
        map:map ?
            function (arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = S.isString(arr) ? arr.charAt(i) : arr[i];
                    if (el
                        ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },

        /**
         * @refer  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
         */
        reduce:/*
         NaN ?
         reduce ? function(arr, callback, initialValue) {
         return arr.reduce(callback, initialValue);
         } : */function (arr, callback, initialValue) {
            var len = arr.length;
            if (typeof callback !== "function") {
                throw new TypeError("callback is not function!");
            }

            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length == 2) {
                throw new TypeError("arguments invalid");
            }

            var k = 0;
            var accumulator;
            if (arguments.length >= 3) {
                accumulator = arguments[2];
            }
            else {
                do {
                    if (k in arr) {
                        accumulator = arr[k++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    k += 1;
                    if (k >= len) {
                        throw new TypeError();
                    }
                }
                while (TRUE);
            }

            while (k < len) {
                if (k in arr) {
                    accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
                }
                k++;
            }

            return accumulator;
        },

        every:every ?
            function (arr, fn, context) {
                return every.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && !fn.call(context, arr[i], i, arr)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

        some:some ?
            function (arr, fn, context) {
                return some.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && fn.call(context, arr[i], i, arr)) {
                        return TRUE;
                    }
                }
                return FALSE;
            },


        /**
         * it is not same with native bind
         * @refer https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         */
        bind:function (fn, obj) {
            var slice = [].slice,
                args = slice.call(arguments, 2),
                fNOP = function () {
                },
                bound = function () {
                    return fn.apply(this instanceof fNOP ? this : obj,
                        args.concat(slice.call(arguments)));
                };
            fNOP.prototype = fn.prototype;
            bound.prototype = new fNOP();
            return bound;
        },

        /**
         * Gets current date in milliseconds.
         * @refer  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
         * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
         * http://kangax.github.com/es5-compat-table/
         */
        now:Date.now || function () {
            return +new Date();
        },
        /**
         * frequently used in taobao cookie about nick
         */
        fromUnicode:function (str) {
            return str.replace(/\\u([a-f\d]{4})/ig, function (m, u) {
                return  String.fromCharCode(parseInt(u, HEX_BASE));
            });
        },
        /**
         * escape string to html
         * @refer   http://yiminghe.javaeye.com/blog/788929
         *          http://wonko.com/post/html-escaping
         * @param str {string} text2html show
         */
        escapeHTML:function (str) {
            return str.replace(getEscapeReg(), function (m) {
                return reverseEntities[m];
            });
        },

        escapeRegExp:function (str) {
            return str.replace(escapeRegExp, '\\$&');
        },

        /**
         * unescape html to string
         * @param str {string} html2text
         */
        unEscapeHTML:function (str) {
            return str.replace(getUnEscapeReg(), function (m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
        },
        /**
         * Converts object to a true array.
         * @param o {object|Array} array like object or array
         * @return {Array}
         */
        makeArray:function (o) {
            if (nullOrUndefined(o)) {
                return [];
            }
            if (S.isArray(o)) {
                return o;
            }

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number' || S.isString(o) || S.isFunction(o)) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        },
        /**
         * Creates a serialized string of an array or object.
         * @return {String}
         * <code>
         * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         * {foo: '', bar: 2}    // -> 'foo=&bar=2'
         * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
         * </code>
         */
        param:function (o, sep, eq, arr) {
            if (!S.isPlainObject(o)) {
                return EMPTY;
            }
            sep = sep || SEP;
            eq = eq || EQ;
            if (S.isUndefined(arr)) {
                arr = TRUE;
            }
            var buf = [], key, val;
            for (key in o) {
                if (o.hasOwnProperty(key)) {
                    val = o[key];
                    key = encode(key);

                    // val is valid non-array value
                    if (isValidParamValue(val)) {
                        buf.push(key, eq, encode(val + EMPTY), sep);
                    }
                    // val is not empty array
                    else if (S.isArray(val) && val.length) {
                        for (var i = 0, len = val.length; i < len; ++i) {
                            if (isValidParamValue(val[i])) {
                                buf.push(key,
                                    (arr ? encode("[]") : EMPTY),
                                    eq, encode(val[i] + EMPTY), sep);
                            }
                        }
                    }
                    // ignore other cases, including empty array, Function, RegExp, Date etc.
                }
            }
            buf.pop();
            return buf.join(EMPTY);
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         * <code>
         * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         * 'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         * 'id=45&raw'        // -> {id: '45', raw: ''}
         * </code>
         */
        unparam:function (str, sep, eq) {
            if (typeof str !== 'string'
                || (str = S.trim(str)).length === 0) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {},
                pairs = str.split(sep),
                pair, key, val,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                pair = pairs[i].split(eq);
                key = decode(pair[0]);
                try {
                    val = decode(pair[1] || EMPTY);
                } catch (e) {
                    S.log(e + "decodeURIComponent error : " + pair[1], "error");
                    val = pair[1] || EMPTY;
                }
                if (S.endsWith(key, "[]")) {
                    key = key.substring(0, key.length - 2);
                }
                if (hasOwnProperty.call(ret, key)) {
                    if (S.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [ret[key], val];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        },
        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         * @param fn {Function|String} the function to execute or the name of the method in
         *        the 'o' object to execute.
         * @param when {Number} the number of milliseconds to wait until the fn is executed.
         * @param periodic {Boolean} if true, executes continuously at supplied interval
         *        until canceled.
         * @param context {Object} the context object.
         * @param [data] that is provided to the function. This accepts either a single
         *        item or an array. If an array is provided, the function is executed with
         *        one parameter for each array item. If you need to pass a single array
         *        parameter, it needs to be wrapped in an array [myarray].
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         *         the timer.
         */
        later:function (fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = S.makeArray(data),
                f,
                r;

            if (S.isString(fn)) {
                m = context[fn];
            }

            if (!m) {
                S.error('method undefined');
            }

            f = function () {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id:r,
                interval:periodic,
                cancel:function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        startsWith:function (str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith:function (str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) == ind;
        },

        /**
         * Based on YUI3
         * Throttles a call to a method based on the time between calls.
         * @param  {function} fn The function call to throttle.
         * @param {object} context ontext fn to run
         * @param {Number} ms The number of milliseconds to throttle the method call.
         *              Passing a -1 will disable the throttle. Defaults to 150.
         * @return {function} Returns a wrapped function that calls fn throttled.
         */
        throttle:function (fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function () {
                    fn.apply(context || this, arguments);
                });
            }

            var last = S.now();

            return (function () {
                var now = S.now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context || this, arguments);
                }
            });
        },

        /**
         * buffers a call between  a fixed time
         * @param {function} fn
         * @param {object} [context]
         * @param {Number} ms
         */
        buffer:function (fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function () {
                    fn.apply(context || this, arguments);
                });
            }
            var bufferTimer = null;

            function f() {
                f.stop();
                bufferTimer = S.later(fn, ms, FALSE, context || this,arguments);
            }

            f.stop = function () {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };

            return f;
        }

    });

    // for idea ..... auto-hint
    S.mix(S, {
        isBoolean:isValidParamValue,
        isNumber:isValidParamValue,
        isString:isValidParamValue,
        isFunction:isValidParamValue,
        isArray:isValidParamValue,
        isDate:isValidParamValue,
        isRegExp:isValidParamValue,
        isObject:isValidParamValue
    });

    S.each('Boolean Number String Function Array Date RegExp Object'.split(' '),
        function (name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function (o) {
                return S.type(o) == lc;
            }
        });

    function nullOrUndefined(o) {
        return S.isNull(o) || S.isUndefined(o);
    }


    function cloneInternal(input, f, memory) {
        var destination = input,
            isArray,
            isPlainObject,
            k,
            stamp;
        if (!input) {
            return destination;
        }

        // If input is the source object of a pair of objects in memory,
        // then return the destination object in that pair of objects .
        // and abort these steps.
        if (input[CLONE_MARKER]) {
            // 瀵瑰簲鐨勫厠闅嗗悗瀵硅薄
            return memory[input[CLONE_MARKER]].destination;
        } else if (typeof input === "object") {
            // 寮曠敤绫诲瀷瑕佸厛璁板綍
            var constructor = input.constructor;
            if (S.inArray(constructor, [Boolean, String, Number, Date, RegExp])) {
                destination = new constructor(input.valueOf());
            }
            // ImageData , File, Blob , FileList .. etc
            else if (isArray = S.isArray(input)) {
                destination = f ? S.filter(input, f) : input.concat();
            } else if (isPlainObject = S.isPlainObject(input)) {
                destination = {};
            }
            // Add a mapping from input (the source object)
            // to output (the destination object) to memory.
            // 鍋氭爣璁�
            input[CLONE_MARKER] = (stamp = S.guid());
            // 瀛樺偍婧愬璞′互鍙婂厠闅嗗悗鐨勫璞�
            memory[stamp] = {destination:destination, input:input};
        }
        // If input is an Array object or an Object object,
        // then, for each enumerable property in input,
        // add a new property to output having the same name,
        // and having a value created from invoking the internal structured cloning algorithm recursively
        // with the value of the property as the "input" argument and memory as the "memory" argument.
        // The order of the properties in the input and output objects must be the same.

        // clone it
        if (isArray) {
            for (var i = 0; i < destination.length; i++) {
                destination[i] = cloneInternal(destination[i], f, memory);
            }
        } else if (isPlainObject) {
            for (k in input) {
                if (input.hasOwnProperty(k)) {
                    if (k !== CLONE_MARKER &&
                        (!f || (f.call(input, input[k], k, input) !== FALSE))) {
                        destination[k] = cloneInternal(input[k], f, memory);
                    }
                }
            }
        }

        return destination;
    }

    function compareObjects(a, b, mismatchKeys, mismatchValues) {
        // 涓や釜姣旇緝杩囦簡锛屾棤闇€鍐嶆瘮杈冿紝闃叉寰幆姣旇緝
        if (a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a) {
            return TRUE;
        }
        a[COMPARE_MARKER] = b;
        b[COMPARE_MARKER] = a;
        var hasKey = function (obj, keyName) {
            return (obj !== null && obj !== undefined) && obj[keyName] !== undefined;
        };
        for (var property in b) {
            if (b.hasOwnProperty(property)) {
                if (!hasKey(a, property) && hasKey(b, property)) {
                    mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
                }
            }
        }
        for (property in a) {
            if (a.hasOwnProperty(property)) {
                if (!hasKey(b, property) && hasKey(a, property)) {
                    mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
                }
            }
        }
        for (property in b) {
            if (b.hasOwnProperty(property)) {
                if (property == COMPARE_MARKER) {
                    continue;
                }
                if (!S.equals(a[property], b[property], mismatchKeys, mismatchValues)) {
                    mismatchValues.push("'" + property + "' was '" + (b[property] ? (b[property].toString()) : b[property])
                        + "' in expected, but was '" +
                        (a[property] ? (a[property].toString()) : a[property]) + "' in actual.");
                }
            }
        }
        if (S.isArray(a) && S.isArray(b) && a.length != b.length) {
            mismatchValues.push("arrays were not the same length");
        }
        delete a[COMPARE_MARKER];
        delete b[COMPARE_MARKER];
        return (mismatchKeys.length === 0 && mismatchValues.length === 0);
    }

})(KISSY, undefined);
/**
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function(S){
    if("require" in this) {
        return;
    }
    S.__loader={};
    S.__loaderUtils={};
    S.__loaderData={};
})(KISSY);/**
 * map mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader) {
    if ("require" in this) {
        return;
    }
    /**
     * modify current module path
     * @param rules
     * @example
     *      [
     *          [/(.+-)min(.js(\?t=\d+)?)$/,"$1$2"],
     *          [/(.+-)min(.js(\?t=\d+)?)$/,function(_,m1,m2){
     *              return m1+m2;
     *          }]
     *      ]
     */
    S.configs.map = function (rules) {
        S.Config.mappedRules = (S.Config.mappedRules || []).concat(rules);
    };

    S.mix(loader, {
        __getMappedPath:function (path) {
            var __mappedRules = S.Config.mappedRules || [];
            for (var i = 0; i < __mappedRules.length; i++) {
                var m, rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        }
    });

})(KISSY, KISSY.__loader);/**
 * combine mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader) {
    if ("require" in this) {
        return;
    }

    var combines;

    /**
     * compress 'from module' to 'to module'
     * {
     *   core:['dom','ua','event','node','json','ajax','anim','base','cookie']
     * }
     */
    combines = S.configs.combines = function (from, to) {
        var cs;
        if (S.isObject(from)) {
            S.each(from, function (v, k) {
                S.each(v, function (v2) {
                    combines(v2, k);
                });
            });
            return;
        }
        cs = S.Config.combines = S.Config.combines || {};
        if (to) {
            cs[from] = to;
        } else {
            return cs[from] || from;
        }
    };

    S.mix(loader, {
        __getCombinedMod:function (modName) {
            var cs;
            cs = S.Config.combines = S.Config.combines || {};
            return cs[modName] || modName;
        }
    });
})(KISSY, KISSY.__loader);/**
 * status constants
 * @author yiminghe@gmail.com
 */
(function(S, data) {
    if ("require" in this) {
        return;
    }
    // 鑴氭湰(loadQueue)/妯″潡(mod) 鍏敤鐘舵€�
    S.mix(data, {
        "INIT":0,
        "LOADING" : 1,
        "LOADED" : 2,
        "ERROR" : 3,
        // 妯″潡鐗规湁
        "ATTACHED" : 4
    });
})(KISSY, KISSY.__loaderData);/**
 * utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    var ua = navigator.userAgent,doc = document;
    S.mix(utils, {
        docHead:function() {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },
        isWebKit:!!ua.match(/AppleWebKit/),
        IE : !!ua.match(/MSIE/),
        isCss:function(url) {
            return /\.css(?:\?|$)/i.test(url);
        },
        isLinkNode:function(n) {
            return n.nodeName.toLowerCase() == 'link';
        },
        /**
         * resolve relative part of path
         * x/../y/z -> y/z
         * x/./y/z -> x/y/z
         * @param path uri path
         * @return {string} resolved path
         * @description similar to path.normalize in nodejs
         */
        normalizePath:function(path) {
            var paths = path.split("/"),
                re = [],
                p;
            for (var i = 0; i < paths.length; i++) {
                p = paths[i];
                if (p == ".") {
                } else if (p == "..") {
                    re.pop();
                } else {
                    re.push(p);
                }
            }
            return re.join("/");
        },

        /**
         * 鏍规嵁褰撳墠妯″潡浠ュ強渚濊禆妯″潡鐨勭浉瀵硅矾寰勶紝寰楀埌渚濊禆妯″潡鐨勭粷瀵硅矾寰�
         * @param moduleName 褰撳墠妯″潡
         * @param depName 渚濊禆妯″潡
         * @return {string|Array} 渚濊禆妯″潡鐨勭粷瀵硅矾寰�
         * @description similar to path.resolve in nodejs
         */
        normalDepModuleName:function normalDepModuleName(moduleName, depName) {
            if (!depName) {
                return depName;
            }
            if (S.isArray(depName)) {
                for (var i = 0; i < depName.length; i++) {
                    depName[i] = normalDepModuleName(moduleName, depName[i]);
                }
                return depName;
            }
            if (startsWith(depName, "../") || startsWith(depName, "./")) {
                var anchor = "",index;
                // x/y/z -> x/y/
                if ((index = moduleName.lastIndexOf("/")) != -1) {
                    anchor = moduleName.substring(0, index + 1);
                }
                return normalizePath(anchor + depName);
            } else if (depName.indexOf("./") != -1
                || depName.indexOf("../") != -1) {
                return normalizePath(depName);
            } else {
                return depName;
            }
        },
        //鍘婚櫎鍚庣紑鍚嶏紝瑕佽€冭檻鏃堕棿鎴�?
        removePostfix:function (path) {
            return path.replace(/(-min)?\.js[^/]*$/i, "");
        },
        /**
         * 璺緞姝ｅ垯鍖栵紝涓嶈兘鏄浉瀵瑰湴鍧€
         * 鐩稿鍦板潃鍒欒浆鎹㈡垚鐩稿椤甸潰鐨勭粷瀵瑰湴鍧€
         * 鐢ㄩ€�:
         * package path 鐩稿鍦板潃鍒欑浉瀵逛簬褰撳墠椤甸潰鑾峰彇缁濆鍦板潃
         */
        normalBasePath:function (path) {
            path = S.trim(path);

            // path 涓虹┖鏃讹紝涓嶈兘鍙樻垚 "/"
            if (path && path.charAt(path.length - 1) != '/') {
                path += "/";
            }

            /**
             * 涓€瀹氳姝ｅ垯鍖栵紝闃叉鍑虹幇 ../ 绛夌浉瀵硅矾寰�
             * 鑰冭檻鏈湴璺緞
             */
            if (!path.match(/^(http(s)?)|(file):/i)
                && !startsWith(path, "/")) {
                path = loader.__pagePath + path;
            }
            return normalizePath(path);
        },

        /**
         * 鐩稿璺緞鏂囦欢鍚嶈浆鎹负缁濆璺緞
         * @param path
         */
        absoluteFilePath:function(path) {
            path = utils.normalBasePath(path);
            return path.substring(0, path.length - 1);
        },

        //http://wiki.commonjs.org/wiki/Packages/Mappings/A
        //濡傛灉妯″潡鍚嶄互 / 缁撳熬锛岃嚜鍔ㄥ姞 index
        indexMapping:function (names) {
            for (var i = 0; i < names.length; i++) {
                if (names[i].match(/\/$/)) {
                    names[i] += "index";
                }
            }
            return names;
        }
    });

    var startsWith = S.startsWith,normalizePath = utils.normalizePath;

})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * script/css load across browser
 * @author  yiminghe@gmail.com
 */
(function (S, utils) {
    if ("require" in this) {
        return;
    }
    var CSS_POLL_INTERVAL = 30,
        /**
         * central poll for link node
         */
            timer = 0,

        monitors = {
            /**
             * node.id:[callback]
             */
        };

    function startCssTimer() {
        if (!timer) {
            S.log("start css polling");
            cssPoll();
        }
    }

    // single thread is ok
    function cssPoll() {
        for (var url in monitors) {
            var callbacks = monitors[url],
                node = callbacks.node,
                loaded = 0;
            if (utils.isWebKit) {
                if (node['sheet']) {
                    S.log("webkit loaded : " + url);
                    loaded = 1;
                }
            } else if (node['sheet']) {
                try {
                    var cssRules;
                    if (cssRules = node['sheet'].cssRules) {
                        S.log('firefox loaded : ' + url);
                        loaded = 1;
                    }
                } catch (ex) {
                    var exName = ex.name;
                    S.log('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
                    if (exName == 'NS_ERROR_DOM_SECURITY_ERR' ||
                        exName == 'SecurityError') {
                        S.log('firefox loaded : ' + url);
                        loaded = 1;
                    }
                }
            }

            if (loaded) {
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].call(node);
                }
                delete monitors[url];
            }
        }
        if (S.isEmptyObject(monitors)) {
            timer = 0;
            S.log("end css polling");
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    S.mix(utils, {
        scriptOnload:document.addEventListener ?
            function (node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                node.addEventListener('load', callback, false);
            } :
            function (node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function () {
                    var rs = node.readyState;
                    if (/loaded|complete/i.test(rs)) {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            },

        /**
         * monitor css onload across browsers
         * 鏆傛椂涓嶈€冭檻濡備綍鍒ゆ柇澶辫触锛屽 404 绛�
         * @refer
         *  - firefox 涓嶅彲琛岋紙缁撹4閿欒锛夛細
         *    - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
         *  - 鍏ㄦ祻瑙堝櫒鍏煎
         *    - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
         *  - 鍏朵粬
         *    - http://www.zachleat.com/web/load-css-dynamically/
         */
        styleOnload:window.attachEvent || window.opera ?
            // ie/opera
            function (node, callback) {
                // whether to detach using function wrapper?
                function t() {
                    node.detachEvent('onload', t);
                    S.log('ie/opera loaded : ' + node.href);
                    callback.call(node);
                }

                node.attachEvent('onload', t);
            } :
            // refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
            // 鏆傛椂涓嶈€冭檻濡備綍鍒ゆ柇澶辫触锛屽 404 绛�
            function (node, callback) {
                var href = node.href, arr;
                arr = monitors[href] = monitors[href] || [];
                arr.node = node;
                arr.push(callback);
                startCssTimer();
            }
    });
})(KISSY, KISSY.__loaderUtils);/**
 * getScript support for css and js callback after load
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, utils) {
    if ("require" in this) {
        return;
    }
    var MILLISECONDS_OF_SECOND = 1000,
        scriptOnload = utils.scriptOnload;

    S.mix(S, {

        /**
         * load  a css file from server using http get ,after css file load ,execute success callback
         * @param url css file url
         * @param success callback
         * @param charset
         */
        getStyle:function(url, success, charset) {
            var doc = document,
                head = utils.docHead(),
                node = doc.createElement('link'),
                config = success;

            if (S.isPlainObject(config)) {
                success = config.success;
                charset = config.charset;
            }

            node.href = url;
            node.rel = 'stylesheet';

            if (charset) {
                node.charset = charset;
            }

            if (success) {
                utils.scriptOnload(node, success);
            }
            head.appendChild(node);
            return node;

        },
        /**
         * Load a JavaScript/Css file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript:function(url, success, charset) {
            if (utils.isCss(url)) {
                return S.getStyle(url, success, charset);
            }
            var doc = document,
                head = doc.head || doc.getElementsByTagName("head")[0],
                node = doc.createElement('script'),
                config = success,
                error,
                timeout,
                timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            function clearTimer() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            }


            node.src = url;
            node.async = true;
            if (charset) {
                node.charset = charset;
            }
            if (success || error) {
                scriptOnload(node, function() {
                    clearTimer();
                    S.isFunction(success) && success.call(node);
                });

                if (S.isFunction(error)) {

                    //鏍囧噯娴忚鍣�
                    if (doc.addEventListener) {
                        node.addEventListener("error", function() {
                            clearTimer();
                            error.call(node);
                        }, false);
                    }

                    timer = S.later(function() {
                        timer = undefined;
                        error();
                    }, (timeout || this.Config.timeout) * MILLISECONDS_OF_SECOND);
                }
            }
            head.insertBefore(node, head.firstChild);
            return node;
        }
    });

})(KISSY, KISSY.__loaderUtils);/**
 * add module definition
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    var IE = utils.IE,
        ATTACHED = data.ATTACHED,
        mix = S.mix;


    mix(loader, {
        /**
         * Registers a module.
         * @param name {String} module name
         * @param def {Function|Object} entry point into the module that is used to bind module to KISSY
         * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ }, {requires: ['mod1']});
         * </code>
         * <code>
         * KISSY.add({
         *     'mod-name': {
         *         fullpath: 'url',
         *         requires: ['mod1','mod2']
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, def, config) {
            var self = this,
                mods = self.Env.mods,
                o;

            // S.add(name, config) => S.add( { name: config } )
            if (S.isString(name)
                && !config
                && S.isPlainObject(def)) {
                o = {};
                o[name] = def;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function(v, k) {
                    v.name = k;
                    if (mods[k]) {
                        // 淇濈暀涔嬪墠娣诲姞鐨勯厤缃�
                        mix(v, mods[k], false);
                    }
                });
                mix(mods, name);
                return self;
            }
            // S.add(name[, fn[, config]])
            if (S.isString(name)) {

                var host;
                if (config && ( host = config.host )) {
                    var hostMod = mods[host];
                    if (!hostMod) {
                        S.log("module " + host + " can not be found !", "error");
                        //S.error("module " + host + " can not be found !");
                        return self;
                    }
                    if (self.__isAttached(host)) {
                        def.call(self, self);
                    } else {
                        //璇� host 妯″潡绾櫄锛�
                        hostMod.fns = hostMod.fns || [];
                        hostMod.fns.push(def);
                    }
                    return self;
                }

                self.__registerModule(name, def, config);
                //鏄剧ず鎸囧畾 add 涓� attach
                if (config && config['attach'] === false) {
                    return self;
                }
                // 鍜� 1.1.7 浠ュ墠鐗堟湰淇濇寔鍏煎锛屼笉寰楀凡鑰屼负涔�
                var mod = mods[name];
                var requires = utils.normalDepModuleName(name, mod.requires);
                if (self.__isAttached(requires)) {
                    //S.log(mod.name + " is attached when add !");
                    self.__attachMod(mod);
                }
                //璋冭瘯鐢紝涓轰粈涔堜笉鍦� add 鏃� attach
                else if (this.Config.debug && !mod) {
                    var i,modNames;
                    i = (modNames = S.makeArray(requires)).length - 1;
                    for (; i >= 0; i--) {
                        var requireName = modNames[i];
                        var requireMod = mods[requireName] || {};
                        if (requireMod.status !== ATTACHED) {
                            S.log(mod.name + " not attached when added : depends " + requireName);
                        }
                    }
                }
                return self;
            }
            // S.add(fn,config);
            if (S.isFunction(name)) {
                config = def;
                def = name;
                if (IE) {
                    /*
                     Kris Zyp
                     2010骞�10鏈�21鏃�, 涓婂崍11鏃�34鍒�
                     We actually had some discussions off-list, as it turns out the required
                     technique is a little different than described in this thread. Briefly,
                     to identify anonymous modules from scripts:
                     * In non-IE browsers, the onload event is sufficient, it always fires
                     immediately after the script is executed.
                     * In IE, if the script is in the cache, it actually executes *during*
                     the DOM insertion of the script tag, so you can keep track of which
                     script is being requested in case define() is called during the DOM
                     insertion.
                     * In IE, if the script is not in the cache, when define() is called you
                     can iterate through the script tags and the currently executing one will
                     have a script.readyState == "interactive"
                     See RequireJS source code if you need more hints.
                     Anyway, the bottom line from a spec perspective is that it is
                     implemented, it works, and it is possible. Hope that helps.
                     Kris
                     */
                    // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                    // use onload to get module name is not right in ie
                    name = self.__findModuleNameByInteractive();
                    S.log("old_ie get modname by interactive : " + name);
                    self.__registerModule(name, def, config);
                    self.__startLoadModuleName = null;
                    self.__startLoadTime = 0;
                } else {
                    // 鍏朵粬娴忚鍣� onload 鏃讹紝鍏宠仈妯″潡鍚嶄笌妯″潡瀹氫箟
                    self.__currentModule = {
                        def:def,
                        config:config
                    };
                }
                return self;
            }
            S.log("invalid format for KISSY.add !", "error");
            return self;
        }
    });

})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);

/**
 * @refer
 *  - https://github.com/amdjs/amdjs-api/wiki/AMD
 **//**
 * build full path from relative path and base path
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        __buildPath:function (mod, base) {
            var self = this,
                Config = self.Config;

            base = base || Config.base;

            build("fullpath", "path");

            if (mod["cssfullpath"] !== data.LOADED) {
                build("cssfullpath", "csspath");
            }

            function build(fullpath, path) {

                if (mod[fullpath + "__builded"]) {
                    return;
                }

                mod[fullpath + "__builded"] = 1;

                if (!mod[fullpath] && mod[path]) {
                    //濡傛灉鏄� ./ 鎴� ../ 鍒欑浉瀵瑰綋鍓嶆ā鍧楄矾寰�
                    mod[path] = utils.normalDepModuleName(mod.name, mod[path]);
                    mod[fullpath] = base + mod[path];
                }
                // debug 妯″紡涓嬶紝鍔犺浇闈� min 鐗�
                if (mod[fullpath] && Config.debug) {
                    mod[fullpath] = mod[fullpath].replace(/-min/ig, "");
                }

                //鍒锋柊瀹㈡埛绔紦瀛橈紝鍔犳椂闂存埑 tag
                if (mod[fullpath]
                    && !(mod[fullpath].match(/\?t=/))
                    && mod.tag) {
                    mod[fullpath] += "?t=" + mod.tag;
                }

                if (mod[fullpath]) {
                    mod[fullpath] = self.__getMappedPath(mod[fullpath]);
                }

            }
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 * logic for config.global , mainly for kissy.editor
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {

        // 鎸夐渶浠� global 杩佺Щ妯″潡瀹氫箟鍒板綋鍓� loader 瀹炰緥锛屽苟鏍规嵁 global 璁剧疆 fullpath
        __mixMod: function(name, global) {
            // 浠� __mixMods 璋冪敤杩囨潵鏃讹紝鍙兘鏈疄渚嬫病鏈夎妯″潡鐨勬暟鎹粨鏋�
            var self = this,
                mods = self.Env.mods,
                gMods = global.Env.mods,
                mod = mods[name] || {},
                status = mod.status;

            if (gMods[name]) {

                S.mix(mod, S.clone(gMods[name]));

                // status 灞炰簬瀹炰緥锛屽綋鏈夊€兼椂锛屼笉鑳借瑕嗙洊銆�
                // 1. 鍙湁娌℃湁鍒濆鍊兼椂锛屾墠浠� global 涓婄户鎵�
                // 2. 鍒濆鍊间负 0 鏃讹紝涔熶粠 global 涓婄户鎵�
                // 鍏朵粬閮戒繚瀛樿嚜宸辩殑鐘舵€�
                if (status) {
                    mod.status = status;
                }
            }

            // 鏉ヨ嚜 global 鐨� mod, path 涔熷簲璇ュ熀浜� global
            self.__buildPath(mod, global.Config.base);

            mods[name] = mod;
        }
    });
})(KISSY, KISSY.__loader);/**
 * for ie ,find current executive script ,then infer module name
 * @author yiminghe@gmail.com
 */
(function (S, loader, utils) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        //ie 鐗规湁锛屾壘鍒板綋鍓嶆鍦ㄤ氦浜掔殑鑴氭湰锛屾牴鎹剼鏈悕纭畾妯″潡鍚�
        // 濡傛灉鎵句笉鍒帮紝杩斿洖鍙戦€佸墠閭ｄ釜鑴氭湰
        __findModuleNameByInteractive:function () {
            var self = this,
                scripts = document.getElementsByTagName("script"),
                re,
                script;

            for (var i = 0; i < scripts.length; i++) {
                script = scripts[i];
                if (script.readyState == "interactive") {
                    re = script;
                    break;
                }
            }
            if (!re) {
                // sometimes when read module file from cache , interactive status is not triggered
                // module code is executed right after inserting into dom
                // i has to preserve module name before insert module script into dom , then get it back here
                S.log("can not find interactive script,time diff : " + (+new Date() - self.__startLoadTime), "error");
                S.log("old_ie get modname from cache : " + self.__startLoadModuleName);
                return self.__startLoadModuleName;
                //S.error("鎵句笉鍒� interactive 鐘舵€佺殑 script");
            }

            // src 蹇呭畾鏄粷瀵硅矾寰�
            // or re.hasAttribute ? re.src :  re.getAttribute('src', 4);
            // http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            var src = utils.absoluteFilePath(re.src);
            // S.log("interactive src :" + src);
            // 娉ㄦ剰锛氭ā鍧楀悕涓嶅寘鍚悗缂€鍚嶄互鍙婂弬鏁帮紝鎵€浠ュ幓闄�
            // 绯荤粺妯″潡鍘婚櫎绯荤粺璺緞
            // 闇€瑕� base norm , 闃叉 base 琚寚瀹氫负鐩稿璺緞
            self.Config.base = utils.normalBasePath(self.Config.base);
            if (src.lastIndexOf(self.Config.base, 0)
                === 0) {
                return utils.removePostfix(src.substring(self.Config.base.length));
            }
            var packages = self.Config.packages,
                finalPackagePath,
                finalPackageLength = -1;
            //澶栭儴妯″潡鍘婚櫎鍖呰矾寰勶紝寰楀埌妯″潡鍚�
            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    var p_path = packages[p].path;
                    if (packages.hasOwnProperty(p) &&
                        src.lastIndexOf(p_path, 0) === 0) {
                        if (p_path.length > finalPackageLength) {
                            finalPackageLength = p_path.length;
                            finalPackagePath = p_path;
                        }
                    }
                }
            }
            if (finalPackagePath) {
                return utils.removePostfix(src.substring(finalPackagePath.length));
            }
            S.log("interactive script does not have package config 锛�" + src, "error");
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * load a single mod (js or css)
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    var IE = utils.IE,
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        ATTACHED = data.ATTACHED;

    S.mix(loader, {
        /**
         * Load a single module.
         */
        __load: function(mod, callback, cfg) {

            var self = this,
                url = mod['fullpath'],
                isCss = utils.isCss(url),
            // 杩欎釜鏄叏灞€鐨勶紝闃叉澶氬疄渚嬪鍚屼竴妯″潡鐨勯噸澶嶄笅杞�
                loadQueque = S.Env._loadQueue,
                status = loadQueque[url],
                node = status;

            mod.status = mod.status || 0;

            // 鍙兘宸茬粡鐢卞叾瀹冩ā鍧楄Е鍙戝姞杞�
            if (mod.status < LOADING && status) {
                // 璇ユā鍧楁槸鍚﹀凡缁忚浇鍏ュ埌 global ?
                mod.status = status === LOADED ? LOADED : LOADING;
            }

            // 1.20 鍏煎 1.1x 澶勭悊锛氬姞杞� cssfullpath 閰嶇疆鐨� css 鏂囦欢
            // 浠呭彂鍑鸿姹傦紝涓嶅仛浠讳綍鍏跺畠澶勭悊
            if (S.isString(mod["cssfullpath"])) {
                S.getScript(mod["cssfullpath"]);
                mod["cssfullpath"] = mod.csspath = LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;
                if (IE && !isCss) {
                    self.__startLoadModuleName = mod.name;
                    self.__startLoadTime = Number(+new Date());
                }
                node = S.getScript(url, {
                    success: function() {
                        if (isCss) {

                        } else {
                            //杞藉叆 css 涓嶉渶瑕佽繖姝ヤ簡
                            //鏍囧噯娴忚鍣ㄤ笅锛氬閮ㄨ剼鏈墽琛屽悗绔嬪嵆瑙﹀彂璇ヨ剼鏈殑 load 浜嬩欢,ie9 杩樻槸涓嶈
                            if (self.__currentModule) {
                                S.log("standard browser get modname after load : " + mod.name);
                                self.__registerModule(mod.name, self.__currentModule.def,
                                    self.__currentModule.config);
                                self.__currentModule = null;
                            }
                            // 妯″潡杞藉叆鍚庯紝濡傛灉闇€瑕佷篃瑕佹贩鍏ュ搴� global 涓婃ā鍧楀畾涔�
                            mixGlobal();
                            if (mod.fns && mod.fns.length > 0) {

                            } else {
                                _modError();
                            }
                        }
                        if (mod.status != ERROR) {
                            S.log(mod.name + ' is loaded.', 'info');
                        }
                        _scriptOnComplete();
                    },
                    error: function() {
                        _modError();
                        _scriptOnComplete();
                    },
                    charset: mod.charset
                });

                loadQueque[url] = node;
            }
            // 宸茬粡鍦ㄥ姞杞戒腑锛岄渶瑕佹坊鍔犲洖璋冨埌 script onload 涓�
            // 娉ㄦ剰锛氭病鏈夎€冭檻 error 鎯呭舰
            else if (mod.status === LOADING) {
                utils.scriptOnload(node, function() {
                    // 妯″潡杞藉叆鍚庯紝濡傛灉闇€瑕佷篃瑕佹贩鍏ュ搴� global 涓婃ā鍧楀畾涔�
                    mixGlobal();
                    _scriptOnComplete();
                });
            }
            // 鏄唴宓屼唬鐮侊紝鎴栬€呭凡缁� loaded
            else {
                // 涔熻娣峰叆瀵瑰簲 global 涓婃ā鍧楀畾涔�
                mixGlobal();
                callback();
            }

            function _modError() {
                S.log(mod.name + ' is not loaded! can not find module in path : ' + mod['fullpath'], 'error');
                mod.status = ERROR;
            }

            function mixGlobal() {
                // 瀵逛簬鍔ㄦ€佷笅杞戒笅鏉ョ殑妯″潡锛宭oaded 鍚庯紝global 涓婃湁鍙兘鏇存柊 mods 淇℃伅
                // 闇€瑕佸悓姝ュ埌 instance 涓婂幓
                // 娉ㄦ剰锛氳姹� mod 瀵瑰簲鐨勬枃浠堕噷锛屼粎淇敼璇� mod 淇℃伅
                if (cfg.global) {
                    self.__mixMod(mod.name, cfg.global);
                }
            }

            function _scriptOnComplete() {
                loadQueque[url] = LOADED;

                if (mod.status !== ERROR) {

                    // 娉ㄦ剰锛氬綋澶氫釜妯″潡渚濊禆鍚屼竴涓笅杞戒腑鐨勬ā鍧桝涓嬶紝妯″潡A浠呴渶 attach 涓€娆�
                    // 鍥犳瑕佸姞涓婁笅闈㈢殑 !== 鍒ゆ柇锛屽惁鍒欎細鍑虹幇閲嶅 attach,
                    // 姣斿缂栬緫鍣ㄩ噷鍔ㄦ€佸姞杞芥椂锛岃渚濊禆鐨勬ā鍧椾細閲嶅
                    if (mod.status !== ATTACHED) {
                        mod.status = LOADED;
                    }

                    callback();
                }
            }
        }
    });

})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 * @module loader
 * @author lifesinger@gmail.com,yiminghe@gmail.com,lijing00333@163.com
 * @description: constant member and common method holder
 */
(function (S, loader, data) {
    if ("require" in this) {
        return;
    }
    var ATTACHED = data.ATTACHED,
        mix = S.mix;

    mix(loader, {

        // 褰撳墠椤甸潰鎵€鍦ㄧ殑鐩綍
        // http://xx.com/y/z.htm#!/f/g
        // ->
        // http://xx.com/y/
        __pagePath: location.href.replace(/#.*$/, "").replace(/[^/]*$/i, ""),

        //firefox,ie9,chrome 濡傛灉add娌℃湁妯″潡鍚嶏紝妯″潡瀹氫箟鍏堟殏瀛樿繖閲�
        __currentModule: null,

        //ie6,7,8寮€濮嬭浇鍏ヨ剼鏈殑鏃堕棿
        __startLoadTime: 0,

        //ie6,7,8寮€濮嬭浇鍏ヨ剼鏈搴旂殑妯″潡鍚�
        __startLoadModuleName: null,

        __isAttached: function (modNames) {
            var mods = this.Env.mods,
                ret = true;
            S.each(modNames, function (name) {
                var mod = mods[name];
                if (!mod || mod.status !== ATTACHED) {
                    ret = false;
                    return ret;
                }
            });
            return ret;
        }
    });


})(KISSY, KISSY.__loader, KISSY.__loaderData);

/**
 * 2011-01-04 chengyu<yiminghe@gmail.com> refactor:
 *
 * adopt requirejs :
 *
 * 1. packages(cfg) , cfg :{
 *    name : 鍖呭悕锛岀敤浜庢寚瀹氫笟鍔℃ā鍧楀墠缂€
 *    path: 鍓嶇紑鍖呭悕瀵瑰簲鐨勮矾寰�
 *    charset: 璇ュ寘涓嬫墍鏈夋枃浠剁殑缂栫爜
 *
 * 2. add(moduleName,function(S,depModule){return function(){}},{requires:["depModuleName"]});
 *    moduleName add 鏃跺彲浠ヤ笉鍐�
 *    depModuleName 鍙互鍐欑浉瀵瑰湴鍧€ (./ , ../)锛岀浉瀵逛簬 moduleName
 *
 * 3. S.use(["dom"],function(S,DOM){
 *    });
 *    渚濊禆娉ㄥ叆锛屽彂鐢熶簬 add 鍜� use 鏃舵湡
 *
 * 4. add,use 涓嶆敮鎸� css loader ,getScript 浠嶇劧淇濈暀鏀寔
 *
 * 5. 閮ㄥ垎鏇存柊妯″潡鏂囦欢浠ｇ爜 x/y?t=2011 锛屽姞杞借繃绋嬩腑娉ㄦ剰鍘婚櫎浜嬩欢鎴筹紝浠呭湪杞藉叆鏂囦欢鏃朵娇鐢�
 *
 * demo : http://lite-ext.googlecode.com/svn/trunk/lite-ext/playground/module_package/index.html
 *
 * 2011-03-01 yiminghe@gmail.com note:
 *
 * compatibility
 *
 * 1. 淇濇寔鍏煎鎬э紝涓嶅緱宸茶€屼负涔�
 *      鏀寔 { host : }
 *      濡傛灉 requires 閮藉凡缁� attached锛屾敮鎸� add 鍚庣珛鍗� attach
 *      鏀寔 { attach : false } 鏄剧ず鎺у埗 add 鏃舵槸鍚� attach
 *      鏀寔 { global : Editor } 鎸囨槑妯″潡鏉ユ簮
 *
 *
 * 2011-05-04 鍒濇鎷嗗垎鏂囦欢锛宼md 涔变簡
 */

/**
 * package mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader, utils) {
    if ("require" in this) {
        return;
    }
    /**
     * 鍖呭０鏄�
     * biz -> .
     * 琛ㄧず閬囧埌 biz/x
     * 鍦ㄥ綋鍓嶇綉椤佃矾寰勬壘 biz/x.js
     */
    S.configs.packages = function (cfgs) {
        var ps;
        ps = S.Config.packages = S.Config.packages || {};
        S.each(cfgs, function (cfg) {
            ps[cfg.name] = cfg;
            //娉ㄦ剰姝ｅ垯鍖�
            cfg.path = cfg.path && utils.normalBasePath(cfg.path);
            cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
        });
    };
    S.mix(loader, {
        __getPackagePath:function (mod) {
            //缂撳瓨鍖呰矾寰勶紝鏈敵鏄庣殑鍖呯殑妯″潡閮藉埌鏍稿績妯″潡涓壘
            if (mod.packagepath) {
                return mod.packagepath;
            }
            var self = this,
            //涓€涓ā鍧楀悎骞跺埌浜嗗彟涓€涓ā鍧楁枃浠朵腑鍘�
                modName = S.__getCombinedMod(mod.name),
                packages = self.Config.packages || {},
                pName = "",
                p_def;

            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    if (S.startsWith(modName, p) &&
                        p.length > pName.length) {
                        pName = p;
                    }
                }
            }
            p_def = packages[pName];
            mod.charset = p_def && p_def.charset || mod.charset;
            if (p_def) {
                mod.tag = p_def.tag;
            } else {
                // kissy 鑷韩缁勪欢鐨勪簨浠舵埑鍚庣紑
                mod.tag = encodeURIComponent(S.Config.tag || S.buildTime);
            }
            return mod.packagepath = (p_def && p_def.path) || self.Config.base;
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * register module ,associate module name with module factory(definition)
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function(S, loader,data) {
    if ("require" in this) {
        return;
    }
    var LOADED = data.LOADED,
        mix = S.mix;

    mix(loader, {
        //娉ㄥ唽妯″潡锛屽皢妯″潡鍜屽畾涔� factory 鍏宠仈璧锋潵
        __registerModule:function(name, def, config) {
            config = config || {};
            var self = this,
                mods = self.Env.mods,
                mod = mods[name] || {};

            // 娉ㄦ剰锛氶€氳繃 S.add(name[, fn[, config]]) 娉ㄥ唽鐨勪唬鐮侊紝鏃犺鏄〉闈腑鐨勪唬鐮侊紝
            // 杩樻槸 js 鏂囦欢閲岀殑浠ｇ爜锛宎dd 鎵ц鏃讹紝閮芥剰鍛崇潃璇ユā鍧楀凡缁� LOADED
            mix(mod, { name: name, status: LOADED });

            if (mod.fns && mod.fns.length) {
                S.log(name + " is defined more than once");
                //S.error(name + " is defined more than once");
            }

            //鏀寔 host锛屼竴涓ā鍧楀涓� add factory
            mod.fns = mod.fns || [];
            mod.fns.push(def);
            mix((mods[name] = mod), config);
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderData);/**
 * use and attach mod
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S, loader, utils, data) {

    if ("require" in this) {
        return;
    }

    var LOADED = data.LOADED,
        ATTACHED = data.ATTACHED;

    S.mix(loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         */
        use:function (modNames, callback, cfg) {
            modNames = modNames.replace(/\s+/g, "").split(',');
            utils.indexMapping(modNames);
            cfg = cfg || {};

            var self = this,
                fired;

            // 宸茬粡鍏ㄩ儴 attached, 鐩存帴鎵ц鍥炶皟鍗冲彲
            if (self.__isAttached(modNames)) {
                var mods = self.__getModules(modNames);
                callback && callback.apply(self, mods);
                return;
            }

            // 鏈夊皻鏈� attached 鐨勬ā鍧�
            S.each(modNames, function (modName) {
                // 浠� name 寮€濮嬭皟鐢紝闃叉涓嶅瓨鍦ㄦā鍧�
                self.__attachModByName(modName, function () {
                    if (!fired &&
                        self.__isAttached(modNames)) {
                        fired = true;
                        var mods = self.__getModules(modNames);
                        callback && callback.apply(self, mods);
                    }
                }, cfg);
            });

            return self;
        },

        __getModules:function (modNames) {
            var self = this,
                mods = [self];

            S.each(modNames, function (modName) {
                if (!utils.isCss(modName)) {
                    mods.push(self.require(modName));
                }
            });
            return mods;
        },

        /**
         * get module's value defined by define function
         * @param {string} moduleName
         */
        require:function (moduleName) {
            var self = this,
                mods = self.Env.mods,
                mod = mods[moduleName],
                re = self['onRequire'] && self['onRequire'](mod);
            if (re !== undefined) {
                return re;
            }
            return mod && mod.value;
        },

        // 鍔犺浇鎸囧畾妯″潡鍚嶆ā鍧楋紝濡傛灉涓嶅瓨鍦ㄥ畾涔夐粯璁ゅ畾涔変负鍐呴儴妯″潡
        __attachModByName:function (modName, callback, cfg) {
            var self = this,
                mods = self.Env.mods;

            var mod = mods[modName];
            //娌℃湁妯″潡瀹氫箟
            if (!mod) {
                // 榛樿 js/css 鍚嶅瓧
                // 涓嶆寚瀹� .js 榛樿涓� js
                // 鎸囧畾涓� css 杞藉叆 .css
                var componentJsName = self.Config['componentJsName'] ||
                        function (m) {
                            var suffix = "js", match;
                            if (match = m.match(/(.+)\.(js|css)$/i)) {
                                suffix = match[2];
                                m = match[1];
                            }
                            return m + '-min.' + suffix;
                        },
                    path = componentJsName(S.__getCombinedMod(modName));
                mod = {
                    path:path,
                    charset:'utf-8'
                };
                //娣诲姞妯″潡瀹氫箟
                mods[modName] = mod;
            }

            mod.name = modName;

            if (mod && mod.status === ATTACHED) {
                return;
            }

            // 鍏堜粠 global 閲屽彇
            if (cfg.global) {
                self.__mixMod(modName, cfg.global);
            }

            self.__attach(mod, callback, cfg);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach:function (mod, callback, cfg) {
            var self = this,
                r,
                rMod,
                i,
                attached = 0,
                mods = self.Env.mods,
            //澶嶅埗涓€浠藉綋鍓嶇殑渚濊禆椤瑰嚭鏉ワ紝闃叉 add 鍚庝慨鏀癸紒
                requires = (mod['requires'] || []).concat();

            mod['requires'] = requires;

            /**
             * check cyclic dependency between mods
             */
            function cyclicCheck() {
                var __allRequires,
                    myName = mod.name,
                    r, r2, rmod,
                    r__allRequires,
                    requires = mod.requires;
                // one mod's all requires mods to run its callback
                __allRequires = mod.__allRequires = mod.__allRequires || {};
                for (var i = 0; i < requires.length; i++) {
                    r = requires[i];
                    rmod = mods[r];
                    __allRequires[r] = 1;
                    if (rmod && (r__allRequires = rmod.__allRequires)) {
                        for (r2 in r__allRequires) {
                            if (r__allRequires.hasOwnProperty(r2)) {
                                __allRequires[r2] = 1;
                            }
                        }
                    }
                }
                if (__allRequires[myName]) {
                    var t = [];
                    for (r in __allRequires) {
                        if (__allRequires.hasOwnProperty(r)) {
                            t.push(r);
                        }
                    }
                    S.error("find cyclic dependency by mod " + myName + " between mods : " + t.join(","));
                }
            }

            if (S.Config.debug) {
                cyclicCheck();
            }

            // attach all required modules
            for (i = 0; i < requires.length; i++) {
                r = requires[i] = utils.normalDepModuleName(mod.name, requires[i]);
                rMod = mods[r];
                if (rMod && rMod.status === ATTACHED) {
                    //no need
                } else {
                    self.__attachModByName(r, fn, cfg);
                }
            }

            // load and attach this module
            self.__buildPath(mod, self.__getPackagePath(mod));

            self.__load(mod, function () {

                // add 鍙兘鏀逛簡 config锛岃繖閲岄噸鏂板彇涓�
                mod['requires'] = mod['requires'] || [];

                var newRequires = mod['requires'],
                    needToLoad = [];

                //鏈ā鍧椾笅杞芥垚鍔熷悗涓茶涓嬭浇 require
                for (i = 0; i < newRequires.length; i++) {
                    r = newRequires[i] = utils.normalDepModuleName(mod.name, newRequires[i]);
                    var rMod = mods[r],
                        inA = S.inArray(r, requires);
                    //宸茬粡澶勭悊杩囦簡鎴栧皢瑕佸鐞�
                    if (rMod &&
                        rMod.status === ATTACHED
                        //宸茬粡姝ｅ湪澶勭悊浜�
                        || inA) {
                        //no need
                    } else {
                        //鏂板鐨勪緷璧栭」
                        needToLoad.push(r);
                    }
                }

                if (needToLoad.length) {
                    for (i = 0; i < needToLoad.length; i++) {
                        self.__attachModByName(needToLoad[i], fn, cfg);
                    }
                } else {
                    fn();
                }
            }, cfg);

            function fn() {
                if (!attached &&
                    self.__isAttached(mod['requires'])) {

                    if (mod.status === LOADED) {
                        self.__attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        attached = 1;
                        callback();
                    }
                }
            }
        },

        __attachMod:function (mod) {
            var self = this,
                fns = mod.fns;

            if (fns) {
                S.each(fns, function (fn) {
                    var value;
                    if (S.isFunction(fn)) {
                        value = fn.apply(self, self.__getModules(mod['requires']));
                    } else {
                        value = fn;
                    }
                    mod.value = mod.value || value;
                });
            }

            mod.status = ATTACHED;
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 *  mix loader into S and infer KISSy baseUrl if not set
 *  @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, loader, utils) {
    if ("require" in this) {
        return;
    }
    S.mix(S, loader);

    /**
     * get base from src
     * @param src script source url
     * @return base for kissy
     * @example:
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     * @notice: custom combo rules, such as yui3:
     *  <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     */
    // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-aio)?(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-aio)?(-min)?\.js/i;

    function getBaseUrl(script) {
        var src = utils.absoluteFilePath(script.src),
            prefix = script.getAttribute('data-combo-prefix') || '??',
            sep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(sep),
            base,
            part0 = parts[0],
            index = part0.indexOf(prefix);
        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            var part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(baseTestReg)) {
                base += part01.replace(baseReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function (part) {
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        return false;
                    }
                });
            }
        }
        return base;
    }

    /**
     * Initializes loader.
     */
    S.__initLoader = function () {
        var self = this;
        self.Env.mods = self.Env.mods || {}; // all added mods
    };

    S.Env._loadQueue = {}; // information for loading and loaded mods
    S.__initLoader();

    (function () {
        // get base from current script file path
        var scripts = document.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);
        S.Config.base = utils.normalBasePath(base);
        // the default timeout for getScript
        S.Config.timeout = 10;
    })();

    S.mix(S.configs, {
        base:function (base) {
            S.Config.base = utils.normalBasePath(base);
        },
        timeout:function (v) {
            S.Config.timeout = v;
        },
        debug:function (v) {
            S.Config.debug = v;
        }
    });

    // for S.app working properly
    S.each(loader, function (v, k) {
        S.__APP_MEMBERS.push(k);
    });

    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * @module  web.js
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.__HOST,
        doc = win['document'],

        docElem = doc.documentElement,

        EMPTY = '',

    // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

    // The functions to execute on DOM ready.
        readyList = [],

    // The number of poll times.
        POLL_RETRYS = 500,

    // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

    // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        RE_NOT_WHITE = /\S/;
    S.mix(S, {


        /**
         * A crude way of determining if an object is a window
         */
        isWindow: function (o) {
            return S.type(o) === 'object'
                && 'setInterval' in o
                && 'document' in o
                && o.document.nodeType == 9;
        },


        parseXML: function (data) {
            var xml;
            try {
                // Standard
                if (window.DOMParser) {
                    xml = new DOMParser().parseFromString(data, "text/xml");
                } else { // IE
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                }
            } catch (e) {
                S.log("parseXML error : ");
                S.log(e);
                xml = undefined;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                S.error("Invalid XML: " + data);
            }
            return xml;
        },

        /**
         * Evalulates a script in a global context.
         */
        globalEval: function (data) {
            if (data && RE_NOT_WHITE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                ( window.execScript || function (data) {
                    window[ "eval" ].call(window, data);
                } )(data);
            }
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function (fn) {

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id <String> The id of the element, or an array of ids to look for.
         * @param fn <Function> What to execute when the element is found.
         */
        available: function (id, fn) {
            id = (id + EMPTY).match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) {
                return;
            }

            var retryCount = 1,
                node,
                timer = S.later(function () {
                    if ((node = doc.getElementById(id)) && (fn(node) || 1) ||
                        ++retryCount > POLL_RETRYS) {
                        timer.cancel();
                    }
                }, POLL_INTERVAL, true);
        }
    });


    /**
     * Binds ready events.
     */
    function _bindReady() {
        var doScroll = docElem.doScroll,
            eventType = doc.addEventListener ? 'DOMContentLoaded' : 'onreadystatechange',
            COMPLETE = 'complete',
            fire = function () {
                _fireReady();
            };

        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (doc.readyState === COMPLETE) {
            return fire();
        }

        // w3c mode
        if (doc.addEventListener) {
            function domReady() {
                doc.removeEventListener(eventType, domReady, false);
                fire();
            }

            doc.addEventListener(eventType, domReady, false);

            // A fallback to window.onload, that will always work
            win.addEventListener('load', fire, false);
        }
        // IE event model is used
        else {
            function stateChange() {
                if (doc.readyState === COMPLETE) {
                    doc.detachEvent(eventType, stateChange);
                    fire();
                }
            }

            // ensure firing before onload, maybe late but safe also for iframes
            doc.attachEvent(eventType, stateChange);

            // A fallback to window.onload, that will always work.
            win.attachEvent('onload', fire);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe = false;

            try {
                notframe = (win['frameElement'] === null);
            } catch (e) {
                S.log("frameElement error : ");
                S.log(e);
            }

            if (doScroll && notframe) {
                function readyScroll() {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fire();
                    } catch (ex) {
                        //S.log("detect document ready : " + ex);
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                }

                readyScroll();
            }
        }
        return 0;
    }

    /**
     * Executes functions bound to ready event.
     */
    function _fireReady() {
        if (isReady) {
            return;
        }

        // Remember that the DOM is ready
        isReady = true;

        // If there are functions bound, to execute
        if (readyList) {
            // Execute all of them
            var fn, i = 0;
            while (fn = readyList[i++]) {
                fn.call(win, S);
            }

            // Reset the list of functions
            readyList = null;
        }
    }

    // If url contains '?ks-debug', debug mode will turn on automatically.
    if (location && (location.search || EMPTY).indexOf('ks-debug') !== -1) {
        S.Config.debug = true;
    }

    /**
     * bind on start
     * in case when you bind but the DOMContentLoaded has triggered
     * then you has to wait onload
     * worst case no callback at all
     */
    _bindReady();

})(KISSY, undefined);
/**
 * 澹版槑 kissy 鏍稿績涓墍鍖呭惈鐨勬ā鍧楋紝鍔ㄦ€佸姞杞芥椂灏嗙洿鎺ヤ粠 core.js 涓姞杞芥牳蹇冩ā鍧�
 * @description: 涓轰簡鍜� 1.1.7 鍙婁互鍓嶇増鏈繚鎸佸吋瀹癸紝鍔″疄涓庡垱鏂帮紝鍏煎涓庨潻鏂� 锛�
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.config({
        'combines':{
            'core':['dom', 'ua', 'event', 'node', 'json', 'ajax', 'anim', 'base', 'cookie']
        }
    });
})(KISSY);
/**
 combined files :

 D:\code\kissy_git\kissy1.2\src\ua\base.js
 D:\code\kissy_git\kissy1.2\src\ua\extra.js
 D:\code\kissy_git\kissy1.2\src\ua.js
 D:\code\kissy_git\kissy1.2\src\dom\base.js
 D:\code\kissy_git\kissy1.2\src\dom\attr.js
 D:\code\kissy_git\kissy1.2\src\dom\class.js
 D:\code\kissy_git\kissy1.2\src\dom\create.js
 D:\code\kissy_git\kissy1.2\src\dom\data.js
 D:\code\kissy_git\kissy1.2\src\dom\insertion.js
 D:\code\kissy_git\kissy1.2\src\dom\offset.js
 D:\code\kissy_git\kissy1.2\src\dom\style.js
 D:\code\kissy_git\kissy1.2\src\dom\selector.js
 D:\code\kissy_git\kissy1.2\src\dom\style-ie.js
 D:\code\kissy_git\kissy1.2\src\dom\traversal.js
 D:\code\kissy_git\kissy1.2\src\dom.js
 D:\code\kissy_git\kissy1.2\src\event\keycodes.js
 D:\code\kissy_git\kissy1.2\src\event\object.js
 D:\code\kissy_git\kissy1.2\src\event\utils.js
 D:\code\kissy_git\kissy1.2\src\event\base.js
 D:\code\kissy_git\kissy1.2\src\event\target.js
 D:\code\kissy_git\kissy1.2\src\event\focusin.js
 D:\code\kissy_git\kissy1.2\src\event\hashchange.js
 D:\code\kissy_git\kissy1.2\src\event\valuechange.js
 D:\code\kissy_git\kissy1.2\src\event\delegate.js
 D:\code\kissy_git\kissy1.2\src\event\mouseenter.js
 D:\code\kissy_git\kissy1.2\src\event\submit.js
 D:\code\kissy_git\kissy1.2\src\event\change.js
 D:\code\kissy_git\kissy1.2\src\event\mousewheel.js
 D:\code\kissy_git\kissy1.2\src\event.js
 D:\code\kissy_git\kissy1.2\src\node\base.js
 D:\code\kissy_git\kissy1.2\src\node\attach.js
 D:\code\kissy_git\kissy1.2\src\node\override.js
 D:\code\kissy_git\kissy1.2\src\anim\easing.js
 D:\code\kissy_git\kissy1.2\src\anim\manager.js
 D:\code\kissy_git\kissy1.2\src\anim\fx.js
 D:\code\kissy_git\kissy1.2\src\anim\queue.js
 D:\code\kissy_git\kissy1.2\src\anim\base.js
 D:\code\kissy_git\kissy1.2\src\anim\color.js
 D:\code\kissy_git\kissy1.2\src\anim.js
 D:\code\kissy_git\kissy1.2\src\node\anim.js
 D:\code\kissy_git\kissy1.2\src\node.js
 D:\code\kissy_git\kissy1.2\src\json\json2.js
 D:\code\kissy_git\kissy1.2\src\json.js
 D:\code\kissy_git\kissy1.2\src\ajax\form-serializer.js
 D:\code\kissy_git\kissy1.2\src\ajax\xhrobject.js
 D:\code\kissy_git\kissy1.2\src\ajax\base.js
 D:\code\kissy_git\kissy1.2\src\ajax\xhrbase.js
 D:\code\kissy_git\kissy1.2\src\ajax\subdomain.js
 D:\code\kissy_git\kissy1.2\src\ajax\xdr.js
 D:\code\kissy_git\kissy1.2\src\ajax\xhr.js
 D:\code\kissy_git\kissy1.2\src\ajax\script.js
 D:\code\kissy_git\kissy1.2\src\ajax\jsonp.js
 D:\code\kissy_git\kissy1.2\src\ajax\form.js
 D:\code\kissy_git\kissy1.2\src\ajax\iframe-upload.js
 D:\code\kissy_git\kissy1.2\src\ajax.js
 D:\code\kissy_git\kissy1.2\src\base\attribute.js
 D:\code\kissy_git\kissy1.2\src\base\base.js
 D:\code\kissy_git\kissy1.2\src\base.js
 D:\code\kissy_git\kissy1.2\src\cookie\base.js
 D:\code\kissy_git\kissy1.2\src\cookie.js
 D:\code\kissy_git\kissy1.2\src\core.js
 **/

/**
 * @module  ua
 * @author  lifesinger@gmail.com
 */
KISSY.add('ua/base', function() {

    var ua = navigator.userAgent,
        EMPTY = '', MOBILE = 'mobile',
        core = EMPTY, shell = EMPTY, m,
        IE_DETECT_RANGE = [6, 9], v, end,
        VERSION_PLACEHOLDER = '{{version}}',
        IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><s></s><![endif]-->',
        div = document.createElement('div'), s,
        o = {
            // browser core type
            //webkit: 0,
            //trident: 0,
            //gecko: 0,
            //presto: 0,

            // browser type
            //chrome: 0,
            //safari: 0,
            //firefox:  0,
            //ie: 0,
            //opera: 0

            //mobile: '',
            //core: '',
            //shell: ''
        },
        numberify = function(s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // try to use IE-Conditional-Comment detect IE more accurately
    // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
    div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
    s = div.getElementsByTagName('s');

    if (s.length > 0) {

        shell = 'ie';
        o[core = 'trident'] = 0.1; // Trident detected, look for revision

        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            o[core] = numberify(m[1]);
        }

        // Detect the accurate version
        // 娉ㄦ剰锛�
        //  o.shell = ie, 琛ㄧず澶栧３鏄� ie
        //  浣� o.ie = 7, 骞朵笉浠ｈ〃澶栧３鏄� ie7, 杩樻湁鍙兘鏄� ie8 鐨勫吋瀹规ā寮�
        //  瀵逛簬 ie8 鐨勫吋瀹规ā寮忥紝杩樿閫氳繃 documentMode 鍘诲垽鏂€備絾姝ゅ涓嶈兘璁� o.ie = 8, 鍚﹀垯
        //  寰堝鑴氭湰鍒ゆ柇浼氬け璇€傚洜涓� ie8 鐨勫吋瀹规ā寮忚〃鐜拌涓哄拰 ie7 鐩稿悓锛岃€屼笉鏄拰 ie8 鐩稿悓
        for (v = IE_DETECT_RANGE[0],end = IE_DETECT_RANGE[1]; v <= end; v++) {
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
            if (s.length > 0) {
                o[shell] = v;
                break;
            }
        }

    } else {

        // WebKit
        if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
            o[core = 'webkit'] = numberify(m[1]);

            // Chrome
            if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
                o[shell = 'chrome'] = numberify(m[1]);
            }
            // Safari
            else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
                o[shell = 'safari'] = numberify(m[1]);
            }

            // Apple Mobile
            if (/ Mobile\//.test(ua)) {
                o[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch
            }
            // Other WebKit Mobile Browsers
            else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
                o[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
            }
        }
        // NOT WebKit
        else {
            // Presto
            // ref: http://www.useragentstring.com/pages/useragentstring.php
            if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
                o[core = 'presto'] = numberify(m[1]);

                // Opera
                if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                    o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                    if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                        o[shell] = numberify(m[1]);
                    }

                    // Opera Mini
                    if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                        o[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                    }
                    // Opera Mobile
                    // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                    // issue: 鐢变簬 Opera Mobile 鏈� Version/ 瀛楁锛屽彲鑳戒細涓� Opera 娣锋穯锛屽悓鏃跺浜� Opera Mobile 鐨勭増鏈彿涔熸瘮杈冩贩涔�
                    else if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                        o[MOBILE] = m[0];
                    }
                }

                // NOT WebKit or Presto
            } else {
                // MSIE
                // 鐢变簬鏈€寮€濮嬪凡缁忎娇鐢ㄤ簡 IE 鏉′欢娉ㄩ噴鍒ゆ柇锛屽洜姝よ惤鍒拌繖閲岀殑鍞竴鍙兘鎬у彧鏈� IE10+
                if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                    o[core = 'trident'] = 0.1; // Trident detected, look for revision
                    o[shell = 'ie'] = numberify(m[1]);

                    // Get the Trident's accurate version
                    if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                        o[core] = numberify(m[1]);
                    }

                    // NOT WebKit, Presto or IE
                } else {
                    // Gecko
                    if ((m = ua.match(/Gecko/))) {
                        o[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                        if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                            o[core] = numberify(m[1]);
                        }

                        // Firefox
                        if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                            o[shell = 'firefox'] = numberify(m[1]);
                        }
                    }
                }
            }
        }
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    return o;
});

/**
 * NOTES:
 *
 * 2011.11.08
 *  - ie < 10 浣跨敤鏉′欢娉ㄩ噴鍒ゆ柇鍐呮牳锛屾洿绮剧‘ by gonghaocn@gmail.com
 *
 * 2010.03
 *  - jQuery, YUI 绛夌被搴撻兘鎺ㄨ崘鐢ㄧ壒鎬ф帰娴嬫浛浠ｆ祻瑙堝櫒鍡呮帰銆傜壒鎬ф帰娴嬬殑濂藉鏄兘鑷姩閫傚簲鏈潵璁惧鍜屾湭鐭ヨ澶囷紝姣斿
 *    if(document.addEventListener) 鍋囪 IE9 鏀寔鏍囧噯浜嬩欢锛屽垯浠ｇ爜涓嶇敤淇敼锛屽氨鑷€傚簲浜嗏€滄湭鏉ユ祻瑙堝櫒鈥濄€�
 *    瀵逛簬鏈煡娴忚鍣ㄤ篃鏄姝ゃ€備絾鏄紝杩欏苟涓嶆剰鍛崇潃娴忚鍣ㄥ梾鎺㈠氨寰楀交搴曟姏寮冦€傚綋浠ｇ爜寰堟槑纭氨鏄拡瀵瑰凡鐭ョ壒瀹氭祻瑙堝櫒鐨勶紝
 *    鍚屾椂骞堕潪鏄煇涓壒鎬ф帰娴嬪彲浠ヨВ鍐虫椂锛岀敤娴忚鍣ㄥ梾鎺㈠弽鑰岃兘甯︽潵浠ｇ爜鐨勭畝娲侊紝鍚屾椂涔熶篃涓嶄細鏈変粈涔堝悗鎮ｃ€傛€讳箣锛屼竴鍒�
 *    鐨嗘潈琛°€�
 *  - UA.ie && UA.ie < 8 骞朵笉鎰忓懗鐫€娴忚鍣ㄥ氨涓嶆槸 IE8, 鏈夊彲鑳芥槸 IE8 鐨勫吋瀹规ā寮忋€傝繘涓€姝ョ殑鍒ゆ柇闇€瑕佷娇鐢� documentMode.
 *
 * TODO:
 *  - test mobile
 *  - 3Q 澶ф垬鍚庯紝360 鍘绘帀浜� UA 淇℃伅涓殑 360 淇℃伅锛岄渶閲囩敤 res 鏂规硶鍘诲垽鏂�
 *
 */

/**
 * @module  ua-extra
 * @author  gonghao<gonghao@ghsky.com>
 */
KISSY.add('ua/extra', function(S, UA) {
    var ua = navigator.userAgent,
        m, external, shell,
        o = { },
        numberify = UA._numberify;

    /**
     * 璇存槑锛�
     * @瀛愭动鎬荤粨鐨勫悇鍥戒骇娴忚鍣ㄧ殑鍒ゆ柇渚濇嵁: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
     * 鏍规嵁 CNZZ 2009 骞村害娴忚鍣ㄥ崰鐢ㄧ巼鎶ュ憡锛屼紭鍖栦簡鍒ゆ柇椤哄簭锛歨ttp://www.tanmi360.com/post/230.htm
     * 濡傛灉妫€娴嬪嚭娴忚鍣紝浣嗘槸鍏蜂綋鐗堟湰鍙锋湭鐭ョ敤 0.1 浣滀负鏍囪瘑
     * 涓栫晫涔嬬獥 & 360 娴忚鍣紝鍦� 3.x 浠ヤ笅鐨勭増鏈兘鏃犳硶閫氳繃 UA 鎴栬€呯壒鎬ф娴嬭繘琛屽垽鏂紝鎵€浠ョ洰鍓嶅彧瑕佹娴嬪埌 UA 鍏抽敭瀛楀氨璁や负璧风増鏈彿涓� 3
     */

    // 360Browser
    if (m = ua.match(/360SE/)) {
        o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Maxthon
    else if ((m = ua.match(/Maxthon/)) && (external = window.external)) {
        // issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
        // but other maxthon versions all have exact version number
        shell = 'maxthon';
        try {
            o[shell] = numberify(external['max_version']);
        } catch(ex) {
            o[shell] = 0.1;
        }
    }
    // TT
    else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
        o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0.1;
    }
    // TheWorld
    else if (m = ua.match(/TheWorld/)) {
        o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Sougou
    else if (m = ua.match(/SE\s([\d.]*)/)) {
        o[shell = 'sougou'] = m[1] ? numberify(m[1]) : 0.1;
    }

    // If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
    shell && (o.shell = shell);

    S.mix(UA, o);
    return UA;
}, {
    requires:["ua/base"]
});

KISSY.add("ua", function(S,UA) {
    return UA;
}, {
    requires:["ua/extra"]
});

/**
 * @module  dom
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/base', function(S, UA, undefined) {

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }


    var NODE_TYPE = {
        /**
         * enumeration of dom node type
         * @type Number
         */
        ELEMENT_NODE : 1,
        "ATTRIBUTE_NODE" : 2,
        TEXT_NODE:3,
        "CDATA_SECTION_NODE" : 4,
        "ENTITY_REFERENCE_NODE": 5,
        "ENTITY_NODE" : 6,
        "PROCESSING_INSTRUCTION_NODE" :7,
        COMMENT_NODE : 8,
        DOCUMENT_NODE : 9,
        "DOCUMENT_TYPE_NODE" : 10,
        DOCUMENT_FRAGMENT_NODE : 11,
        "NOTATION_NODE" : 12
    };
    var DOM = {

        _isCustomDomain :function (win) {
            win = win || window;
            var domain = win.document.domain,
                hostname = win.location.hostname;
            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support
        },

        _genEmptyIframeSrc:function(win) {
            win = win || window;
            if (UA['ie'] && DOM._isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent("" +
                    "document.open();" +
                    "document.domain='" +
                    win.document.domain
                    + "';" +
                    "document.close();") + "}())";
            }
        },

        _NODE_TYPE:NODE_TYPE,


        /**
         * 鏄笉鏄� element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, DOM.ELEMENT_NODE);
        },

        /**
         * elem 涓� window 鏃讹紝鐩存帴杩斿洖
         * elem 涓� document 鏃讹紝杩斿洖鍏宠仈鐨� window
         * elem 涓� undefined 鏃讹紝杩斿洖褰撳墠 window
         * 鍏跺畠鍊硷紝杩斿洖 false
         */
        _getWin: function(elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, DOM.DOCUMENT_NODE) ?
                    elem.defaultView || elem.parentWindow :
                    (elem === undefined || elem === null) ?
                        window : false;
        },

        _nodeTypeIs: nodeTypeIs,

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList:function(o) {
            // 娉�1锛歩e 涓嬶紝鏈� window.item, typeof node.item 鍦� ie 涓嶅悓鐗堟湰涓嬶紝杩斿洖鍊间笉鍚�
            // 娉�2锛歴elect 绛夊厓绱犱篃鏈� item, 瑕佺敤 !node.nodeType 鎺掗櫎鎺�
            // 娉�3锛氶€氳繃 namedItem 鏉ュ垽鏂笉鍙潬
            // 娉�4锛歡etElementsByTagName 鍜� querySelectorAll 杩斿洖鐨勯泦鍚堜笉鍚�
            // 娉�5: 鑰冭檻 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },

        _nodeName:function(e, name) {
            return e && e.nodeName.toLowerCase() === name.toLowerCase();
        }
    };

    S.mix(DOM, NODE_TYPE);

    return DOM;

}, {
    requires:['ua']
});

/**
 * 2011-08
 *  - 娣诲姞閿洏鏋氫妇鍊硷紝鏂逛究渚濊禆绋嬪簭娓呮櫚
 */

/**
 * @module  dom-attr
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/attr', function(S, DOM, UA, undefined) {

        var doc = document,
            docElement = doc.documentElement,
            oldIE = !docElement.hasAttribute,
            TEXT = docElement.textContent === undefined ?
                'innerText' : 'textContent',
            EMPTY = '',
            nodeName = DOM._nodeName,
            isElementNode = DOM._isElementNode,
            rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
            rfocusable = /^(?:button|input|object|select|textarea)$/i,
            rclickable = /^a(?:rea)?$/i,
            rinvalidChar = /:|^on/,
            rreturn = /\r/g,
            attrFix = {
            },
            attrFn = {
                val: 1,
                css: 1,
                html: 1,
                text: 1,
                data: 1,
                width: 1,
                height: 1,
                offset: 1,
                scrollTop:1,
                scrollLeft:1
            },
            attrHooks = {
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                tabindex:{
                    get:function(el) {
                        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                        var attributeNode = el.getAttributeNode("tabindex");
                        return attributeNode && attributeNode.specified ?
                            parseInt(attributeNode.value, 10) :
                            rfocusable.test(el.nodeName) || rclickable.test(el.nodeName) && el.href ?
                                0 :
                                undefined;
                    }
                },
                // 鍦ㄦ爣鍑嗘祻瑙堝櫒涓嬶紝鐢� getAttribute 鑾峰彇 style 鍊�
                // IE7- 涓嬶紝闇€瑕佺敤 cssText 鏉ヨ幏鍙�
                // 缁熶竴浣跨敤 cssText
                style:{
                    get:function(el) {
                        return el.style.cssText;
                    },
                    set:function(el, val) {
                        el.style.cssText = val;
                    }
                }
            },
            propFix = {
                tabindex: "tabIndex",
                readonly: "readOnly",
                "for": "htmlFor",
                "class": "className",
                maxlength: "maxLength",
                cellspacing: "cellSpacing",
                "cellpadding": "cellPadding",
                rowspan: "rowSpan",
                colspan: "colSpan",
                usemap: "useMap",
                frameborder: "frameBorder",
                "contenteditable": "contentEditable"
            },
        // Hook for boolean attributes
        // if bool is false
        //  - standard browser returns null
        //  - ie<8 return false
        //   - so norm to undefined
            boolHook = {
                get: function(elem, name) {
                    // 杞彂鍒� prop 鏂规硶
                    return DOM.prop(elem, name) ?
                        // 鏍规嵁 w3c attribute , true 鏃惰繑鍥炲睘鎬у悕瀛楃涓�
                        name.toLowerCase() :
                        undefined;
                },
                set: function(elem, value, name) {
                    var propName;
                    if (value === false) {
                        // Remove boolean attributes when set to false
                        DOM.removeAttr(elem, name);
                    } else {
                        // 鐩存帴璁剧疆 true,鍥犱负杩欐槸 bool 绫诲睘鎬�
                        propName = propFix[ name ] || name;
                        if (propName in elem) {
                            // Only set the IDL specifically if it already exists on the element
                            elem[ propName ] = true;
                        }
                        elem.setAttribute(name, name.toLowerCase());
                    }
                    return name;
                }
            },
            propHooks = {},
        // get attribute value from attribute node , only for ie
            attrNodeHook = {
            },
            valHooks = {
                option: {
                    get: function(elem) {
                        // 褰撴病鏈夎瀹� value 鏃讹紝鏍囧噯娴忚鍣� option.value === option.text
                        // ie7- 涓嬶紝娌℃湁璁惧畾 value 鏃讹紝option.value === '', 闇€瑕佺敤 el.attributes.value 鏉ュ垽鏂槸鍚︽湁璁惧畾 value
                        var val = elem.attributes.value;
                        return !val || val.specified ? elem.value : elem.text;
                    }
                },
                select: {
                    // 瀵逛簬 select, 鐗瑰埆鏄� multiple type, 瀛樺湪寰堜弗閲嶇殑鍏煎鎬ч棶棰�
                    get: function(elem) {
                        var index = elem.selectedIndex,
                            options = elem.options,
                            one = elem.type === "select-one";

                        // Nothing was selected
                        if (index < 0) {
                            return null;
                        } else if (one) {
                            return DOM.val(options[index]);
                        }

                        // Loop through all the selected options
                        var ret = [], i = 0, len = options.length;
                        for (; i < len; ++i) {
                            if (options[i].selected) {
                                ret.push(DOM.val(options[i]));
                            }
                        }
                        // Multi-Selects return an array
                        return ret;
                    },

                    set: function(elem, value) {
                        var values = S.makeArray(value),
                            opts = elem.options;
                        S.each(opts, function(opt) {
                            opt.selected = S.inArray(DOM.val(opt), values);
                        });

                        if (!values.length) {
                            elem.selectedIndex = -1;
                        }
                        return values;
                    }
                }};

        function isTextNode(elem) {
            return DOM._nodeTypeIs(elem, DOM.TEXT_NODE);
        }

        if (oldIE) {

            // get attribute value from attribute node for ie
            attrNodeHook = {
                get: function(elem, name) {
                    var ret;
                    ret = elem.getAttributeNode(name);
                    // Return undefined if nodeValue is empty string
                    return ret && ret.nodeValue !== "" ?
                        ret.nodeValue :
                        undefined;
                },
                set: function(elem, value, name) {
                    // Check form objects in IE (multiple bugs related)
                    // Only use nodeValue if the attribute node exists on the form
                    var ret = elem.getAttributeNode(name);
                    if (ret) {
                        ret.nodeValue = value;
                    } else {
                        try {
                            var attr = elem.ownerDocument.createAttribute(name);
                            attr.value = value;
                            elem.setAttributeNode(attr);
                        }
                        catch (e) {
                            // It's a real failure only if setAttribute also fails.
                            return elem.setAttribute(name, value, 0);
                        }
                    }
                }
            };


            // ie6,7 涓嶅尯鍒� attribute 涓� property
            attrFix = propFix;
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            attrHooks.tabIndex = attrHooks.tabindex;
            // fix ie bugs
            // 涓嶅厜鏄� href, src, 杩樻湁 rowspan 绛夐潪 mapping 灞炴€э紝涔熼渶瑕佺敤绗� 2 涓弬鏁版潵鑾峰彇鍘熷鍊�
            // 娉ㄦ剰 colSpan rowSpan 宸茬粡鐢� propFix 杞负澶у啓
            S.each([ "href", "src", "width", "height","colSpan","rowSpan" ], function(name) {
                attrHooks[ name ] = {
                    get: function(elem) {
                        var ret = elem.getAttribute(name, 2);
                        return ret === null ? undefined : ret;
                    }
                };
            });
            // button 鍏冪礌鐨� value 灞炴€у拰鍏跺唴瀹瑰啿绐�
            // <button value='xx'>zzz</button>
            valHooks.button = attrHooks.value = attrNodeHook;
        }

        // Radios and checkboxes getter/setter

        S.each([ "radio", "checkbox" ], function(r) {
            valHooks[ r ] = {
                get: function(elem) {
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                },
                set: function(elem, value) {
                    if (S.isArray(value)) {
                        return elem.checked = S.inArray(DOM.val(elem), value);
                    }
                }

            };
        });

        function getProp(elem, name) {
            name = propFix[ name ] || name;
            var hook = propHooks[ name ];
            if (hook && hook.get) {
                return hook.get(elem, name);

            } else {
                return elem[ name ];
            }
        }

        S.mix(DOM, {

            /**
             * 鑷畾涔夊睘鎬т笉鎺ㄨ崘浣跨敤锛屼娇鐢� .data
             * @param selector
             * @param name
             * @param value
             */
            prop: function(selector, name, value) {
                // suports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.prop(selector, k, name[k]);
                    }
                    return;
                }
                var elems = DOM.query(selector);
                // Try to normalize/fix the name
                name = propFix[ name ] || name;
                var hook = propHooks[ name ];
                if (value !== undefined) {
                    elems.each(function(elem) {
                        if (hook && hook.set) {
                            hook.set(elem, value, name);
                        } else {
                            elem[ name ] = value;
                        }
                    });
                } else {
                    if (elems.length) {
                        return getProp(elems[0], name);
                    }
                }
            },

            /**
             * 鏄惁鍏朵腑涓€涓厓绱犲寘鍚寚瀹� property
             * @param selector
             * @param name
             */
            hasProp:function(selector, name) {
                var elems = DOM.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var el = elems[i];
                    if (getProp(el, name) !== undefined) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 涓嶆帹鑽愪娇鐢紝浣跨敤 .data .removeData
             * @param selector
             * @param name
             */
            removeProp:function(selector, name) {
                name = propFix[ name ] || name;
                DOM.query(selector).each(function(el) {
                    try {
                        el[ name ] = undefined;
                        delete el[ name ];
                    } catch(e) {
                        S.log("delete el property error : ");
                        S.log(e);
                    }
                });
            },

            /**
             * Gets the value of an attribute for the first element in the set of matched elements or
             * Sets an attribute for the set of matched elements.
             */
            attr:function(selector, name, val, pass) {
                /*
                 Hazards From Caja Note:

                 - In IE[67], el.setAttribute doesn't work for attributes like
                 'class' or 'for'.  IE[67] expects you to set 'className' or
                 'htmlFor'.  Caja use setAttributeNode solves this problem.

                 - In IE[67], <input> elements can shadow attributes.  If el is a
                 form that contains an <input> named x, then el.setAttribute(x, y)
                 will set x's value rather than setting el's attribute.  Using
                 setAttributeNode solves this problem.

                 - In IE[67], the style attribute can only be modified by setting
                 el.style.cssText.  Neither setAttribute nor setAttributeNode will
                 work.  el.style.cssText isn't bullet-proof, since it can be
                 shadowed by <input> elements.

                 - In IE[67], you can never change the type of an <button> element.
                 setAttribute('type') silently fails, but setAttributeNode
                 throws an exception.  caja : the silent failure. KISSY throws error.

                 - In IE[67], you can never change the type of an <input> element.
                 setAttribute('type') throws an exception.  We want the exception.

                 - In IE[67], setAttribute is case-sensitive, unless you pass 0 as a
                 3rd argument.  setAttributeNode is case-insensitive.

                 - Trying to set an invalid name like ":" is supposed to throw an
                 error.  In IE[678] and Opera 10, it fails without an error.
                 */
                // suports hash
                if (S.isPlainObject(name)) {
                    pass = val;
                    for (var k in name) {
                        DOM.attr(selector, k, name[k], pass);
                    }
                    return;
                }

                if (!(name = S.trim(name))) {
                    return;
                }

                // attr functions
                if (pass && attrFn[name]) {
                    return DOM[name](selector, val);
                }

                // scrollLeft
                name = name.toLowerCase();

                if (pass && attrFn[name]) {
                    return DOM[name](selector, val);
                }
                var els = DOM.query(selector);
                if (val === undefined) {
                    return DOM.__attr(els[0], name);
                } else {
                    els.each(function(el) {
                        DOM.__attr(el, name, val);
                    });
                }
            },

            __attr:function(el, name, val) {
                if (!isElementNode(el)) {
                    return;
                }
                // custom attrs
                name = attrFix[name] || name;

                var attrNormalizer,
                    ret;

                // browsers index elements by id/name on forms, give priority to attributes.
                if (nodeName(el, "form")) {
                    attrNormalizer = attrNodeHook;
                }
                else if (rboolean.test(name)) {
                    attrNormalizer = boolHook;
                }
                // only old ie?
                else if (rinvalidChar.test(name)) {
                    attrNormalizer = attrNodeHook;
                } else {
                    attrNormalizer = attrHooks[name];
                }

                // getter
                if (val === undefined) {

                    if (attrNormalizer && attrNormalizer.get) {
                        return attrNormalizer.get(el, name);
                    }

                    ret = el.getAttribute(name);

                    // standard browser non-existing attribute return null
                    // ie<8 will return undefined , because it return property
                    // so norm to undefined
                    return ret === null ? undefined : ret;
                } else {

                    if (attrNormalizer && attrNormalizer.set) {
                        attrNormalizer.set(el, val, name);
                    } else {
                        // convert the value to a string (all browsers do this but IE)
                        el.setAttribute(name, EMPTY + val);
                    }
                }
            },

            /**
             * Removes the attribute of the matched elements.
             */
            removeAttr: function(selector, name) {
                name = name.toLowerCase();
                name = attrFix[name] || name;
                DOM.query(selector).each(function(el) {
                    if (isElementNode(el)) {
                        var propName;
                        el.removeAttribute(name);
                        // Set corresponding property to false for boolean attributes
                        if (rboolean.test(name) && (propName = propFix[ name ] || name) in el) {
                            el[ propName ] = false;
                        }
                    }
                });
            },

            /**
             * 鏄惁鍏朵腑涓€涓厓绱犲寘鍚寚瀹氬睘鎬�
             */
            hasAttr: oldIE ?
                function(selector, name) {
                    name = name.toLowerCase();
                    var elems = DOM.query(selector);
                    // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                    // IE5-7 doesn't return the value of a style attribute.
                    // var $attr = el.attributes[name];
                    for (var i = 0; i < elems.length; i++) {
                        var el = elems[i];
                        var $attr = el.getAttributeNode(name);
                        if ($attr && $attr.specified) {
                            return true;
                        }
                    }
                    return false;
                }
                :
                function(selector, name) {
                    var elems = DOM.query(selector);
                    for (var i = 0; i < elems.length; i++) {
                        var el = elems[i];
                        //浣跨敤鍘熺敓瀹炵幇
                        if (el.hasAttribute(name)) {
                            return true;
                        }
                    }
                    return false;
                },

            /**
             * Gets the current value of the first element in the set of matched or
             * Sets the value of each element in the set of matched elements.
             */
            val : function(selector, value) {
                var hook, ret;

                //getter
                if (value === undefined) {

                    var elem = DOM.get(selector);

                    if (elem) {
                        hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                        if (hook && "get" in hook && (ret = hook.get(elem, "value")) !== undefined) {
                            return ret;
                        }

                        ret = elem.value;

                        return typeof ret === "string" ?
                            // handle most common string cases
                            ret.replace(rreturn, "") :
                            // handle cases where value is null/undefined or number
                            S.isNullOrUndefined(ret) ? "" : ret;
                    }

                    return;
                }

                DOM.query(selector).each(function(elem) {

                    if (elem.nodeType !== 1) {
                        return;
                    }

                    var val = value;

                    // Treat null/undefined as ""; convert numbers to string
                    if (S.isNullOrUndefined(val)) {
                        val = "";
                    } else if (typeof val === "number") {
                        val += "";
                    } else if (S.isArray(val)) {
                        val = S.map(val, function (value) {
                            return S.isNullOrUndefined(val) ? "" : value + "";
                        });
                    }

                    hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                    // If set returns undefined, fall back to normal setting
                    if (!hook || !("set" in hook) || hook.set(elem, val, "value") === undefined) {
                        elem.value = val;
                    }
                });
            },

            /**
             * Gets the text context of the first element in the set of matched elements or
             * Sets the text content of the matched elements.
             */
            text: function(selector, val) {
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var el = DOM.get(selector);

                    // only gets value on supported nodes
                    if (isElementNode(el)) {
                        return el[TEXT] || EMPTY;
                    }
                    else if (isTextNode(el)) {
                        return el.nodeValue;
                    }
                    return undefined;
                }
                // setter
                else {
                    DOM.query(selector).each(function(el) {
                        if (isElementNode(el)) {
                            el[TEXT] = val;
                        }
                        else if (isTextNode(el)) {
                            el.nodeValue = val;
                        }
                    });
                }
            }
        });
        return DOM;
    }, {
        requires:["./base","ua"]
    }
);

/**
 * NOTES:
 * 鎵跨帀锛�2011-06-03
 *  - 鍊熼壌 jquery 1.6,鐞嗘竻 attribute 涓� property
 *
 * 鎵跨帀锛�2011-01-28
 *  - 澶勭悊 tabindex锛岄『渚块噸鏋�
 *
 * 2010.03
 *  - 鍦� jquery/support.js 涓紝special attrs 閲岃繕鏈� maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, 浣嗘祴璇曞彂鐜帮紝鍦� Grade-A 绾ф祻瑙堝櫒涓�
 *    骞舵棤鍏煎鎬ч棶棰樸€�
 *  - 褰� colspan/rowspan 灞炴€у€艰缃湁璇椂锛宨e7- 浼氳嚜鍔ㄧ籂姝ｏ紝鍜� href 涓€鏍凤紝闇€瑕佷紶閫�
 *    绗� 2 涓弬鏁版潵瑙ｅ喅銆俲Query 鏈€冭檻锛屽瓨鍦ㄥ吋瀹规€� bug.
 *  - jQuery 鑰冭檻浜嗘湭鏄惧紡璁惧畾 tabindex 鏃跺紩鍙戠殑鍏煎闂锛宬issy 閲屽拷鐣ワ紙澶笉甯哥敤浜嗭級
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option 鍦� Safari 4 涓凡淇銆�
 *
 */

/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/class', function(S, DOM, undefined) {

    var SPACE = ' ',
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE);
    }

    S.mix(DOM, {

        __hasClass:function(el, cls) {
            var className = el.className;
            if (className) {
                className = norm(className);
                return className.indexOf(SPACE + cls + SPACE) > -1;
            } else {
                return false;
            }
        },

        /**
         * Determine whether any of the matched elements are assigned the given class.
         */
        hasClass: function(selector, value) {
            return batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    var className = norm(elemClass),
                        j = 0,
                        ret = true;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            ret = false;
                            break;
                        }
                    }
                    if (ret) {
                        return true;
                    }
                }
            }, true);
        },

        /**
         * Adds the specified class(es) to each of the set of matched elements.
         */
        addClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (!elemClass) {
                    elem.className = value;
                } else {
                    var className = norm(elemClass),
                        setClass = elemClass,
                        j = 0;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            setClass += SPACE + classNames[j];
                        }
                    }
                    elem.className = S.trim(setClass);
                }
            }, undefined);
        },

        /**
         * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
         */
        removeClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    if (!cl) {
                        elem.className = '';
                    } else {
                        var className = norm(elemClass),
                            j = 0,
                            needle;
                        for (; j < cl; j++) {
                            needle = SPACE + classNames[j] + SPACE;
                            // 涓€涓� cls 鏈夊彲鑳藉娆″嚭鐜帮細'link link2 link link3 link'
                            while (className.indexOf(needle) >= 0) {
                                className = className.replace(needle, SPACE);
                            }
                        }
                        elem.className = S.trim(className);
                    }
                }
            }, undefined);
        },

        /**
         * Replace a class with another class for matched elements.
         * If no oldClassName is present, the newClassName is simply added.
         */
        replaceClass: function(selector, oldClassName, newClassName) {
            DOM.removeClass(selector, oldClassName);
            DOM.addClass(selector, newClassName);
        },

        /**
         * Add or remove one or more classes from each element in the set of
         * matched elements, depending on either the class's presence or the
         * value of the switch argument.
         * @param state {Boolean} optional boolean to indicate whether class
         *        should be added or removed regardless of current state.
         */
        toggleClass: function(selector, value, state) {
            var isBool = S.isBoolean(state), has;

            batch(selector, value, function(elem, classNames, cl) {
                var j = 0, className;
                for (; j < cl; j++) {
                    className = classNames[j];
                    has = isBool ? !state : DOM.hasClass(elem, className);
                    DOM[has ? 'removeClass' : 'addClass'](elem, className);
                }
            }, undefined);
        }
    });

    function batch(selector, value, fn, resultIsBool) {
        if (!(value = S.trim(value))) {
            return resultIsBool ? false : undefined;
        }

        var elems = DOM.query(selector),
            len = elems.length,
            tmp = value.split(REG_SPLIT),
            elem,
            ret;

        var classNames = [];
        for (var i = 0; i < tmp.length; i++) {
            var t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        for (i = 0; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) {
                    return ret;
                }
            }
        }

        if (resultIsBool) {
            return false;
        }
        return undefined;
    }

    return DOM;
}, {
    requires:["dom/base"]
});

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 鐨勯€昏緫鍜� jQuery 淇濇寔涓€鑷�
 *   - toggleClass 涓嶆敮鎸� value 涓� undefined 鐨勬儏褰紙jQuery 鏀寔锛�
 */

/**
 * @module  dom-create
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/create', function(S, DOM, UA, undefined) {

        var doc = document,
            ie = UA['ie'],
            nodeTypeIs = DOM._nodeTypeIs,
            isElementNode = DOM._isElementNode,
            isString = S.isString,
            DIV = 'div',
            PARENT_NODE = 'parentNode',
            DEFAULT_DIV = doc.createElement(DIV),
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            RE_TAG = /<([\w:]+)/,
            rleadingWhitespace = /^\s+/,
            lostLeadingWhitespace = ie && ie < 9,
            rhtml = /<|&#?\w+;/,
            RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        // help compression
        function getElementsByTagName(el, tag) {
            return el.getElementsByTagName(tag);
        }

        function cleanData(els) {
            var Event = S.require("event");
            if (Event) {
                Event.detach(els);
            }
            DOM.removeData(els);
        }

        S.mix(DOM, {

            /**
             * Creates a new HTMLElement using the provided html string.
             */
            create: function(html, props, ownerDoc, _trim/*internal*/) {

                if (isElementNode(html)
                    || nodeTypeIs(html, DOM.TEXT_NODE)) {
                    return DOM.clone(html);
                }
                var ret = null;
                if (!isString(html)) {
                    return ret;
                }
                if (_trim === undefined) {
                    _trim = true;
                }

                if (_trim) {
                    html = S.trim(html);
                }

                if (!html) {
                    return ret;
                }

                var creators = DOM._creators,
                    holder,
                    whitespaceMatch,
                    context = ownerDoc || doc,
                    m,
                    tag = DIV,
                    k,
                    nodes;

                if (!rhtml.test(html)) {
                    ret = context.createTextNode(html);
                }
                // 绠€鍗� tag, 姣斿 DOM.create('<p>')
                else if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = context.createElement(m[1]);
                }
                // 澶嶆潅鎯呭喌锛屾瘮濡� DOM.create('<img src="sprite.png" />')
                else {
                    // Fix "XHTML"-style tags in all browsers
                    html = html.replace(rxhtmlTag, "<$1><" + "/$2>");

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    holder = (creators[tag] || creators[DIV])(html, context);
                    // ie 鎶婂墠缂€绌虹櫧鍚冩帀浜�
                    if (lostLeadingWhitespace && (whitespaceMatch = html.match(rleadingWhitespace))) {
                        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
                    }
                    nodes = holder.childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from "fragment"
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    }
                    else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nl2frag(nodes, context);
                    } else {
                        S.error(html + " : create node error");
                    }
                }

                return attachProps(ret, props);
            },

            _creators: {
                div: function(html, ownerDoc) {
                    var frag = ownerDoc && ownerDoc != doc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                    // html 涓� <style></style> 鏃朵笉琛岋紝蹇呴』鏈夊叾浠栧厓绱狅紵
                    frag['innerHTML'] = "m<div>" + html + "<" + "/div>";
                    return frag.lastChild;
                }
            },

            /**
             * Gets/Sets the HTML contents of the HTMLElement.
             * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
             * @param {Function} callback (optional) For async script loading you can be notified when the update completes.
             */
            html: function(selector, val, loadScripts, callback) {
                // supports css selector/Node/NodeList
                var els = DOM.query(selector),el = els[0];
                if (!el) {
                    return
                }
                // getter
                if (val === undefined) {
                    // only gets value on the first of element nodes
                    if (isElementNode(el)) {
                        return el['innerHTML'];
                    } else {
                        return null;
                    }
                }
                // setter
                else {

                    var success = false;
                    val += "";

                    // faster
                    if (! val.match(/<(?:script|style)/i) &&
                        (!lostLeadingWhitespace || !val.match(rleadingWhitespace)) &&
                        !creatorsMap[ (val.match(RE_TAG) || ["",""])[1].toLowerCase() ]) {

                        try {
                            els.each(function(elem) {
                                if (isElementNode(elem)) {
                                    cleanData(getElementsByTagName(elem, "*"));
                                    elem.innerHTML = val;
                                }
                            });
                            success = true;
                        } catch(e) {
                            // a <= "<a>"
                            // a.innerHTML='<p>1</p>';
                        }

                    }

                    if (!success) {
                        val = DOM.create(val, 0, el.ownerDocument, false);
                        els.each(function(elem) {
                            if (isElementNode(elem)) {
                                DOM.empty(elem);
                                DOM.append(val, elem, loadScripts);
                            }
                        });
                    }
                    callback && callback();
                }
            },

            /**
             * Remove the set of matched elements from the DOM.
             * 涓嶈浣跨敤 innerHTML='' 鏉ユ竻闄ゅ厓绱狅紝鍙兘浼氶€犳垚鍐呭瓨娉勯湶锛岃浣跨敤 DOM.remove()
             * @param selector 閫夋嫨鍣ㄦ垨鍏冪礌闆嗗悎
             * @param {Boolean} keepData 鍒犻櫎鍏冪礌鏃舵槸鍚︿繚鐣欏叾涓婄殑鏁版嵁锛岀敤浜庣绾挎搷浣滐紝鎻愰珮鎬ц兘
             */
            remove: function(selector, keepData) {
                DOM.query(selector).each(function(el) {
                    if (!keepData && isElementNode(el)) {
                        // 娓呮鏁版嵁
                        var elChildren = getElementsByTagName(el, "*");
                        cleanData(elChildren);
                        cleanData(el);
                    }

                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            },

            /**
             * clone node across browsers for the first node in selector
             * @param selector 閫夋嫨鍣ㄦ垨鍗曚釜鍏冪礌
             * @param {Boolean} withDataAndEvent 澶嶅埗鑺傜偣鏄惁鍖呮嫭鍜屾簮鑺傜偣鍚屾牱鐨勬暟鎹拰浜嬩欢
             * @param {Boolean} deepWithDataAndEvent 澶嶅埗鑺傜偣鐨勫瓙瀛欒妭鐐规槸鍚﹀寘鎷拰婧愯妭鐐瑰瓙瀛欒妭鐐瑰悓鏍风殑鏁版嵁鍜屼簨浠�
             * @refer https://developer.mozilla.org/En/DOM/Node.cloneNode
             * @returns 澶嶅埗鍚庣殑鑺傜偣
             */
            clone:function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                var elem = DOM.get(selector);

                if (!elem) {
                    return null;
                }

                // TODO
                // ie bug :
                // 1. ie<9 <script>xx</script> => <script></script>
                // 2. ie will execute external script
                var clone = elem.cloneNode(deep);

                if (isElementNode(elem) ||
                    nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (isElementNode(elem)) {
                        fixAttributes(elem, clone);
                    }

                    if (deep) {
                        processAll(fixAttributes, elem, clone);
                    }
                }
                // runtime 鑾峰緱浜嬩欢妯″潡
                if (withDataAndEvent) {
                    cloneWidthDataAndEvent(elem, clone);
                    if (deep && deepWithDataAndEvent) {
                        processAll(cloneWidthDataAndEvent, elem, clone);
                    }
                }
                return clone;
            },

            empty:function(selector) {
                DOM.query(selector).each(function(el) {
                    DOM.remove(el.childNodes);
                });
            },

            _nl2frag:nl2frag
        });

        function processAll(fn, elem, clone) {
            if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                var eCs = elem.childNodes,
                    cloneCs = clone.childNodes,
                    fIndex = 0;
                while (eCs[fIndex]) {
                    if (cloneCs[fIndex]) {
                        processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                    }
                    fIndex++;
                }
            } else if (isElementNode(elem)) {
                var elemChildren = getElementsByTagName(elem, "*"),
                    cloneChildren = getElementsByTagName(clone, "*"),
                    cIndex = 0;
                while (elemChildren[cIndex]) {
                    if (cloneChildren[cIndex]) {
                        fn(elemChildren[cIndex], cloneChildren[cIndex]);
                    }
                    cIndex++;
                }
            }
        }


        // 鍏嬮殕闄や簡浜嬩欢鐨� data
        function cloneWidthDataAndEvent(src, dest) {
            var Event = S.require('event');

            if (isElementNode(dest) && !DOM.hasData(src)) {
                return;
            }

            var srcData = DOM.data(src);

            // 娴呭厠闅嗭紝data 涔熸斁鍦ㄥ厠闅嗚妭鐐逛笂
            for (var d in srcData) {
                DOM.data(dest, d, srcData[d]);
            }

            // 浜嬩欢瑕佺壒娈婄偣
            if (Event) {
                // _removeData 涓嶉渶瑕侊紵鍒氬厠闅嗗嚭鏉ユ湰鏉ュ氨娌�
                Event._removeData(dest);
                Event._clone(src, dest);
            }
        }

        // wierd ie cloneNode fix from jq
        function fixAttributes(src, dest) {

            // clearAttributes removes the attributes, which we don't want,
            // but also removes the attachEvent events, which we *do* want
            if (dest.clearAttributes) {
                dest.clearAttributes();
            }

            // mergeAttributes, in contrast, only merges back on the
            // original attributes, not the events
            if (dest.mergeAttributes) {
                dest.mergeAttributes(src);
            }

            var nodeName = dest.nodeName.toLowerCase(),
                srcChilds = src.childNodes;

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object" && !dest.childNodes.length) {
                for (var i = 0; i < srcChilds.length; i++) {
                    dest.appendChild(srcChilds[i].cloneNode(true));
                }
                // dest.outerHTML = src.outerHTML;
            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest['defaultChecked'] = dest.checked = src.checked;
                }

                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (dest.value !== src.value) {
                    dest.value = src.value;
                }

                // IE6-8 fails to return the selected option to the default selected
                // state when cloning options
            } else if (nodeName === "option") {
                dest.selected = src.defaultSelected;
                // IE6-8 fails to set the defaultValue to the correct value when
                // cloning other types of input fields
            } else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;
            }

            // Event data gets referenced instead of copied if the expando
            // gets copied too
            // 鑷畾涔� data 鏍规嵁鍙傛暟鐗规畩澶勭悊锛宔xpando 鍙槸涓敤浜庡紩鐢ㄧ殑灞炴€�
            dest.removeAttribute(DOM.__EXPANDO);
        }

        // 娣诲姞鎴愬憳鍒板厓绱犱腑
        function attachProps(elem, props) {
            if (S.isPlainObject(props)) {
                if (isElementNode(elem)) {
                    DOM.attr(elem, props, true);
                }
                // document fragment
                else if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                    DOM.attr(elem.childNodes, props, true);
                }
            }
            return elem;
        }

        // 灏� nodeList 杞崲涓� fragment
        function nl2frag(nodes, ownerDoc) {
            var ret = null, i, len;

            if (nodes
                && (nodes.push || nodes.item)
                && nodes[0]) {
                ownerDoc = ownerDoc || nodes[0].ownerDocument;
                ret = ownerDoc.createDocumentFragment();
                nodes = S.makeArray(nodes);
                for (i = 0,len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            }
            else {
                S.log('Unable to convert ' + nodes + ' to fragment.');
            }
            return ret;
        }

        // only for gecko and ie
        // 2010-10-22: 鍙戠幇 chrome 涔熶笌 gecko 鐨勫鐞嗕竴鑷翠簡
        //if (ie || UA['gecko'] || UA['webkit']) {
        // 瀹氫箟 creators, 澶勭悊娴忚鍣ㄥ吋瀹�
        var creators = DOM._creators,
            create = DOM.create,
            TABLE_OPEN = '<table>',
            TABLE_CLOSE = '<' + '/table>',
            RE_TBODY = /(?:\/(?:thead|tfoot|caption|col|colgroup)>)+\s*<tbody/,
            creatorsMap = {
                option: 'select',
                optgroup:'select',
                area:'map',
                thead:'table',
                td: 'tr',
                th:'tr',
                tr: 'tbody',
                tbody: 'table',
                tfoot:'table',
                caption:'table',
                colgroup:'table',
                col: 'colgroup',
                legend: 'fieldset' // ie 鏀寔锛屼絾 gecko 涓嶆敮鎸�
            };

        for (var p in creatorsMap) {
            (function(tag) {
                creators[p] = function(html, ownerDoc) {
                    return create('<' + tag + '>' + html + '<' + '/' + tag + '>', null, ownerDoc);
                }
            })(creatorsMap[p]);
        }


        // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
        if (ie < 8) {
            creators.tbody = function(html, ownerDoc) {
                var frag = create(TABLE_OPEN + html + TABLE_CLOSE, null, ownerDoc),
                    tbody = frag.children['tags']('tbody')[0];

                if (frag.children.length > 1 && tbody && !RE_TBODY.test(html)) {
                    tbody[PARENT_NODE].removeChild(tbody); // strip extraneous tbody
                }
                return frag;
            };
        }

        // fix table elements
        S.mix(creators, {
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody
        });
        //}
        return DOM;
    },
    {
        requires:["./base","ua"]
    });

/**
 * 2011-10-13
 * empty , html refactor
 *
 * 2011-08-22
 * clone 瀹炵幇锛屽弬鑰� jq
 *
 * 2011-08
 *  remove 闇€瑕佸瀛愬瓩鑺傜偣浠ュ強鑷韩娓呴櫎浜嬩欢浠ュ強鑷畾涔� data
 *  create 淇敼锛屾敮鎸� <style></style> ie 涓嬬洿鎺ュ垱寤�
 *  TODO: jquery clone ,clean 瀹炵幇
 *
 * TODO:
 *  - 鐮旂┒ jQuery 鐨� buildFragment 鍜� clean
 *  - 澧炲姞 cache, 瀹屽杽 test cases
 *  - 鏀寔鏇村 props
 *  - remove 鏃讹紝鏄惁闇€瑕佺Щ闄や簨浠讹紝浠ラ伩鍏嶅唴瀛樻硠婕忥紵闇€瑕佽缁嗙殑娴嬭瘯銆�
 */

/**
 * @fileOverview   dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function (S, DOM, undefined) {

    var win = window,
        EXPANDO = '_ks_data_' + S.now(), // 璁╂瘡涓€浠� kissy 鐨� expando 閮戒笉鍚�
        dataCache = { }, // 瀛樺偍 node 鑺傜偣鐨� data
        winDataCache = { };    // 閬垮厤姹℃煋鍏ㄥ眬


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    var noData = {
    };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {
        hasData:function (cache, name) {
            if (cache) {
                if (name !== undefined) {
                    if (name in cache) {
                        return true;
                    }
                } else if (!S.isEmptyObject(cache)) {
                    return true;
                }
            }
            return false;
        }
    };

    var objectOps = {
        hasData:function (ob, name) {
            // 鍙垽鏂綋鍓嶇獥鍙ｏ紝iframe 绐楀彛鍐呮暟鎹洿鎺ユ斁鍏ュ叏灞€鍙橀噺
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 鐩存帴寤虹珛鍦ㄥ璞″唴
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data:function (ob, name, value) {
            if (ob == win) {
                return objectOps.data(winDataCache, name, value);
            }
            var cache = ob[EXPANDO];
            if (value !== undefined) {
                cache = ob[EXPANDO] = ob[EXPANDO] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    cache = ob[EXPANDO] = ob[EXPANDO] || {};
                    return cache;
                }
            }
        },
        removeData:function (ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob);
                }
            } else {
                try {
                    // ob maybe window in iframe
                    // ie will throw error
                    delete ob[EXPANDO];
                } catch (e) {
                    ob[EXPANDO] = undefined;
                }
            }
        }
    };

    var domOps = {
        hasData:function (elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },

        data:function (elem, name, value) {
            if (noData[elem.nodeName.toLowerCase()]) {
                return undefined;
            }
            var key = elem[EXPANDO], cache;
            if (!key) {
                // 鏍规湰涓嶇敤闄勫姞灞炴€�
                if (name !== undefined &&
                    value === undefined) {
                    return undefined;
                }
                // 鑺傜偣涓婂叧鑱旈敭鍊间篃鍙互
                key = elem[EXPANDO] = S.guid();
            }
            cache = dataCache[key];
            if (value !== undefined) {
                // 闇€瑕佹柊寤�
                cache = dataCache[key] = dataCache[key] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    // 闇€瑕佹柊寤�
                    cache = dataCache[key] = dataCache[key] || {};
                    return cache;
                }
            }
        },

        removeData:function (elem, name) {
            var key = elem[EXPANDO], cache;
            if (!key) {
                return;
            }
            cache = dataCache[key];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch (e) {
                    elem[EXPANDO] = undefined;
                    //S.log("delete expando error : ");
                    //S.log(e);
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            __EXPANDO:EXPANDO,

            /**
             * whether any node has data
             * @param {HTMLElement[]|String} selector 閫夋嫨鍣ㄦ垨鑺傜偣鏁扮粍
             * @param {String} name 鏁版嵁閿悕
             * @returns {boolean} 鑺傜偣鏄惁鏈夊叧鑱旀暟鎹敭鍚嶇殑鍊�
             */
            hasData:function (selector, name) {
                var ret = false, elems = DOM.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var elem = elems[i];
                    if (checkIsNode(elem)) {
                        ret = domOps.hasData(elem, name);
                    } else {
                        ret = objectOps.hasData(elem, name);
                    }
                    if (ret) {
                        return ret;
                    }
                }
                return ret;
            },

            /**
             * Store arbitrary data associated with the matched elements.
             * @param {HTMLElement[]|String} selector 閫夋嫨鍣ㄦ垨鑺傜偣鏁扮粍
             * @param {String} [name] 鏁版嵁閿悕
             * @param {String} [data] 鏁版嵁閿€�
             * @returns 褰撲笉璁剧疆 data锛岃缃� name 閭ｄ箞杩斿洖锛� 鑺傜偣鏄惁鏈夊叧鑱旀暟鎹敭鍚嶇殑鍊�
             *          褰撲笉璁剧疆 data锛� name 閭ｄ箞杩斿洖锛� 鑺傜偣鐨勫瓨鍌ㄧ┖闂村璞�
             *          褰撹缃� data锛� name 閭ｄ箞杩涜璁剧疆鎿嶄綔锛岃繑鍥� undefined
             */
            data:function (selector, name, data) {
                // suports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.data(selector, k, name[k]);
                    }
                    return undefined;
                }

                // getter
                if (data === undefined) {
                    var elem = DOM.get(selector);
                    if (checkIsNode(elem)) {
                        return domOps.data(elem, name, data);
                    } else if (elem) {
                        return objectOps.data(elem, name, data);
                    }
                }
                // setter
                else {
                    DOM.query(selector).each(function (elem) {
                        if (checkIsNode(elem)) {
                            domOps.data(elem, name, data);
                        } else {
                            objectOps.data(elem, name, data);
                        }
                    });
                }
                return undefined;
            },

            /**
             * Remove a previously-stored piece of data.
             * @param {HTMLElement[]|String} selector 閫夋嫨鍣ㄦ垨鑺傜偣鏁扮粍
             * @param {String} [name] 鏁版嵁閿悕锛屼笉璁剧疆鏃跺垹闄ゅ叧鑱旇妭鐐圭殑鎵€鏈夐敭鍊煎
             */
            removeData:function (selector, name) {
                DOM.query(selector).each(function (elem) {
                    if (checkIsNode(elem)) {
                        domOps.removeData(elem, name);
                    } else {
                        objectOps.removeData(elem, name);
                    }
                });
            }
        });

    function checkIsNode(elem) {
        // note : 鏅€氬璞′笉瑕佸畾涔� nodeType 杩欑鐗规畩灞炴€�!
        return elem && elem.nodeType;
    }

    return DOM;

}, {
    requires:["./base"]
});
/**
 * 鎵跨帀锛�2011-05-31
 *  - 鍒嗗眰 锛岃妭鐐瑰拰鏅€氬璞″垎寮€澶勭悊
 **/

/**
 * @module  dom-insertion
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/insertion', function(S, UA, DOM) {

    var PARENT_NODE = 'parentNode',
        rformEls = /^(?:button|input|object|select|textarea)$/i,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        _isElementNode = DOM._isElementNode,
        NEXT_SIBLING = 'nextSibling';

    /**
     ie 6,7 lose checked status when append to dom
     var c=S.all("<input />");
     c.attr("type","radio");
     c.attr("checked",true);
     S.all("#t").append(c);
     alert(c[0].checked);
     */
    function fixChecked(ret) {
        for (var i = 0; i < ret.length; i++) {
            var el = ret[i];
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                fixChecked(el.childNodes);
            } else if (nodeName(el, "input")) {
                fixCheckedInternal(el);
            } else if (_isElementNode(el)) {
                var cs = el.getElementsByTagName("input");
                for (var j = 0; j < cs.length; j++) {
                    fixChecked(cs[j]);
                }
            }
        }
    }

    function fixCheckedInternal(el) {
        if (el.type === "checkbox" || el.type === "radio") {
            // after insert , in ie6/7 checked is decided by defaultChecked !
            el.defaultChecked = el.checked;
        }
    }

    var rscriptType = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || rscriptType.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [],i,el,nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = el.nodeName.toLowerCase();
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === "script" && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (_isElementNode(el) &&
                    // ie checkbox getElementsByTagName 鍚庨€犳垚 checked 涓㈠け
                    !rformEls.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName("script");
                    for (j = 0; j < ss.length; j++) {
                        s = ss[j];
                        if (isJs(s)) {
                            tmp.push(s);
                        }
                    }
                    nodes.splice.apply(nodes, [i + 1,0].concat(tmp));
                }
                ret.push(el);
            }
        }
        return ret;
    }

    // execute script
    function evalScript(el) {
        if (el.src) {
            S.getScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || "");
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = DOM.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7
        if (UA['ie'] < 8) {
            fixChecked(newNodes);
        }
        refNodes = DOM.query(refNodes);
        var newNodesLength = newNodes.length,
            refNodesLength = refNodes.length;
        if ((!newNodesLength &&
            (!scripts || !scripts.length)) ||
            !refNodesLength) {
            return;
        }
        // fragment 鎻掑叆閫熷害蹇偣
        var newNode = DOM._nl2frag(newNodes),
            clonedNode;
        //fragment 涓€鏃︽彃鍏ラ噷闈㈠氨绌轰簡锛屽厛澶嶅埗涓�
        if (refNodesLength > 1) {
            clonedNode = DOM.clone(newNode, true);
        }
        for (var i = 0; i < refNodesLength; i++) {
            var refNode = refNodes[i];
            if (newNodesLength) {
                //refNodes 瓒呰繃涓€涓紝clone
                var node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts && scripts.length) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         */
        insertBefore: function(newNodes, refNodes, loadScripts) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode);
                }
            }, loadScripts);
        },

        /**
         * Inserts the new node as the next sibling of the reference node.
         */
        insertAfter: function(newNodes, refNodes, loadScripts) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                }
            }, loadScripts);
        },

        /**
         * Inserts the new node as the last child.
         */
        appendTo: function(newNodes, parents, loadScripts) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.appendChild(newNode);
            }, loadScripts);
        },

        /**
         * Inserts the new node as the first child.
         */
        prependTo:function(newNodes, parents, loadScripts) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.insertBefore(newNode, parent.firstChild);
            }, loadScripts);
        }
    });
    var alias = {
        "prepend":"prependTo",
        "append":"appendTo",
        "before":"insertBefore",
        "after":"insertAfter"
    };
    for (var a in alias) {
        DOM[a] = DOM[alias[a]];
    }
    return DOM;
}, {
    requires:["ua","./create"]
});

/**
 * 2011-05-25
 *  - 鎵跨帀锛氬弬鑰� jquery 澶勭悊澶氬澶氱殑鎯呭舰 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */

/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/offset', function(S, DOM, UA, undefined) {

    var win = window,
        doc = document,
        isIE = UA['ie'],
        docElem = doc.documentElement,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        CSS1Compat = "CSS1Compat",
        compatMode = "compatMode",
        isStrict = doc[compatMode] === CSS1Compat,
        MAX = Math.max,
        PARSEINT = parseInt,
        POSITION = 'position',
        RELATIVE = 'relative',
        DOCUMENT = 'document',
        BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        OWNER_DOCUMENT = 'ownerDocument',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll',
        CLIENT = 'client',
        LEFT = 'left',
        TOP = 'top',
        isNumber = S.isNumber,
        SCROLL_LEFT = SCROLL + 'Left',
        SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

//    ownerDocument 鐨勫垽鏂笉淇濊瘉 elem 娌℃湁娓哥鍦� document 涔嬪锛堟瘮濡� fragment锛�
//    function inDocument(elem) {
//        if (!elem) {
//            return 0;
//        }
//        var doc = elem.ownerDocument;
//        if (!doc) {
//            return 0;
//        }
//        var html = doc.documentElement;
//        if (html === elem) {
//            return true;
//        }
//        else if (DOM.__contains(html, elem)) {
//            return true;
//        }
//        return false;
//    }

    S.mix(DOM, {


        /**
         * Gets the current coordinates of the element, relative to the document.
         * @param relativeWin The window to measure relative to. If relativeWin
         *     is not in the ancestor frame chain of the element, we measure relative to
         *     the top-most window.
         */
        offset: function(selector, val, relativeWin) {
            // getter
            if (val === undefined) {
                var elem = DOM.get(selector),ret;
                if (elem) {
                    ret = getOffset(elem, relativeWin);
                }
                return ret;
            }
            // setter
            DOM.query(selector).each(function(elem) {
                setOffset(elem, val);
            });
        },

        /**
         * Makes elem visible in the container
         * @param elem
         * @param container
         * @param top
         * @param hscroll
         * @param {Boolean} auto whether adjust element automatically
         *                       (it only scrollIntoView when element is out of view)
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll, auto) {
            if (!(elem = DOM.get(elem))) {
                return;
            }

            if (container) {
                container = DOM.get(container);
            }

            if (!container) {
                container = elem.ownerDocument;
            }

            if (auto !== true) {
                hscroll = hscroll === undefined ? true : !!hscroll;
                top = top === undefined ? true : !!top;
            }

            // document 褰掍竴鍖栧埌 window
            if (nodeTypeIs(container, DOM.DOCUMENT_NODE)) {
                container = getWin(container);
            }

            var isWin = !!getWin(container),
                elemOffset = DOM.offset(elem),
                eh = DOM.outerHeight(elem),
                ew = DOM.outerWidth(elem),
                containerOffset,
                ch,
                cw,
                containerScroll,
                diffTop,
                diffBottom,
                win,
                winScroll,
                ww,
                wh;

            if (isWin) {
                win = container;
                wh = DOM.height(win);
                ww = DOM.width(win);
                winScroll = {
                    left:DOM.scrollLeft(win),
                    top:DOM.scrollTop(win)
                };
                // elem 鐩稿 container 鍙瑙嗙獥鐨勮窛绂�
                diffTop = {
                    left: elemOffset[LEFT] - winScroll[LEFT],
                    top: elemOffset[TOP] - winScroll[TOP]
                };
                diffBottom = {
                    left:  elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
                    top:elemOffset[TOP] + eh - (winScroll[TOP] + wh)
                };
                containerScroll = winScroll;
            }
            else {
                containerOffset = DOM.offset(container);
                ch = container.clientHeight;
                cw = container.clientWidth;
                containerScroll = {
                    left:DOM.scrollLeft(container),
                    top:DOM.scrollTop(container)
                };
                // elem 鐩稿 container 鍙瑙嗙獥鐨勮窛绂�
                // 娉ㄦ剰杈规 , offset 鏄竟妗嗗埌鏍硅妭鐐�
                diffTop = {
                    left: elemOffset[LEFT] - containerOffset[LEFT] -
                        (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                    top: elemOffset[TOP] - containerOffset[TOP] -
                        (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0)
                };
                diffBottom = {
                    left:  elemOffset[LEFT] + ew -
                        (containerOffset[LEFT] + cw +
                            (PARSEINT(DOM.css(container, 'borderRightWidth')) || 0)) ,
                    top:elemOffset[TOP] + eh -
                        (containerOffset[TOP] + ch +
                            (PARSEINT(DOM.css(container, 'borderBottomWidth')) || 0))
                };
            }

            if (diffTop.top < 0 || diffBottom.top > 0) {
                // 寮哄埗鍚戜笂
                if (top === true) {
                    DOM.scrollTop(container, containerScroll.top + diffTop.top);
                } else if (top === false) {
                    DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                } else {
                    // 鑷姩璋冩暣
                    if (diffTop.top < 0) {
                        DOM.scrollTop(container, containerScroll.top + diffTop.top);
                    } else {
                        DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                    }
                }
            }

            if (hscroll) {
                if (diffTop.left < 0 || diffBottom.left > 0) {
                    // 寮哄埗鍚戜笂
                    if (top === true) {
                        DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                    } else if (top === false) {
                        DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                    } else {
                        // 鑷姩璋冩暣
                        if (diffTop.left < 0) {
                            DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                        } else {
                            DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                        }
                    }
                }
            }
        },
        /**
         * for idea autocomplete
         */
        docWidth:0,
        docHeight:0,
        viewportHeight:0,
        viewportWidth:0
    });

    // http://old.jr.pl/www.quirksmode.org/viewport/compatibility.html
    // http://www.quirksmode.org/dom/w3c_cssom.html
    // add ScrollLeft/ScrollTop getter/setter methods
    S.each(['Left', 'Top'], function(name, i) {
        var method = SCROLL + name;

        DOM[method] = function(elem, v) {
            if (isNumber(elem)) {
                return arguments.callee(win, elem);
            }
            elem = DOM.get(elem);
            var ret,
                w = getWin(elem),
                d;
            if (w) {
                if (v !== undefined) {
                    v = parseFloat(v);
                    // 娉ㄦ剰澶� windw 鎯呭喌锛屼笉鑳界畝鍗曞彇 win
                    var left = name == "Left" ? v : DOM.scrollLeft(w),
                        top = name == "Top" ? v : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                } else {
                    //鏍囧噯
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    ret = w[ 'page' + (i ? 'Y' : 'X') + 'Offset'];
                    if (!isNumber(ret)) {
                        d = w[DOCUMENT];
                        //ie6,7,8 standard mode
                        ret = d[DOC_ELEMENT][method];
                        if (!isNumber(ret)) {
                            //quirks mode
                            ret = d[BODY][method];
                        }
                    }
                }
            } else if (isElementNode(elem)) {
                if (v !== undefined) {
                    elem[method] = parseFloat(v)
                } else {
                    ret = elem[method];
                }
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function(name) {
        DOM['doc' + name] = function(refWin) {
            refWin = DOM.get(refWin);
            var w = getWin(refWin),
                d = w[DOCUMENT];
            return MAX(
                //firefox chrome documentElement.scrollHeight< body.scrollHeight
                //ie standard mode : documentElement.scrollHeight> body.scrollHeight
                d[DOC_ELEMENT][SCROLL + name],
                //quirks : documentElement.scrollHeight 鏈€澶х瓑浜庡彲瑙嗙獥鍙ｅ涓€鐐癸紵
                d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function(refWin) {
            refWin = DOM.get(refWin);
            var prop = CLIENT + name,
                win = getWin(refWin),
                doc = win[DOCUMENT],
                body = doc[BODY],
                documentElement = doc[DOC_ELEMENT],
                documentElementProp = documentElement[prop];
            // 鏍囧噯妯″紡鍙� documentElement
            // backcompat 鍙� body
            return doc[compatMode] === CSS1Compat
                && documentElementProp ||
                body && body[ prop ] || documentElementProp;
//            return (prop in w) ?
//                // 鏍囧噯 = documentElement.clientHeight
//                w[prop] :
//                // ie 鏍囧噯 documentElement.clientHeight , 鍦� documentElement.clientHeight 涓婃粴鍔紵
//                // ie quirks body.clientHeight: 鍦� body 涓婏紵
//                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    function getClientPosition(elem) {
        var box, x = 0, y = 0,
            body = doc.body,
            w = getWin(elem[OWNER_DOCUMENT]);

        // 鏍规嵁 GBS 鏈€鏂版暟鎹紝A-Grade Browsers 閮藉凡鏀寔 getBoundingClientRect 鏂规硶锛屼笉鐢ㄥ啀鑰冭檻浼犵粺鐨勫疄鐜版柟寮�
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 娉細jQuery 杩樿€冭檻鍑忓幓 docElem.clientLeft/clientTop
            // 浣嗘祴璇曞彂鐜帮紝杩欐牱鍙嶈€屼細瀵艰嚧褰� html 鍜� body 鏈夎竟璺�/杈规鏍峰紡鏃讹紝鑾峰彇鐨勫€间笉姝ｇ‘
            // 姝ゅ锛宨e6 浼氬拷鐣� html 鐨� margin 鍊硷紝骞歌繍鍦版槸娌℃湁璋佷細鍘昏缃� html 鐨� margin

            x = box[LEFT];
            y = box[TOP];

            // ie 涓嬪簲璇ュ噺鍘荤獥鍙ｇ殑杈规鍚э紝姣曠珶榛樿 absolute 閮芥槸鐩稿绐楀彛瀹氫綅鐨�
            // 绐楀彛杈规鏍囧噯鏄 documentElement ,quirks 鏃惰缃� body
            // 鏈€濂界姝㈠湪 body 鍜� html 涓婅竟妗� 锛屼絾 ie < 9 html 榛樿鏈� 2px 锛屽噺鍘�
            // 浣嗘槸闈� ie 涓嶅彲鑳借缃獥鍙ｈ竟妗嗭紝body html 涔熶笉鏄獥鍙� ,ie 鍙互閫氳繃 html,body 璁剧疆
            // 鏍囧噯 ie 涓� docElem.clientTop 灏辨槸 border-top
            // ie7 html 鍗崇獥鍙ｈ竟妗嗘敼鍙樹笉浜嗐€傛案杩滀负 2

            // 浣嗘爣鍑� firefox/chrome/ie9 涓� docElem.clientTop 鏄獥鍙ｈ竟妗嗭紝鍗充娇璁句簡 border-top 涔熶负 0
            var clientTop = isIE && doc['documentMode'] != 9
                    && (isStrict ? docElem.clientTop : body.clientTop)
                    || 0,
                clientLeft = isIE && doc['documentMode'] != 9
                    && (isStrict ? docElem.clientLeft : body.clientLeft)
                    || 0;
            if (1 > 2) {
            }
            x -= clientLeft;
            y -= clientTop;

            // iphone/ipad/itouch 涓嬬殑 Safari 鑾峰彇 getBoundingClientRect 鏃讹紝宸茬粡鍔犲叆 scrollTop
            if (UA.mobile == 'apple') {
                x -= DOM[SCROLL_LEFT](w);
                y -= DOM[SCROLL_TOP](w);
            }
        }

        return { left: x, top: y };
    }


    function getPageOffset(el) {
        var pos = getClientPosition(el);
        var w = getWin(el[OWNER_DOCUMENT]);
        pos.left += DOM[SCROLL_LEFT](w);
        pos.top += DOM[SCROLL_TOP](w);
        return pos;
    }

    // 鑾峰彇 elem 鐩稿 elem.ownerDocument 鐨勫潗鏍�
    function getOffset(el, relativeWin) {
        var position = {left:0,top:0};

        // Iterate up the ancestor frame chain, keeping track of the current window
        // and the current element in that window.
        var currentWin = getWin(el[OWNER_DOCUMENT]);
        var currentEl = el;
        relativeWin = relativeWin || currentWin;
        do {
            // if we're at the top window, we want to get the page offset.
            // if we're at an inner frame, we only want to get the window position
            // so that we can determine the actual page offset in the context of
            // the outer window.
            var offset = currentWin == relativeWin ?
                getPageOffset(currentEl) :
                getClientPosition(currentEl);
            position.left += offset.left;
            position.top += offset.top;
        } while (currentWin && currentWin != relativeWin &&
            (currentEl = currentWin['frameElement']) &&
            (currentWin = currentWin.parent));

        return position;
    }

    // 璁剧疆 elem 鐩稿 elem.ownerDocument 鐨勫潗鏍�
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }
        var old = getOffset(elem), ret = { }, current, key;

        for (key in offset) {
            current = PARSEINT(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }

    return DOM;
}, {
    requires:["./base","ua"]
});

/**
 * 2011-05-24
 *  - 鎵跨帀锛�
 *  - 璋冩暣 docWidth , docHeight ,
 *      viewportHeight , viewportWidth ,scrollLeft,scrollTop 鍙傛暟锛�
 *      渚夸簬鏀剧疆鍒� Node 涓幓锛屽彲浠ュ畬鍏ㄦ憜鑴� DOM锛屽畬鍏ㄤ娇鐢� Node
 *
 *
 *
 * TODO:
 *  - 鑰冭檻鏄惁瀹炵幇 jQuery 鐨� position, offsetParent 绛夊姛鑳�
 *  - 鏇磋缁嗙殑娴嬭瘯鐢ㄤ緥锛堟瘮濡傦細娴嬭瘯 position 涓� fixed 鐨勬儏鍐碉級
 */

/**
 * @module  dom
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/style', function(S, DOM, UA, undefined) {

    var doc = document,
        docElem = doc.documentElement,
        isIE = UA['ie'],
        STYLE = 'style',
        FLOAT = 'float',
        CSS_FLOAT = 'cssFloat',
        STYLE_FLOAT = 'styleFloat',
        WIDTH = 'width',
        HEIGHT = 'height',
        AUTO = 'auto',
        DISPLAY = 'display',
        OLD_DISPLAY = DISPLAY + S.now(),
        NONE = 'none',
        PARSEINT = parseInt,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        cssNumber = {
            "fillOpacity": 1,
            "fontWeight": 1,
            "lineHeight": 1,
            "opacity": 1,
            "orphans": 1,
            "widows": 1,
            "zIndex": 1,
            "zoom": 1
        },
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
    // 鑰冭檻 ie9 ...
        rupper = /([A-Z]|^ms)/g,
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = {},
        cssProps = {},
        defaultDisplay = {};

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        cssProps[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        cssProps[FLOAT] = STYLE_FLOAT;
    }

    function camelCase(name) {
        return name.replace(RE_DASH, CAMELCASE_FN);
    }

    var defaultDisplayDetectIframe,
        defaultDisplayDetectIframeDoc;

    // modified from jquery : bullet-proof method of getting default display
    // fix domain problem in ie>6 , ie6 still access denied
    function getDefaultDisplay(tagName) {
        var body,
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            DOM.prepend(elem, body);
            var oldDisplay = DOM.css(elem, "display");
            body.removeChild(elem);
            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if (oldDisplay === "none" || oldDisplay === "") {
                // No iframe to use yet, so create it
                if (!defaultDisplayDetectIframe) {
                    defaultDisplayDetectIframe = doc.createElement("iframe");

                    defaultDisplayDetectIframe.frameBorder =
                        defaultDisplayDetectIframe.width =
                            defaultDisplayDetectIframe.height = 0;

                    DOM.prepend(defaultDisplayDetectIframe, body);
                    var iframeSrc;
                    if (iframeSrc = DOM._genEmptyIframeSrc()) {
                        defaultDisplayDetectIframe.src = iframeSrc;
                    }
                } else {
                    DOM.prepend(defaultDisplayDetectIframe, body);
                }

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!defaultDisplayDetectIframeDoc || !defaultDisplayDetectIframe.createElement) {

                    try {
                        defaultDisplayDetectIframeDoc = defaultDisplayDetectIframe.contentWindow.document;
                        defaultDisplayDetectIframeDoc.write(( doc.compatMode === "CSS1Compat" ? "<!doctype html>" : "" )
                            + "<html><head>" +
                            (UA['ie'] && DOM._isCustomDomain() ?
                                "<script>document.domain = '" +
                                    doc.domain
                                    + "';</script>" : "")
                            +
                            "</head><body>");
                        defaultDisplayDetectIframeDoc.close();
                    } catch(e) {
                        // ie6 need a breath , such as alert(8) or setTimeout;
                        // 鍚屾椂闇€瑕佸悓姝ワ紝鎵€浠ユ棤瑙ｏ紝鍕夊己杩斿洖
                        return "block";
                    }
                }

                elem = defaultDisplayDetectIframeDoc.createElement(tagName);

                defaultDisplayDetectIframeDoc.body.appendChild(elem);

                oldDisplay = DOM.css(elem, "display");

                body.removeChild(defaultDisplayDetectIframe);
            }

            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }

        return defaultDisplay[ tagName ];
    }

    S.mix(DOM, {
        _camelCase:camelCase,
        _cssNumber:cssNumber,
        _CUSTOM_STYLES: CUSTOM_STYLES,
        _cssProps:cssProps,
        _getComputedStyle: function(elem, name) {
            var val = "",
                computedStyle = {},
                d = elem.ownerDocument;

            name = name.replace(rupper, "-$1").toLowerCase();

            // https://github.com/kissyteam/kissy/issues/61
            if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                val = computedStyle.getPropertyValue(name) || computedStyle[name];
            }

            // 杩樻病鏈夊姞鍏ュ埌 document锛屽氨鍙栬鍐�
            if (val == "" && !DOM.__contains(d.documentElement, elem)) {
                name = cssProps[name] || name;
                val = elem[STYLE][name];
            }

            return val;
        },

        /**
         *  Get and set the style property on a DOM Node
         */
        style:function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.style(selector, k, name[k]);
                }
                return;
            }
            if (val === undefined) {
                var elem = DOM.get(selector),ret = '';
                if (elem) {
                    ret = style(elem, name, val);
                }
                return ret;
            } else {
                DOM.query(selector).each(function(elem) {
                    style(elem, name, val);
                });
            }
        },

        /**
         * (Gets computed style) or (sets styles) on the matches elements.
         */
        css: function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.css(selector, k, name[k]);
                }
                return;
            }

            name = camelCase(name);
            var hook = CUSTOM_STYLES[name];
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var elem = DOM.get(selector), ret = '';
                if (elem) {
                    // If a hook was provided get the computed value from there
                    if (hook && "get" in hook && (ret = hook.get(elem, true)) !== undefined) {
                    } else {
                        ret = DOM._getComputedStyle(elem, name);
                    }
                }
                return ret === undefined ? '' : ret;
            }
            // setter
            else {
                DOM.style(selector, name, val);
            }
        },

        /**
         * Show the matched elements.
         */
        show: function(selector) {

            DOM.query(selector).each(function(elem) {

                elem[STYLE][DISPLAY] = DOM.data(elem, OLD_DISPLAY) || EMPTY;

                // 鍙兘鍏冪礌杩樺浜庨殣钘忕姸鎬侊紝姣斿 css 閲岃缃簡 display: none
                if (DOM.css(elem, DISPLAY) === NONE) {
                    var tagName = elem.tagName.toLowerCase(),
                        old = getDefaultDisplay(tagName);
                    DOM.data(elem, OLD_DISPLAY, old);
                    elem[STYLE][DISPLAY] = old;
                }
            });
        },

        /**
         * Hide the matched elements.
         */
        hide: function(selector) {
            DOM.query(selector).each(function(elem) {
                var style = elem[STYLE], old = style[DISPLAY];
                if (old !== NONE) {
                    if (old) {
                        DOM.data(elem, OLD_DISPLAY, old);
                    }
                    style[DISPLAY] = NONE;
                }
            });
        },

        /**
         * Display or hide the matched elements.
         */
        toggle: function(selector) {
            DOM.query(selector).each(function(elem) {
                if (DOM.css(elem, DISPLAY) === NONE) {
                    DOM.show(elem);
                } else {
                    DOM.hide(elem);
                }
            });
        },

        /**
         * Creates a stylesheet from a text blob of rules.
         * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
         * @param {String} cssText The text containing the css rules
         * @param {String} id An id to add to the stylesheet for later removal
         */
        addStyleSheet: function(refWin, cssText, id) {
            if (S.isString(refWin)) {
                id = cssText;
                cssText = refWin;
                refWin = window;
            }
            refWin = DOM.get(refWin);
            var win = DOM._getWin(refWin),doc = win.document;
            var elem;

            if (id && (id = id.replace('#', EMPTY))) {
                elem = DOM.get('#' + id, doc);
            }

            // 浠呮坊鍔犱竴娆★紝涓嶉噸澶嶆坊鍔�
            if (elem) {
                return;
            }

            elem = DOM.create('<style>', { id: id }, doc);

            // 鍏堟坊鍔犲埌 DOM 鏍戜腑锛屽啀缁� cssText 璧嬪€硷紝鍚﹀垯 css hack 浼氬け鏁�
            DOM.get('head', doc).appendChild(elem);

            if (elem.styleSheet) { // IE
                elem.styleSheet.cssText = cssText;
            } else { // W3C
                elem.appendChild(doc.createTextNode(cssText));
            }
        },

        unselectable:function(selector) {
            DOM.query(selector).each(function(elem) {
                if (UA['gecko']) {
                    elem[STYLE]['MozUserSelect'] = 'none';
                }
                else if (UA['webkit']) {
                    elem[STYLE]['KhtmlUserSelect'] = 'none';
                } else {
                    if (UA['ie'] || UA['opera']) {
                        var e,i = 0,
                            els = elem.getElementsByTagName("*");
                        elem.setAttribute("unselectable", 'on');
                        while (( e = els[ i++ ] )) {
                            switch (e.tagName.toLowerCase()) {
                                case 'iframe' :
                                case 'textarea' :
                                case 'input' :
                                case 'select' :
                                    /* Ignore the above tags */
                                    break;
                                default :
                                    e.setAttribute("unselectable", 'on');
                            }
                        }
                    }
                }
            });
        },
        innerWidth:0,
        innerHeight:0,
        outerWidth:0,
        outerHeight:0,
        width:0,
        height:0
    });

    function capital(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    S.each([WIDTH,HEIGHT], function(name) {
        DOM["inner" + capital(name)] = function(selector) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, "padding");
            } else {
                return null;
            }
        };


        DOM["outer" + capital(name)] = function(selector, includeMargin) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, includeMargin ? "margin" : "border");
            } else {
                return null;
            }
        };

        DOM[name] = function(selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
    });


    var cssShow = { position: "absolute", visibility: "hidden", display: "block" };

    /**
     * css height,width 姘歌繙閮芥槸璁＄畻鍊�
     */
    S.each(["height", "width"], function(name) {
        CUSTOM_STYLES[ name ] = {
            get: function(elem, computed) {
                var val;
                if (computed) {
                    if (elem.offsetWidth !== 0) {
                        val = getWH(elem, name);
                    } else {
                        swap(elem, cssShow, function() {
                            val = getWH(elem, name);
                        });
                    }
                    return val + "px";
                }
            },
            set: function(elem, value) {
                if (RE_NUMPX.test(value)) {
                    value = parseFloat(value);
                    if (value >= 0) {
                        return value + "px";
                    }
                } else {
                    return value;
                }
            }
        };
    });

    S.each(["left", "top"], function(name) {
        CUSTOM_STYLES[ name ] = {
            get: function(elem, computed) {
                if (computed) {
                    var val = DOM._getComputedStyle(elem, name),offset;

                    // 1. 褰撴病鏈夎缃� style.left 鏃讹紝getComputedStyle 鍦ㄤ笉鍚屾祻瑙堝櫒涓嬶紝杩斿洖鍊间笉鍚�
                    //    姣斿锛歠irefox 杩斿洖 0, webkit/ie 杩斿洖 auto
                    // 2. style.left 璁剧疆涓虹櫨鍒嗘瘮鏃讹紝杩斿洖鍊间负鐧惧垎姣�
                    // 瀵逛簬绗竴绉嶆儏鍐碉紝濡傛灉鏄� relative 鍏冪礌锛屽€间负 0. 濡傛灉鏄� absolute 鍏冪礌锛屽€间负 offsetLeft - marginLeft
                    // 瀵逛簬绗簩绉嶆儏鍐碉紝澶ч儴鍒嗙被搴撻兘鏈仛澶勭悊锛屽睘浜庘€滄槑涔嬭€屼笉 fix鈥濈殑淇濈暀 bug
                    if (val === AUTO) {
                        val = 0;
                        if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                            offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                            // old-ie 涓嬶紝elem.offsetLeft 鍖呭惈 offsetParent 鐨� border 瀹藉害锛岄渶瑕佸噺鎺�
                            if (isIE && document['documentMode'] != 9 || UA['opera']) {
                                // 绫讳技 offset ie 涓嬬殑杈规澶勭悊
                                // 濡傛灉 offsetParent 涓� html 锛岄渶瑕佸噺鍘婚粯璁� 2 px == documentElement.clientTop
                                // 鍚﹀垯鍑忓幓 borderTop 鍏跺疄涔熸槸 clientTop
                                // http://msdn.microsoft.com/en-us/library/aa752288%28v=vs.85%29.aspx
                                // ie<9 娉ㄦ剰鏈夋椂鍊� elem.offsetParent 涓� null ...
                                // 姣斿 DOM.append(DOM.create("<div class='position:absolute'></div>"),document.body)
                                offset -= elem.offsetParent && elem.offsetParent['client' + (name == 'left' ? 'Left' : 'Top')]
                                    || 0;
                            }
                            val = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
                        }
                        val += "px";
                    }
                    return val;
                }
            }
        };
    });


    function swap(elem, options, callback) {
        var old = {};

        // Remember the old values, and insert the new ones
        for (var name in options) {
            old[ name ] = elem[STYLE][ name ];
            elem[STYLE][ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem[STYLE][ name ] = old[ name ];
        }
    }


    function style(elem, name, val) {
        var style;
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        name = camelCase(name);
        var ret,hook = CUSTOM_STYLES[name];
        name = cssProps[name] || name;
        // setter
        if (val !== undefined) {
            // normalize unsetting
            if (val === null || val === EMPTY) {
                val = EMPTY;
            }
            // number values may need a unit
            else if (!isNaN(Number(val)) && !cssNumber[name]) {
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 鏃犳晥鍊兼姤閿�
                try {
                    elem[STYLE][name] = val;
                } catch(e) {
                    S.log("css set error :" + e);
                }
            }
            return undefined;
        }
        //getter
        else {
            // If a hook was provided get the non-computed value from there
            if (hook && "get" in hook && (ret = hook.get(elem, false)) !== undefined) {

            } else {
                // Otherwise just get the value from the style object
                ret = style[ name ];
            }
            return ret === undefined ? "" : ret;
        }

    }


    /**
     * 寰楀埌鍏冪礌鐨勫ぇ灏忎俊鎭�
     * @param elem
     * @param name
     * @param {String} extra    "padding" : (css width) + padding
     *                          "border" : (css width) + padding + border
     *                          "margin" : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOM.viewportWidth(elem) : DOM.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOM.docWidth(elem) : DOM.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        if (val > 0) {
            if (extra !== "border") {
                S.each(which, function(w) {
                    if (!extra) {
                        val -= parseFloat(DOM.css(elem, "padding" + w)) || 0;
                    }
                    if (extra === "margin") {
                        val += parseFloat(DOM.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                    }
                });
            }

            return val
        }

        // Fall back to computed then uncomputed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val < 0 || S.isNullOrUndefined(val)) {
            val = elem.style[ name ] || 0;
        }
        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function(w) {
                val += parseFloat(DOM.css(elem, "padding" + w)) || 0;
                if (extra !== "padding") {
                    val += parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                }
                if (extra === "margin") {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    return DOM;
}, {
    requires:["dom/base","ua"]
});

/**
 *
 * 2011-08-19
 *  - 璋冩暣缁撴瀯锛屽噺灏戣€﹀悎
 *  - fix css("height") == auto
 *
 * NOTES:
 *  - Opera 涓嬶紝color 榛樿杩斿洖 #XXYYZZ, 闈� rgb(). 鐩墠 jQuery 绛夌被搴撳潎蹇界暐姝ゅ樊寮傦紝KISSY 涔熷拷鐣ャ€�
 *  - Safari 浣庣増鏈紝transparent 浼氳繑鍥炰负 rgba(0, 0, 0, 0), 鑰冭檻浣庣増鏈墠鏈夋 bug, 浜﹀拷鐣ャ€�
 *
 *
 *  - getComputedStyle 鍦� webkit 涓嬶紝浼氳垗寮冨皬鏁伴儴鍒嗭紝ie 涓嬩細鍥涜垗浜斿叆锛実ecko 涓嬬洿鎺ヨ緭鍑� float 鍊笺€�
 *
 *  - color: blue 缁ф壙鍊硷紝getComputedStyle, 鍦� ie 涓嬭繑鍥� blue, opera 杩斿洖 #0000ff, 鍏跺畠娴忚鍣�
 *    杩斿洖 rgb(0, 0, 255)
 *
 *  - 鎬讳箣锛氳浣垮緱杩斿洖鍊煎畬鍏ㄤ竴鑷存槸涓嶅ぇ鍙兘鐨勶紝jQuery/ExtJS/KISSY 鏈€滆拷姹傚畬缇庘€濄€俌UI3 鍋氫簡閮ㄥ垎瀹岀編澶勭悊锛屼絾
 *    渚濇棫瀛樺湪娴忚鍣ㄥ樊寮傘€�
 */

/**
 * @module  selector
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('dom/selector', function(S, DOM, undefined) {

    var doc = document,
        filter = S.filter,
        require = function(selector) {
            return S.require(selector);
        },
        isArray = S.isArray,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        nodeName = DOM._nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        COMMA = ',',
        trim = S.trim,
        ANY = '*',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {String|Array} selector
     * @param {String|Array<HTMLElement>|NodeList} context find elements matching selector under context
     * @return {Array} The array of found HTMLElement
     */
    function query(selector, context) {
        var ret,
            i,
            isSelectorString = typeof selector === 'string',
        // optimize common usage
            contexts = context === undefined ? [doc] : tuneContext(context);

        if (isSelectorString) {
            selector = trim(selector);
            if (contexts.length == 1 && selector) {
                ret = quickFindBySelectorStr(selector, contexts[0]);
            }
        }
        if (!ret) {
            ret = [];
            if (selector) {
                for (i = 0; i < contexts.length; i++) {
                    push.apply(ret, queryByContexts(selector, contexts[i]));
                }

                //蹇呰鏃跺幓閲嶆帓搴�
                if (ret.length > 1 &&
                    // multiple contexts
                    (contexts.length > 1 ||
                        (isSelectorString &&
                            // multiple selector
                            selector.indexOf(COMMA) > -1))) {
                    unique(ret);
                }
            }
        }
        // attach each method
        ret.each = function(f) {
            var self = this,el,i;
            for (i = 0; i < self.length; i++) {
                el = self[i];
                if (f(el, i) === false) {
                    break;
                }
            }
        };

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            isSelectorString = typeof selector === 'string';
        if (isSelectorString && selector.match(REG_QUERY) ||
            !isSelectorString) {
            // 绠€鍗曢€夋嫨鍣ㄨ嚜宸卞鐞�
            ret = queryBySimple(selector, context);
        }
        // 濡傛灉閫夋嫨鍣ㄦ湁 , 鍒嗗紑閫掑綊涓€閮ㄥ垎涓€閮ㄥ垎鏉�
        else if (isSelectorString && selector.indexOf(COMMA) > -1) {
            ret = queryBySelectors(selector, context);
        }
        else {
            // 澶嶆潅浜嗭紝浜ょ粰 sizzle
            ret = queryBySizzle(selector, context);
        }
        return ret;
    }

    // 浜ょ粰 sizzle 妯″潡澶勭悊
    function queryBySizzle(selector, context) {
        var ret = [],
            sizzle = require("sizzle");
        if (sizzle) {
            sizzle(selector, context, ret);
        } else {
            // 鍘熺敓涓嶆敮鎸�
            error(selector);
        }
        return ret;
    }

    // 澶勭悊 selector 鐨勬瘡涓儴鍒�
    function queryBySelectors(selector, context) {
        var ret = [],
            i,
            selectors = selector.split(/\s*,\s*/);
        for (i = 0; i < selectors.length; i++) {
            push.apply(ret, queryByContexts(selectors[i], context));
        }
        // 澶氶儴鍒嗛€夋嫨鍣ㄥ彲鑳藉緱鍒伴噸澶嶇粨鏋�
        return ret;
    }

    function quickFindBySelectorStr(selector, context) {
        var ret,t,match,id,tag,cls;
        // selector 涓� #id 鏄渶甯歌鐨勬儏鍐碉紝鐗规畩浼樺寲澶勭悊
        if (REG_ID.test(selector)) {
            t = getElementById(selector.slice(1), context);
            if (t) {
                // #id 鏃犳晥鏃讹紝杩斿洖绌烘暟缁�
                ret = [t];
            } else {
                ret = [];
            }
        }
        // selector 涓烘敮鎸佸垪琛ㄤ腑鐨勫叾瀹� 6 绉�
        else {
            match = REG_QUERY.exec(selector);
            if (match) {
                // 鑾峰彇鍖归厤鍑虹殑淇℃伅
                id = match[1];
                tag = match[2];
                cls = match[3];
                // 绌虹櫧鍓嶅彧鑳芥湁 id 锛屽彇鍑烘潵浣滀负 context
                context = (id ? getElementById(id, context) : context);
                if (context) {
                    // #id .cls | #id tag.cls | .cls | tag.cls | #id.cls
                    if (cls) {
                        if (!id || selector.indexOf(SPACE) != -1) { // 鎺掗櫎 #id.cls
                            ret = [].concat(getElementsByClassName(cls, tag, context));
                        }
                        // 澶勭悊 #id.cls
                        else {
                            t = getElementById(id, context);
                            if (t && hasClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 鎺掗櫎绌虹櫧瀛楃涓�
                        ret = getElementsByTagName(tag, context);
                    }
                }
                ret = ret || [];
            }
        }
        return ret;
    }

    // 鏈€绠€鍗曟儏鍐典簡锛屽崟涓€夋嫨鍣ㄩ儴鍒嗭紝鍗曚釜涓婁笅鏂�
    function queryBySimple(selector, context) {
        var ret,
            isSelectorString = typeof selector === 'string';
        if (isSelectorString) {
            ret = quickFindBySelectorStr(selector, context) || [];
        }
        // 浼犲叆鐨� selector 鏄� NodeList 鎴栧凡鏄� Array
        else if (selector && (isArray(selector) || isNodeList(selector))) {
            // 鍙兘鍖呭惈鍦� context 閲岄潰
            ret = filter(selector, function(s) {
                return testByContext(s, context);
            });
        }
        // 浼犲叆鐨� selector 鏄� HTMLNode 鏌ョ湅绾︽潫
        // 鍚﹀垯 window/document锛屽師鏍疯繑鍥�
        else if (selector && testByContext(selector, context)) {
            ret = [selector];
        }
        return ret;
    }

    function testByContext(element, context) {
        if (!element) {
            return false;
        }
        // 闃叉 element 鑺傜偣杩樻病娣诲姞鍒� document 锛屼絾鏄篃鍙互鑾峰彇鍒� query(element) => [element]
        // document 鐨勪笂涓嬫枃涓€寰嬫斁琛�

        // context == doc 鎰忓懗鐫€娌℃湁鎻愪緵绗簩涓弬鏁帮紝鍒拌繖閲屽彧鏄兂鍗曠函鍖呰鍘熺敓鑺傜偣锛屽垯涓嶆娴�
        if (context == doc) {
            return true;
        }
        // 鑺傜偣鍙椾笂涓嬫枃绾︽潫
        return DOM.__contains(context, element);
    }

    var unique;
    (function() {
        var sortOrder,
            t,
            hasDuplicate,
            baseHasDuplicate = true;

        // Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
        [0, 0].sort(function() {
            baseHasDuplicate = false;
            return 0;
        });

        // 鎺掑簭鍘婚噸
        unique = function (elements) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                elements.sort(sortOrder);

                if (hasDuplicate) {
                    var i = 1,len = elements.length;
                    while (i < len) {
                        if (elements[i] === elements[ i - 1 ]) {
                            elements.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
            }
            return elements;
        };

        // 璨屼技闄や簡 ie 閮芥湁浜�...
        if (doc.documentElement.compareDocumentPosition) {
            sortOrder = t = function(a, b) {
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                }

                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };

        } else {
            sortOrder = t = function(a, b) {
                // The nodes are identical, we can exit early
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                } else if (a.sourceIndex && b.sourceIndex) {
                    return a.sourceIndex - b.sourceIndex;
                }
            };
        }
    })();


    // 璋冩暣 context 涓哄悎鐞嗗€�
    function tuneContext(context) {
        // context 涓� undefined 鏄渶甯歌鐨勬儏鍐碉紝浼樺厛鑰冭檻
        if (context === undefined) {
            return [doc];
        }
        // 鍏朵粬鐩存帴浣跨敤 query
        return query(context, undefined);
    }

    // query #id
    function getElementById(id, context) {
        var doc = context,
            el;
        if (context.nodeType !== DOM.DOCUMENT_NODE) {
            doc = context.ownerDocument;
        }
        el = doc.getElementById(id);
        if (el && el.id === id) {
            // optimize for common usage
        }
        else if (el && el.parentNode) {
            // ie opera confuse name with id
            // https://github.com/kissyteam/kissy/issues/67
            // 涓嶈兘鐩存帴 el.id 锛屽惁鍒� input shadow form attribute
            if (DOM.__attr(el, "id") !== id) {
                // 鐩存帴鍦� context 涓嬬殑鎵€鏈夎妭鐐规壘
                el = DOM.filter(ANY, "#" + id, context)[0] || null;
            }
            // ie 鐗规畩鎯呭喌涓嬩互鍙婃寚鏄庡湪 context 涓嬫壘浜嗭紝涓嶉渶瑕佸啀鍒ゆ柇
            // 濡傛灉鎸囧畾浜� context node , 杩樿鍒ゆ柇 id 鏄惁澶勪簬 context 鍐�
            else if (!testByContext(el, context)) {
                el = null;
            }
        } else {
            el = null;
        }
        return el;
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context && makeArray(context.getElementsByTagName(tag)) || [];
    }

    (function() {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function(tag, context) {
                var ret = makeArray(context.getElementsByTagName(tag));
                if (tag === ANY) {
                    var t = [], i = 0,node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t.push(node);
                        }
                    }
                    ret = t;
                }
                return ret;
            };
        }
    })();

    // query .cls
    var getElementsByClassName = doc.getElementsByClassName ? function(cls, tag, context) {
        // query("#id1 xx","#id2")
        // #id2 鍐呮病鏈� #id1 , context 涓� null , 杩欓噷闃插尽涓�
        if (!context) {
            return [];
        }
        var els = context.getElementsByClassName(cls),
            ret,
            i = 0,
            len = els.length,
            el;

        if (tag && tag !== ANY) {
            ret = [];
            for (; i < len; ++i) {
                el = els[i];
                if (nodeName(el, tag)) {
                    ret.push(el);
                }
            }
        } else {
            ret = makeArray(els);
        }
        return ret;
    } : ( doc.querySelectorAll ? function(cls, tag, context) {
        // ie8 return staticNodeList 瀵硅薄,[].concat 浼氬舰鎴� [ staticNodeList ] 锛屾墜鍔ㄨ浆鍖栦负鏅€氭暟缁�
        return context && makeArray(context.querySelectorAll((tag ? tag : '') + '.' + cls)) || [];
    } : function(cls, tag, context) {
        if (!context) {
            return [];
        }
        var els = context.getElementsByTagName(tag || ANY),
            ret = [],
            i = 0,
            len = els.length,
            el;
        for (; i < len; ++i) {
            el = els[i];
            if (hasClass(el, cls)) {
                ret.push(el);
            }
        }
        return ret;
    });

    function hasClass(el, cls) {
        return DOM.__hasClass(el, cls);
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    S.mix(DOM, {

        query: query,

        get: function(selector, context) {
            return query(selector, context)[0] || null;
        },

        unique:unique,

        /**
         * Filters an array of elements to only include matches of a filter.
         * @param filter selector or fn
         */
        filter: function(selector, filter, context) {
            var elems = query(selector, context),
                sizzle = require("sizzle"),
                match,
                tag,
                id,
                cls,
                ret = [];

            // 榛樿浠呮敮鎸佹渶绠€鍗曠殑 tag.cls 鎴� #id 褰㈠紡
            if (typeof filter === 'string' &&
                (filter = trim(filter)) &&
                (match = REG_QUERY.exec(filter))) {
                id = match[1];
                tag = match[2];
                cls = match[3];
                if (!id) {
                    filter = function(elem) {
                        var tagRe = true,clsRe = true;

                        // 鎸囧畾 tag 鎵嶈繘琛屽垽鏂�
                        if (tag) {
                            tagRe = nodeName(elem, tag);
                        }

                        // 鎸囧畾 cls 鎵嶈繘琛屽垽鏂�
                        if (cls) {
                            clsRe = hasClass(elem, cls);
                        }

                        return clsRe && tagRe;
                    }
                } else if (id && !tag && !cls) {
                    filter = function(elem) {
                        return DOM.__attr(elem, "id") === id;
                    };
                }
            }

            if (S.isFunction(filter)) {
                ret = S.filter(elems, filter);
            }
            // 鍏跺畠澶嶆潅 filter, 閲囩敤澶栭儴閫夋嫨鍣�
            else if (filter && sizzle) {
                ret = sizzle.matches(filter, elems);
            }
            // filter 涓虹┖鎴栦笉鏀寔鐨� selector
            else {
                error(filter);
            }

            return ret;
        },

        /**
         * Returns true if the passed element(s) match the passed filter
         */
        test: function(selector, filter, context) {
            var elements = query(selector, context);
            return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
        }
    });
    return DOM;
}, {
    requires:["./base"]
});

/**
 * NOTES:
 *
 * 2011.08.02
 *  - 鍒╃敤 sizzle 閲嶆瀯閫夋嫨鍣�
 *  - 1.1.6 淇锛屽師鏉� context 鍙敮鎸� #id 浠ュ強 document
 *    1.2 context 鏀寔浠绘剰锛屽拰 selector 鏍煎紡涓€鑷�
 *  - 绠€鍗曢€夋嫨鍣ㄤ篃鍜� jquery 淇濇寔涓€鑷� DOM.query("xx","yy") 鏀寔
 *    - context 涓嶆彁渚涘垯涓哄綋鍓� document 锛屽惁鍒欓€氳繃 query 閫掑綊鍙栧緱
 *    - 淇濊瘉閫夋嫨鍑烘潵鐨勮妭鐐癸紙闄や簡 document window锛夐兘鏄綅浜� context 鑼冨洿鍐�
 *
 *
 * 2010.01
 *  - 瀵� reg exec 鐨勭粨鏋�(id, tag, className)鍋� cache, 鍙戠幇瀵规€ц兘褰卞搷寰堝皬锛屽幓鎺夈€�
 *  - getElementById 浣跨敤棰戠巼鏈€楂橈紝浣跨敤鐩磋揪閫氶亾浼樺寲銆�
 *  - getElementsByClassName 鎬ц兘浼樹簬 querySelectorAll, 浣� IE 绯诲垪涓嶆敮鎸併€�
 *  - instanceof 瀵规€ц兘鏈夊奖鍝嶃€�
 *  - 鍐呴儴鏂规硶鐨勫弬鏁帮紝姣斿 cls, context 绛夌殑寮傚父鎯呭喌锛屽凡缁忓湪 query 鏂规硶涓湁淇濊瘉锛屾棤闇€鍐椾綑鈥滈槻鍗€濄€�
 *  - query 鏂规硶涓殑鏉′欢鍒ゆ柇鑰冭檻浜嗏€滈鐜囦紭鍏堚€濆師鍒欍€傛渶鏈夊彲鑳藉嚭鐜扮殑鎯呭喌鏀惧湪鍓嶉潰銆�
 *  - Array 鐨� push 鏂规硶鍙互鐢� j++ 鏉ユ浛浠ｏ紝鎬ц兘鏈夋彁鍗囥€�
 *  - 杩斿洖鍊肩瓥鐣ュ拰 Sizzle 涓€鑷达紝姝ｅ父鏃讹紝杩斿洖鏁扮粍锛涘叾瀹冩墍鏈夋儏鍐碉紝杩斿洖绌烘暟缁勩€�
 *
 *  - 浠庡帇缂╄搴﹁€冭檻锛岃繕鍙互灏� getElmentsByTagName 鍜� getElementsByClassName 瀹氫箟涓哄父閲忥紝
 *    涓嶈繃鎰熻杩欐牱鍋氬お鈥滃帇缂╂帶鈥濓紝杩樻槸淇濈暀涓嶆浛鎹㈢殑濂姐€�
 *
 *  - 璋冩暣 getElementsByClassName 鐨勯檷绾у啓娉曪紝鎬ц兘鏈€宸殑鏀炬渶鍚庛€�
 *
 * 2010.02
 *  - 娣诲姞瀵瑰垎缁勯€夋嫨鍣ㄧ殑鏀寔锛堜富瑕佸弬鑰� Sizzle 鐨勪唬鐮侊紝浠ｅ幓闄や簡瀵归潪 Grade A 绾ф祻瑙堝櫒鐨勬敮鎸侊級
 *
 * 2010.03
 *  - 鍩轰簬鍘熺敓 dom 鐨勪袱涓� api: S.query 杩斿洖鏁扮粍; S.get 杩斿洖绗竴涓€�
 *    鍩轰簬 Node 鐨� api: S.one, 鍦� Node 涓疄鐜般€�
 *    鍩轰簬 NodeList 鐨� api: S.all, 鍦� NodeList 涓疄鐜般€�
 *    閫氳繃 api 鐨勫垎灞傦紝鍚屾椂婊¤冻鍒濈骇鐢ㄦ埛鍜岄珮绾х敤鎴风殑闇€姹傘€�
 *
 * 2010.05
 *  - 鍘绘帀缁� S.query 杩斿洖鍊奸粯璁ゆ坊鍔犵殑 each 鏂规硶锛屼繚鎸佺函鍑€銆�
 *  - 瀵逛簬涓嶆敮鎸佺殑 selector, 閲囩敤澶栭儴鑰﹀悎杩涙潵鐨� Selector.
 *
 * 2010.06
 *  - 澧炲姞 filter 鍜� test 鏂规硶
 *
 * 2010.07
 *  - 鍙栨秷瀵� , 鍒嗙粍鐨勬敮鎸侊紝group 鐩存帴鐢� Sizzle
 *
 * 2010.08
 *  - 缁� S.query 鐨勭粨鏋� attach each 鏂规硶
 *
 * 2011.05
 *  - 鎵跨帀锛氭仮澶嶅绠€鍗曞垎缁勬敮鎸�
 *
 * Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
 * 鑰冭檻 2/8 鍘熷垯锛屼粎鏀寔浠ヤ笅閫夋嫨鍣細
 * #id
 * tag
 * .cls
 * #id tag
 * #id .cls
 * tag.cls
 * #id tag.cls
 * 娉� 1锛歊EG_QUERY 杩樹細鍖归厤 #id.cls
 * 娉� 2锛歵ag 鍙互涓� * 瀛楃
 * 娉� 3: 鏀寔 , 鍙峰垎缁�
 *
 *
 * Bugs:
 *  - S.query('#test-data *') 绛夊甫 * 鍙风殑閫夋嫨鍣紝鍦� IE6 涓嬭繑鍥炵殑鍊间笉瀵广€俲Query 绛夌被搴撲篃鏈夋 bug, 璇″紓銆�
 *
 * References:
 *  - http://ejohn.org/blog/selectors-that-people-actually-use/
 *  - http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - MDC: querySelector, querySelectorAll, getElementsByClassName
 *  - Sizzle: http://github.com/jeresig/sizzle
 *  - MINI: http://james.padolsey.com/javascript/mini/
 *  - Peppy: http://jamesdonaghue.com/?p=40
 *  - Sly: http://github.com/digitarald/sly
 *  - XPath, TreeWalker锛歨ttp://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
 *
 *  - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 *  - http://www.quirksmode.org/dom/getElementsByTagNames.html
 *  - http://ejohn.org/blog/comparing-document-position/
 *  - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */

/**
 * @module  dom
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style-ie', function(S, DOM, UA, Style) {

        var HUNDRED = 100;

        // only for ie
        if (!UA['ie']) {
            return DOM;
        }

        var doc = document,
            docElem = doc.documentElement,
            OPACITY = 'opacity',
            STYLE = 'style',
            FILTER = "filter",
            CURRENT_STYLE = 'currentStyle',
            RUNTIME_STYLE = 'runtimeStyle',
            LEFT = 'left',
            PX = 'px',
            CUSTOM_STYLES = Style._CUSTOM_STYLES,
            RE_NUMPX = /^-?\d+(?:px)?$/i,
            RE_NUM = /^-?\d/,
            ropacity = /opacity=([^)]*)/,
            ralpha = /alpha\([^)]*\)/i;

        // use alpha filter for IE opacity
        try {
            if (S.isNullOrUndefined(docElem.style[OPACITY])) {

                CUSTOM_STYLES[OPACITY] = {

                    get: function(elem, computed) {
                        // 娌℃湁璁剧疆杩� opacity 鏃朵細鎶ラ敊锛岃繖鏃惰繑鍥� 1 鍗冲彲
                        // 濡傛灉璇ヨ妭鐐规病鏈夋坊鍔犲埌 dom 锛屽彇涓嶅埌 filters 缁撴瀯
                        // val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                        return ropacity.test((
                            computed && elem[CURRENT_STYLE] ?
                                elem[CURRENT_STYLE][FILTER] :
                                elem[STYLE][FILTER]) || "") ?
                            ( parseFloat(RegExp.$1) / HUNDRED ) + "" :
                            computed ? "1" : "";
                    },

                    set: function(elem, val) {
                        val = parseFloat(val);

                        var style = elem[STYLE],
                            currentStyle = elem[CURRENT_STYLE],
                            opacity = isNaN(val) ? "" : "alpha(" + OPACITY + "=" + val * HUNDRED + ")",
                            filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || "");

                        // ie  has layout
                        style.zoom = 1;

                        // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute
                        if (val >= 1 && S.trim(filter.replace(ralpha, "")) === "") {

                            // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                            // if "filter:" is present at all, clearType is disabled, we want to avoid this
                            // style.removeAttribute is IE Only, but so apparently is this code path...
                            style.removeAttribute(FILTER);

                            // if there there is no filter style applied in a css rule, we are done
                            if (currentStyle && !currentStyle[FILTER]) {
                                return;
                            }
                        }

                        // otherwise, set new filter values
                        // 濡傛灉 >=1 灏变笉璁撅紝灏变笉鑳借鐩栧閮ㄦ牱寮忚〃瀹氫箟鐨勬牱寮忥紝涓€瀹氳璁�
                        style.filter = ralpha.test(filter) ?
                            filter.replace(ralpha, opacity) :
                            filter + (filter ? ", " : "") + opacity;
                    }
                };
            }
        }
        catch(ex) {
            S.log('IE filters ActiveX is disabled. ex = ' + ex);
        }

        /**
         * border fix
         * ie 涓嶈缃暟鍊硷紝鍒� computed style 涓嶈繑鍥炴暟鍊硷紝鍙繑鍥� thick? medium ...
         * (default is "medium")
         */
        var IE8 = UA['ie'] == 8,
            BORDER_MAP = {
            },
            BORDERS = ["","Top","Left","Right","Bottom"];
        BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
        BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
        BORDER_MAP['thick'] = IE8 ? '5px' : '6px';
        S.each(BORDERS, function(b) {
            var name = "border" + b + "Width",
                styleName = "border" + b + "Style";
            CUSTOM_STYLES[name] = {
                get: function(elem, computed) {
                    // 鍙湁闇€瑕佽绠楁牱寮忕殑鏃跺€欐墠杞崲锛屽惁鍒欏彇鍘熷€�
                    var currentStyle = computed ? elem[CURRENT_STYLE] : 0,
                        current = currentStyle && String(currentStyle[name]) || undefined;
                    // look up keywords if a border exists
                    if (current && current.indexOf("px") < 0) {
                        // 杈规娌℃湁闅愯棌
                        if (BORDER_MAP[current] && currentStyle[styleName] !== "none") {
                            current = BORDER_MAP[current];
                        } else {
                            // otherwise no border
                            current = 0;
                        }
                    }
                    return current;
                }
            };
        });

        // getComputedStyle for IE
        if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

            DOM._getComputedStyle = function(elem, name) {
                name = DOM._cssProps[name] || name;

                var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

                // 褰� width/height 璁剧疆涓虹櫨鍒嗘瘮鏃讹紝閫氳繃 pixelLeft 鏂瑰紡杞崲鐨� width/height 鍊�
                // 涓€寮€濮嬪氨澶勭悊浜�! CUSTOM_STYLE["height"],CUSTOM_STYLE["width"] ,cssHook 瑙ｅ喅@2011-08-19
                // 鍦� ie 涓嬩笉瀵癸紝闇€瑕佺洿鎺ョ敤 offset 鏂瑰紡
                // borderWidth 绛夊€间篃鏈夐棶棰橈紝浣嗚€冭檻鍒� borderWidth 璁句负鐧惧垎姣旂殑姒傜巼寰堝皬锛岃繖閲屽氨涓嶈€冭檻浜�

                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                    // Remember the original values
                    var style = elem[STYLE],
                        left = style[LEFT],
                        rsLeft = elem[RUNTIME_STYLE] && elem[RUNTIME_STYLE][LEFT];

                    // Put in the new values to get a computed value out
                    if (rsLeft) {
                        elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                    }
                    style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                    ret = style['pixelLeft'] + PX;

                    // Revert the changed values
                    style[LEFT] = left;
                    if (rsLeft) {
                        elem[RUNTIME_STYLE][LEFT] = rsLeft;
                    }
                }
                return ret === "" ? "auto" : ret;
            };
        }
        return DOM;
    },
    {
        requires:["./base","ua","./style"]
    }
);
/**
 * NOTES:
 * 鎵跨帀锛� 2011.05.19 opacity in ie
 *  - 濡傛灉鑺傜偣鏄姩鎬佸垱寤猴紝璁剧疆opacity锛屾病鏈夊姞鍒� dom 鍓嶏紝鍙栦笉鍒� opacity 鍊�
 *  - 鍏煎锛歜order-width 鍊硷紝ie 涓嬫湁鍙兘杩斿洖 medium/thin/thick 绛夊€硷紝鍏跺畠娴忚鍣ㄨ繑鍥� px 鍊笺€�
 *
 *  - opacity 鐨勫疄鐜帮紝鍙傝€冭嚜 jquery
 *
 */

/**
 * @module  dom-traversal
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/traversal', function(S, DOM, undefined) {

    var isElementNode = DOM._isElementNode,
        CONTAIN_MASK = 16;

    S.mix(DOM, {

        closest:function(selector, filter, context) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
            }, context, true);
        },

        /**
         * Gets the parent node of the first matched element.
         */
        parent: function(selector, filter, context) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
            }, context);
        },

        first:function(selector, filter) {
            var elem = DOM.get(selector);
            return nth(elem && elem.firstChild, filter, 'nextSibling',
                undefined, undefined, true);
        },

        last:function(selector, filter) {
            var elem = DOM.get(selector);
            return nth(elem && elem.lastChild, filter, 'previousSibling',
                undefined, undefined, true);
        },

        /**
         * Gets the following sibling of the first matched element.
         */
        next: function(selector, filter) {
            return nth(selector, filter, 'nextSibling', undefined);
        },

        /**
         * Gets the preceding sibling of the first matched element.
         */
        prev: function(selector, filter) {
            return nth(selector, filter, 'previousSibling', undefined);
        },

        /**
         * Gets the siblings of the first matched element.
         */
        siblings: function(selector, filter) {
            return getSiblings(selector, filter, true);
        },

        /**
         * Gets the children of the first matched element.
         */
        children: function(selector, filter) {
            return getSiblings(selector, filter, undefined);
        },

        __contains:document.documentElement.contains ?
            function(a, b) {
                if (a.nodeType == DOM.TEXT_NODE) {
                    return false;
                }
                var precondition;
                if (b.nodeType == DOM.TEXT_NODE) {
                    b = b.parentNode;
                    // a 鍜� b鐖朵翰鐩哥瓑涔熷氨鏄繑鍥� true
                    precondition = true;
                } else if (b.nodeType == DOM.DOCUMENT_NODE) {
                    // b === document
                    // 娌℃湁浠讳綍鍏冪礌鑳藉寘鍚� document
                    return false;
                } else {
                    // a 鍜� b 鐩哥瓑杩斿洖 false
                    precondition = a !== b;
                }
                // !a.contains => a===document
                // 娉ㄦ剰鍘熺敓 contains 鍒ゆ柇鏃� a===b 涔熻繑鍥� true
                return precondition && (a.contains ? a.contains(b) : true);
            } : (
            document.documentElement.compareDocumentPosition ?
                function(a, b) {
                    return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
                } :
                // it can not be true , pathetic browser
                0
            ),

        /**
         * Check to see if a DOM node is within another DOM node.
         */
        contains:
            function(a, b) {
                a = DOM.get(a);
                b = DOM.get(b);
                if (a && b) {
                    return DOM.__contains(a, b);
                }
            },

        equals:function(n1, n2) {
            n1 = DOM.query(n1);
            n2 = DOM.query(n2);
            if (n1.length != n2.length) {
                return false;
            }
            for (var i = n1.length; i >= 0; i--) {
                if (n1[i] != n2[i]) {
                    return false;
                }
            }
            return true;
        }
    });

    // 鑾峰彇鍏冪礌 elem 鍦� direction 鏂瑰悜涓婃弧瓒� filter 鐨勭涓€涓厓绱�
    // filter 鍙负 number, selector, fn array 锛屼负鏁扮粍鏃惰繑鍥炲涓�
    // direction 鍙负 parentNode, nextSibling, previousSibling
    // context : 鍒版煇涓樁娈典笉鍐嶆煡鎵剧洿鎺ヨ繑鍥�
    function nth(elem, filter, direction, extraFilter, context, includeSef) {
        if (!(elem = DOM.get(elem))) {
            return null;
        }
        if (filter === 0) {
            return elem;
        }
        if (!includeSef) {
            elem = elem[direction];
        }
        if (!elem) {
            return null;
        }
        context = (context && DOM.get(context)) || null;

        if (filter === undefined) {
            // 榛樿鍙� 1
            filter = 1;
        }
        var ret = [],
            isArray = S.isArray(filter),
            fi,
            flen;

        if (S.isNumber(filter)) {
            fi = 0;
            flen = filter;
            filter = function() {
                return ++fi === flen;
            };
        }

        // 姒傚康缁熶竴锛岄兘鏄� context 涓婁笅鏂囷紝鍙繃婊ゅ瓙瀛欒妭鐐癸紝鑷繁涓嶇
        while (elem && elem != context) {
            if (isElementNode(elem)
                && testFilter(elem, filter)
                && (!extraFilter || extraFilter(elem))) {
                ret.push(elem);
                if (!isArray) {
                    break;
                }
            }
            elem = elem[direction];
        }

        return isArray ? ret : ret[0] || null;
    }

    function testFilter(elem, filter) {
        if (!filter) {
            return true;
        }
        if (S.isArray(filter)) {
            for (var i = 0; i < filter.length; i++) {
                if (DOM.test(elem, filter[i])) {
                    return true;
                }
            }
        } else if (DOM.test(elem, filter)) {
            return true;
        }
        return false;
    }

    // 鑾峰彇鍏冪礌 elem 鐨� siblings, 涓嶅寘鎷嚜韬�
    function getSiblings(selector, filter, parent) {
        var ret = [],
            elem = DOM.get(selector),
            j,
            parentNode = elem,
            next;
        if (elem && parent) {
            parentNode = elem.parentNode;
        }

        if (parentNode) {
            for (j = 0,next = parentNode.firstChild;
                 next;
                 next = next.nextSibling) {
                if (isElementNode(next)
                    && next !== elem
                    && (!filter || DOM.test(next, filter))) {
                    ret[j++] = next;
                }
            }
        }

        return ret;
    }

    return DOM;
}, {
    requires:["./base"]
});

/**
 * 2011-08
 * - 娣诲姞 closest , first ,last 瀹屽叏鎽嗚劚鍘熺敓灞炴€�
 *
 * NOTES:
 * - jquery does not return null ,it only returns empty array , but kissy does.
 *
 *  - api 鐨勮璁′笂锛屾病鏈夎窡闅� jQuery. 涓€鏄负浜嗗拰鍏朵粬 api 涓€鑷达紝淇濇寔 first-all 鍘熷垯銆備簩鏄�
 *    閬靛惊 8/2 鍘熷垯锛岀敤灏藉彲鑳藉皯鐨勪唬鐮佹弧瓒崇敤鎴锋渶甯哥敤鐨勫姛鑳姐€�
 *
 */

KISSY.add("dom", function(S,DOM) {
    return DOM;
}, {
    requires:["dom/attr",
        "dom/class",
        "dom/create",
        "dom/data",
        "dom/insertion",
        "dom/offset",
        "dom/style",
        "dom/selector",
        "dom/style-ie",
        "dom/traversal"]
});

/**
 * @fileOverview some keycodes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add("event/keycodes", function() {
    var KeyCodes = {
        MAC_ENTER: 3,
        BACKSPACE: 8,
        TAB: 9,
        NUM_CENTER: 12,  // NUMLOCK on FF/Safari Mac
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,     // also NUM_NORTH_EAST
        PAGE_DOWN: 34,   // also NUM_SOUTH_EAST
        END: 35,         // also NUM_SOUTH_WEST
        HOME: 36,        // also NUM_NORTH_WEST
        LEFT: 37,        // also NUM_WEST
        UP: 38,          // also NUM_NORTH
        RIGHT: 39,       // also NUM_EAST
        DOWN: 40,        // also NUM_SOUTH
        PRINT_SCREEN: 44,
        INSERT: 45,      // also NUM_INSERT
        DELETE: 46,      // also NUM_DELETE
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        QUESTION_MARK: 63, // needs localization
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        META: 91, // WIN_KEY_LEFT
        WIN_KEY_RIGHT: 92,
        CONTEXT_MENU: 93,
        NUM_ZERO: 96,
        NUM_ONE: 97,
        NUM_TWO: 98,
        NUM_THREE: 99,
        NUM_FOUR: 100,
        NUM_FIVE: 101,
        NUM_SIX: 102,
        NUM_SEVEN: 103,
        NUM_EIGHT: 104,
        NUM_NINE: 105,
        NUM_MULTIPLY: 106,
        NUM_PLUS: 107,
        NUM_MINUS: 109,
        NUM_PERIOD: 110,
        NUM_DIVISION: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUMLOCK: 144,
        SEMICOLON: 186,            // needs localization
        DASH: 189,                 // needs localization
        EQUALS: 187,               // needs localization
        COMMA: 188,                // needs localization
        PERIOD: 190,               // needs localization
        SLASH: 191,                // needs localization
        APOSTROPHE: 192,           // needs localization
        SINGLE_QUOTE: 222,         // needs localization
        OPEN_SQUARE_BRACKET: 219,  // needs localization
        BACKSLASH: 220,            // needs localization
        CLOSE_SQUARE_BRACKET: 221, // needs localization
        WIN_KEY: 224,
        MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
        WIN_IME: 229
    };

    return KeyCodes;

});

/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/object', function(S, undefined) {

    var doc = document,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis').split(' ');

    /**
     * KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.currentTarget = currentTarget;
        self.originalEvent = domEvent || { };

        if (domEvent) { // html element
            self.type = domEvent.type;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }

        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = true;
    }

    S.augment(EventObject, {

        _fix: function() {
            var self = this,
                originalEvent = self.originalEvent,
                l = props.length, prop,
                ct = self.currentTarget,
                ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

            // clone properties of the original event object
            while (l) {
                prop = props[--l];
                self[prop] = originalEvent[prop];
            }

            // fix target property, if necessary
            if (!self.target) {
                self.target = self.srcElement || doc; // srcElement might not be defined either
            }

            // check if target is a textnode (safari)
            if (self.target.nodeType === 3) {
                self.target = self.target.parentNode;
            }

            // add relatedTarget, if necessary
            if (!self.relatedTarget && self.fromElement) {
                self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
            }

            // calculate pageX/Y if missing and clientX/Y available
            if (self.pageX === undefined && self.clientX !== undefined) {
                var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
            }

            // add which for key events
            if (self.which === undefined) {
                self.which = (self.charCode === undefined) ? self.keyCode : self.charCode;
            }

            // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (self.metaKey === undefined) {
                self.metaKey = self.ctrlKey;
            }

            // add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!self.which && self.button !== undefined) {
                self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
            }
        },

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function() {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function() {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }

            this.isPropagationStopped = true;
        },



        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         */
        stopImmediatePropagation: function() {
            var self = this;
            self.isImmediatePropagationStopped = true;
            // fixed 1.2
            // call stopPropagation implicitly
            self.stopPropagation();
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
        }
    });

    if (1 > 2) {
        alert(S.cancelBubble);
    }

    return EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 鐨勮缁嗘祴璇�
 */

/**
 * utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/utils", function(S, DOM) {

    /**
     * whether two event listens are the same
     * @param h1 宸叉湁鐨� handler 鎻忚堪
     * @param h2 鐢ㄦ埛鎻愪緵鐨� handler 鎻忚堪
     */
    function isIdenticalHandler(h1, h2, el) {
        var scope1 = h1.scope || el,
            ret = 1,
            d1,
            d2,
            scope2 = h2.scope || el;
        if (h1.fn !== h2.fn
            || scope1 !== scope2) {
            ret = 0;
        } else if ((d1 = h1.data) !== (d2 = h2.data)) {
            // undelgate 涓嶈兘 remove 鏅€� on 鐨� handler
            // remove 涓嶈兘 remove delegate 鐨� handler
            if (!d1 && d2
                || d1 && !d2
                ) {
                ret = 0;
            } else if (d1 && d2) {
                if (!d1.equals || !d2.equals) {
                    S.error("no equals in data");
                } else if (!d1.equals(d2,el)) {
                    ret = 0;
                }
            }
        }
        return ret;
    }


    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target &&
            target.nodeType !== DOM.TEXT_NODE &&
            target.nodeType !== DOM.COMMENT_NODE;
    }


    function batchForType(obj, methodName, targets, types) {
        // on(target, 'click focus', fn)
        if (types && types.indexOf(" ") > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(/\s+/), function(type) {
                var args2 = [].concat(args);
                args2.splice(0, 4, targets, type);
                obj[methodName].apply(obj, args2);
            });
            return true;
        }
        return 0;
    }


    function splitAndRun(type, fn) {
        S.each(type.split(/\s+/), fn);
    }


    var doc = document,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            };


    return {
        splitAndRun:splitAndRun,
        batchForType:batchForType,
        isValidTarget:isValidTarget,
        isIdenticalHandler:isIdenticalHandler,
        simpleAdd:simpleAdd,
        simpleRemove:simpleRemove
    };

}, {
    requires:['dom']
});

/**
 * scalable event framework for kissy (refer DOM3 Events)
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, Utils, undefined) {

    var isValidTarget = Utils.isValidTarget,
        isIdenticalHandler = Utils.isIdenticalHandler,
        batchForType = Utils.batchForType,
        simpleRemove = Utils.simpleRemove,
        simpleAdd = Utils.simpleAdd,
        splitAndRun = Utils.splitAndRun,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        each = S.each,
        trim = S.trim,
    // 璁板綍鎵嬪伐 fire(domElement,type) 鏃剁殑 type
    // 鍐嶅湪娴忚鍣ㄩ€氱煡鐨勭郴缁� eventHandler 涓鏌�
    // 濡傛灉鐩稿悓锛岄偅涔堣瘉鏄庡凡缁� fire 杩囦簡锛屼笉瑕佸啀娆¤Е鍙戜簡
        Event_Triggered = "",
        TRIGGERED_NONE = "trigger-none-" + S.now(),
        EVENT_SPECIAL = {},
    // 浜嬩欢瀛樺偍浣嶇疆 key
    // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();

    /**
     * @name Event
     * @namespace
     */
    var Event = {

        _clone:function(src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !Event._hasData(src)) {
                return;
            }
            var eventDesc = Event._data(src),
                events = eventDesc.events;
            each(events, function(handlers, type) {
                each(handlers, function(handler) {
                    // scope undefined 鏃朵笉鑳藉啓姝诲湪 handlers 涓紝鍚﹀垯涓嶈兘淇濊瘉 clone 鏃剁殑 this
                    Event.on(dest, type, handler.fn, handler.scope, handler.data);
                });
            });
        },

        _hasData:function(elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        },

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special: EVENT_SPECIAL,

        // single type , single target , fixed native
        __add:function(isNativeTarget, target, type, fn, scope, data) {
            var eventDesc;

            // 涓嶆槸鏈夋晥鐨� target 鎴� 鍙傛暟涓嶅
            if (!target ||
                !S.isFunction(fn) ||
                (isNativeTarget && !isValidTarget(target))) {
                return;
            }
            // 鑾峰彇浜嬩欢鎻忚堪
            eventDesc = Event._data(target);
            if (!eventDesc) {
                Event._data(target, eventDesc = {});
            }
            //浜嬩欢 listeners , similar to eventListeners in DOM3 Events
            var events = eventDesc.events = eventDesc.events || {},
                handlers = events[type] = events[type] || [],
                handleObj = {
                    fn: fn,
                    scope: scope,
                    data:data
                },
                eventHandler = eventDesc.handler;
            // 璇ュ厓绱犳病鏈� handler 锛屽苟涓旇鍏冪礌鏄� dom 鑺傜偣鏃舵墠闇€瑕佹敞鍐� dom 浜嬩欢
            if (!eventHandler) {
                eventHandler = eventDesc.handler = function(event, data) {
                    // 鏄粡杩� fire 鎵嬪姩璋冪敤鑰屾祻瑙堝櫒鍚屾瑙﹀彂瀵艰嚧鐨勶紝灏变笉瑕佸啀娆¤Е鍙戜簡锛�
                    // 宸茬粡鍦� fire 涓� bubble 杩囦竴娆′簡
                    if (event && event.type == Event_Triggered) {
                        return;
                    }
                    var currentTarget = eventHandler.target;
                    if (!event || !event.fixed) {
                        event = new EventObject(currentTarget, event);
                    }
                    var type = event.type;
                    if (S.isPlainObject(data)) {
                        S.mix(event, data);
                    }
                    // protect type
                    if (type) {
                        event.type = type;
                    }
                    return _handle(currentTarget, event);
                };
                // as for native dom event , this represents currentTarget !
                eventHandler.target = target;
            }

            for (var i = handlers.length - 1; i >= 0; --i) {
                /**
                 * If multiple identical EventListeners are registered on the same EventTarget
                 * with the same parameters the duplicate instances are discarded.
                 * They do not cause the EventListener to be called twice
                 * and since they are discarded
                 * they do not need to be removed with the removeEventListener method.
                 */
                if (isIdenticalHandler(handlers[i], handleObj, target)) {
                    return;
                }
            }

            if (isNativeTarget) {
                addDomEvent(target, type, eventHandler, handlers, handleObj);
                //nullify to prevent memory leak in ie ?
                target = null;
            }

            // 澧炲姞 listener
            handlers.push(handleObj);
        },

        /**
         * Adds an event listener.similar to addEventListener in DOM3 Events
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler/listener.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        add: function(targets, type, fn, scope /* optional */, data/*internal usage*/) {
            type = trim(type);
            // data : 闄勫姞鍦ㄥ洖璋冨悗闈㈢殑鏁版嵁锛宒elegate 妫€鏌ヤ娇鐢�
            // remove 鏃� data 鐩哥瓑(鎸囧悜鍚屼竴瀵硅薄鎴栬€呭畾涔変簡 equals 姣旇緝鍑芥暟)
            if (batchForType(Event, 'add', targets, type, fn, scope, data)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                Event.__add(true, target, type, fn, scope, data);
            });

            return targets;
        },

        // single target, single type, fixed native
        __remove:function(isNativeTarget, target, type, fn, scope, data) {

            if (
                !target ||
                    (isNativeTarget && !isValidTarget(target))
                ) {
                return;
            }

            var eventDesc = Event._data(target),
                events = eventDesc && eventDesc.events,
                handlers,
                len,
                i,
                j,
                t,
                special = (isNativeTarget && EVENT_SPECIAL[type]) || { };

            if (!events) {
                return;
            }

            // remove all types of event
            if (!type) {
                for (type in events) {
                    Event.__remove(isNativeTarget, target, type);
                }
                return;
            }

            if ((handlers = events[type])) {
                len = handlers.length;
                // 绉婚櫎 fn
                if (fn && len) {
                    var currentHandler = {
                        data:data,
                        fn:fn,
                        scope:scope
                    },handler;

                    for (i = 0,j = 0,t = []; i < len; ++i) {
                        handler = handlers[i];
                        // 娉ㄦ剰椤哄簭锛岀敤鎴锋彁渚涚殑 handler 鍦ㄧ浜屼釜鍙傛暟
                        if (!isIdenticalHandler(handler, currentHandler, target)) {
                            t[j++] = handler;
                        } else if (special.remove) {
                            special.remove.call(target, handler);
                        }
                    }

                    events[type] = t;
                    len = t.length;
                }

                // remove(el, type) or fn 宸茬Щ闄ゅ厜
                if (fn === undefined || len === 0) {
                    // dom node need to detach handler from dom node
                    if (isNativeTarget &&
                        (!special['tearDown'] ||
                            special['tearDown'].call(target) === false)) {
                        simpleRemove(target, type, eventDesc.handler);
                    }
                    // remove target's single event description
                    delete events[type];
                }
            }

            // remove target's  all events description
            if (S.isEmptyObject(events)) {
                eventDesc.handler.target = null;
                delete eventDesc.handler;
                delete eventDesc.events;
                Event._removeData(target);
            }
        },

        /**
         * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler/listener.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        remove: function(targets, type /* optional */, fn /* optional */, scope /* optional */, data/*internal usage*/) {
            type = trim(type);
            if (batchForType(Event, 'remove', targets, type, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                Event.__remove(true, target, type, fn, scope, data);
            });
            return targets;
        },

        _handle:_handle,

        /**
         * fire event , simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @return boolean The return value of fire/dispatchEvent indicates
         *                 whether any of the listeners which handled the event called preventDefault.
         *                 If preventDefault was called the value is false, else the value is true.
         */
        fire: function(targets, eventType, eventData, onlyHandlers) {
            var ret = true;
            eventType = trim(eventType);
            if (eventType.indexOf(" ") > -1) {
                splitAndRun(eventType, function(t) {
                    ret = Event.fire(targets, t, eventData, onlyHandlers) && ret;
                });
                return ret;
            }
            // custom event firing moved to target.js
            eventData = eventData || {};
            // protect event type
            eventData.type = eventType;
            DOM.query(targets).each(function(target) {
                ret = fireDOMEvent(target, eventType, eventData, onlyHandlers) && ret;
            });
            return ret;
        }
    };

    // for compatibility
    Event['__getListeners'] = getListeners

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function getListeners(target, type) {
        var events = getEvents(target) || {};
        return events[type] || [];
    }

    function _handle(target, event) {
        /* As some listeners may remove themselves from the
         event, the original array length is dynamic. So,
         let's make a copy of all listeners, so we are
         sure we'll call all of them.*/
        /**
         * DOM3 Events: EventListenerList objects in the DOM are live. ??
         */
        var listeners = getListeners(target, event.type).slice(0),
            ret,
            gRet,
            i = 0,
            len = listeners.length,
            listener;

        for (; i < len; ++i) {
            listener = listeners[i];
            // 浼犲叆闄勪欢鍙傛暟data锛岀洰鍓嶇敤浜庡鎵�
            // scope undefined 鏃朵笉鑳藉啓姝诲湪 listener 涓紝鍚﹀垯涓嶈兘淇濊瘉 clone 鏃剁殑 this
            ret = listener.fn.call(listener.scope || target,
                event, listener.data);

            // 鍜� jQuery 閫昏緫淇濇寔涓€鑷�
            if (ret !== undefined) {
                // 鏈変竴涓� false锛屾渶缁堢粨鏋滃氨鏄� false
                // 鍚﹀垯绛変簬鏈€鍚庝竴涓繑鍥炲€�
                if (gRet !== false) {
                    gRet = ret;
                }
                // return false 绛変环 preventDefault + stopProgation
                if (ret === false) {
                    event.halt();
                }
            }

            if (event.isImmediatePropagationStopped) {
                break;
            }
        }

        // fire 鏃跺垽鏂鏋� preventDefault锛屽垯杩斿洖 false 鍚﹀垯杩斿洖 true
        // 杩欓噷杩斿洖鍊兼剰涔変笉鍚�
        return gRet;
    }

    function getEvents(target) {
        // 鑾峰彇浜嬩欢鎻忚堪
        var eventDesc = Event._data(target);
        return eventDesc && eventDesc.events;
    }

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = EVENT_SPECIAL[type] || {};
        // 绗竴娆℃敞鍐岃浜嬩欢锛宒om 鑺傜偣鎵嶉渶瑕佹敞鍐� dom 浜嬩欢
        if (!handlers.length &&
            (!special.setup || special.setup.call(target) === false)) {
            simpleAdd(target, type, eventHandler)
        }
        if (special.add) {
            special.add.call(target, handleObj);
        }
    }


    /**
     * fire dom event from bottom to up , emulate dispatchEvent in DOM3 Events
     * @return boolean The return value of dispatchEvent indicates
     *                 whether any of the listeners which handled the event called preventDefault.
     *                 If preventDefault was called the value is false, else the value is true.
     */
    function fireDOMEvent(target, eventType, eventData, onlyHandlers) {
        if (!isValidTarget(target)) {
            return false;
        }

        var event,
            ret = true;
        if (eventData instanceof EventObject) {
            event = eventData;
        } else {
            event = new EventObject(target, undefined, eventType);
            S.mix(event, eventData);
        }
        /*
         The target of the event is the EventTarget on which dispatchEvent is called.
         */
        // TODO: protect target , but incompatible
        // event.target=target;
        // protect type
        event.type = eventType;
        // 鍙繍琛岃嚜宸辩殑缁戝畾鍑芥暟锛屼笉鍐掓场涔熶笉瑙﹀彂榛樿琛屼负
        if (onlyHandlers) {
            event.halt();
        }
        var cur = target,
            ontype = "on" + eventType;

        //bubble up dom tree
        do{
            event.currentTarget = cur;
            _handle(cur, event);
            // Trigger an inline bound script
            if (cur[ ontype ] &&
                cur[ ontype ].call(cur) === false) {
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                cur === target.ownerDocument && window;
        } while (cur && !event.isPropagationStopped);

        if (!event.isDefaultPrevented) {
            if (!(eventType === "click" &&
                nodeName(target, "a"))) {
                var old;
                try {
                    if (ontype && target[ eventType ]) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = target[ ontype ];

                        if (old) {
                            target[ ontype ] = null;
                        }

                        // 璁板綍褰撳墠 trigger 瑙﹀彂
                        Event_Triggered = eventType;

                        // 鍙Е鍙戦粯璁や簨浠讹紝鑰屼笉瑕佹墽琛岀粦瀹氱殑鐢ㄦ埛鍥炶皟
                        // 鍚屾瑙﹀彂
                        target[ eventType ]();
                    }
                } catch (ieError) {
                    S.log("trigger action error : ");
                    S.log(ieError);
                }

                if (old) {
                    target[ ontype ] = old;
                }

                Event_Triggered = TRIGGERED_NONE;
            }
        } else {
            ret = false;
        }
        return ret;
    }

    return Event;
}, {
    requires:["dom","./object","./utils"]
});

/**
 * 2011-11-24
 *  - 鑷畾涔変簨浠跺拰 dom 浜嬩欢鎿嶄綔褰诲簳鍒嗙
 *  - TODO: group event from DOM3 Event
 *
 * 2011-06-07
 *  - refer : http://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010823/events.html
 *  - 閲嶆瀯
 *  - eventHandler 涓€涓厓绱犱竴涓€屼笉鏄竴涓厓绱犱竴涓簨浠朵竴涓紝鑺傜渷鍐呭瓨
 *  - 鍑忓皯闂寘浣跨敤锛宲revent ie 鍐呭瓨娉勯湶锛�
 *  - 澧炲姞 fire 锛屾ā鎷熷啋娉″鐞� dom 浜嬩欢
 */

/**
 * @module  EventTarget
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/target', function (S, Event, EventObject, Utils, undefined) {
    var KS_PUBLISH = "__~ks_publish",
        trim = S.trim,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = "__~ks_bubble_targets",
        ALL_EVENT = "*";

    function getCustomEvent(self, type, eventData) {
        if (eventData instanceof EventObject) {
            // set currentTarget in the process of bubbling
            eventData.currentTarget = self;
            return eventData;
        }
        var customEvent = new EventObject(self, undefined, type);
        if (S.isPlainObject(eventData)) {
            S.mix(customEvent, eventData);
        }
        // protect type
        customEvent.type = type;
        return customEvent
    }

    function getEventPublishObj(self) {
        self[KS_PUBLISH] = self[KS_PUBLISH] || {};
        return self[KS_PUBLISH];
    }

    function getBubbleTargetsObj(self) {
        self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || {};
        return self[KS_BUBBLE_TARGETS];
    }

    function isBubblable(self, eventType) {
        var publish = getEventPublishObj(self);
        return publish[eventType] && publish[eventType].bubbles || publish[ALL_EVENT] && publish[ALL_EVENT].bubbles
    }

    function attach(method) {
        return function (type, fn, scope) {
            var self = this;
            type = trim(type);
            splitAndRun(type, function (t) {
                Event["__" + method](false, self, t, fn, scope);
            });
            return self; // chain
        };
    }

    /**
     * 鎻愪緵浜嬩欢鍙戝竷鍜岃闃呮満鍒�
     * @name Target
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {
        /**
         * 瑙﹀彂浜嬩欢
         * @param {String} type 浜嬩欢鍚�
         * @param {Object} eventData 浜嬩欢闄勫姞淇℃伅瀵硅薄
         * @returns 濡傛灉涓€涓� listener 杩斿洖false锛屽垯杩斿洖 false 锛屽惁鍒欒繑鍥炴渶鍚庝竴涓� listener 鐨勫€�.
         */
        fire: function (type, eventData) {
            var self = this,
                ret,
                r2,
                customEvent;
            type = trim(type);
            if (type.indexOf(" ") > 0) {
                splitAndRun(type, function (t) {
                    r2 = self.fire(t, eventData);
                    if (r2 === false) {
                        ret = false;
                    }
                });
                return ret;
            }
            if (eventData) {
                eventData.type = type;
            }
            customEvent = getCustomEvent(self, type, eventData);
            ret = Event._handle(self, customEvent);
            if (!customEvent.isPropagationStopped &&
                isBubblable(self, type)) {
                r2 = self.bubble(type, customEvent);
                // false 浼樺厛杩斿洖
                if (ret !== false) {
                    ret = r2;
                }
            }
            return ret
        },

        /**
         * defined event config
         * @param type
         * @param cfg
         *        example { bubbles: true}
         *        default bubbles: false
         */
        publish: function (type, cfg) {
            var self = this,
                publish = getEventPublishObj(self);
            type = trim(type);
            if (type) {
                publish[type] = cfg;
            }
        },

        /**
         * bubble event to its targets
         * @param type
         * @param eventData
         */
        bubble: function (type, eventData) {
            var self = this,
                ret,
                targets = getBubbleTargetsObj(self);
            S.each(targets, function (t) {
                var r2 = t.fire(type, eventData);
                if (ret !== false) {
                    ret = r2;
                }
            });
            return ret;
        },

        /**
         * add target which bubblable event bubbles towards
         * @param target another EventTarget instance
         */
        addTarget: function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            targets[S.stamp(target)] = target;
        },

        removeTarget: function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            delete targets[S.stamp(target)];
        },

        /**
         * 鐩戝惉浜嬩欢
         * @param {String} type 浜嬩欢鍚�
         * @param {Function} fn 浜嬩欢澶勭悊鍣�
         * @param {Object} scope 浜嬩欢澶勭悊鍣ㄥ唴鐨� this 鍊硷紝榛樿褰撳墠瀹炰緥
         * @returns 褰撳墠瀹炰緥
         */
        on: attach("add")
    };

    /**
     * 鍙栨秷鐩戝惉浜嬩欢
     * @param {String} type 浜嬩欢鍚�
     * @param {Function} fn 浜嬩欢澶勭悊鍣�
     * @param {Object} scope 浜嬩欢澶勭悊鍣ㄥ唴鐨� this 鍊硷紝榛樿褰撳墠瀹炰緥
     * @returns 褰撳墠瀹炰緥
     */
    Target.detach = attach("remove");

    return Target;
}, {
    /*
     瀹為檯涓婂彧闇€瑕� dom/data 锛屼絾鏄笉瑕佽法妯″潡寮曠敤鍙︿竴妯″潡鐨勫瓙妯″潡锛�
     鍚﹀垯浼氬鑷碽uild鎵撳寘鏂囦欢 dom 鍜� dom-data 閲嶅杞藉叆
     */
    requires: ["./base", './object', './utils']
});
/**
 *  yiminghe:2011-10-17
 *   - implement bubble for custom event
 **/

/**
 * @module  event-focusin
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/focusin', function(S, UA, Event) {

    // 璁╅潪 IE 娴忚鍣ㄦ敮鎸� focusin/focusout
    if (!UA['ie']) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {
            var attaches = 0;
            Event.special[o.name] = {
                // 缁熶竴鍦� document 涓� capture focus/blur 浜嬩欢锛岀劧鍚庢ā鎷熷啋娉� fire 鍑烘潵
                // 杈惧埌鍜� focusin 涓€鏍风殑鏁堟灉 focusin -> focus
                // refer: http://yiminghe.iteye.com/blog/813255
                setup: function() {
                    if (attaches++ === 0) {
                        document.addEventListener(o.fix, handler, true);
                    }
                },

                tearDown:function() {
                    if (--attaches === 0) {
                        document.removeEventListener(o.fix, handler, true);
                    }
                }
            };

            function handler(event) {
                var target = event.target;
                return Event.fire(target, o.name);
            }

        });
    }
    return Event;
}, {
    requires:["ua","./base"]
});

/**
 * 鎵跨帀:2011-06-07
 * - refactor to jquery , 鏇村姞鍚堢悊鐨勬ā鎷熷啋娉￠『搴忥紝瀛愬厓绱犲厛鍑鸿Е鍙戯紝鐖跺厓绱犲悗瑙﹀彂
 *
 * NOTES:
 *  - webkit 鍜� opera 宸叉敮鎸� DOMFocusIn/DOMFocusOut 浜嬩欢锛屼絾涓婇潰鐨勫啓娉曞凡缁忚兘杈惧埌棰勬湡鏁堟灉锛屾殏鏃朵笉鑰冭檻鍘熺敓鏀寔銆�
 */

/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com , xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM, UA) {

    var doc = document,
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // ie8 鏀寔 hashchange
    // 浣咺E8浠ヤ笂鍒囨崲娴忚鍣ㄦā寮忓埌IE7锛堝吋瀹规ā寮忥級锛屼細瀵艰嚧 'onhashchange' in window === true锛屼絾鏄笉瑙﹀彂浜嬩欢

    // 1. 涓嶆敮鎸� hashchange 浜嬩欢锛屾敮鎸� hash 瀵艰埅(opera??)锛氬畾鏃跺櫒鐩戞帶
    // 2. 涓嶆敮鎸� hashchange 浜嬩欢锛屼笉鏀寔 hash 瀵艰埅(ie67) : iframe + 瀹氭椂鍣�
    if ((!( 'on' + HASH_CHANGE in window)) || ie && ie < 8) {


        function getIframeDoc(iframe) {
            return iframe.contentWindow.document;
        }

        var POLL_INTERVAL = 50,
            win = window,
            IFRAME_TEMPLATE = "<html><head><title>" + (doc.title || "") +
                " - {hash}</title>{head}</head><body>{hash}</body></html>",

            getHash = function() {
                // 涓嶈兘 location.hash
                // http://xx.com/#yy?z=1
                // ie6 => location.hash = #yy
                // 鍏朵粬娴忚鍣� => location.hash = #yy?z=1
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },

            timer,

        // 鐢ㄤ簬瀹氭椂鍣ㄦ娴嬶紝涓婃瀹氭椂鍣ㄨ褰曠殑 hash 鍊�
            lastHash,

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    // S.log("poll success :" + hash + " :" + lastHash);
                    // 閫氱煡瀹岃皟鐢ㄨ€� hashchange 浜嬩欢鍓嶈缃� lastHash
                    lastHash = hash;
                    // ie<8 鍚屾 : hashChange -> onIframeLoad
                    hashChange(hash);
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie && ie < 8 ? function(hash) {
                // S.log("set iframe html :" + hash);

                var html = S.substitute(IFRAME_TEMPLATE, {
                        hash: S.escapeHTML(hash),
                        // 涓€瀹氳鍔犲摝
                        head:DOM._isCustomDomain() ? "<script>document.domain = '" +
                            doc.domain
                            + "';</script>" : ""
                    }),
                    iframeDoc = getIframeDoc(iframe);
                try {
                    // 鍐欏叆鍘嗗彶 hash
                    iframeDoc.open();
                    // 鍙栨椂瑕佺敤 innerText !!
                    // 鍚﹀垯鍙� innerHtml 浼氬洜涓� escapeHtml 瀵肩疆 body.innerHTMl != hash
                    iframeDoc.write(html);
                    iframeDoc.close();
                    // 绔嬪埢鍚屾璋冪敤 onIframeLoad !!!!
                } catch (e) {
                    // S.log('doc write error : ', 'error');
                    // S.log(e, 'error');
                }
            } : function () {
                notifyHashChange();
            },

            notifyHashChange = function () {
                // S.log("hash changed : " + getHash());
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = 0;
            },
            iframe;

        // ie6, 7, 瑕嗙洊涓€浜沠unction
        if (ie < 8) {

            /**
             * 鍓嶈繘鍚庨€€ : start -> notifyHashChange
             * 鐩存帴杈撳叆 : poll -> hashChange -> start
             * iframe 鍐呭鍜� url 鍚屾
             */
            setup = function() {
                if (!iframe) {
                    var iframeSrc = DOM._genEmptyIframeSrc();
                    //http://www.paciellogroup.com/blog/?p=604
                    iframe = DOM.create('<iframe ' +
                        (iframeSrc ? 'src="' + iframeSrc + '"' : '') +
                        ' style="display: none" ' +
                        'height="0" ' +
                        'width="0" ' +
                        'tabindex="-1" ' +
                        'title="empty"/>');
                    // Append the iframe to the documentElement rather than the body.
                    // Keeping it outside the body prevents scrolling on the initial
                    // page load
                    DOM.prepend(iframe, doc.documentElement);

                    // init锛岀涓€娆¤Е鍙戯紝浠ュ悗閮芥槸 onIframeLoad
                    Event.add(iframe, "load", function() {
                        Event.remove(iframe, "load");
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, "load", onIframeLoad);
                        poll();
                    });

                    // Whenever `document.title` changes, update the Iframe's title to
                    // prettify the back/next history menu entries. Since IE sometimes
                    // errors with "Unspecified error" the very first time this is set
                    // (yes, very useful) wrap this with a try/catch block.
                    doc.onpropertychange = function() {
                        try {
                            if (event.propertyName === 'title') {
                                getIframeDoc(iframe).title =
                                    doc.title + " - " + getHash();
                            }
                        } catch(e) {
                        }
                    };

                    /**
                     * 鍓嶈繘鍚庨€€ 锛� onIframeLoad -> 瑙﹀彂
                     * 鐩存帴杈撳叆 : timer -> hashChange -> onIframeLoad -> 瑙﹀彂
                     * 瑙﹀彂缁熶竴鍦� start(load)
                     * iframe 鍐呭鍜� url 鍚屾
                     */
                    function onIframeLoad() {
                        // S.log('iframe start load..');

                        // 2011.11.02 note: 涓嶈兘鐢� innerHtml 浼氳嚜鍔ㄨ浆涔夛紒锛�
                        // #/x?z=1&y=2 => #/x?z=1&amp;y=2
                        var c = S.trim(getIframeDoc(iframe).body.innerText),
                            ch = getHash();

                        // 鍚庨€€鏃朵笉绛�
                        // 瀹氭椂鍣ㄨ皟鐢� hashChange() 淇敼 iframe 鍚屾璋冪敤杩囨潵鐨�(鎵嬪姩鏀瑰彉 location)鍒欑浉绛�
                        if (c != ch) {
                            S.log("set loc hash :" + c);
                            location.hash = c;
                            // 浣縧asthash涓� iframe 鍘嗗彶锛� 涓嶇劧閲嶆柊鍐檌frame锛�
                            // 浼氬鑷存渶鏂扮姸鎬侊紙涓㈠け鍓嶈繘鐘舵€侊級

                            // 鍚庨€€鍒欑珛鍗宠Е鍙� hashchange锛�
                            // 骞舵洿鏂板畾鏃跺櫒璁板綍鐨勪笂涓� hash 鍊�
                            lastHash = c;
                        }
                        notifyHashChange();
                    }
                }
            };

            tearDown = function() {
                timer && clearTimeout(timer);
                timer = 0;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = 0;
            };
        }

        Event.special[HASH_CHANGE] = {
            setup: function() {
                if (this !== win) {
                    return;
                }
                // 绗竴娆″惎鍔� hashchange 鏃跺彇涓€涓嬶紝涓嶈兘绫诲簱杞藉叆鍚庣珛鍗冲彇
                // 闃叉绫诲簱宓屽叆鍚庯紝鎵嬪姩淇敼杩� hash锛�
                lastHash = getHash();
                // 涓嶇敤娉ㄥ唽 dom 浜嬩欢
                setup();
            },
            tearDown: function() {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires:["./base","dom","ua"]
});

/**
 * 宸茬煡 bug :
 * - ie67 鏈夋椂鍚庨€€鍚庡彇寰楃殑 location.hash 涓嶅拰鍦板潃鏍忎竴鑷达紝瀵艰嚧蹇呴』鍚庨€€涓ゆ鎵嶈兘瑙﹀彂 hashchange
 *
 * v1 : 2010-12-29
 * v1.1: 鏀寔闈濱E锛屼絾涓嶆敮鎸乷nhashchange浜嬩欢鐨勬祻瑙堝櫒(渚嬪浣庣増鏈殑firefox銆乻afari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 */

/**
 * inspired by yui3 :
 *
 * Synthetic event that fires when the <code>value</code> property of an input
 * field or textarea changes as a result of a keystroke, mouse operation, or
 * input method editor (IME) input event.
 *
 * Unlike the <code>onchange</code> event, this event fires when the value
 * actually changes and not when the element loses focus. This event also
 * reports IME and multi-stroke input more reliably than <code>oninput</code> or
 * the various key events across browsers.
 *
 * @author yiminghe@gmail.com
 */
KISSY.add('event/valuechange', function (S, Event, DOM) {
    var VALUE_CHANGE = "valuechange",
        nodeName = DOM._nodeName,
        KEY = "event/valuechange",
        HISTORY_KEY = KEY + "/history",
        POLL_KEY = KEY + "/poll",
        interval = 50;

    function stopPoll(target) {
        DOM.removeData(target, HISTORY_KEY);
        if (DOM.hasData(target, POLL_KEY)) {
            var poll = DOM.data(target, POLL_KEY);
            clearTimeout(poll);
            DOM.removeData(target, POLL_KEY);
        }
    }

    function stopPollHandler(ev) {
        var target = ev.target;
        stopPoll(target);
    }

    function startPoll(target) {
        if (DOM.hasData(target, POLL_KEY)) return;
        DOM.data(target, POLL_KEY, setTimeout(function () {
            var v = target.value, h = DOM.data(target, HISTORY_KEY);
            if (v !== h) {
                // 鍙Е鍙戣嚜宸辩粦瀹氱殑 handler
                Event.fire(target, VALUE_CHANGE, {
                    prevVal:h,
                    newVal:v
                }, true);
                DOM.data(target, HISTORY_KEY, v);
            }
            DOM.data(target, POLL_KEY, setTimeout(arguments.callee, interval));
        }, interval));
    }

    function startPollHandler(ev) {
        var target = ev.target;
        // when focus ,record its current value immediately
        if (ev.type == "focus") {
            DOM.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", stopPollHandler);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", stopPollHandler);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
    }

    Event.special[VALUE_CHANGE] = {
        setup:function () {
            var target = this;
            if (nodeName(target, "input")
                || nodeName(target, "textarea")) {
                monitor(target);
            }
        },
        tearDown:function () {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires:["./base", "dom"]
});

/**
 * kissy delegate for event module
 * @author yiminghe@gmail.com
 */
KISSY.add("event/delegate", function(S, DOM, Event, Utils) {
    var batchForType = Utils.batchForType,
        delegateMap = {
            "focus":{
                type:"focusin"
            },
            "blur":{
                type:"focusout"
            },
            "mouseenter":{
                type:"mouseover",
                handler:mouseHandler
            },
            "mouseleave":{
                type:"mouseout",
                handler:mouseHandler
            }
        };

    S.mix(Event, {
        delegate:function(targets, type, selector, fn, scope) {
            if (batchForType(Event, 'delegate', targets, type, selector, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                var preType = type,handler = delegateHandler;
                if (delegateMap[type]) {
                    type = delegateMap[preType].type;
                    handler = delegateMap[preType].handler || handler;
                }
                Event.on(target, type, handler, target, {
                    fn:fn,
                    selector:selector,
                    preType:preType,
                    scope:scope,
                    equals:equals
                });
            });
            return targets;
        },

        undelegate:function(targets, type, selector, fn, scope) {
            if (batchForType(Event, 'undelegate', targets, type, selector, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                var preType = type,
                    handler = delegateHandler;
                if (delegateMap[type]) {
                    type = delegateMap[preType].type;
                    handler = delegateMap[preType].handler || handler;
                }
                Event.remove(target, type, handler, target, {
                    fn:fn,
                    selector:selector,
                    preType:preType,
                    scope:scope,
                    equals:equals
                });
            });
            return targets;
        }
    });

    // 姣旇緝鍑芥暟锛屼袱涓� delegate 鎻忚堪瀵硅薄姣旇緝
    // 娉ㄦ剰椤哄簭锛� 宸叉湁data 鍜� 鐢ㄦ埛鎻愪緵鐨� data 姣旇緝
    function equals(d, el) {
        // 鐢ㄦ埛涓嶆彁渚� fn selector 閭ｄ箞鑲畾鎴愬姛
        if (d.fn === undefined && d.selector === undefined) {
            return true;
        }
        // 鐢ㄦ埛涓嶆彁渚� fn 鍒欏彧姣旇緝 selector
        else if (d.fn === undefined) {
            return this.selector == d.selector;
        } else {
            var scope = this.scope || el,
                dScope = d.scope || el;
            return this.fn == d.fn && this.selector == d.selector && scope == dScope;
        }
    }

    // 鏍规嵁 selector 锛屼粠浜嬩欢婧愬緱鍒板搴旇妭鐐�
    function delegateHandler(event, data) {
        var delegateTarget = this,
            target = event.target,
            invokeds = DOM.closest(target, [data.selector], delegateTarget);

        // 鎵惧埌浜嗙鍚� selector 鐨勫厓绱狅紝鍙兘骞朵笉鏄簨浠舵簮
        return invokes.call(delegateTarget, invokeds, event, data);
    }

    // mouseenter/leave 鐗规畩澶勭悊
    function mouseHandler(event, data) {
        var delegateTarget = this,
            ret,
            target = event.target,
            relatedTarget = event.relatedTarget;
        // 鎭㈠涓虹敤鎴锋兂瑕佺殑 mouseenter/leave 绫诲瀷
        event.type = data.preType;
        // mouseenter/leave 涓嶄細鍐掓场锛屽彧閫夋嫨鏈€杩戜竴涓�
        target = DOM.closest(target, data.selector, delegateTarget);
        if (target) {
            if (target !== relatedTarget &&
                (!relatedTarget || !DOM.contains(target, relatedTarget))
                ) {
                var currentTarget = event.currentTarget;
                event.currentTarget = target;
                ret = data.fn.call(data.scope || delegateTarget, event);
                event.currentTarget = currentTarget;
            }
        }
        return ret;
    }


    function invokes(invokeds, event, data) {
        var self = this;
        if (invokeds) {
            // 淇濇姢 currentTarget
            // 鍚﹀垯 fire 褰卞搷 delegated listener 涔嬪悗姝ｅ父鐨� listener 浜嬩欢
            var currentTarget = event.currentTarget;
            for (var i = 0; i < invokeds.length; i++) {
                event.currentTarget = invokeds[i];
                var ret = data.fn.call(data.scope || self, event);
                // delegate 鐨� handler 鎿嶄綔浜嬩欢鍜屾牴鍏冪礌鏈韩鎿嶄綔浜嬩欢鏁堟灉涓€鑷�
                if (ret === false) {
                    event.halt();
                }
                if (event.isPropagationStopped) {
                    break;
                }
            }
            event.currentTarget = currentTarget;
        }
    }

    return Event;
}, {
    requires:["dom","./base","./utils"]
});

/**
 * focusin/out 鐨勭壒娈婁箣澶� , delegate 鍙兘鍦ㄥ鍣ㄤ笂娉ㄥ唽 focusin/out 锛�
 * 1.鍏跺疄闈� ie 閮芥槸娉ㄥ唽 focus capture=true锛岀劧鍚庢敞鍐屽埌 focusin 瀵瑰簲 handlers
 *   1.1 褰� Event.fire("focus")锛屾病鏈� focus 瀵瑰簲鐨� handlers 鏁扮粍锛岀劧鍚庤皟鐢ㄥ厓绱� focus 鏂规硶锛�
 *   focusin.js 璋冪敤 Event.fire("focusin") 杩涜€屾墽琛� focusin 瀵瑰簲鐨� handlers 鏁扮粍
 *   1.2 褰撹皟鐢� Event.fire("focusin")锛岀洿鎺ユ墽琛� focusin 瀵瑰簲鐨� handlers 鏁扮粍锛屼絾涓嶄細鐪熸鑱氱劍
 *
 * 2.ie 鐩存帴娉ㄥ唽 focusin , focusin handlers 涔熸湁瀵瑰簲鐢ㄦ埛鍥炶皟
 *   2.1 褰� Event.fire("focus") , 鍚� 1.1
 *   2.2 褰� Event.fire("focusin"),鐩存帴鎵ц focusin 瀵瑰簲鐨� handlers 鏁扮粍锛屼絾涓嶄細鐪熸鑱氱劍
 *
 * mouseenter/leave delegate 鐗规畩澶勭悊锛� mouseenter 娌℃湁鍐掓场鐨勬蹇碉紝鍙兘鏇挎崲涓� mouseover/out
 *
 * form submit 浜嬩欢 ie<9 涓嶄細鍐掓场
 *
 **/

/**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function(S, Event, DOM, UA) {

    if (!UA['ie']) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {


            // 鍏冪礌鍐呰Е鍙戠殑 mouseover/out 涓嶈兘绠� mouseenter/leave
            function withinElement(event) {

                var self = this,
                    parent = event.relatedTarget;

                // 璁剧疆鐢ㄦ埛瀹為檯娉ㄥ唽鐨勪簨浠跺悕锛岃Е鍙戣浜嬩欢鎵€瀵瑰簲鐨� listener 鏁扮粍
                event.type = o.name;

                // Firefox sometimes assigns relatedTarget a XUL element
                // which we cannot access the parentNode property of
                try {

                    // Chrome does something similar, the parentNode property
                    // can be accessed but is null.
                    if (parent && parent !== document && !parent.parentNode) {
                        return;
                    }

                    // 鍦ㄨ嚜韬杈瑰氨瑙﹀彂
                    if (parent !== self &&
                        // self==document , parent==null
                        (!parent || !DOM.contains(self, parent))
                        ) {
                        // handle event if we actually just moused on to a non sub-element
                        Event._handle(self, event);
                    }

                    // assuming we've left the element since we most likely mousedover a xul element
                } catch(e) {
                    S.log("withinElement error : ", "error");
                    S.log(e, "error");
                }
            }


            Event.special[o.name] = {

                // 绗竴娆� mouseenter 鏃舵敞鍐屼笅
                // 浠ュ悗閮界洿鎺ユ斁鍒� listener 鏁扮粍閲岋紝 鐢� mouseover 璇诲彇瑙﹀彂
                setup: function() {
                    Event.add(this, o.fix, withinElement);
                },

                //褰� listener 鏁扮粍涓虹┖鏃讹紝涔熸竻鎺� mouseover 娉ㄥ唽锛屼笉鍐嶈鍙�
                tearDown:function() {
                    Event.remove(this, o.fix, withinElement);
                }
            }
        });
    }

    return Event;
}, {
    requires:["./base","dom","ua"]
});

/**
 * 鎵跨帀锛�2011-06-07
 * - 鏍规嵁鏂扮粨鏋勶紝璋冩暣 mouseenter 鍏煎澶勭悊
 * - fire('mouseenter') 鍙互鐨勶紝鐩存帴鎵ц mouseenter 鐨� handlers 鐢ㄦ埛鍥炶皟鏁扮粍
 *
 *
 * TODO:
 *  - ie6 涓嬶紝鍘熺敓鐨� mouseenter/leave 璨屼技涔熸湁 bug, 姣斿 <div><div /><div /><div /></div>
 *    jQuery 涔熷紓甯革紝闇€瑕佽繘涓€姝ョ爺绌�
 */

/**
 * patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var nodeName = DOM._nodeName;
        Event.special['submit'] = {
            setup: function() {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // keypoint : find the forms
                Event.on(el, "click keypress", detector);
            },
            tearDown:function() {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                DOM.query("form", el).each(function(form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", submitBubble);
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                form = nodeName(t, "input") || nodeName(t, "button") ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", submitBubble);
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }


    }

}, {
    requires:["ua","./base","dom"]
});
/**
 * modified from jq ,fix submit in ie<9
 **/

/**
 * change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add("event/change", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        var rformElems = /^(?:textarea|input|select)$/i;

        function isFormElement(n) {
            return rformElems.test(n.nodeName);
        }

        function isCheckBoxOrRadio(el) {
            var type = el.type;
            return type == "checkbox" || type == "radio";
        }

        Event.special['change'] = {
            setup: function() {
                var el = this;
                if (isFormElement(el)) {
                    // checkbox/radio only fires change when blur in ie<9
                    // so use another technique from jquery
                    if (isCheckBoxOrRadio(el)) {
                        // change in ie<9
                        // change = propertychange -> click
                        Event.on(el, "propertychange", propertyChange);
                        Event.on(el, "click", onClick);
                    } else {
                        // other form elements use native , do not bubble
                        return false;
                    }
                } else {
                    // if bind on parentNode ,lazy bind change event to its form elements
                    // note event order : beforeactivate -> change
                    // note 2: checkbox/radio is exceptional
                    Event.on(el, "beforeactivate", beforeActivate);
                }
            },
            tearDown:function() {
                var el = this;
                if (isFormElement(el)) {
                    if (isCheckBoxOrRadio(el)) {
                        Event.remove(el, "propertychange", propertyChange);
                        Event.remove(el, "click", onClick);
                    } else {
                        return false;
                    }
                } else {
                    Event.remove(el, "beforeactivate", beforeActivate);
                    DOM.query("textarea,input,select", el).each(function(fel) {
                        if (fel.__changeHandler) {
                            fel.__changeHandler = 0;
                            Event.remove(fel, "change", changeHandler);
                        }
                    });
                }
            }
        };

        function propertyChange(e) {
            if (e.originalEvent.propertyName == "checked") {
                this.__changed = 1;
            }
        }

        function onClick(e) {
            if (this.__changed) {
                this.__changed = 0;
                // fire from itself
                Event.fire(this, "change", e);
            }
        }

        function beforeActivate(e) {
            var t = e.target;
            if (isFormElement(t) && !t.__changeHandler) {
                t.__changeHandler = 1;
                // lazy bind change
                Event.on(t, "change", changeHandler);
            }
        }

        function changeHandler(e) {
            var fel = this;
            // checkbox/radio already bubble using another technique
            if (isCheckBoxOrRadio(fel)) {
                return;
            }
            var p;
            if (p = fel.parentNode) {
                // fire from parent , itself is handled natively
                Event.fire(p, "change", e);
            }
        }

    }
}, {
    requires:["ua","./base","dom"]
});

/**
 * normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add("event/mousewheel", function(S, Event, UA, Utils, EventObject) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel',
        simpleRemove = Utils.simpleRemove,
        simpleAdd = Utils.simpleAdd,
        mousewheelHandler = "mousewheelHandler";

    function handler(e) {
        var deltaX,
            currentTarget = this,
            deltaY,
            delta,
            detail = e.detail;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            // press control e.detail == 1 else e.detail == 3
            delta = -(detail % 3 == 0 ? detail / 3 : detail);
        }

        // Gecko
        if (e.axis !== undefined) {
            if (e.axis === e['HORIZONTAL_AXIS']) {
                deltaY = 0;
                deltaX = -1 * delta;
            } else if (e.axis === e['VERTICAL_AXIS']) {
                deltaX = 0;
                deltaY = delta;
            }
        }

        // Webkit
        if (e['wheelDeltaY'] !== undefined) {
            deltaY = e['wheelDeltaY'] / 120;
        }
        if (e['wheelDeltaX'] !== undefined) {
            deltaX = -1 * e['wheelDeltaX'] / 120;
        }

        // 榛樿 deltaY ( ie )
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        // can not invoke eventDesc.handler , it will protect type
        // but here in firefox , we want to change type really
        e = new EventObject(currentTarget, e);

        S.mix(e, {
            deltaY:deltaY,
            delta:delta,
            deltaX:deltaX,
            type:'mousewheel'
        });

        return  Event._handle(currentTarget, e);
    }

    Event.special['mousewheel'] = {
        setup: function() {
            var el = this,
                mousewheelHandler,
                eventDesc = Event._data(el);
            // solve this in ie
            mousewheelHandler = eventDesc[mousewheelHandler] = S.bind(handler, el);
            simpleAdd(this, MOUSE_WHEEL, mousewheelHandler);
        },
        tearDown:function() {
            var el = this,
                mousewheelHandler,
                eventDesc = Event._data(el);
            mousewheelHandler = eventDesc[mousewheelHandler];
            simpleRemove(this, MOUSE_WHEEL, mousewheelHandler);
            delete eventDesc[mousewheelHandler];
        }
    };

}, {
    requires:['./base','ua','./utils','./object']
});

/**
 note:
 not perfect in osx : accelerated scroll
 refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 **/

/**
 * KISSY Scalable Event Framework
 * @author yiminghe@gmail.com
 */
KISSY.add("event", function(S, KeyCodes, Event, Target, Object) {
    Event.KeyCodes = KeyCodes;
    Event.Target = Target;
    Event.Object = Object;
    return Event;
}, {
    requires:[
        "event/keycodes",
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/delegate",
        "event/mouseenter",
        "event/submit",
        "event/change",
        "event/mousewheel"
    ]
});

/**
 * definition for node and nodelist
 * @author yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add("node/base", function(S, DOM, undefined) {

    var AP = Array.prototype,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

    /**
     * The NodeList class provides a wrapper for manipulating DOM Node.
     * @constructor
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,
            domNode;

        if (!(self instanceof NodeList)) {
            return new NodeList(html, props, ownerDocument);
        }

        // handle NodeList(''), NodeList(null), or NodeList(undefined)
        if (!html) {
            return undefined;
        }

        else if (S.isString(html)) {
            // create from html
            domNode = DOM.create(html, props, ownerDocument);
            // ('<p>1</p><p>2</p>') 杞崲涓� NodeList
            if (domNode.nodeType === DOM.DOCUMENT_FRAGMENT_NODE) { // fragment
                AP.push.apply(this, makeArray(domNode.childNodes));
                return undefined;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            AP.push.apply(this, makeArray(html));
            return undefined;
        }

        else {
            // node, document, window
            domNode = html;
        }

        self[0] = domNode;
        self.length = 1;
        return undefined;
    }

    S.augment(NodeList, {

        /**
         * 榛樿闀垮害涓� 0
         */
        length: 0,


        item: function(index) {
            var self = this;
            if (S.isNumber(index)) {
                if (index >= self.length) {
                    return null;
                } else {
                    return new NodeList(self[index]);
                }
            } else {
                return new NodeList(index);
            }
        },

        add:function(selector, context, index) {
            if (S.isNumber(context)) {
                index = context;
                context = undefined;
            }
            var list = NodeList.all(selector, context).getDOMNodes(),
                ret = new NodeList(this);
            if (index === undefined) {
                AP.push.apply(ret, list);
            } else {
                var args = [index,0];
                args.push.apply(args, list);
                AP.splice.apply(ret, args);
            }
            return ret;
        },

        slice:function(start, end) {
            return new NodeList(AP.slice.call(this, start, end));
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function() {
            return AP.slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
         * @param context An optional context to apply the function with Default context is the current NodeList instance
         */
        each: function(fn, context) {
            var self = this;

            S.each(self, function(n, i) {
                n = new NodeList(n);
                return fn.call(context || n, n, i, self);
            });

            return self;
        },
        /**
         * Retrieves the DOMNode.
         */
        getDOMNode: function() {
            return this[0];
        },

        /**
         * stack sub query
         */
        end:function() {
            var self = this;
            return self.__parent || self;
        },

        all:function(selector) {
            var ret,self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        one:function(selector) {
            var self = this,all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    });

    S.mix(NodeList, {
        /**
         * 鏌ユ壘浣嶄簬涓婁笅鏂囦腑骞朵笖绗﹀悎閫夋嫨鍣ㄥ畾涔夌殑鑺傜偣鍒楄〃鎴栨牴鎹� html 鐢熸垚鏂拌妭鐐�
         * @param {String|HTMLElement[]|NodeList} selector html 瀛楃涓叉垨<a href='http://docs.kissyui.com/docs/html/api/core/dom/selector.html'>閫夋嫨鍣�</a>鎴栬妭鐐瑰垪琛�
         * @param {String|Array<HTMLElement>|NodeList|HTMLElement|Document} [context] 涓婁笅鏂囧畾涔�
         * @returns {NodeList} 鑺傜偣鍒楄〃瀵硅薄
         */
        all:function(selector, context) {
            // are we dealing with html string ?
            // TextNode 浠嶉渶瑕佽嚜宸� new Node

            if (S.isString(selector)
                && (selector = S.trim(selector))
                && selector.length >= 3
                && S.startsWith(selector, "<")
                && S.endsWith(selector, ">")
                ) {
                if (context) {
                    if (context.getDOMNode) {
                        context = context.getDOMNode();
                    }
                    if (context.ownerDocument) {
                        context = context.ownerDocument;
                    }
                }
                return new NodeList(selector, undefined, context);
            }
            return new NodeList(DOM.query(selector, context));
        },
        one:function(selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    S.mix(NodeList, DOM._NODE_TYPE);

    return NodeList;
}, {
    requires:["dom"]
});


/**
 * Notes:
 * 2011-05-25
 *  - 鎵跨帀锛氬弬鑰� jquery锛屽彧鏈変竴涓� NodeList 瀵硅薄锛孨ode 灏辨槸 NodeList 鐨勫埆鍚�
 *
 *  2010.04
 *   - each 鏂规硶浼犵粰 fn 鐨� this, 鍦� jQuery 閲屾寚鍚戝師鐢熷璞★紝杩欐牱鍙互閬垮厤鎬ц兘闂銆�
 *     浣嗕粠鐢ㄦ埛瑙掑害璁诧紝this 鐨勭涓€鐩磋鏄� $(this), kissy 鍜� yui3 淇濇寔涓€鑷达紝鐗虹壊
 *     鎬ц兘锛屼互鏄撶敤涓洪銆�
 *   - 鏈変簡 each 鏂规硶锛屼技涔庝笉鍐嶉渶瑕� import 鎵€鏈� dom 鏂规硶锛屾剰涔変笉澶с€�
 *   - dom 鏄綆绾� api, node 鏄腑绾� api, 杩欐槸鍒嗗眰鐨勪竴涓師鍥犮€傝繕鏈変竴涓師鍥犳槸锛屽鏋�
 *     鐩存帴鍦� node 閲屽疄鐜� dom 鏂规硶锛屽垯涓嶅ぇ濂藉皢 dom 鐨勬柟娉曡€﹀悎鍒� nodelist 閲屻€傚彲
 *     浠ヨ锛屾妧鏈垚鏈細鍒剁害 api 璁捐銆�
 */

/**
 * import methods from DOM to NodeList.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        makeArray = S.makeArray,
    // DOM 娣诲姞鍒� NP 涓婄殑鏂规硶
    // if DOM methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            "equals",
            "contains",
            "scrollTop",
            "scrollLeft",
            "height",
            "width",
            "innerHeight",
            "innerWidth",
            "outerHeight",
            "outerWidth",
            "addStyleSheet",
            // "append" will be overridden
            "appendTo",
            // "prepend" will be overridden
            "prependTo",
            "insertBefore",
            "before",
            "after",
            "insertAfter",
            "test",
            "hasClass",
            "addClass",
            "removeClass",
            "replaceClass",
            "toggleClass",
            "removeAttr",
            "hasAttr",
            "hasProp",
            // anim override
//            "show",
//            "hide",
//            "toggle",
            "scrollIntoView",
            "remove",
            "empty",
            "removeData",
            "hasData",
            "unselectable"
        ],
    // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            "filter",
            "first",
            "last",
            "parent",
            "closest",
            "next",
            "prev",
            "clone",
            "siblings",
            "children"
        ],
    // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            "attr":1,
            "text":0,
            "css":1,
            "style":1,
            "val":0,
            "prop":1,
            "offset":0,
            "html":0,
            "data":1
        },
    // Event 娣诲姞鍒� NP 涓婄殑鏂规硶
        EVENT_INCLUDES = ["on","detach","fire","delegate","undelegate"];


    function accessNorm(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        return ret;
    }

    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        else if (ret === null) {
            return null;
        }
        return new NodeList(ret);
    }

    function accessNormIf(fn, self, index, args) {

        // get
        if (args[index] === undefined
            // 骞朵笖绗竴涓弬鏁颁笉鏄璞★紝鍚﹀垯鍙兘鏄壒閲忚缃啓
            && !S.isObject(args[0])) {
            args.unshift(self);
            return DOM[fn].apply(DOM, args);
        }
        // set
        return accessNorm(fn, self, args);
    }

    S.each(DOM_INCLUDES_NORM, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function(index, k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function(k) {
        NLP[k] = function() {
            var self=this,
                args = makeArray(arguments);
            args.unshift(self);
            Event[k].apply(Event, args);
            return self;
        }
    });

}, {
    requires:["dom","event","./base"]
});

/**
 * 2011-05-24
 *  - 鎵跨帀锛�
 *  - 灏� DOM 涓殑鏂规硶鍖呰鎴� NodeList 鏂规硶
 *  - Node 鏂规硶璋冪敤鍙傛暟涓殑 KISSY NodeList 瑕佽浆鎹㈡垚绗竴涓� HTML Node
 *  - 瑕佹敞鎰忛摼寮忚皟鐢紝濡傛灉 DOM 鏂规硶杩斿洖 undefined 锛堟棤杩斿洖鍊硷級锛屽垯 NodeList 瀵瑰簲鏂规硶杩斿洖 this
 *  - 瀹為檯涓婂彲浠ュ畬鍏ㄤ娇鐢� NodeList 鏉ヤ唬鏇� DOM锛屼笉鍜岃妭鐐瑰叧鑱旂殑鏂规硶濡傦細viewportHeight 绛夛紝鍦� window锛宒ocument 涓婅皟鐢�
 *  - 瀛樺湪 window/document 铏氳妭鐐癸紝閫氳繃 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 鑾峰緱
 */

/**
 * overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Event, NodeList) {

    /**
     * append(node ,parent) : 鍙傛暟椤哄簭鍙嶈繃鏉ヤ簡
     * appendTo(parent,node) : 鎵嶆槸姝ｅ父
     *
     */
    S.each(['append', 'prepend','before','after'], function(insertType) {

        NodeList.prototype[insertType] = function(html) {

            var newNode = html,self = this;
            // 鍒涘缓
            if (S.isString(newNode)) {
                newNode = DOM.create(newNode);
            }
            if (newNode) {
                DOM[insertType](newNode, self);
            }
            return self;

        };
    });

}, {
    requires:["dom","event","./base","./attach"]
});

/**
 * 2011-05-24
 * - 鎵跨帀锛�
 * - 閲嶅啓 NodeList 鐨勬煇浜涙柟娉�
 * - 娣诲姞 one ,all 锛屼粠褰撳墠 NodeList 寰€涓嬪紑濮嬮€夋嫨鑺傜偣
 * - 澶勭悊 append ,prepend 鍜� DOM 鐨勫弬鏁板疄闄呬笂鏄弽杩囨潵鐨�
 * - append/prepend 鍙傛暟鏄妭鐐规椂锛屽鏋滃綋鍓� NodeList 鏁伴噺 > 1 闇€瑕佺粡杩� clone锛屽洜涓哄悓涓€鑺傜偣涓嶅彲鑳借娣诲姞鍒板涓妭鐐逛腑鍘伙紙NodeList锛�
 */

/**
 * @module anim-easing
 */
KISSY.add('anim/easing', function() {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 鍜� YUI 鐨� Easing 鐩告瘮锛孲.Easing 杩涜浜嗗綊涓€鍖栧鐞嗭紝鍙傛暟璋冩暣涓猴細
     * @param {Number} t Time value used to compute current value  淇濈暀 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        BACK_CONST = 1.70158,

        Easing = {

            swing:function(t) {
                return ( -Math.cos(t * PI) / 2 ) + 0.5;
            },

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },

            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    Easing.NativeTimeFunction = {
        easeNone: 'linear',
        ease: 'ease',

        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeBoth: 'ease-in-out',

        // Ref:
        //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        //  2. http://www.robertpenner.com/easing/easing_demo.html
        //  3. assets/cubic-bezier-timing-function.html
        // 娉細鏄ā鎷熷€硷紝闈炵簿纭帹瀵煎€�
        easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
        easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
        easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
    };

    return Easing;
});

/**
 * TODO:
 *  - test-easing.html 璇︾粏鐨勬祴璇� + 鏇茬嚎鍙鍖�
 *
 * NOTES:
 *  - 缁煎悎姣旇緝 jQuery UI/scripty2/YUI 鐨� easing 鍛藉悕锛岃繕鏄寰� YUI 鐨勫鐢ㄦ埛
 *    鏈€鍙嬪ソ銆傚洜姝よ繖娆″畬鍏ㄧ収鎼� YUI 鐨� Easing, 鍙槸浠ｇ爜涓婂仛浜嗙偣鍘嬬缉浼樺寲銆�
 *
 */

/**
 * single timer for the whole anim module
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var stamp = S.stamp;

    return {
        interval:15,
        runnings:{},
        timer:null,
        start:function(anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
            }
        },
        pause:function(anim) {
            this.notRun(anim);
        },
        resume:function(anim) {
            this.start(anim);
        },
        startTimer:function() {
            var self = this;
            if (!self.timer) {
                self.timer = setTimeout(function() {
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames:function() {
            var self = this,
                done = 1,
                runnings = self.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = 0;
                    runnings[r]._frame();
                }
            }
            return done;
        }
    };
});

/**
 * animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/fx", function(S, DOM, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @param cfg
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    S.augment(Fx, {

        load:function(cfg) {
            var self = this;
            S.mix(self, cfg);
            self.startTime = S.now();
            self.pos = 0;
            self.unit = self.unit || "";
        },

        frame:function(end) {
            var self = this,
                endFlag = 0,
                elapsedTime,
                t = S.now();
            if (end || t >= self.duration + self.startTime) {
                self.pos = 1;
                endFlag = 1;
            } else {
                elapsedTime = t - self.startTime;
                self.pos = self.easing(elapsedTime / self.duration);
            }
            self.update();
            return endFlag;
        },

        /**
         * 鏁板€兼彃鍊煎嚱鏁�
         * @param {Number} from 婧愬€�
         * @param {Number} to 鐩殑鍊�
         * @param {Number} pos 褰撳墠浣嶇疆锛屼粠 easing 寰楀埌 0~1
         * @return {Number} 褰撳墠鍊�
         */
        interpolate:function (from, to, pos) {
            // 榛樿鍙鏁板瓧杩涜 easing
            if (S.isNumber(from) &&
                S.isNumber(to)) {
                return (from + (to - from) * pos).toFixed(3);
            } else {
                return undefined;
            }
        },

        update:function() {
            var self = this,
                prop = self.prop,
                elem = self.elem,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === undefined) {
                // 鎻掑€煎嚭閿欙紝鐩存帴璁剧疆涓烘渶缁堝€�
                if (!self.finished) {
                    self.finished = 1;
                    DOM.css(elem, prop, to);
                    S.log(self.prop + " update directly ! : " + val + " : " + from + " : " + to);
                }
            } else {
                val += self.unit;
                if (isAttr(elem, prop)) {
                    DOM.attr(elem, prop, val, 1);
                } else {
                    DOM.css(elem, prop, val);
                }
            }
        },

        /**
         * current value
         */
        cur:function() {
            var self = this,
                prop = self.prop,
                elem = self.elem;
            if (isAttr(elem, prop)) {
                return DOM.attr(elem, prop, undefined, 1);
            }
            var parsed,
                r = DOM.css(elem, prop);
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === "auto" ? 0 : r
                : parsed;
        }
    });

    function isAttr(elem, prop) {
        // support scrollTop/Left now!
        if ((!elem.style || elem.style[ prop ] == null) &&
            DOM.attr(elem, prop, undefined, 1) != null) {
            return 1;
        }
        return 0;
    }

    Fx.Factories = {};

    Fx.getFx = function(cfg) {
        var Constructor = Fx.Factories[cfg.prop] || Fx;
        return new Constructor(cfg);
    };

    return Fx;

}, {
    requires:['dom']
});
/**
 * TODO
 * 鏀寔 transform ,ie 浣跨敤 matrix
 *  - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 *  - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 *  - 鏍囧噯锛歨ttp://www.zenelements.com/blog/css3-transform/
 *  - ie: http://www.useragentman.com/IETransformsTranslator/
 *  - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 *  - jq 鎻掍欢: http://plugins.jquery.com/project/2d-transform
 **/

/**
 * queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/queue", function(S, DOM) {

    var /*闃熷垪闆嗗悎瀹瑰櫒*/
        queueCollectionKey = S.guid("ks-queue-" + S.now() + "-"),
    /*榛樿闃熷垪*/
        queueKey = S.guid("ks-queue-" + S.now() + "-"),
    // 褰撳墠闃熷垪鏄惁鏈夊姩鐢绘鍦ㄦ墽琛�
        processing = "...";

    function getQueue(elem, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(elem, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(elem, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    function removeQueue(elem, name) {
        name = name || queueKey;
        var quCollection = DOM.data(elem, queueCollectionKey);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(elem, queueCollectionKey);
        }
    }

    var q = {

        queueCollectionKey:queueCollectionKey,

        queue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues:function(elem) {
            DOM.removeData(elem, queueCollectionKey);
        },

        removeQueue:removeQueue,

        dequeue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(elem, name);
            }
        }

    };
    return q;
}, {
    requires:['dom']
});

/**
 * animation framework for KISSY
 * @author   yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, Fx, Q) {

    var camelCase = DOM._camelCase,
        _isElementNode = DOM._isElementNode,
        specialVals = ["hide","show","toggle"],
    // shorthand css properties
        SHORT_HANDS = {
            border:[
                "borderBottomWidth",
                "borderLeftWidth",
                'borderRightWidth',
                // 'borderSpacing', 缁勫悎灞炴€э紵
                'borderTopWidth'
            ],
            "borderBottom":["borderBottomWidth"],
            "borderLeft":["borderLeftWidth"],
            borderTop:["borderTopWidth"],
            borderRight:["borderRightWidth"],
            font:[
                'fontSize',
                'fontWeight'
            ],
            margin:[
                'marginBottom',
                'marginLeft',
                'marginRight',
                'marginTop'
            ],
            padding:[
                'paddingBottom',
                'paddingLeft',
                'paddingRight',
                'paddingTop'
            ]
        },
        defaultConfig = {
            duration: 1,
            easing: 'easeNone'
        },
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    Anim.SHORT_HANDS = SHORT_HANDS;


    /**
     * get a anim instance associate
     * @param elem 鍏冪礌鎴栬€� window 锛� window 鏃跺彧鑳藉姩鐢� scrollTop/scrollLeft 锛�
     * @param props
     * @param duration
     * @param easing
     * @param callback
     */
    function Anim(elem, props, duration, easing, callback) {
        var self = this,config;

        // ignore non-exist element
        if (!(elem = DOM.get(elem))) {
            return;
        }

        // factory or constructor
        if (!(self instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback);
        }

        /**
         * the transition properties
         */
        if (S.isString(props)) {
            props = S.unparam(props, ";", ":");
        } else {
            // clone to prevent collision within multiple instance
            props = S.clone(props);
        }

        /**
         * 椹煎嘲灞炴€у悕
         */
        for (var prop in props) {
            var camelProp = camelCase(S.trim(prop));
            if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        }

        /**
         * animation config
         */
        if (S.isPlainObject(duration)) {
            config = S.clone(duration);
        } else {
            config = {
                duration:parseFloat(duration) || undefined,
                easing:easing,
                complete:callback
            };
        }

        config = S.merge(defaultConfig, config);
        self.config = config;
        config.duration *= 1000;

        // domEl deprecated!
        self.elem = self['domEl'] = elem;
        self.props = props;

        // 瀹炰緥灞炴€�
        self._backupProps = {};
        self._fxs = {};

        // register callback
        self.on("complete", onComplete);
    }


    function onComplete(e) {
        var self = this,
            _backupProps = self._backupProps,
            config = self.config;

        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            DOM.css(self.elem, _backupProps);
        }

        if (config.complete) {
            config.complete.call(self, e);
        }
    }

    function runInternal() {
        var self = this,
            config = self.config,
            _backupProps = self._backupProps,
            elem = self.elem,
            hidden,
            val,
            prop,
            specialEasing = (config['specialEasing'] || {}),
            fxs = self._fxs,
            props = self.props;

        // 杩涘叆璇ュ嚱鏁板嵆浠ｈ〃鎵ц锛坬[0] 宸茬粡鏄� ...锛�
        saveRunning(self);

        if (self.fire("start") === false) {
            // no need to invoke complete
            self.stop(0);
            return;
        }

        if (_isElementNode(elem)) {
            hidden = DOM.css(elem, "display") == "none";
            for (prop in props) {
                val = props[prop];
                // 鐩存帴缁撴潫
                if (val == "hide" && hidden || val == 'show' && !hidden) {
                    // need to invoke complete
                    self.stop(1);
                    return;
                }
            }
        }

        // 鍒嗙 easing
        S.each(props, function(val, prop) {
            if (!props.hasOwnProperty(prop)) {
                return;
            }
            var easing;
            if (S.isArray(val)) {
                easing = specialEasing[prop] = val[1];
                props[prop] = val[0];
            } else {
                easing = specialEasing[prop] = (specialEasing[prop] || config.easing);
            }
            if (S.isString(easing)) {
                easing = specialEasing[prop] = Easing[easing];
            }
            specialEasing[prop] = easing || Easing.easeNone;
        });


        // 鎵╁睍鍒嗗睘鎬�
        S.each(SHORT_HANDS, function(shortHands, p) {
            var sh,
                origin,
                val;
            if (val = props[p]) {
                origin = {};
                S.each(shortHands, function(sh) {
                    // 寰楀埌鍘熷鍒嗗睘鎬т箣鍓嶅€�
                    origin[sh] = DOM.css(elem, sh);
                    specialEasing[sh] = specialEasing[p];
                });
                DOM.css(elem, p, val);
                for (sh in origin) {
                    // 寰楀埌鏈熷緟鐨勫垎灞炴€ф渶鍚庡€�
                    props[sh] = DOM.css(elem, sh);
                    // 杩樺師
                    DOM.css(elem, sh, origin[sh]);
                }
                // 鍒犻櫎澶嶅悎灞炴€�
                delete props[p];
            }
        });

        // 鍙栧緱鍗曚綅锛屽苟瀵瑰崟涓睘鎬ф瀯寤� Fx 瀵硅薄
        for (prop in props) {
            if (!props.hasOwnProperty(prop)) {
                continue;
            }

            val = S.trim(props[prop]);

            var to,
                from,
                propCfg = {
                    elem:elem,
                    prop:prop,
                    duration:config.duration,
                    easing:specialEasing[prop]
                },
                fx = Fx.getFx(propCfg);

            // hide/show/toggle : special treat!
            if (S.inArray(val, specialVals)) {
                // backup original value
                _backupProps[prop] = DOM.style(elem, prop);
                if (val == "toggle") {
                    val = hidden ? "show" : "hide";
                }
                if (val == "hide") {
                    to = 0;
                    from = fx.cur();
                    // 鎵ц瀹屽悗闅愯棌
                    _backupProps.display = 'none';
                } else {
                    from = 0;
                    to = fx.cur();
                    // prevent flash of content
                    DOM.css(elem, prop, from);
                    DOM.show(elem);
                }
                val = to;
            } else {
                to = val;
                from = fx.cur();
            }

            val += "";

            var unit = "",
                parts = val.match(rfxnum);

            if (parts) {
                to = parseFloat(parts[2]);
                unit = parts[3];

                // 鏈夊崟浣嶄絾鍗曚綅涓嶆槸 px
                if (unit && unit !== "px") {
                    DOM.css(elem, prop, val);
                    from = (to / fx.cur()) * from;
                    DOM.css(elem, prop, from + unit);
                }

                // 鐩稿
                if (parts[1]) {
                    to = ( (parts[ 1 ] === "-=" ? -1 : 1) * to ) + from;
                }
            }

            propCfg.from = from;
            propCfg.to = to;
            propCfg.unit = unit;
            fx.load(propCfg);
            fxs[prop] = fx;
        }

        if (_isElementNode(elem) &&
            (props.width || props.height)) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE does not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            S.mix(_backupProps, {
                overflow:DOM.style(elem, "overflow"),
                "overflow-x":DOM.style(elem, "overflowX"),
                "overflow-y":DOM.style(elem, "overflowY")
            });
            DOM.css(elem, "overflow", "hidden");
            // inline element should has layout/inline-block
            if (DOM.css(elem, "display") === "inline" &&
                DOM.css(elem, "float") === "none") {
                if (UA['ie']) {
                    DOM.css(elem, "zoom", 1);
                } else {
                    DOM.css(elem, "display", "inline-block");
                }
            }
        }

        AM.start(self);
    }


    S.augment(Anim, Event.Target, {

        /**
         * @type {boolean} 鏄惁鍦ㄨ繍琛�
         */
        isRunning:function() {
            return isRunning(this);
        },

        _runInternal:runInternal,

        /**
         * 寮€濮嬪姩鐢�
         */
        run: function() {
            var self = this,
                queueName = self.config.queue;

            if (queueName === false) {
                runInternal.call(self);
            } else {
                // 褰撳墠鍔ㄧ敾瀵硅薄鍔犲叆闃熷垪
                Q.queue(self);
            }

            return self;
        },

        _frame:function() {

            var self = this,
                prop,
                end = 1,
                fxs = self._fxs;

            for (prop in fxs) {
                if (fxs.hasOwnProperty(prop)) {
                    end &= fxs[prop].frame();
                }
            }

            if ((self.fire("step") === false) ||
                end) {
                // complete 浜嬩欢鍙湪鍔ㄧ敾鍒拌揪鏈€鍚庝竴甯ф椂鎵嶈Е鍙�
                self.stop(end);
            }
        },

        stop: function(finish) {
            var self = this,
                config = self.config,
                queueName = config.queue,
                prop,
                fxs = self._fxs;

            // already stopped
            if (!self.isRunning()) {
                // 浠庤嚜宸辩殑闃熷垪涓Щ闄�
                if (queueName !== false) {
                    Q.remove(self);
                }
                return;
            }

            if (finish) {
                for (prop in fxs) {
                    if (fxs.hasOwnProperty(prop)) {
                        fxs[prop].frame(1);
                    }
                }
                self.fire("complete");
            }

            AM.stop(self);

            removeRunning(self);

            if (queueName !== false) {
                // notify next anim to run in the same queue
                Q.dequeue(self);
            }

            return self;
        }
    });

    var runningKey = S.guid("ks-anim-unqueued-" + S.now() + "-");

    function saveRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (!allRunning) {
            DOM.data(elem, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(elem, runningKey);
            }
        }
    }

    function isRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }

    /**
     * stop all the anims currently running
     * @param elem element which anim belongs to
     * @param end
     * @param clearQueue
     */
    Anim.stop = function(elem, end, clearQueue, queueName) {
        if (
        // default queue
            queueName === null ||
                // name of specified queue
                S.isString(queueName) ||
                // anims not belong to any queue
                queueName === false
            ) {
            return stopQueue.apply(undefined, arguments);
        }
        // first stop first anim in queues
        if (clearQueue) {
            Q.removeQueues(elem);
        }
        var allRunning = DOM.data(elem, runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allRunning);
        for (var k in anims) {
            anims[k].stop(end);
        }
    };

    /**
     *
     * @param elem element which anim belongs to
     * @param queueName queue'name if set to false only remove
     * @param end
     * @param clearQueue
     */
    function stopQueue(elem, end, clearQueue, queueName) {
        if (clearQueue && queueName !== false) {
            Q.removeQueue(elem, queueName);
        }
        var allRunning = DOM.data(elem, runningKey),
            anims = S.merge(allRunning);
        for (var k in anims) {
            var anim = anims[k];
            if (anim.config.queue == queueName) {
                anim.stop(end);
            }
        }
    }

    /**
     * whether elem is running anim
     * @param elem
     */
    Anim['isRunning'] = function(elem) {
        var allRunning = DOM.data(elem, runningKey);
        return allRunning && !S.isEmptyObject(allRunning);
    };

    Anim.Q = Q;

    if (SHORT_HANDS) {
    }
    return Anim;
}, {
    requires:["dom","event","./easing","ua","./manager","./fx","./queue"]
});

/**
 * 2011-11
 * - 閲嶆瀯锛屾姏寮� emile锛屼紭鍖栨€ц兘锛屽彧瀵归渶瑕佺殑灞炴€ц繘琛屽姩鐢�
 * - 娣诲姞 stop/stopQueue/isRunning锛屾敮鎸侀槦鍒楃鐞�
 *
 * 2011-04
 * - 鍊熼壌 yui3 锛屼腑澶畾鏃跺櫒锛屽惁鍒� ie6 鍐呭瓨娉勯湶锛�
 * - 鏀寔閰嶇疆 scrollTop/scrollLeft
 *
 *
 * TODO:
 *  - 鏁堢巼闇€瑕佹彁鍗囷紝褰撲娇鐢� nativeSupport 鏃朵粛鍋氫簡杩囧鍔ㄤ綔
 *  - opera nativeSupport 瀛樺湪 bug 锛屾祻瑙堝櫒鑷韩 bug ?
 *  - 瀹炵幇 jQuery Effects 鐨� queue / specialEasing / += / 绛夌壒鎬�
 *
 * NOTES:
 *  - 涓� emile 鐩告瘮锛屽鍔犱簡 borderStyle, 浣垮緱 border: 5px solid #ccc 鑳戒粠鏃犲埌鏈夛紝姝ｇ‘鏄剧ず
 *  - api 鍊熼壌浜� YUI, jQuery 浠ュ強 http://www.w3.org/TR/css3-transitions/
 *  - 浠ｇ爜瀹炵幇浜嗗€熼壌浜� Emile.js: http://github.com/madrobby/emile *
 */

/**
 * special patch for making color gradual change
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim, Fx) {

    var HEX_BASE = 16,

        floor = Math.floor,

        KEYWORDS = {
            "black":[0,0,0],
            "silver":[192,192,192],
            "gray":[128,128,128],
            "white":[255,255,255],
            "maroon":[128,0,0],
            "red":[255,0,0],
            "purple":[128,0,128],
            "fuchsia":[255,0,255],
            "green":[0,128,0],
            "lime":[0,255,0],
            "olive":[128,128,0],
            "yellow":[255,255,0],
            "navy":[0,0,128],
            "blue":[0,0,255],
            "teal":[0,128,128],
            "aqua":[0,255,255]
        },
        re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,

        re_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i,

        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i,

        SHORT_HANDS = Anim.SHORT_HANDS,

        COLORS = [
            'backgroundColor' ,
            'borderBottomColor' ,
            'borderLeftColor' ,
            'borderRightColor' ,
            'borderTopColor' ,
            'color' ,
            'outlineColor'
        ];

    SHORT_HANDS['background'] = ['backgroundColor'];

    SHORT_HANDS['borderColor'] = [
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    ];

    SHORT_HANDS['border'].push(
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    );

    SHORT_HANDS['borderBottom'].push(
        'borderBottomColor'
    );

    SHORT_HANDS['borderLeft'].push(
        'borderLeftColor'
    );

    SHORT_HANDS['borderRight'].push(
        'borderRightColor'
    );

    SHORT_HANDS['borderTop'].push(
        'borderTopColor'
    );

    //寰楀埌棰滆壊鐨勬暟鍊艰〃绀猴紝绾㈢豢钃濇暟瀛楁暟缁�
    function numericColor(val) {
        val = (val + "");
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        }
        else if (match = val.match(re_RGBA)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3]),
                parseInt(match[4])
            ];
        }
        else if (match = val.match(re_hex)) {
            for (var i = 1; i < match.length; i++) {
                if (match[i].length < 2) {
                    match[i] += match[i];
                }
            }
            return [
                parseInt(match[1], HEX_BASE),
                parseInt(match[2], HEX_BASE),
                parseInt(match[3], HEX_BASE)
            ];
        }
        if (KEYWORDS[val = val.toLowerCase()]) {
            return KEYWORDS[val];
        }

        //transparent 鎴栬€� 棰滆壊瀛楃涓茶繑鍥�
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }

    function ColorFx() {
        ColorFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(ColorFx, Fx, {

        load:function() {
            var self = this;
            ColorFx.superclass.load.apply(self, arguments);
            if (self.from) {
                self.from = numericColor(self.from);
            }
            if (self.to) {
                self.to = numericColor(self.to);
            }
        },

        interpolate:function (from, to, pos) {
            var interpolate = ColorFx.superclass.interpolate;
            if (from.length == 3 && to.length == 3) {
                return 'rgb(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos))
                ].join(', ') + ')';
            } else if (from.length == 4 || to.length == 4) {
                return 'rgba(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos)),
                    // 閫忔槑搴﹂粯璁� 1
                    floor(interpolate(from[3] || 1, to[3] || 1, pos))
                ].join(', ') + ')';
            } else {
                S.log("anim/color unknown value : " + from);
            }
        }

    });

    S.each(COLORS, function(color) {
        Fx.Factories[color] = ColorFx;
    });

    return ColorFx;

}, {
    requires:["dom","./base","./fx"]
});

/**
 * TODO
 * 鏀寔 hsla
 *  - https://github.com/jquery/jquery-color/blob/master/jquery.color.js
 **/

KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color"]
});

/**
 * @module  anim-node-plugin
 * @author  yiminghe@gmail.com,
 *          lifesinger@gmail.com,
 *          qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function(S, DOM, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
        // width animations
        [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
        // opacity animations
        [ "opacity" ]
    ];

    function getFxs(type, num, from) {
        var ret = [],
            obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }

    S.augment(Node, {
        animate:function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return self;
        },
        stop:function(end, clearQueue, queue) {
            var self = this;
            S.each(self, function(elem) {
                Anim.stop(elem, end, clearQueue, queue);
            });
            return self;
        },
        isRunning:function() {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isRunning(self[i])) {
                    return 1;
                }
            }
            return 0;
        }
    });

    S.each({
            show: getFxs("show", 3),
            hide: getFxs("hide", 3),
            toggle:getFxs("toggle", 3),
            fadeIn: getFxs("show", 3, 2),
            fadeOut: getFxs("hide", 3, 2),
            fadeToggle:getFxs("toggle", 3, 2),
            slideDown: getFxs("show", 1),
            slideUp: getFxs("hide", 1),
            slideToggle:getFxs("toggle", 1)
        },
        function(v, k) {
            Node.prototype[k] = function(speed, callback, easing) {
                var self = this;
                // 娌℃湁鍙傛暟鏃讹紝璋冪敤 DOM 涓殑瀵瑰簲鏂规硶
                if (DOM[k] && !speed) {
                    DOM[k](self);
                } else {
                    S.each(self, function(elem) {
                        Anim(elem, v, speed, easing || 'easeOut', callback).run();
                    });
                }
                return self;
            };
        });

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-11-10
 *  - 閲嶅啓锛岄€昏緫鏀惧埌 Anim 妯″潡锛岃繖杈瑰彧杩涜杞彂
 *
 * 2011-05-17
 *  - 鎵跨帀锛氭坊鍔� stop 锛岄殢鏃跺仠姝㈠姩鐢�
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */

KISSY.add("node", function(S, Event, Node) {
    Node.KeyCodes = Event.KeyCodes;
    return Node;
}, {
    requires:[
        "event",
        "node/base",
        "node/attach",
        "node/override",
        "node/anim"]
});

/*
 http://www.JSON.org/json2.js
 2010-08-25

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

KISSY.add("json/json2", function(S, UA) {
    var win = window,JSON = win.JSON;
    // ie 8.0.7600.16315@win7 json 鏈夐棶棰�
    if (!JSON || UA['ie'] < 9) {
        JSON = win.JSON = {};
    }

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable['lastIndex'] = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx['lastIndex'] = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
    return JSON;
}, {requires:['ua']});

/**
 * adapt json2 to kissy
 * @author lifesinger@gmail.com
 */
KISSY.add('json', function (S, JSON) {

    return {

        parse: function(text) {
            // 褰撹緭鍏ヤ负 undefined / null / '' 鏃讹紝杩斿洖 null
            if (S.isNullOrUndefined(text) || text === '') {
                return null;
            }
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
}, {
    requires:["json/json2"]
});

/**
 * form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/form-serializer", function(S, DOM) {
    var rselectTextarea = /^(?:select|textarea)/i,
        rCRLF = /\r?\n/g,
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
    return {
        /**
         * 搴忓垪鍖栬〃鍗曞厓绱�
         * @param {String|HTMLElement[]|HTMLElement|Node} forms
         */
        serialize:function(forms) {
            var elements = [],data = {};
            DOM.query(forms).each(function(el) {
                // form 鍙栧叾琛ㄥ崟鍏冪礌闆嗗悎
                // 鍏朵粬鐩存帴鍙栬嚜韬�
                var subs = el.elements ? S.makeArray(el.elements) : [el];
                elements.push.apply(elements, subs);
            });
            // 瀵硅〃鍗曞厓绱犺繘琛岃繃婊わ紝鍏峰鏈夋晥鍊肩殑鎵嶄繚鐣�
            elements = S.filter(elements, function(el) {
                // 鏈夊悕瀛�
                return el.name &&
                    // 涓嶈绂佺敤
                    !el.disabled &&
                    (
                        // radio,checkbox 琚€夋嫨浜�
                        el.checked ||
                            // select 鎴栬€� textarea
                            rselectTextarea.test(el.nodeName) ||
                            // input 绫诲瀷
                            rinput.test(el.type)
                        );

                // 杩欐牱瀛愭墠鍙栧€�
            });
            S.each(elements, function(el) {
                var val = DOM.val(el),vs;
                // 瀛楃涓叉崲琛屽钩鍙板綊涓€鍖�
                val = S.map(S.makeArray(val), function(v) {
                    return v.replace(rCRLF, "\r\n");
                });
                // 鍏ㄩ儴鎼炴垚鏁扮粍锛岄槻姝㈠悓鍚�
                vs = data[el.name] = data[el.name] || [];
                vs.push.apply(vs, val);
            });
            // 鍚嶅€奸敭鍊煎搴忓垪鍖�,鏁扮粍鍏冪礌鍚嶅瓧鍓嶄笉鍔� []
            return S.param(data, undefined, undefined, false);
        }
    };
}, {
    requires:['dom']
});

/**
 * encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var OK_CODE = 200,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
    // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(xhr) {

        // text xml 鏄惁鍘熺敓杞寲鏀寔
        var text = xhr.responseText,
            xml = xhr.responseXML,
            c = xhr.config,
            cConverts = c.converters,
            xConverts = xhr.converters || {},
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 渚嬪 script 鐩存帴鏄痡s寮曟搸鎵ц锛屾病鏈夎繑鍥炲€硷紝涓嶉渶瑕佽嚜宸卞鐞嗗垵濮嬭繑鍥炲€�
        // jsonp 鏃惰繕闇€瑕佹妸 script 杞崲鎴� json锛屽悗闈㈣繕寰楄嚜宸辨潵
        if (text || xml) {

            var contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type");

            // 鍘婚櫎鏃犵敤鐨勯€氱敤鏍煎紡
            while (dataType[0] == "*") {
                dataType.shift();
            }

            if (!dataType.length) {
                // 鑾峰彇婧愭暟鎹牸寮忥紝鏀惧湪绗竴涓�
                for (type in contents) {
                    if (contents[type].test(contentType)) {
                        if (dataType[0] != type) {
                            dataType.unshift(type);
                        }
                        break;
                    }
                }
            }
            // 鏈嶅姟鍣ㄧ娌℃湁鍛婄煡锛堝苟涓斿鎴风娌℃湁mimetype锛夐粯璁� text 绫诲瀷
            dataType[0] = dataType[0] || "text";

            //鑾峰緱鍚堥€傜殑鍒濆鏁版嵁
            if (dataType[0] == "text" && text !== undefined) {
                responseData = text;
            }
            // 鏈� xml 鍊兼墠鐩存帴鍙栵紝鍚﹀垯鍙兘杩樿浠� xml 杞�
            else if (dataType[0] == "xml" && xml !== undefined) {
                responseData = xml;
            } else {
                // 鐪嬭兘鍚︿粠 text xml 杞崲鍒板悎閫傛暟鎹�
                S.each(["text","xml"], function(prevType) {
                    var type = dataType[0],
                        converter = xConverts[prevType] && xConverts[prevType][type] ||
                            cConverts[prevType] && cConverts[prevType][type];
                    if (converter) {
                        dataType.unshift(prevType);
                        responseData = prevType == "text" ? text : xml;
                        return false;
                    }
                });
            }
        }
        var prevType = dataType[0];

        // 鎸夌収杞寲閾炬妸鍒濆鏁版嵁杞崲鎴愭垜浠兂瑕佺殑鏁版嵁绫诲瀷
        for (var i = 1; i < dataType.length; i++) {
            type = dataType[i];

            var converter = xConverts[prevType] && xConverts[prevType][type] ||
                cConverts[prevType] && cConverts[prevType][type];

            if (!converter) {
                throw "no covert for " + prevType + " => " + type;
            }
            responseData = converter(responseData);

            prevType = type;
        }

        xhr.responseData = responseData;
    }

    function XhrObject(c) {
        S.mix(this, {
            // 缁撴瀯鍖栨暟鎹紝濡� json
            responseData:null,
            config:c || {},
            timeoutTimer:null,
            responseText:null,
            responseXML:null,
            responseHeadersString:"",
            responseHeaders:null,
            requestHeaders:{},
            readyState:0,
            //internal state
            state:0,
            statusText:null,
            status:0,
            transport:null
        });
    }

    S.augment(XhrObject, Event.Target, {
            // Caches the header
            setRequestHeader: function(name, value) {
                this.requestHeaders[ name ] = value;
                return this;
            },

            // Raw string
            getAllResponseHeaders: function() {
                return this.state === 2 ? this.responseHeadersString : null;
            },

            // Builds headers hashtable if needed
            getResponseHeader: function(key) {
                var match;
                if (this.state === 2) {
                    if (!this.responseHeaders) {
                        this.responseHeaders = {};
                        while (( match = rheaders.exec(this.responseHeadersString) )) {
                            this.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = this.responseHeaders[ key];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType: function(type) {
                if (!this.state) {
                    this.mimeType = type;
                }
                return this;
            },

            // Cancel the request
            abort: function(statusText) {
                statusText = statusText || "abort";
                if (this.transport) {
                    this.transport.abort(statusText);
                }
                this.callback(0, statusText);
                return this;
            },

            callback:function(status, statusText) {
                //debugger
                var xhr = this;
                // 鍙兘鎵ц涓€娆★紝闃叉閲嶅鎵ц
                // 渚嬪瀹屾垚鍚庯紝璋冪敤 abort

                // 鍒拌繖瑕佷箞鎴愬姛锛岃皟鐢╯uccess
                // 瑕佷箞澶辫触锛岃皟鐢� error
                // 鏈€缁堥兘浼氳皟鐢� complete
                if (xhr.state == 2) {
                    return;
                }
                xhr.state = 2;
                xhr.readyState = 4;
                var isSuccess;
                if (status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED) {

                    if (status == NOT_MODIFIED) {
                        statusText = "notmodified";
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(xhr);
                            statusText = "success";
                            isSuccess = true;
                        } catch(e) {
                            statusText = "parsererror : " + e;
                        }
                    }

                } else {
                    if (status < 0) {
                        status = 0;
                    }
                }

                xhr.status = status;
                xhr.statusText = statusText;

                if (isSuccess) {
                    xhr.fire("success");
                } else {
                    xhr.fire("error");
                }
                xhr.fire("complete");
                xhr.transport = undefined;
            }
        }
    );

    return XhrObject;
}, {
    requires:["event"]
});

/**
 * a scalable client io framework
 * @author  yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

        var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
            rspace = /\s+/,
            rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
            mirror = function(s) {
                return s;
            },
            HTTP_PORT = 80,
            HTTPS_PORT = 443,
            rnoContent = /^(?:GET|HEAD)$/,
            curLocation,
            curLocationParts;


        try {
            curLocation = location.href;
        } catch(e) {
            S.log("ajax/base get curLocation error : ");
            S.log(e);
            // Use the href attribute of an A element
            // since IE will modify it given document.location
            curLocation = document.createElement("a");
            curLocation.href = "";
            curLocation = curLocation.href;
        }

        curLocationParts = rurl.exec(curLocation);

        var isLocal = rlocalProtocol.test(curLocationParts[1]),
            transports = {},
            defaultConfig = {
                // isLocal:isLocal,
                type:"GET",
                // only support utf-8 when post, encoding can not be changed actually
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                async:true,
                // whether add []
                serializeArray:true,
                // whether param data
                processData:true,
                /*
                 url:"",
                 context:null,
                 // 鍗曚綅绉�!!
                 timeout: 0,
                 data: null,
                 // 鍙彇json | jsonp | script | xml | html | text | null | undefined
                 dataType: null,
                 username: null,
                 password: null,
                 cache: null,
                 mimeType:null,
                 xdr:{
                 subDomain:{
                 proxy:'http://xx.t.com/proxy.html'
                 },
                 src:''
                 },
                 headers: {},
                 xhrFields:{},
                 // jsonp script charset
                 scriptCharset:null,
                 crossdomain:false,
                 forceScript:false,
                 */

                accepts: {
                    xml: "application/xml, text/xml",
                    html: "text/html",
                    text: "text/plain",
                    json: "application/json, text/javascript",
                    "*": "*/*"
                },
                converters:{
                    text:{
                        json:JSON.parse,
                        html:mirror,
                        text:mirror,
                        xml:S.parseXML
                    }
                },
                contents:{
                    xml:/xml/,
                    html:/html/,
                    json:/json/
                }
            };

        defaultConfig.converters.html = defaultConfig.converters.text;

        function setUpConfig(c) {
            // deep mix
            c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
            if (!S.isBoolean(c.crossDomain)) {
                var parts = rurl.exec(c.url.toLowerCase());
                c.crossDomain = !!( parts &&
                    ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) )
                            !=
                            ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) ) )
                    );
            }

            if (c.processData && c.data && !S.isString(c.data)) {
                // 蹇呴』 encodeURIComponent 缂栫爜 utf-8
                c.data = S.param(c.data, undefined, undefined, c.serializeArray);
            }

            c.type = c.type.toUpperCase();
            c.hasContent = !rnoContent.test(c.type);

            if (!c.hasContent) {
                if (c.data) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
                }
                if (c.cache === false) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
                }
            }

            // 鏁版嵁绫诲瀷澶勭悊閾撅紝涓€姝ユ灏嗗墠闈㈢殑鏁版嵁绫诲瀷杞寲鎴愭渶鍚庝竴涓�
            c.dataType = S.trim(c.dataType || "*").split(rspace);

            c.context = c.context || c;
            return c;
        }

        function fire(eventType, xhr) {
            io.fire(eventType, { ajaxConfig: xhr.config ,xhr:xhr});
        }

        function handleXhrEvent(e) {
            var xhr = this,
                c = xhr.config,
                type = e.type;
            if (this.timeoutTimer) {
                clearTimeout(this.timeoutTimer);
            }
            if (c[type]) {
                c[type].call(c.context, xhr.responseData, xhr.statusText, xhr);
            }
            fire(type, xhr);
        }

        function io(c) {
            if (!c.url) {
                return undefined;
            }
            c = setUpConfig(c);
            var xhr = new XhrObject(c);
            fire("start", xhr);
            var transportContructor = transports[c.dataType[0]] || transports["*"],
                transport = new transportContructor(xhr);
            xhr.transport = transport;

            if (c.contentType) {
                xhr.setRequestHeader("Content-Type", c.contentType);
            }
            var dataType = c.dataType[0],
                accepts = c.accepts;
            // Set the Accepts header for the server, depending on the dataType
            xhr.setRequestHeader(
                "Accept",
                dataType && accepts[dataType] ?
                    accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
                    accepts[ "*" ]
            );

            // Check for headers option
            for (var i in c.headers) {
                xhr.setRequestHeader(i, c.headers[ i ]);
            }

            xhr.on("complete success error", handleXhrEvent);

            xhr.readyState = 1;

            fire("send", xhr);

            // Timeout
            if (c.async && c.timeout > 0) {
                xhr.timeoutTimer = setTimeout(function() {
                    xhr.abort("timeout");
                }, c.timeout * 1000);
            }

            try {
                // flag as sending
                xhr.state = 1;
                transport.send();
            } catch (e) {
                // Propagate exception as error if not done
                if (xhr.status < 2) {
                    xhr.callback(-1, e);
                    // Simply rethrow otherwise
                } else {
                    S.error(e);
                }
            }

            return xhr;
        }

        S.mix(io, Event.Target);
        S.mix(io, {
            isLocal:isLocal,
            setupConfig:function(setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            setupTransport:function(name, fn) {
                transports[name] = fn;
            },
            getTransport:function(name) {
                return transports[name];
            },
            getConfig:function() {
                return defaultConfig;
            }
        });


        return io;
    },
    {
        requires:["json","event","./xhrobject"]
    });

/**
 * 鍊熼壌 jquery锛屼紭鍖栧噺灏戦棴鍖呬娇鐢�
 *
 * TODO:
 *  ifModified mode 鏄惁闇€瑕侊紵
 *  浼樼偣锛�
 *      涓嶄緷璧栨祻瑙堝櫒澶勭悊锛宎jax 璇锋眰娴忚涓嶄細鑷姩鍔� If-Modified-Since If-None-Match ??
 *  缂虹偣锛�
 *      鍐呭瓨鍗犵敤
 **/

/**
 * base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrbase", function (S, io) {
    var OK_CODE = 200,
        win = window,
    // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = win['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223,
        XhrBase = {
            proto:{}
        };

    function createStandardXHR(_, refWin) {
        try {
            return new (refWin || win)['XMLHttpRequest']();
        } catch (e) {
            //S.log("createStandardXHR error");
        }
        return undefined;
    }

    function createActiveXHR(_, refWin) {
        try {
            return new (refWin || win)['ActiveXObject']("Microsoft.XMLHTTP");
        } catch (e) {
            S.log("createActiveXHR error");
        }
        return undefined;
    }

    XhrBase.xhr = win.ActiveXObject ? function (crossDomain, refWin) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 涓嶈兘璁块棶鏈湴鏂囦欢
        return !io.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin);
    } : createStandardXHR;

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    S.mix(XhrBase.proto, {
        sendInternal:function () {

            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            var xhr = self.xhr,
                xhrFields,
                i;

            if (c['username']) {
                xhr.open(c.type, c.url, c.async, c['username'], c.password)
            } else {
                xhr.open(c.type, c.url, c.async);
            }

            if (xhrFields = c['xhrFields']) {
                for (i in xhrFields) {
                    xhr[ i ] = xhrFields[ i ];
                }
            }

            // Override mime type if supported
            if (xhrObj.mimeType && xhr.overrideMimeType) {
                xhr.overrideMimeType(xhrObj.mimeType);
            }
            // yui3 and jquery both have
            if (!c.crossDomain && !xhrObj.requestHeaders["X-Requested-With"]) {
                xhrObj.requestHeaders[ "X-Requested-With" ] = "XMLHttpRequest";
            }
            try {
                // 璺ㄥ煙鏃讹紝涓嶈兘璁撅紝鍚﹀垯璇锋眰鍙樻垚
                // OPTIONS /xhr/r.php HTTP/1.1
                if (!c.crossDomain) {
                    for (i in xhrObj.requestHeaders) {
                        xhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                }
            } catch (e) {
                S.log("setRequestHeader in xhr error : ");
                S.log(e);
            }

            xhr.send(c.hasContent && c.data || null);

            if (!c.async || xhr.readyState == 4) {
                self._callback();
            } else {
                // _XDomainRequest 鍗曠嫭鐨勫洖璋冩満鍒�
                if (isInstanceOfXDomainRequest(xhr)) {
                    xhr.onload = function () {
                        xhr.readyState = 4;
                        xhr.status = 200;
                        self._callback();
                    };
                    xhr.onerror = function () {
                        xhr.readyState = 4;
                        xhr.status = 500;
                        self._callback();
                    };
                } else {
                    xhr.onreadystatechange = function () {
                        self._callback();
                    };
                }
            }
        },
        // 鐢� xhrObj.abort 璋冪敤锛岃嚜宸变笉鍙互璋冪敤 xhrObj.abort
        abort:function () {
            this._callback(0, 1);
        },

        _callback:function (event, abort) {
            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occured
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            var self = this,
                xhr = self.xhr,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            try {

                //abort or complete
                if (abort || xhr.readyState == 4) {

                    // ie6 ActiveObject 璁剧疆涓嶆伆褰撳睘鎬у鑷村嚭閿�
                    if (isInstanceOfXDomainRequest(xhr)) {
                        xhr.onerror = S.noop;
                        xhr.onload = S.noop;
                    } else {
                        // ie6 ActiveObject 鍙兘璁剧疆锛屼笉鑳借鍙栬繖涓睘鎬э紝鍚﹀垯鍑洪敊锛�
                        xhr.onreadystatechange = S.noop;
                    }

                    if (abort) {
                        // 瀹屾垚浠ュ悗 abort 涓嶈璋冪敤
                        if (xhr.readyState !== 4) {
                            xhr.abort();
                        }
                    } else {
                        var status = xhr.status;

                        // _XDomainRequest 涓嶈兘鑾峰彇鍝嶅簲澶�
                        if (!isInstanceOfXDomainRequest(xhr)) {
                            xhrObj.responseHeadersString = xhr.getAllResponseHeaders();
                        }

                        var xml = xhr.responseXML;

                        // Construct response list
                        if (xml && xml.documentElement /* #4958 */) {
                            xhrObj.responseXML = xml;
                        }
                        xhrObj.responseText = xhr.responseText;

                        // Firefox throws an exception when accessing
                        // statusText for faulty cross-domain requests
                        try {
                            var statusText = xhr.statusText;
                        } catch (e) {
                            S.log("xhr statustext error : ", "error");
                            S.log(e, "error");
                            // We normalize with Webkit giving an empty statusText
                            statusText = "";
                        }

                        // Filter status for non standard behaviors
                        // If the request is local and we have data: assume a success
                        // (success with no data won't get notified, that's the best we
                        // can do given current implementations)
                        if (!status && io.isLocal && !c.crossDomain) {
                            status = xhrObj.responseText ? OK_CODE : NOT_FOUND_CODE;
                            // IE - #1450: sometimes returns 1223 when it should be 204
                        } else if (status === NO_CONTENT_CODE2) {
                            status = NO_CONTENT_CODE;
                        }
                        xhrObj.callback(status, statusText);
                    }
                }
            } catch (firefoxAccessException) {
                S.log(firefoxAccessException.stack || firefoxAccessException, "error");
                xhr.onreadystatechange = S.noop;
                if (!abort) {
                    xhrObj.callback(-1, firefoxAccessException);
                }
            }
        }
    });

    return XhrBase;
}, {
    requires:['./base']
});

/**
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/subdomain", function(S, XhrBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        PROXY_PAGE = "/sub_domain_proxy.html",
        doc = document,
        iframeMap = {
            // hostname:{iframe: , ready:}
        };

    function SubDomain(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.__hostname = m[2];
        self.__protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomain, XhrBase.proto, {
        send:function() {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.__hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.xhr = XhrBase.xhr(0, iframeDesc.iframe.contentWindow);
                if (self.xhr) {
                    self.sendInternal();
                } else {
                    S.error("document.domain not set correctly!");
                }
                return;
            }
            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = document.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframe.src = self.__protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", _onLoad, self);

        }
    });

    function _onLoad() {
        var self = this,
            hostname = self.__hostname,
            iframeDesc = iframeMap[hostname];
        iframeDesc.ready = 1;
        Event.detach(iframeDesc.iframe, "load", _onLoad, self);
        self.send();
    }

    return SubDomain;

}, {
    requires:['./xhrbase','event','dom']
});

/**
 * use flash to accomplish cross domain request , usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xdr", function(S, io, DOM) {

    var // current running request instances
        maps = {},
        ID = "io_swf",
    // flash transporter
        flash,
        doc = document,
    // whether create the flash transporter
        init = false;

    // create the flash transporter
    function _swf(uri, _, uid) {
        if (init) {
            return;
        }
        init = true;
        var o = '<object id="' + ID +
                '" type="application/x-shockwave-flash" data="' +
                uri + '" width="0" height="0">' +
                '<param name="movie" value="' +
                uri + '" />' +
                '<param name="FlashVars" value="yid=' +
                _ + '&uid=' +
                uid +
                '&host=KISSY.io" />' +
                '<param name="allowScriptAccess" value="always" />' +
                '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrTransport(xhrObj) {
        S.log("use flash xdr");
        this.xhrObj = xhrObj;
    }

    S.augment(XdrTransport, {
        // rewrite send to support flash xdr
        send:function() {
            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;
            var xdr = c['xdr'] || {};
            // 涓嶆彁渚涘垯浣跨敤 cdn 榛樿鐨� flash
            _swf(xdr.src || (S.Config.base + "ajax/io.swf"), 1, 1);
            // 绠€渚胯捣瑙侊紝鐢ㄨ疆璁�
            if (!flash) {
                // S.log("detect xdr flash");
                setTimeout(function() {
                    self.send();
                }, 200);
                return;
            }
            self._uid = S.guid();
            maps[self._uid] = self;

            // ie67 send 鍑洪敊锛�
            flash.send(c.url, {
                id:self._uid,
                uid:self._uid,
                method:c.type,
                data:c.hasContent && c.data || {}
            });
        },

        abort:function() {
            flash.abort(this._uid);
        },

        _xdrResponse:function(e, o) {
            // S.log(e);
            var self = this,
                ret,
                xhrObj = self.xhrObj;

            // need decodeURI to get real value from flash returned value
            xhrObj.responseText = decodeURI(o.c.responseText);

            switch (e) {
                case 'success':
                    ret = { status: 200, statusText: "success" };
                    delete maps[o.id];
                    break;
                case 'abort':
                    delete maps[o.id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[o.id];
                    ret = { status: 500, statusText: e };
                    break;
            }
            if (ret) {
                xhrObj.callback(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    io['applyTo'] = function(_, cmd, args) {
        // S.log(cmd + " execute");
        var cmds = cmd.split("."),
            func = S;
        S.each(cmds, function(c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    io['xdrReady'] = function() {
        flash = doc.getElementById(ID);
    };

    /**
     * when response is returned from server
     * @param e response status
     * @param o internal data
     * @param c internal data
     */
    io['xdrResponse'] = function(e, o, c) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o, c);
    };

    // export io for flash to call
    S.io = io;

    return XdrTransport;

}, {
    requires:["./base",'dom']
});

/**
 * ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io, XhrBase, SubDomain, XdrTransport) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var _XDomainRequest = window['XDomainRequest'];

    var detectXhr = XhrBase.xhr();

    if (detectXhr) {

        // slice last two pars
        // xx.taobao.com => taobao.com
        function getMainDomain(host) {
            var t = host.split('.');
            if (t.length < 2) {
                return t.join(".");
            } else {
                return t.reverse().slice(0, 2).reverse().join('.');
            }
        }

        function XhrTransport(xhrObj) {
            var c = xhrObj.config,
                xdrCfg = c['xdr'] || {};

            if (c.crossDomain) {

                var parts = c.url.match(rurl);

                // 璺ㄥ瓙鍩�
                if (getMainDomain(location.hostname) == getMainDomain(parts[2])) {
                    return new SubDomain(xhrObj);
                }

                /**
                 * ie>7 寮哄埗浣跨敤 flash xdr
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;

            return undefined;
        }

        S.augment(XhrTransport, XhrBase.proto, {

            send:function() {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                self.xhr = XhrBase.xhr(c.crossDomain);
                self.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base",'./xhrbase','./subdomain',"./xdr"]
});

/**
 * 鍊熼壌 jquery锛屼紭鍖栦娇鐢ㄥ師鍨嬫浛浠ｉ棴鍖�
 **/

/**
 * script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/script", function(S, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500;

    io.setupConfig({
        accepts:{
            script:"text/javascript, " +
                "application/javascript, " +
                "application/ecmascript, " +
                "application/x-ecmascript"
        },

        contents:{
            script:/javascript|ecmascript/
        },
        converters:{
            text:{
                // 濡傛灉浠� xhr+eval 闇€瑕佷笅闈㈢殑锛�
                // 鍚﹀垯鐩存帴 script node 涓嶉渶瑕侊紝寮曟搸鑷繁鎵ц浜嗭紝
                // 涓嶉渶瑕佹墜鍔� eval
                script:function(text) {
                    S.globalEval(text);
                    return text;
                }
            }
        }
    });

    function ScriptTransport(xhrObj) {
        // 浼樺厛浣跨敤 xhr+eval 鏉ユ墽琛岃剼鏈�, ie 涓嬪彲浠ユ帰娴嬪埌锛堟洿澶氾級澶辫触鐘舵€�
        if (!xhrObj.config.crossDomain &&
            !xhrObj.config['forceScript']) {
            return new (io.getTransport("*"))(xhrObj);
        }
        this.xhrObj = xhrObj;
        return 0;
    }

    S.augment(ScriptTransport, {
        send:function() {
            var self = this,
                script,
                xhrObj = this.xhrObj,
                c = xhrObj.config,
                head = doc['head'] ||
                    doc.getElementsByTagName("head")[0] ||
                    doc.documentElement;
            self.head = head;
            script = doc.createElement("script");
            self.script = script;
            script.async = "async";

            if (c['scriptCharset']) {
                script.charset = c['scriptCharset'];
            }

            script.src = c.url;

            script.onerror =
                script.onload =
                    script.onreadystatechange = function(e) {
                        e = e || window.event;
                        // firefox onerror 娌℃湁 type ?!
                        self._callback((e.type || "error").toLowerCase());
                    };

            head.insertBefore(script, head.firstChild);
        },

        _callback:function(event, abort) {
            var script = this.script,
                xhrObj = this.xhrObj,
                head = this.head;

            // 闃叉閲嶅璋冪敤,鎴愬姛鍚� abort
            if (!script) {
                return;
            }

            if (abort ||
                !script.readyState ||
                /loaded|complete/.test(script.readyState)
                || event == "error"
                ) {

                script['onerror'] = script.onload = script.onreadystatechange = null;

                // Remove the script
                if (head && script.parentNode) {
                    // ie 鎶ラ敊杞藉叆鏃犳晥 js
                    // 鎬庝箞 abort ??
                    // script.src = "#";
                    head.removeChild(script);
                }

                this.script = undefined;
                this.head = undefined;

                // Callback if not abort
                if (!abort && event != "error") {
                    xhrObj.callback(OK_CODE, "success");
                }
                // 闈� ie<9 鍙互鍒ゆ柇鍑烘潵
                else if (event == "error") {
                    xhrObj.callback(ERROR_CODE, "scripterror");
                }
            }
        },

        abort:function() {
            this._callback(0, 1);
        }
    });

    io.setupTransport("script", ScriptTransport);

    return io;

}, {
    requires:['./base','./xhr']
});

/**
 * jsonp transport based on script transport
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function(S, io) {

    io.setupConfig({
        jsonp:"callback",
        jsonpCallback:function() {
            //涓嶄娇鐢� now() 锛屾瀬绔儏鍐典笅鍙兘閲嶅
            return S.guid("jsonp");
        }
    });

    io.on("start", function(e) {
        var xhr = e.xhr,c = xhr.config;
        if (c.dataType[0] == "jsonp") {
            var response,
                cJsonpCallback = c.jsonpCallback,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = window[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            window[jsonpCallback] = function(r) {
                // 浣跨敤鏁扮粍锛屽尯鍒細鏁呮剰璋冪敤浜� jsonpCallback(undefined) 涓� 鏍规湰娌℃湁璋冪敤
                // jsonp 杩斿洖浜嗘暟缁�
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhr.on("complete", function() {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch(e) {
                        //S.log("delete window variable error : ");
                        //S.log(e);
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            xhr.converters = xhr.converters || {};
            xhr.converters.script = xhr.converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            xhr.converters.script.json = function() {
                if (!response) {
                    S.error(" not call jsonpCallback : " + jsonpCallback)
                }
                return response[0];
            };

            c.dataType.length = 2;
            // 鍒╃敤 script transport 鍙戦€� script 璇锋眰
            c.dataType[0] = 'script';
            c.dataType[1] = 'json';
        }
    });

    return io;
}, {
    requires:['./base']
});

KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        var xhr = e.xhr,
            c = xhr.config;
        // serialize form if needed
        if (c.form) {
            var form = DOM.get(c.form),
                enctype = form['encoding'] || form.enctype;
            // 涓婁紶鏈夊叾浠栨柟娉�
            if (enctype.toLowerCase() != "multipart/form-data") {
                // when get need encode
                var formParam = FormSerializer.serialize(form);

                if (formParam) {
                    if (c.hasContent) {
                        // post 鍔犲埌 data 涓�
                        c.data = c.data || "";
                        if (c.data) {
                            c.data += "&";
                        }
                        c.data += formParam;
                    } else {
                        // get 鐩存帴鍔犲埌 url
                        c.url += ( /\?/.test(c.url) ? "&" : "?" ) + formParam;
                    }
                }
            } else {
                var d = c.dataType[0];
                if (d == "*") {
                    d = "text";
                }
                c.dataType.length = 2;
                c.dataType[0] = "iframe";
                c.dataType[1] = d;
            }
        }
    });

    return io;

}, {
    requires:['./base',"dom","./form-serializer"]
});

/**
 * non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/iframe-upload", function (S, DOM, Event, io) {

    var doc = document;

    var OK_CODE = 200, ERROR_CODE = 500, BREATH_INTERVAL = 30;

    // iframe 鍐呯殑鍐呭灏辨槸 body.innerText
    io.setupConfig({
        converters: {
            // iframe 鍒板叾浠栫被鍨嬬殑杞寲鍜� text 涓€鏍�
            iframe: io.getConfig().converters.text,
            text: {
                iframe: function (text) {
                    return text;
                }
            }}});

    function createIframe(xhr) {
        var id = S.guid("ajax-iframe");
        xhr.iframe = DOM.create("<iframe " +
            " id='" + id + "'" +
            // need name for target of form
            " name='" + id + "'" +
            " style='position:absolute;left:-9999px;top:-9999px;'/>");
        xhr.iframeId = id;
        DOM.prepend(xhr.iframe, doc.body || doc.documentElement);
    }

    function addDataToForm(data, form, serializeArray) {
        data = S.unparam(data);
        var ret = [];
        for (var d in data) {
            var isArray = S.isArray(data[d]),
                vs = S.makeArray(data[d]);
            // 鏁扮粍鍜屽師鐢熶竴鏍峰寰咃紝鍒涘缓澶氫釜鍚屽悕杈撳叆鍩�
            for (var i = 0; i < vs.length; i++) {
                var e = doc.createElement("input");
                e.type = 'hidden';
                e.name = d + (isArray && serializeArray ? "[]" : "");
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        }
        return ret;
    }


    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(xhr) {
        this.xhr = xhr;
    }

    S.augment(IframeTransport, {
        send: function () {
            //debugger
            var xhr = this.xhr,
                c = xhr.config,
                fields,
                form = DOM.get(c.form);

            this.attrs = {
                target: DOM.attr(form, "target") || "",
                action: DOM.attr(form, "action") || ""
            };
            this.form = form;

            createIframe(xhr);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {"target": xhr.iframeId, "action": c.url});

            if (c.data) {
                fields = addDataToForm(c.data, form, c.serializeArray);
            }

            this.fields = fields;

            var iframe = xhr.iframe;

            Event.on(iframe, "load error", this._callback, this);

            form.submit();

        },

        _callback: function (event
                             //, abort
            ) {
            //debugger
            var form = this.form,
                xhr = this.xhr,
                eventType = event.type,
                iframe = xhr.iframe;
            // 闃叉閲嶅璋冪敤 , 鎴愬姛鍚� abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, this.attrs);

            if (eventType == "load") {
                try {
                    var iframeDoc = iframe.contentWindow.document;
                    if (iframeDoc) {
                        xhr.responseXML = iframeDoc;
                        xhr.responseText = DOM.text(iframeDoc.body);
                        xhr.callback(OK_CODE, "success");
                    } else {
                        xhr.callback(ERROR_CODE, "parser error");
                    }
                } catch (e) {
                    xhr.callback(ERROR_CODE, "parser error");
                }
            } else if (eventType == 'error') {
                xhr.callback(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);


            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            xhr.iframe = null;
        },

        abort: function () {
            this._callback(0, 1);
        }
    });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
    requires: ["dom", "event", "./base"]
});

KISSY.add("ajax", function(S, serializer, io) {
    var undef = undefined;
    // some shortcut
    S.mix(io, {

        /**
         * form 搴忓垪鍖�
         * @param formElement {HTMLFormElement} 灏嗚搴忓垪鍖栫殑 form 鍏冪礌
         */
        serialize:serializer.serialize,

        get: function(url, data, callback, dataType, _t) {
            // data 鍙傛暟鍙渷鐣�
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }

            return io({
                type: _t || "get",
                url: url,
                data: data,
                success: callback,
                dataType: dataType
            });
        },

        post: function(url, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, dataType, "post");
        },

        jsonp: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "jsonp");
        },

        // 鍜� S.getScript 淇濇寔涓€鑷�
        // 鏇村ソ鐨� getScript 鍙互鐢�
        /*
         io({
         dataType:'script'
         });
         */
        getScript:S.getScript,

        getJSON: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "json");
        },

        upload:function(url, form, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io({
                url:url,
                type:'post',
                dataType:dataType,
                form:form,
                data:data,
                success:callback
            });
        }
    });

    return io;
}, {
    requires:[
        "ajax/form-serializer",
        "ajax/base",
        "ajax/xhrobject",
        "ajax/xhr",
        "ajax/script",
        "ajax/jsonp",
        "ajax/form",
        "ajax/iframe-upload"]
});

/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function (S, undef) {

    // atomic flag
    Attribute.INVALID = {};

    var INVALID = Attribute.INVALID;

    /**
     *
     * @param host
     * @param method
     * @return method if fn or host[method]
     */
    function normalFn(host, method) {
        if (S.isString(method)) {
            return host[method];
        }
        return method;
    }


    /**
     * fire attribute value change
     */
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName) {
        attrName = attrName || name;
        return self.fire(when + capitalFirst(name) + 'Change', {
            attrName:attrName,
            subAttrName:subAttrName,
            prevVal:prevVal,
            newVal:newVal
        });
    }


    /**
     *
     * @param obj
     * @param name
     * @param create
     * @return non-empty property value of obj
     */
    function ensureNonEmpty(obj, name, create) {
        var ret = obj[name] || {};
        if (create) {
            obj[name] = ret;
        }
        return ret;
    }

    /**
     *
     * @param self
     * @return non-empty attr config holder
     */
    function getAttrs(self) {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         // 娉ㄦ剰锛氬彧鑳芥槸鏅€氬璞′互鍙婄郴缁熷唴缃被鍨嬶紝鑰屼笉鑳芥槸 new Xx()锛屽惁鍒欑敤 valueFn 鏇夸唬
         value: v, // default value
         valueFn: function
         }
         }
         */
        return ensureNonEmpty(self, "__attrs", true);
    }

    /**
     *
     * @param self
     * @return non-empty attr value holder
     */
    function getAttrVals(self) {
        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        return ensureNonEmpty(self, "__attrVals", true);
    }

    /**
     * o, [x,y,z] => o[x][y][z]
     * @param o
     * @param path
     */
    function getValueByPath(o, path) {
        for (var i = 0, len = path.length;
             o != undef && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /**
     * o, [x,y,z], val => o[x][y][z]=val
     * @param o
     * @param path
     * @param val
     */
    function setValueByPath(o, path, val) {
        var rlen = path.length - 1,
            s = o;
        if (rlen >= 0) {
            for (var i = 0; i < rlen; i++) {
                o = o[path[i]];
            }
            if (o != undef) {
                o[path[i]] = val;
            } else {
                s = undef;
            }
        }
        return s;
    }

    function setInternal(self, name, value, opts, attrs) {
        var ret;
        opts = opts || {};
        var dot = ".",
            path,
            subVal,
            prevVal,
            declare = self.hasAttr(name),
            fullName = name;

        if (!declare &&
            name.indexOf(dot) !== -1) {
            path = name.split(dot);
            name = path.shift();
        }

        prevVal = self.get(name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        if (!path && prevVal === value) {
            return undefined;
        } else if (path && subVal === value) {
            return undefined;
        }

        if (path) {
            var tmp = S.clone(prevVal);
            setValueByPath(tmp, path, value);
            value = tmp;
        }

        // check before event
        if (!opts['silent']) {
            if (false === __fireAttrChange(self, 'before', name, prevVal, value, fullName)) {
                return false;
            }
        }
        // set it
        ret = self.__set(name, value);

        if (ret === false) {
            return ret;
        }

        // fire after event
        if (!opts['silent']) {
            value = getAttrVals(self)[name];
            __fireAttrChange(self, 'after', name, prevVal, value, fullName);
            if (!attrs) {
                __fireAttrChange(self,
                    '', '*',
                    [prevVal], [value],
                    [fullName], [name]);
            } else {
                attrs.push({
                    prevVal:prevVal,
                    newVal:value,
                    attrName:name,
                    subAttrName:fullName
                });
            }
        }
        return self;
    }

    /**
     * 鎻愪緵灞炴€х鐞嗘満鍒�
     * @name Attribute
     * @class
     */
    function Attribute() {
    }

    S.augment(Attribute, {

        /**
         * @return un-cloned attr config collections
         */
        getAttrs:function () {
            return getAttrs(this);
        },

        /**
         * @return un-cloned attr value collections
         */
        getAttrVals:function () {
            var self = this,
                o = {},
                a,
                attrs = getAttrs(self);
            for (a in attrs) {
                o[a] = self.get(a);
            }
            return o;
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * @param {String} name attrName
         * @param {Object} attrConfig The config supports the following properties:
         * {
         *     value: 'the default value', // 鏈€濂戒笉瑕佷娇鐢ㄨ嚜瀹氫箟绫荤敓鎴愮殑瀵硅薄锛岃繖鏃朵娇鐢� valueFn
         *     valueFn: function //
         *     setter: function
         *     getter: function
         * }
         * @param {boolean} override whether override existing attribute config ,default true
         */
        addAttr:function (name, attrConfig, override) {
            var self = this,
                attrs = getAttrs(self),
                cfg = S.clone(attrConfig);
            if (!attrs[name]) {
                attrs[name] = cfg;
            } else {
                S.mix(attrs[name], cfg, override);
            }
            return self;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
         * @param {Object} initialValues user defined initial values
         */
        addAttrs:function (attrConfigs, initialValues) {
            var self = this;
            S.each(attrConfigs, function (attrConfig, name) {
                self.addAttr(name, attrConfig);
            });
            if (initialValues) {
                self.set(initialValues);
            }
            return self;
        },

        /**
         * Checks if the given attribute has been added to the host.
         */
        hasAttr:function (name) {
            return name && getAttrs(this).hasOwnProperty(name);
        },

        /**
         * Removes an attribute from the host object.
         */
        removeAttr:function (name) {
            var self = this;

            if (self.hasAttr(name)) {
                delete getAttrs(self)[name];
                delete getAttrVals(self)[name];
            }

            return self;
        },

        /**
         * Sets the value of an attribute.
         */
        set:function (name, value, opts) {
            var ret, self = this;
            if (S.isPlainObject(name)) {
                var all = name;
                name = 0;
                ret = true;
                opts = value;
                var attrs = [];
                for (name in all) {
                    ret = setInternal(self, name, all[name], opts, attrs);
                    if (ret === false) {
                        break;
                    }
                }
                var attrNames = [],
                    prevVals = [],
                    newVals = [],
                    subAttrNames = [];
                S.each(attrs, function (attr) {
                    prevVals.push(attr.prevVal);
                    newVals.push(attr.newVal);
                    attrNames.push(attr.attrName);
                    subAttrNames.push(attr.subAttrName);
                });
                if (attrNames.length) {
                    __fireAttrChange(self,
                        '',
                        '*',
                        prevVals,
                        newVals,
                        subAttrNames,
                        attrNames);
                }
                return ret;
            }

            return setInternal(self, name, value, opts);


        },

        /**
         * internal use, no event involved, just set.
         * @protected overriden by mvc/model
         */
        __set:function (name, value) {
            var self = this,
                setValue,
            // if host does not have meta info corresponding to (name,value)
            // then register on demand in order to collect all data meta info
            // 涓€瀹氳娉ㄥ唽灞炴€у厓鏁版嵁锛屽惁鍒欏叾浠栨ā鍧楅€氳繃 _attrs 涓嶈兘鏋氫妇鍒版墍鏈夋湁鏁堝睘鎬�
            // 鍥犱负灞炴€у湪澹版槑娉ㄥ唽鍓嶅彲浠ョ洿鎺ヨ缃€�
                attrConfig = ensureNonEmpty(getAttrs(self), name, true),
                validator = attrConfig['validator'],
                setter = attrConfig['setter'];

            // validator check
            if (validator = normalFn(self, validator)) {
                if (validator.call(self, value, name) === false) {
                    return false;
                }
            }

            // if setter has effect
            if (setter = normalFn(self, setter)) {
                setValue = setter.call(self, value, name);
            }

            if (setValue === INVALID) {
                return false;
            }

            if (setValue !== undef) {
                value = setValue;
            }

            // finally set
            getAttrVals(self)[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         */
        get:function (name) {
            var self = this,
                dot = ".",
                path,
                declared = self.hasAttr(name),
                attrConfig,
                getter, ret;

            if (!declared && name.indexOf(dot) !== -1) {
                path = name.split(dot);
                name = path.shift();
            }

            attrConfig = ensureNonEmpty(getAttrs(self), name);
            getter = attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in getAttrVals(self) ?
                getAttrVals(self)[name] :
                self.__getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter = normalFn(self, getter)) {
                ret = getter.call(self, ret, name);
            }

            if (path) {
                ret = getValueByPath(ret, path);
            }

            return ret;
        },

        /**
         * get default attribute value from valueFn/value
         * @private
         * @param name
         */
        __getDefAttrVal:function (name) {
            var self = this,
                attrConfig = ensureNonEmpty(getAttrs(self), name),
                valFn,
                val;

            if ((valFn = normalFn(self, attrConfig.valueFn))) {
                val = valFn.call(self);
                if (val !== undef) {
                    attrConfig.value = val;
                }
                delete attrConfig.valueFn;
                getAttrs(self)[name] = attrConfig;
            }

            return attrConfig.value;
        },

        /**
         * Resets the value of an attribute.just reset what addAttr set  (not what invoker set when call new Xx(cfg))
         * @param {String} name name of attribute
         */
        reset:function (name, opts) {
            var self = this;

            if (S.isString(name)) {
                if (self.hasAttr(name)) {
                    // if attribute does not have default value, then set to undefined.
                    return self.set(name, self.__getDefAttrVal(name), opts);
                }
                else {
                    return self;
                }
            }

            opts = name;

            var attrs = getAttrs(self),
                values = {};

            // reset all
            for (name in attrs) {
                values[name] = self.__getDefAttrVal(name);
            }

            self.set(values, opts);
            return self;
        }
    });

    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    if (undef) {
        Attribute.prototype.addAttrs = undef;
    }
    return Attribute;
});

/**
 *  2011-10-18
 *    get/set sub attribute value ,set("x.y",val) x 鏈€濂戒负 {} 锛屼笉瑕佹槸 new Clz() 鍑烘潵鐨�
 *    add validator
 */

/**
 * @module  Base
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base/base', function (S, Attribute, Event) {

    /**
     * Base for class-based component
     * @name Base
     * @extends Event.Target
     * @extends Attribute
     * @class
     */
    function Base(config) {
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(this, config);
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 瀛愮被涓婄殑 ATTRS 閰嶇疆浼樺厛
                if (attrs.hasOwnProperty(attr)) {
                    // 鐖剁被鍚庡姞锛岀埗绫讳笉瑕嗙洊瀛愮被鐨勭浉鍚岃缃�
                    // 灞炴€у璞′細 merge   a: {y:{getter:fn}}, b:{y:{value:3}}, b extends a => b {y:{value:3}}
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //鐢ㄦ埛璁剧疆浼氳皟鐢� setter/validator 鐨勶紝浣嗕笉浼氳Е鍙戝睘鎬у彉鍖栦簨浠�
                    host.__set(attr, config[attr]);
                }

            }
        }
    }

    S.augment(Base, Event.Target, Attribute);
    return Base;
}, {
    requires:["./attribute","event"]
});

KISSY.add("base", function(S, Base, Attribute) {
    Base.Attribute = Attribute;
    return Base;
}, {
    requires:["base/base","base/attribute"]
});

/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie/base', function(S) {

    var doc = document,
        MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
        encode = encodeURIComponent,
        decode = decodeURIComponent;


    function isNotEmptyString(val) {
        return S.isString(val) && val !== '';
    }

    return {

        /**
         * 鑾峰彇 cookie 鍊�
         * @return {string} 濡傛灉 name 涓嶅瓨鍦紝杩斿洖 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = String(doc.cookie).match(
                    new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, expires, domain, path, secure) {
            var text = String(encode(val)), date = expires;

            // 浠庡綋鍓嶆椂闂村紑濮嬶紝澶氬皯澶╁悗杩囨湡
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
            }
            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            //S.log(text);
            doc.cookie = name + '=' + text;
        },

        remove: function(name, domain, path, secure) {
            // 缃┖锛屽苟绔嬪埢杩囨湡
            this.set(name, '', -1, domain, path, secure);
        }
    };

});

/**
 * NOTES:
 *
 *  2010.04
 *   - get 鏂规硶瑕佽€冭檻 ie 涓嬶紝
 *     鍊间负绌虹殑 cookie 涓� 'test3; test3=3; test3tt=2; test1=t1test3; test3', 娌℃湁绛変簬鍙枫€�
 *     闄や簡姝ｅ垯鑾峰彇锛岃繕鍙互 split 瀛楃涓茬殑鏂瑰紡鏉ヨ幏鍙栥€�
 *   - api 璁捐涓婏紝鍘熸湰鎯冲€熼壌 jQuery 鐨勭畝鏄庨鏍硷細S.cookie(name, ...), 浣嗚€冭檻鍒板彲鎵╁睍鎬э紝鐩墠
 *     鐙珛鎴愰潤鎬佸伐鍏风被鐨勬柟寮忔洿浼樸€�
 */

KISSY.add("cookie", function(S,C) {
    return C;
}, {
    requires:["cookie/base"]
});

KISSY.add("core", function(S, UA, DOM, Event, Node, JSON, Ajax, Anim, Base, Cookie) {
    var re = {
        UA:UA,
        DOM:DOM,
        Event:Event,
        EventTarget:Event.Target,
        "EventObject":Event.Object,
        Node:Node,
        NodeList:Node,
        JSON:JSON,
        "Ajax":Ajax,
        "IO":Ajax,
        ajax:Ajax,
        io:Ajax,
        jsonp:Ajax.jsonp,
        Anim:Anim,
        Easing:Anim.Easing,
        Base:Base,
        "Cookie":Cookie,
        one:Node.one,
        all:Node.all,
        get:DOM.get,
        query:DOM.query
    };
    S.mix(S, re);
    return re;
}, {
    requires:[
        "ua",
        "dom",
        "event",
        "node",
        "json",
        "ajax",
        "anim",
        "base",
        "cookie"
    ]
});



KISSY.use('core');