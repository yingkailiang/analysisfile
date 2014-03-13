'use strict';


//TODO: rename; "data change" is awful.

/*
 * Register and respond to listeners from data change.
 * Data change
 */
(function (exports) {

  var dataChangeListeners = [];

  exports.addDataChangeListener = function (fn) {
    dataChangeListeners.push(fn);
  };

  exports.notifyListeners = function () {
    dataChangeListeners.forEach(function (listener) {
      setTimeout(function () {
        try {
          listener();
        } catch (e) {}
      }, 0);
    });
  };

}(window));
