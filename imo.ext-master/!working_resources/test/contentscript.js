/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

function log(text) {
  chrome.extension.sendRequest({'action' : 'log', 'text' : text}, function() {});
};
 
var regex = /beam/;

// Test the text of the body element against our regular expression.
if (regex.test(document.body.innerText)) {
  // The regular expression produced a match, so notify the background page.
  chrome.extension.sendRequest({}, function(response) {});
  alert('ssss');
} else {
  // No match was found.
}
