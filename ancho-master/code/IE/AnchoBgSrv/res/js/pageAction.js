/******************************************************************************
 * pageAction.js
 * Part of Ancho browser extension framework
 * Implements chrome.pageAction
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 ******************************************************************************/

//******************************************************************************
//* requires
var utils = require("utils.js");
var Event = require("events.js").Event;
var EventFactory = utils.EventFactory;

var EVENT_LIST = ['onClicked'];
var API_NAME = 'pageAction';

require("pageAction_spec.js");
var preprocessArguments = require("typeChecking.js").preprocessArguments;
var notImplemented = require("typeChecking.js").notImplemented;

var addonRootURL = require("extension.js").addonRootURL;

var getLocalizedMessage = require("i18n.js").getLocalizedMessage;
var isLocalizedMessageIdentifier = require("i18n.js").isLocalizedMessageIdentifier;
var getLocalizedMessageFromIdentifier = require("i18n.js").getLocalizedMessageFromIdentifier;

//******************************************************************************
//* main closure
(function(){
  /* PageActionInfo class
   *  aTitleOrObject : another PageActionInfo to copy from or the title
   *  aIcon: the icon
   *  aPopup the popup
   */
  function PageActionInfo(aTitleOrObject, aIcon, aPopup) {
    if ('object' == typeof aTitleOrObject) {
      this.enabled = aTitleOrObject.enabled;
      this.title = aTitleOrObject.title;
      this.icon = aTitleOrObject.icon;
      this.popup = aTitleOrObject.popup;
    }
    else {
      this.enabled = false;
      this.title = aTitleOrObject || '';
      this.icon = aIcon || '';
      this.popup = aPopup || '';
    }
  }

  PageActionInfo.prototype = {
  };

  /* getIconFromCollection
   *  Get an icon from an object. Finds the best fitting icon, means, the one
   *  which is at least 16 px.
   *  Returns the full path for this icon.
   */
  function getIconFromCollection(collection) {
    var icon = null;
    for (var i in collection) {
      icon = collection[i];
      if (parseInt(i, 10) >= 16) {
        break;
      }
    }
    return icon ? addonAPI.path + icon : null;
  }

  /*
   * getPageAction
   *  Get a pageaction for a certain tab. If aCreateIfNotFound is true
   *  the page action info is created in any case. If not, and if it does not
   *  exist, the global page action info is returned.
   *  Getters should set aCreateIfNotFound to false, setters to true.
   */
  function getPageAction(aTabId, aCreateIfNotFound) {
    aCreateIfNotFound = ('undefined' == typeof aCreateIfNotFound) ?
        true :
        aCreateIfNotFound;
    if (aTabId) {
      // for a tab
      if ('undefined' == typeof pageActionsPerTab[aTabId]) {
        // does not exist
        if (aCreateIfNotFound) {
          // create
          pageActionsPerTab[aTabId] = new PageActionInfo(pageActionInfoGlobal);
          return pageActionsPerTab[aTabId];
        }
        // return global
        return pageActionInfoGlobal;
      }
      // exists
      return pageActionsPerTab[aTabId];
    }
    // global info requested
    return pageActionInfoGlobal;
  }

  /*
   * createPopup
   *  Create a popupup for this page action
   */
  function createPopup(aX, aY, aPopup) {
    var api = require("api.js");
    var apiId = api.reserveFullAPIInstanceID();
    var data = {
      chrome: api.createFullAPI(apiId),
      console: console
    };
    var cleanUpProcedure = function() {
      console.debug("Cleaning after popup window");
      api.releaseFullAPI(apiId);
    }
    console.debug("Creating popup window");
    serviceAPI.windowManager.createPopupWindow(addonRootURL + aPopup, aX, aY, data, cleanUpProcedure);
  }

  /*
   * onClick
   *  Click handler for page action toolbar button
   */
  function onClick(aTabId, aX, aY, aWidth, aHeight) {
    console.info("PAGEACTION clicked for " + addonAPI.id + " tab " + aTabId + " at " + aX + ", " + aY);
    aX += (aWidth / 2);
    aY += aHeight;
    var popup = getPageAction(aTabId).popup;
    if (popup) {
      createPopup(aX, aY, popup);
    }
    serviceAPI.invokeExternalEventObject(
          addonAPI.id,
          'pageAction.onClicked',
          [{}]//TODO - send tab info
          );
  }

  var pageActionInfoGlobal = null;
  var pageActionsPerTab = {};

  /*****************************************************************************
   * the API object
   */
  function PageAction(instanceID) {
    //----------------------------------------------------------------------------
    // chrome.pageAction.show
    this.show = function(tabId) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      getPageAction(tabId, true).enabled = true;
      serviceAPI.pageActionToolbar(tabId).show(addonAPI.id, tabId);
    };

    //----------------------------------------------------------------------------
    // chrome.pageAction.hide
    this.hide = function(tabId) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      getPageAction(tabId, true).enabled = false;
      serviceAPI.pageActionToolbar(tabId).hide(addonAPI.id, tabId);
    };

    //----------------------------------------------------------------------------
    // chrome.pageAction.setTitle
    this.setTitle = function(details) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      var args = preprocessArguments('chrome.pageAction.setTitle', arguments,
          'chrome.pageAction');
      getPageAction(args.details.tabId, true).title = args.details.title;
      serviceAPI.pageActionToolbar(args.details.tabId).setTitle(addonAPI.id, args.details.tabId, args.details.title);
    };

    //----------------------------------------------------------------------------
    // chrome.pageAction.getTitle
    this.getTitle = function(details, callback) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      var args = preprocessArguments('chrome.pageAction.getTitle', arguments,
          'chrome.pageAction');
      args.callback(getPageAction(tabId).title);
    };

    //----------------------------------------------------------------------------
    // chrome.pageAction.setIcon
    this.setIcon = function(details, callback) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      var args = preprocessArguments('chrome.pageAction.setIcon', arguments,
          'chrome.pageAction');
      var icon = null;
      if (args.details.path) {
        icon = ('object' === typeof args.details.path) ?
            getIconFromCollection(args.details.path) :
            addonAPI.path + args.details.path;
      }
/*
currently no support for imageData
      else if (args.details.imageData) {
        icon = serviceAPI.isImageData(args.details.imageData) ?
            args.details.imageData :
            getIconFromCollection(args.details.imageData);
      }
*/
      if (!icon) {
        throw new Error('No valid icon given.');
      }
      getPageAction(args.details.tabId, true).icon = icon;
      serviceAPI.pageActionToolbar(args.details.tabId).setIcon(addonAPI.id, args.details.tabId, icon);
    };

    //----------------------------------------------------------------------------
    // chrome.pageAction.setPopup
    this.setPopup = function(details) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      var args = preprocessArguments('chrome.pageAction.setPopup', arguments,
          'chrome.pageAction');
      getPageAction(args.details.tabId, true).popup = args.details.popup;
    };

    //----------------------------------------------------------------------------
    // chrome.pageAction.getPopup
    this.getPopup = function(details, callback) {
      if (!pageActionInfoGlobal) {
        throw new Error('This extension has no page action specified.');
      }
      var args = preprocessArguments('chrome.pageAction.getPopup', arguments,
          'chrome.pageAction');
      args.callback(getPageAction(tabId).popup);
    };
  }

  //============================================================================
  // exported API

  exports.createAPI = function(instanceID) {
    var retval = new PageAction(instanceID);
    EventFactory.createEvents(retval, instanceID, API_NAME, EVENT_LIST);
    return retval;
  }

  exports.releaseAPI = function(instanceID) {
    EventFactory.releaseEvents(instanceID, API_NAME, EVENT_LIST);
  }

  //Called from api.js - uses data provided from manifest
  exports.initPageAction = function(pageActionData) {
    if (pageActionData) {
      pageActionInfoGlobal = new PageActionInfo()

      // localize
      if (pageActionData.default_title && isLocalizedMessageIdentifier(pageActionData.default_title)) {
        pageActionInfoGlobal.title = getLocalizedMessageFromIdentifier(pageActionData.default_title);
      } else {
        pageActionInfoGlobal.title = pageActionData.default_title || '';
      }

      pageActionInfoGlobal.popup = pageActionData.default_popup || '';
      if ('object' === typeof pageActionData.default_icon) {
        pageActionInfoGlobal.icon =
            getIconFromCollection(pageActionData.default_icon);
      }
      else if ('string' === typeof pageActionData.default_icon) {
        pageActionInfoGlobal.icon = addonAPI.path + pageActionData.default_icon;
      }
   }
    console.info("pageAction INITIALIZED");
  }

  // called on each new tab
  exports.register = function(aInstanceID) {
    if (!pageActionInfoGlobal) {
      return;
    }
    serviceAPI.pageActionToolbar(aInstanceID).registerAction(
      addonAPI.id,
      aInstanceID,
      pageActionInfoGlobal.icon,
      pageActionInfoGlobal.title,
      onClick
    );
    console.info("pageAction REGISTERED for tab " + aInstanceID);
  }

  // called when a tab closes
  exports.unregister = function(aInstanceID) {
    var toolbar = serviceAPI.pageActionToolbar(aInstanceID);
    if (toolbar) {
      toolbar.unregisterAction(addonAPI.id, aInstanceID);
      console.info("pageAction UNREGISTERED for tab " + aInstanceID);
    }
  }

})();



