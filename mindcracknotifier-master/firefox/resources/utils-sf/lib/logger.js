const Trait = require("traits").Trait;

Logger = Trait.compose({
    LOG_ALL: 15,
    LOG_LOG: 8,
    LOG_DEBUG: 4,
    LOG_WARN: 2,
    LOG_ERROR: 1,
    NO_LOG: 0,
    _logLevel: 1,
    _console: console,
    constructor: function(){
    },
     set logLevel(level){
        this._logLevel = level;
    },
     get logLevel(){
        return this._logLevel;
    },
    log: function(){
        if (this._logLevel & this.LOG_LOG) {
            this._console.log.apply(this._console, arguments);
        }
    },
    debug: function(){
        if (this._logLevel & this.LOG_DEBUG) {
            this._console.log.apply(this._console, arguments);
        }
    },
    warn: function(){
        if (this._logLevel & this.LOG_WARN) {
            this._console.warn.apply(this._console, arguments);
        }
        
    },
    error: function(){
        if (this._logLevel & this.LOG_ERROR) {
            this._console.error.apply(this._console, arguments);
        }
        
    }
});

exports.Logger = Logger();
exports.LoggerFactory = Logger;
