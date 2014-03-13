// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview This script runs before anything else is initialized within
 * Pulsar in order to set the CLOSURE_NO_DEPS variable and load CSS before
 * Closure is initialized. It is included by both the main app and the Platform
 * not Supported dialog. When building Pulsar in debug mode, this file must run
 * before base.js, so this should not be compiled into pulsar_ui.js.
 * @author khorimoto@google.com (Kyle Horimoto)
 */

var CLOSURE_NO_DEPS = true;

// Path names of the html files that can be loaded by Pulsar.
var AppPathnames = {
  MAIN_APP: '/pulsar_ui.html',
 //PLATFORM_NOT_SUPPORTED: '/pulsar_ui.html'
};

// Selecting the stylesheet based on BiDi.
// We want to do this as early as possible while loading HTML so we will not
// start rendering without the CSS.
(function() {
  var link = document.getElementById('compiled_css');
     link.href = 'pulsar_ui_' + chrome.i18n.getMessage('@@bidi_dir') + '.css';
 
  }
)();
