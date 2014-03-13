cordova.define("org.chromium.bootstrap.helpers.ChromeExtensionURLs", function(require, exports, module) { // Copyright (c) 2013 The Chromium Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var exec = cordova.require('cordova/exec');

    exports.releaseReadyWait = function() {
        exec(null, null, 'ChromeExtensionURLs', 'release', [])
    };

});