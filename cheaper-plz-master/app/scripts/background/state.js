'use strict';


/*
 * App State
 */
(function (exports,
           storage) {

  var items = exports.items = [];
  storage.get('items', function (data) {
    if (data) {
      items.concat(data);
    }
  });

  // hash of URLs
  var itemHistory = exports.itemHistory = {};
  storage.get('itemHistory', function (data) {
    for (var url in data) {
      if (data.hasOwnProperty(url)) {
        itemHistory[url] = data[url];
      }
    }
  });

  exports.removeItem = function (url) {
    if (itemHistory[url]) {
      var i;
      for (i = 0; i < items.length; i++) {
        if (items[i].url === url) {
          items.splice(i, 1);
          break;
        }
      }
      delete itemHistory[url];
    }
  };

  exports.clearUpdated = function () {
    exports.updated = [];
  };

  exports.getItems = function () {
    return exports.items;
  };

  exports.clearUpdated();

}(window,
  window.storage));
