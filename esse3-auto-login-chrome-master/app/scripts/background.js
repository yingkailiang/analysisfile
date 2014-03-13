'use strict';

/* global Prefs */

var prefs = new Prefs();

var settings = {
    credentials: {},
    portal: '',
    studentId: ''
};

var getPortal = function(callback) {
    prefs.getPortal(function(_portal) {
        settings.portal = _portal;
        if (callback) { callback(); }
    });
};
var getCredentials = function(callback) {
    prefs.getCredentials(function(_credentials) {
        settings.credentials = _credentials;
        if (callback) { callback(); }
    });
};
var getStudentId = function(callback) {
    prefs.getStudentId(function(_studentId) {
        settings.studentId = _studentId;
        if (callback) { callback(); }
    });
};

var requests = [];

var callbackFn = function(details, callbackFn) {
    console.log('Authentication request intercepted.');
    var pendingReqIndex = $.inArray(details.requestId, requests);
    // If there is already a pending request
    if (pendingReqIndex > -1) {
        // Remove it and let the user enter its data
        requests.splice(pendingReqIndex, 1);
        callbackFn();
    } else {
        // Otherwise save the request and try to log in
        requests.push(details.requestId);
        callbackFn({
            authCredentials: {
                username: settings.credentials.username,
                password: settings.credentials.password
            }
        });
    }
};

var callback;

var setAuthenticationInterceptor = function() {
    callback = callbackFn;

    var optExtraInfoSpec = ['asyncBlocking'];

    getPortal(function() {
        var filter = {
            urls: [settings.portal + '*']
        };
        if (callback) {
            chrome.webRequest.onAuthRequired.removeListener(callback);
        }
        chrome.webRequest.onAuthRequired.addListener(callback, filter, optExtraInfoSpec);
    });
};

function main() {
    // Logs the previous version
    chrome.runtime.onInstalled.addListener(function (details) {
        console.log('previousVersion', details.previousVersion);
    });

    // Opens the options page on click
    chrome.browserAction.onClicked.addListener(function() {
        chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function() {
        });
    });

    // Authentication handler
    setAuthenticationInterceptor();
}

function init() {
    // Initialize settings variables
    getCredentials();
    getStudentId();

    // Add storage listener, to keep settings in sync
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (var key in changes) {
            var storageChange = changes[key];
            console.log('Storage key "%s" in namespace "%s" changed. ' +
                        'Old value was "%s", new value is "%s".',
                        key, namespace, storageChange.oldValue, storageChange.newValue);
            if (key === 'prefs') {
                settings = changes[key].newValue;
            }
            // Reset the listener
            setAuthenticationInterceptor();
        }
    });

    main();
}

init();