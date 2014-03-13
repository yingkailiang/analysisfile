/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

if (!require("api-utils/xul-app").is("Firefox")) {
  throw new Error([
    "The windows module currently supports only Firefox. In the future",
    " we would like it to support other applications, however.  Please see ",
    "https://bugzilla.mozilla.org/show_bug.cgi?id=571449 for more information."
  ].join(""));
}
     
const { Cc, Ci, Cu } = require('chrome'),
      { Trait } = require('api-utils/traits'),
      { List } = require('api-utils/list'),
      { EventEmitter } = require('api-utils/events'),
      { WindowTabs, WindowTabTracker } = require('api-utils/windows/tabs'),
      { WindowDom } = require('api-utils/windows/dom'),
      { WindowLoader } = require('api-utils/windows/loader'),
      { WindowTrackerTrait } = require('api-utils/window-utils'),
      { Options,Tab } = require('api-utils/tabs/tab'),
      { utils } = require('api-utils/xpcom'),
      apiUtils = require('api-utils/api-utils'),
      unload = require('api-utils/unload'),
     { getOwnerWindow, getActiveTab, getTabs } = require("tabs/utils"),
	 { observer: tabsObserver } = require("api-utils/tabs/observer"),
      WM = Cc['@mozilla.org/appshell/window-mediator;1'].
        getService(Ci.nsIWindowMediator),
      BROWSER = 'navigator:browser';
var	  ID_COUNT=0;

Cu.import("resource://gre/modules/Services.jsm",this);




function getWindowType(window){
	if(window && !window.gBrowser){ 	  
  	  return "app";
    }
    return "normal";
}

/**
 * Window trait composes safe wrappers for browser window that are E10S
 * compatible.
 */
const BrowserWindowTrait = Trait.compose(
  EventEmitter,
  WindowDom.resolve({ close: '_close' }),
  WindowTabs,
  WindowTabTracker,
  WindowLoader,
  /* WindowSidebars, */
  Trait.compose({
    _emit: Trait.required,
    _close: Trait.required,
    _load: Trait.required,
    _type:"normal",
	get id(){
		return this._id;
	},
	get type(){
		return this._type;
	},
	get width(){
		return this._window.innerWidth;
	},
	get height(){
		return this._window.innerHeight;
	},
	get top(){
		return this._window.screenY;
	},
	get left(){
		return this._window.screenX;
	},
	get activeTab(){
		return this._window.gBrowser ? Tab({tab:getActiveTab(this._window)}) :null;
	},
	
	
	
	//patch to prevent getActiveTab error
	__initWindowTabTracker:function __initWindowTabTracker() {
	    // Ugly hack that we have to remove at some point (see Bug 658059). At this
	    // point it is necessary to invoke lazy `tabs` getter on the windows object
	    // which creates a `TabList` instance.
	    this.tabs;
	    // Binding all methods used as event listeners to the instance.
	    this._onTabReady = this._emitEvent.bind(this, "ready");
	    this._onTabOpen = this._onTabEvent.bind(this, "open");
	    this._onTabClose = this._onTabEvent.bind(this, "close");
	    this._onTabMove = this._onTabEvent.bind(this, "move");
	    this._onTabActivate = this._onTabEvent.bind(this, "activate");
	    this._onTabDeactivate = this._onTabEvent.bind(this, "deactivate");

	    for each (let tab in getTabs(this._window)) {
	      // We emulate "open" events for all open tabs since gecko does not emits
	      // them on the tabs that new windows are open with. Also this is
	      // necessary to synchronize tabs lists with an actual state.
	      this._onTabOpen(tab);
	    }
	    // We also emulate "activate" event so that it's picked up by a tab list.
	    if(this._window.gBrowser){
	    	this._onTabActivate(getActiveTab(this._window));
	    }
	    // Setting up event listeners		
	    tabsObserver.on("open", this._onTabOpen);
	    tabsObserver.on("close", this._onTabClose);
	    tabsObserver.on("activate", this._onTabActivate);
	    tabsObserver.on("deactivate", this._onTabDeactivate);
	    tabsObserver.on("move", this._onTabMove);
		
	    },
    /**
     * Constructor returns wrapper of the specified chrome window.
     * @param {nsIWindow} window
     */
    constructor: function BrowserWindow(options) {
      // Register this window ASAP, in order to avoid loop that would try
      // to create this window instance over and over (see bug 648244)
      windows.push(this);
      this._id=ID_COUNT++;
      if(options.type){
    	  this._type=options.type}
      else{      
    	  this._type=getWindowType(options.window);}
	  windowsId[this._id]=this._public;
      // make sure we don't have unhandled errors
      this.on('error', console.exception.bind(console));

      if ('onOpen' in options)
        this.on('open', options.onOpen);
      if ('onClose' in options)
        this.on('close', options.onClose);
      if ('window' in options)
        this._window = options.window;
      if ('tabs' in options) {
        this._tabOptions = Array.isArray(options.tabs) ?
                           options.tabs.map(Options) :
                           [ Options(options.tabs) ];
      }
      else if ('url' in options) {
        this._tabOptions = [ Options(options.url) ];
      }
      this._load();
	

      return this;
    },
    _tabOptions: [],
    _onLoad: function() {
      try {
        this.__initWindowTabTracker();
      } catch(e) {
        this._emit('error', e)
      }
      this._emitOnObject(browserWindows, 'open', this._public);
    },
    _onUnload: function() {
      this._destroyWindowTabTracker();
      this._emitOnObject(browserWindows, 'close', this._public);
      this._window = null;
      // Removing reference from the windows array.
      windows.splice(windows.indexOf(this), 1);
      this._removeAllListeners('close');
      this._removeAllListeners('open');
      this._removeAllListeners('ready');
    },
    close: function close(callback) {
      // maybe we should deprecate this with message ?
      if (callback) this.on('close', callback);
      return this._close();
    }
  })
);
/**
 * Wrapper for `BrowserWindowTrait`. Creates new instance if wrapper for
 * window doesn't exists yet. If wrapper already exists then returns it
 * instead.
 * @params {Object} options
 *    Options that are passed to the the `BrowserWindowTrait`
 * @returns {BrowserWindow}
 * @see BrowserWindowTrait
 */
function BrowserWindow(options) {
  let chromeWindow = options.window;
  for each (let window in windows) {
    if (chromeWindow == window._window)
      return window._public
  }
  let window = BrowserWindowTrait(options);
  return window._public;
}
// to have proper `instanceof` behavior will go away when #596248 is fixed.
BrowserWindow.prototype = BrowserWindowTrait.prototype;
exports.BrowserWindow = BrowserWindow
const windows = [];
const windowsId={};
/**
 * `BrowserWindows` trait is composed out of `List` trait and it represents
 * "live" list of currently open browser windows. Instance mutates itself
 * whenever new browser window gets opened / closed.
 */
// Very stupid to resolve all `toStrings` but this will be fixed by #596248
const browserWindows = Trait.resolve({ toString: null }).compose(
  List.resolve({ constructor: '_initList' }),
  EventEmitter.resolve({ toString: null }),
  WindowTrackerTrait.resolve({ constructor: '_initTracker', toString: null }),
  Trait.compose({
    _emit: Trait.required,
    _add: Trait.required,
    _remove: Trait.required,

    // public API

    /**
     * Constructor creates instance of `Windows` that represents live list of open
     * windows.
     */
    constructor: function BrowserWindows() {
      this._trackedWindows = [];
      this._initList();
      this._initTracker();
      unload.ensure(this, "_destructor");
    },
    _destructor: function _destructor() {
      this._removeAllListeners('open');
      this._removeAllListeners('close');
    },
	get:function(id){return windowsId[id];},
    /**
     * This property represents currently active window.
     * Property is non-enumerable, in order to preserve array like enumeration.
     * @type {Window|null}
     */
    get activeWindow() {
      let window = WM.getMostRecentWindow(BROWSER);
      return window && this._isBrowser(window) ? BrowserWindow({ window: window }) : null;
    },
    open: function open(options) {
      if (typeof options === "string")
        // `tabs` option is under review and may be removed.
        options = { tabs: [Options(options)] };
		
		if(options.type=="app"){
		var windowOptions='centerscreen,titlebar=yes,resizable=yes,minimizable=yes';
		if(options.width){
			windowOptions+=",width="+options.width ; 
		}
		if(options.width){
			windowOptions+=",height="+options.height ; 
		}
			var window=Services.ww.openWindow(null,options.url, '_blank',windowOptions, null);
			options={window:window,type:"app"};
		}
      return BrowserWindow(options);
    },
    /**
     * Returns true if specified window is a browser window.
     * @param {nsIWindow} window
     * @returns {Boolean}
     */
    _isBrowser: function _isBrowser(window)
      BROWSER === window.document.documentElement.getAttribute("windowtype")
    ,
     /**
      * Internal listener which is called whenever new window gets open.
      * Creates wrapper and adds to this list.
      * @param {nsIWindow} chromeWindow
      */
    _onTrack: function _onTrack(chromeWindow) {   		
      if (!this._isBrowser(chromeWindow)) return;
      let window = BrowserWindow({ window: chromeWindow });
      this._add(window);
      this._emit('open', window);
    },
    /**
     * Internal listener which is called whenever window gets closed.
     * Cleans up references and removes wrapper from this list.
     * @param {nsIWindow} window
     */
    _onUntrack: function _onUntrack(chromeWindow) {
      if (!this._isBrowser(chromeWindow)) return;
      let window = BrowserWindow({ window: chromeWindow });
      // `_onUnload` method of the `BrowserWindow` will remove `chromeWindow`
      // from the `windows` array.
      this._remove(window);
      this._emit('close', window);
    }
    
  }).resolve({ toString: null })
)();
exports.browserWindows = browserWindows;

