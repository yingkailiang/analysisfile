/* global _, $, async */

(function() {
  "use strict";

  function fetchStories(){
    var refreshIntervalInMinutes = 5;
    var epochTime = (new Date()).getTime();
    var feed = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fna.leagueoflegends.com%2Fen%2Frss.xml?" + epochTime  + "'&format=json&diagnostics=true&callback=JSON_CALLBACK";

    async.waterfall([
      // DEBUG: Empty Local Storage
      // function(done){
      //   chrome.storage.local.set({"stories": null}, function(){
      //     done(null);
      //   });
      // },
      // Fetch Feed
      function(done){
        $.ajax({
          url: feed,
          type : "GET",
          cache: false,
          dataType : "jsonp",
          jsonpCallback: "JSON_CALLBACK",
          success: function(data) {
            if (data.query.results) {
              done(null, data.query.results.item);
            }
            else {
              done("No results found");
            }
          },
          error: function() {
            done("Error fetching feed");
          }
        });
      },
      // Fetch stories from Local Storage
      function(incomingStories, done){
        chrome.storage.local.get("stories", function(items){
          var existingStories = items.stories || [];
          done(null, incomingStories, existingStories);
        });
      },
      // Merge incoming stories & existing stories and persist to Local Stories
      function(incomingStories, existingStories, done){
        var mergedStories = _.union(incomingStories, existingStories);
        mergedStories = _.uniq(mergedStories, function(story){
          return story.title;
        });

        chrome.storage.local.set({"stories": mergedStories}, function(){
          var newStoriesCount = _.size(mergedStories) - _.size(existingStories);
          done(null, newStoriesCount);
        });
      },
      // Calculate unread count and persiste to Sync Storage
      function(newStoriesCount, done){
        chrome.storage.sync.get("unreadStoriesCount", function(result){
          var oldUnreadCount = parseInt(result.unreadStoriesCount, 10);
          var unreadStoriesCount;

          if(isNaN(oldUnreadCount)) {
            unreadStoriesCount = 0;
          } else {
            unreadStoriesCount = newStoriesCount + oldUnreadCount;
          }

          // Save unread count to sync storae
          chrome.storage.sync.set({"unreadStoriesCount": unreadStoriesCount}, function(){
            done(null, unreadStoriesCount);
          });
        });
      },
      // Update browser badge
      function(unreadStoriesCount, done){
        if (unreadStoriesCount !== 0) {
          chrome.browserAction.setBadgeBackgroundColor({color: [0, 255, 0, 255]});
          chrome.browserAction.setBadgeText({text: unreadStoriesCount.toString()});
        }
        done(null);
      }
    ], function () {
      window.setTimeout(fetchStories, refreshIntervalInMinutes * 60 * 1000 );
    });
  }

  fetchStories();

})();
