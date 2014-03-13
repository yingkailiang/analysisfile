// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

function Prefs() {
    this.defaults = {
        prefs: {
            portal: '',
            studentId: '',
            credentials: {
                username: '',
                password: ''
            }
        }
    };

    this.PORTAL = 'portal';
    this.STUDENT_ID = 'studentId';
    this.CREDENTIALS = 'credentials';
}

Prefs.prototype = {
    getP: function(key, callback) {
        chrome.storage.sync.get(this.defaults,
            function (storage) {
                callback(storage.prefs[key]);
            });
    },

    setP: function(key, value, callback) {
        chrome.storage.sync.get(this.defaults,
            function (storage) {
                storage.prefs[key] = value;
                chrome.storage.sync.set(storage, callback);
            });
    },

    getPortal: function(callback) {
        this.getP(this.PORTAL, callback);
    },

    setPortal: function(portal, callback) {
        this.setP(this.PORTAL, portal, callback);
    },

    getCredentials: function(callback) {
        this.getP(this.CREDENTIALS, callback);
    },

    setCredentials: function(credentials, callback) {
        this.setP(this.CREDENTIALS, credentials, callback);
    },

    getStudentId: function(callback) {
        this.getP(this.STUDENT_ID, callback);
    },

    setStudentId: function(studentId, callback) {
        this.setP(this.STUDENT_ID, studentId, callback);
    }
};