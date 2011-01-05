// The Makefile copies this to the beginning of nodes-ed.js so these functions
//  should be available throught the libary

// write all of the non-function properties of an object to the log opts = {prefix : '', level : 'info'}
var NdEjs = {
    logObjectData : function (o, f, opts) {
        var lines = [],
            p,
            level,
            a;
        for (a in o) {
            if (!(typeof o[a] === 'function')) {
                lines[lines.length] = String(a) + " = " + String(o[a]);
            }
        }
        p = (opts && opts.prefix) || '';
        level = (opts && opts.level) || 'info';
        f(p + 'Object : ' + o + '\n	 ' + lines.join('\n	 '), level);
    },
    
    // write all of the properties of an object to the log opts = {prefix : '', level : 'info'}
    logObject : function (o, f, opts) {
        var lines = [],
            p,
            level,
            a;
        for (a in o) {
            if (o.hasOwnProperty(a)) {
                lines[lines.length] = String(a) + " = " + String(o[a]);
            }
        }
        p = (opts && opts.prefix) || '';
        level = (opts && opts.level) || 'info';
        f(p + 'Object : ' + o + '\n	 ' + lines.join('\n	 '), level);
    },

    // log an exception to function f
    logException : function (e, f) {
        try {
            var st = printStackTrace({e : e});
            f("Exception: name=" + e.name + ' message=' + e.message +  '\n' + st.join('\n  '), "error");
        }
        catch (ex) {
            NdEjs.logObject(e, f, {prefix : 'Exception without stacktrace'});
            NdEjs.logObject(ex, f, {prefix : 'Exception during stacktrace'});
        }
    },
    
    // returns false if o is null or undefined
    isNone : function (o) {
        return (o === null || o === undefined);
    },

    // returns false if o is null or undefined
    isNotNone : function (o) {
        return !(o === null || o === undefined);
    },

    // takes a collection of key values, and returns all of the keys that don't have
    //	values that are undefined or null
    getNotNonePairs : function (o, keyList) {
        var r = {},
            v,
            a,
            i;
        if (keyList instanceof Array) {
            for (i = 0; i < keyList.length; ++i) {
                a = keyList[i];
                v = o[a];
                if (isNotNone(v)) {
                    r[a] = v;
                }
            }
        }
        else {
            for (a in o) {
                if (o.hasOwnProperty(a)) {
                    v = o[a];
                    if (isNotNone(v)) {
                        r[a] = v;
                    }
                }
            }
        }
        return r;
    }

};
