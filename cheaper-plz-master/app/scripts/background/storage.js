/*global chrome:false*/
'use strict';

/*
 * Abstract methods for persisting data
 */
(function (exports, notifyListeners) {
  
    var local = {};

    // auto sync...
    chrome.storage.onChanged.addListener(function (changes, areaName) {
      var changeName, change;

      if (areaName === 'local') {

        for (changeName in changes) {
          if (changes.hasOwnProperty(changeName)) {
            change = changes[changeName];
            local[changeName] = change.newValue;
            api.set(changeName, change.newValue, notifyListeners);
          }
        }
      }
    });


    var api = exports.storage = {
      set: function (name, value, cb) {
        chrome.storage.sync.set({
          name: value
        }, cb || function () {});
      },

      get: function (name, cb) {
        chrome.storage.sync.get(name, function (item) {
          cb(item);
          notifyListeners();
        });
      }
    };

}(window, window.notifyListeners));
