/*global chrome:false*/
'use strict';


/*
 * Refresh all item statuses
 */
(function (exports,
           remoteScrape,
           notifyListeners,
           items,
           itemHistory) {

  // true if we're waiting on the server to update prices
  var refreshing = false;

  // public API for checking the refresh status
  exports.isRefreshing = function () {
    return refreshing;
  };
  
  exports.refresh = function (cb) {
    var changed = 0;
    var toProc = items.length;

    refreshing = true;
    notifyListeners();

    // if there are no items, immediately return that there was no change
    if (items.length === 0) {

      // needs to be called async because Angular
      setTimeout(function () {
        refreshing = false;
        cb(0);
      }, 0);
    }
    items.forEach(function (item, i) {
      remoteScrape(item.url, function (updatedItem) {
        if (updatedItem) {
          if (items[i].price !== updatedItem.price) {

            changed += 1;
            items[i].oldPrice = items[i].price;
            items[i].price = updatedItem.price;

            if (window.updated.indexOf(item) === -1) {
              window.updated.push(item);
            }
          }
          item.updated = Date.now();
          itemHistory[item.url].push(item.price);

          // limit itemHistory to 60 refreshes
          if (itemHistory[item.url].length > 30) {
            itemHistory[item.url].shift();
          }
        }
        toProc -= 1;
        if (toProc === 0) {
          refreshing = false;
          notifyListeners();
          if (cb) {
            cb(changed);
          }
          if (changed > 0) {
            chrome.browserAction.setBadgeText({
              text: changed.toString()
            });
          }
        }
      });
    });
  };

}(window,
  window.remoteScrape,
  window.notifyListeners,
  window.items,
  window.itemHistory));
