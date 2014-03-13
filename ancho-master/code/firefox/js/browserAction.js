(function() {

  var Cu = Components.utils;

  Cu.import('resource://gre/modules/Services.jsm');

  //var Event = require('./event');
  var Utils = require('./utils');
  var Binder = require('./binder');

  const BUTTON_ID = '__ANCHO_BROWSER_ACTION_BUTTON__';
  const CANVAS_ID = '__ANCHO_BROWSER_ACTION_CANVAS__';
  const HBOX_ID = '__ANCHO_BROWSER_ACTION_HBOX__';
  const IMAGE_ID = '__ANCHO_BROWSER_ACTION_IMAGE__';
  const PANEL_ID = '__ANCHO_BROWSER_ACTION_PANEL__';
  const NAVIGATOR_TOOLBOX = 'navigator-toolbox';
  const TOOLBAR_ID = 'nav-bar';
  const BROWSER_ACTION_ICON_WIDTH = 19;
  const BROWSER_ACTION_ICON_HEIGHT = 19;

  var extensionIconMap = {};

  function BrowserActionIcon(extension) {
    this._extension = extension;
    this._manifest = extension.manifest;

    this._iconType = null;
    this._badgeText = null;
    this._badgeBackgroundColor = '#f00';
    this._tabBadgeText = {};
    this._tabBadgeBackgroundColor = {};
  }

  BrowserActionIcon.prototype = {
    init: function() {
      // TODO: this.onClicked = new Event();
      if (this._manifest.browser_action && this._manifest.browser_action.default_icon) {
        this._iconType = 'browser_action';
      }
      else if (this._manifest.page_action && this._manifest.page_action.default_icon) {
        this._iconType = 'page_action';
      }

      if (this._iconType) {
        this._extension.windowWatcher.register(function(win, context) {
          this.startup(win);
          var tabbrowser = win.document.getElementById('content');
          var container = tabbrowser.tabContainer;
          context.listener = function() {
            this.setIcon(win, {});
          }.bind(this);
          container.addEventListener('TabSelect', context.listener, false);
        }.bind(this), function(win, context) {
          var tabbrowser = win.document.getElementById('content');
          var container = tabbrowser.tabContainer;
          container.removeEventListener('TabSelect', context.listener, false);
          this.shutdown(win);
        }.bind(this));
      }
    },

    _getElementId: function(id) {
      return id + this._extension.id;
    },

    _installAction: function(window, button, iconPath) {
      var document = window.document;
      var panel = document.createElement('panel');
      panel.id = this._getElementId(PANEL_ID);
      var iframe = document.createElement('iframe');
      iframe.setAttribute('type', 'chrome');

      document.getElementById('mainPopupSet').appendChild(panel);
      panel.appendChild(iframe);

      var hbox = document.createElement('hbox');
      hbox.id = this._getElementId(HBOX_ID);
      hbox.setAttribute('hidden', 'true');
      panel.appendChild(hbox);

      // Catch keypresses that propagate up to the panel so that they don't get processed
      // by the toolbar button.
      panel.addEventListener('keypress', function(event) {
        event.stopPropagation();
      }, false);

      button.addEventListener('click', function(event) {
        this.clickHandler(event);
      }.bind(this), false);
      this.setIcon(window, { path: iconPath });
    },

    installBrowserAction: function(window) {
      var id = this._getElementId(BUTTON_ID);
      var document = window.document;
      if (document.getElementById(id)) {
        // We already have the toolbar button.
        return;
      }
      var toolbar = document.getElementById(TOOLBAR_ID);
      if (!toolbar) {
        // No toolbar in this window so we're done.
        return;
      }
      var buttonText = this._extension.getLocalizedText(this._manifest.browser_action.default_title);

      var toolbarButton = document.createElement('toolbarbutton');
      toolbarButton.setAttribute('id', id);
      toolbarButton.setAttribute('type', 'button');
      toolbarButton.setAttribute('removable', 'true');
      toolbarButton.setAttribute('class', 'toolbarbutton-1 chromeclass-toolbar-additional');
      toolbarButton.setAttribute('label', buttonText);
      toolbarButton.setAttribute('tooltiptext', buttonText);

      var iconPath = this._extension.getURL(this._manifest.browser_action.default_icon);
      toolbarButton.style.listStyleImage = 'url(' + iconPath + ')';
      var palette = document.getElementById(NAVIGATOR_TOOLBOX).palette;
      palette.appendChild(toolbarButton);

      var currentset = toolbar.getAttribute('currentset').split(',');
      var index = currentset.indexOf(id);
      if (index === -1) {
        if (this._extension.firstRun) {
          // No button yet so add it to the toolbar.
          toolbar.appendChild(toolbarButton);
          toolbar.setAttribute('currentset', toolbar.currentSet);
          document.persist(toolbar.id, 'currentset');
        }
      }
      else {
        var before = null;
        for (var i=index+1; i<currentset.length; i++) {
          before = document.getElementById(currentset[i]);
          if (before) {
            toolbar.insertItem(id, before);
            break;
          }
        }
        if (!before) {
          toolbar.insertItem(id);
        }
      }

      this._installAction(window, toolbarButton, iconPath);
    },

    installPageAction: function(window) {
      var id = this._getElementId(BUTTON_ID);
      var document = window.document;
      if (document.getElementById(id)) {
        // We already have the toolbar button.
        return;
      }
      var image = document.createElement('image');
      image.setAttribute('id', id);
      image.setAttribute('class', 'urlbar-icon');

      var iconPath = this._extension.getURL(this._manifest.page_action.default_icon);
      image.style.listStyleImage = 'url(' + iconPath + ')';

      var icons = document.getElementById('urlbar-icons');
      icons.insertBefore(image, icons.firstChild);

      this._installAction(window, image, iconPath);
    },

    showPopup: function(panel, iframe, document) {
      panel.style.visibility = 'hidden';
      // Deferred loading of scripting.js since we have a circular reference that causes
      // problems if we load it earlier.
      var loadHtml = require('./scripting').loadHtml;
      loadHtml(this._extension, document, iframe, this._extension.getURL(this._manifest[this._iconType].default_popup), function() {
        iframe.contentDocument.addEventListener('readystatechange', Binder.bindAnonymous(this, function(event) {
          iframe.contentDocument.removeEventListener('readystatechange', Binder.unbindAnonymous(), false);
          panel.style.removeProperty('visibility');
        }), false);
        var body = iframe.contentDocument.body;
        // Need to float the body so that it will resize to the contents of its children.
        if (!body.style.cssFloat) {
          body.style.cssFloat = 'left';
        }
        // We need to intercept link clicks and open them in the current browser window.
        body.addEventListener('click', function(event) {
          var link = event.target;
          if (link.href) {
            event.preventDefault();
            var browser = document.getElementById('content');
            if ('_newtab' === link.target) {
              browser.selectedTab = browser.addTab(link.href);
            }
            else {
              browser.contentWindow.open(link.href, link.target);
            }
            panel.hidePopup();
            return false;
          }
        }, false);

        // Remember the height and width of the popup.
        // Check periodically and resize it if necessary.
        var oldHeight = 0,
          oldWidth = 0;
        function getPanelBorderWidth(which) {
          return parseFloat(document.defaultView.getComputedStyle(panel)['border' + which + 'Width']);
        }

        function resizePopup() {
          if (body.scrollHeight !== oldHeight && body.scrollWidth !== oldWidth) {
            oldHeight = iframe.height = body.scrollHeight + 1;
            oldWidth = iframe.width = body.scrollWidth + 1;
            panel.sizeTo(oldWidth + getPanelBorderWidth('Left') + getPanelBorderWidth('Right'),
              oldHeight + getPanelBorderWidth('Top') + getPanelBorderWidth('Bottom'));
          }
        }
        iframe.contentDocument.addEventListener('MozScrolledAreaChanged', function(event) {
          resizePopup();
        }, false);
        iframe.contentWindow.close = function() {
          panel.hidePopup();
        };
      });
    },

    clickHandler: function(event) {
      var document = event.target.ownerDocument;
      if (event.target !== document.getElementById(this._getElementId(BUTTON_ID))) {
        // Only react when button itself is clicked (i.e. not the panel).
        return;
      }
      var self = this;
      var button = event.target;
      var panel = document.getElementById(this._getElementId(PANEL_ID));
      var iframe = panel.firstChild;
      iframe.setAttribute('src', 'about:blank');
      panel.addEventListener('popupshowing', Binder.bindAnonymous(this, function(event) {
        panel.removeEventListener('popupshowing', Binder.unbindAnonymous(), false);
        self.showPopup(panel, iframe, document);
      }), false);
      panel.openPopup(button, 'after_start', 0, 0, false, false);
    },

    _drawButton: function(tabId, button, canvas) {
      var ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = 'bold 9px sans-serif';

      var text = this.getBadgeText(tabId);
      if (text)
      {
        var w = ctx.measureText(text).width;
        var h = 7;

        var rp = ((canvas.width - 4) > w) ? 2 : 1; // right padding = 2, or 1 if text is wider
        var x = canvas.width - w - rp;
        var y = canvas.height - h - 1; // 1 = bottom padding

        var color = this.getBadgeBackgroundColor(tabId);
        ctx.fillStyle = color;
        ctx.fillRect(x-rp, y-1, w+rp+rp, h+2);
        ctx.fillStyle = '#fff'; // text color
        ctx.fillText(text, x, y);
      }

      button.image = canvas.toDataURL('image/png', '');  // set new toolbar image
    },

    _getTabIdForWindow: function(window) {
      var browser = window.document.getElementById('content');
      return Utils.getWindowId(browser.contentWindow);
    },

    setIcon: function(window, details) {
      var document = window.document;
      var hbox = document.getElementById(this._getElementId(HBOX_ID));
      var canvas = document.getElementById(this._getElementId(CANVAS_ID));
      if (!canvas) {
        canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.id = this._getElementId(CANVAS_ID);
        hbox.appendChild(canvas);
      }
      var img = document.getElementById(this._getElementId(IMAGE_ID));
      if (!img) {
        img = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
        img.id = this._getElementId(IMAGE_ID);
        hbox.appendChild(img);
      }

      canvas.setAttribute('width', BROWSER_ACTION_ICON_WIDTH);
      canvas.setAttribute('height', BROWSER_ACTION_ICON_HEIGHT);
      var ctx = canvas.getContext('2d');
      var button = document.getElementById(this._getElementId(BUTTON_ID));
      var tabId = this._getTabIdForWindow(window);

      var self = this;
      if (details.path) {
        img.onload = function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          self._drawButton(tabId, button, canvas, ctx);
        };
        img.src = details.path;
      }
      else if (details.imageData) {
        ctx.putImageData(details.imageData, 0, 0);
        self._drawButton(tabId, button, canvas, ctx);
      }
      else {
        // No image provided so just update the badge using the existing image.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        self._drawButton(tabId, button, canvas, ctx);
      }
    },

    updateIcon: function(details) {
      var self = this;
      this._extension.windowWatcher.forAllWindows(function(window) {
        self.setIcon(window, details);
      });
    },

    shutdown: function(window) {
      var document = window.document;
      var button = document.getElementById(this._getElementId(BUTTON_ID));
      var parent = button.parentNode;
      if (parent.contains(button)) {
        button.parentNode.removeChild(button);
      }
      var panel = document.getElementById(this._getElementId(PANEL_ID));
      parent = panel.parentNode;
      if (parent.contains(panel)) {
        parent.removeChild(panel);
      }
      delete extensionIconMap[this._extension.id];
    },

    startup: function(window) {
      switch(this._iconType) {
        case 'browser_action':
          this.installBrowserAction(window);
          break;
        case 'page_action':
          this.installPageAction(window);
          break;
      }
    },

    getBadgeBackgroundColor: function(tabId) {
      if (this._tabBadgeBackgroundColor[tabId]) {
        return this._tabBadgeBackgroundColor[tabId];
      }
      else {
        return this._badgeBackgroundColor;
      }
    },

    getBadgeText: function(tabId) {
      if (this._tabBadgeText[tabId]) {
        return this._tabBadgeText[tabId];
      }
      else {
        return this._badgeText;
      }
    },

    setBadgeBackgroundColor: function(tabId, color) {
      if ('undefined' !== typeof(tabId)) {
        this._tabBadgeBackgroundColor[tabId] = color;
      }
      else {
        this._badgeBackgroundColor = color;
      }
      this.updateIcon({});
    },

    setBadgeText: function(tabId, text) {
      if ('undefined' !== typeof(tabId)) {
        this._tabBadgeText[tabId] = text;
      }
      else {
        this._badgeText = text;
      }
      this.updateIcon({});
    }
  };

  var BrowserActionAPI = function(extension) {
    if (!(extension.id in extensionIconMap)) {
      this._icon = new BrowserActionIcon(extension);
      this._icon.init();
      extensionIconMap[extension.id] = this._icon;
    }
    else {
      this._icon = extensionIconMap[extension.id];
    }
  };

  BrowserActionAPI.prototype.getBadgeBackgroundColor = function(details, callback) {
    callback(this._icon.getBadgeBackgroundColor(details.tabId));
  };

  BrowserActionAPI.prototype.getBadgeText = function(details, callback) {
    callback(this._icon.getBadgeText(details.tabId));
  };

  BrowserActionAPI.prototype.getPopup = function() {
    throw new Error('Unsupported method');
  };

  BrowserActionAPI.prototype.getTitle = function() {
    throw new Error('Unsupported method');
  };

  BrowserActionAPI.prototype.setBadgeBackgroundColor = function(details) {
    function colorToString(color) {
      if ('string' === typeof(color)) {
        // TODO: Support three digit RGB codes.
        if (/#[0-9A-F]{6}/i.exec(color)) {
          return color;
        }
      } else if (Array.isArray(color)){
        if (color.length === 3) {
          // TODO: Support alpha.
          var str = '#';
          for (var i = 0; i < 3; ++i) {
            var tmp = Math.max(0, Math.min(color[i], 255));
            str += tmp.toString(16);
          }
          return str;
        }
      }
      throw new Error('Unsupported color format');
    }

    this._icon.setBadgeBackgroundColor(details.tabId, colorToString(details.color));
  };

  BrowserActionAPI.prototype.setBadgeText = function(details) {
    this._icon.setBadgeText(details.tabId, details.text);
  };

  BrowserActionAPI.prototype.setPopup = function() {
    throw new Error('Unsupported method');
  };

  BrowserActionAPI.prototype.setTitle = function() {
    throw new Error('Unsupported method');
  };

  BrowserActionAPI.prototype.setIcon = function(details) {
    this._icon.updateIcon(details);
  };


  module.exports = BrowserActionAPI;

}).call(this);
