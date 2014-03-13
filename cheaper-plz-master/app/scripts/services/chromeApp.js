/*global angular:false, chrome:false*/
'use strict';

/*
 * The chromeApp service acts as a bridge between the background page and the
 * Angular-driven user interfaces in `tab.html` and `popup.html`.
 */
angular.module('cheaperApp.chromeApp', [])
  .factory('chromeApp', function ($rootScope) {

    // define routing from other contexts
    // specifically, content scripts
    var commands = {};
    chrome.extension.onMessage.addListener(function(
      request,
      sender,
      sendResponse) {

      var command = request.command;
      var payload = request.payload;

      if (commands[command]) {
        commands[command](payload, sendResponse);
      }
    });

    commands.addItem = function (pl) {
      $rootScope.$apply();
    };

    // start a digest cycle whenever data changes (through refresh, sync, etc)
    chrome.extension.getBackgroundPage().addDataChangeListener(function () {
      $rootScope.$apply();
    });


    // Define external API
    var api = {

      /*
       * API for the list of items a user is watching
       */

      getItems: function () {
        return chrome.extension.getBackgroundPage().getItems();
      },

      removeItem: function (url) {
        return chrome.extension.getBackgroundPage().removeItem(url);
      },

      setItems: function (value) {
        chrome.extension.getBackgroundPage().store = value;
      },


      /*
       * API for the list of items that have changed
       */

      getUpdated: function () {
        return chrome.extension.getBackgroundPage().updated || [];
      },

      clearUpdated: function () {
        try {
          chrome.extension.getBackgroundPage().clearUpdated();
        }
        catch (e) {}
        api.clearUpdateAlert();
      },

      clearUpdateAlert: function () {
        // reset the badge text when the popup loads
        chrome.browserAction.setBadgeText({
          text: ''
        });
      },

      isRefreshing: function () {
        return chrome.extension.getBackgroundPage().isRefreshing();
      },


      /*
       * API for getting watched item price history
       */

      getItemHistory: function () {
        return chrome.extension.getBackgroundPage().itemHistory;
      },


      /*
       * API for opening new tabs
       */

      openTab: function (url) {
        chrome.tabs.create({
          url: url || 'tab.html'
        });
      },

      openHomepage: function () {
        chrome.tabs.create({
          url: 'http://cheaperplz.com'
        });
      },


      /*
       * API for checking items for price changes
       */

      scrapeCurrentPage: function () {
        chrome.tabs.getSelected(null, function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            command: 'scrapeCurrentPage'
          });
        });
      },

      refresh: function (cb) {
        chrome.extension.getBackgroundPage().refresh(function (diff) {
          $rootScope.$apply(function () {
            cb(diff);
          });
        });
      },

      setRefreshInterval: function (newInt) {
        chrome.extension.getBackgroundPage().setRefreshInterval(newInt);
      },

      getRefreshInterval: function () {
        return chrome.extension.getBackgroundPage().interval;
      }

    };

    return api;
  });
