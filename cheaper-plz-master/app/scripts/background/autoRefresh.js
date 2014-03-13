'use strict';


/*
 * Configure and start polling for changes
 */
(function (exports, notifyListeners) {
  
  var intervalDuration,
    intervalId;

  var setRefreshInterval = exports.setRefreshInterval = function (newInt) {
    if (!newInt) {
      return;
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalDuration = newInt;

    intervalId = setInterval(function () {
      if (exports.isRefreshing()) {
        return;
      }
      window.refresh(function (changed) {
        if (changed) {
          notifyListeners();
        }
      });
    }, intervalDuration);
  };

  // by default, update every one hour
  // TODO: persist this change
  setRefreshInterval(1000 * 60 * 60);

}(window, window.notifyListeners));
