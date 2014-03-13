/* global moment, angular */
// http://dailyjs.com/2013/04/25/angularjs-3/
// "http://developer.yahoo.com/yql/console/#h=select+*+from+rss+where+url%3D"http%3A%2F%2Fna.leagueoflegends.com%2Fen%2Frss.xml""
// var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22http%3A%2F%2Fna.leagueoflegends.com%2Fen%2Frss.xml%22&format=json&diagnostics=true&callback=JSON_CALLBACK";

(function() {
  "use strict";

  var app = angular.module("leagueUpdateApp", []);

  app.controller("MainCtrl", function($scope, $filter) {

    // Stories
    $scope.stories = [];

    // Preload existing stories
    chrome.storage.local.get("stories", function(items) {
      $scope.stories = items.stories || [];
      $scope.stories = $filter("orderBy")($scope.stories, function(story){
        return new Date(story.pubDate);
      }, true);
      $scope.$apply();
    });

    // Save unread count to sync storae
    chrome.storage.sync.set({"unreadStoriesCount": 0}, function(){
      chrome.browserAction.setBadgeText({"text": ""});
    });

    // Subscribe to new stories
    chrome.storage.onChanged.addListener(function(changes, areaName) {
      if (areaName === "sync" && changes.stories) {
        $scope.stories = changes.stories;
      }

      $scope.stories = $filter("orderBy")($scope.stories, function(story){
        return new Date(story.pubDate);
      }, true);
      $scope.$apply();
    });

    // Opens a link in a new tab
    $scope.openInTab = function(link){
      chrome.tabs.create({url: link});
      return false;
    };
  });

  app.filter("fromNow", function() {
    return function(input) {
      return moment(input, "ddd, DD MMM YYYY HH:mm:ss ZZ").fromNow();
    };
  });
})();
