'use strict';

/**
 * Method for creating basic auth header.
 *
 * Got function from here: http://stackoverflow.com/questions/5507234/how-to-use-basic-auth-and-jquery-and-ajax
 *
 * @param user The user who wants to authenticate
 * @param password The password of the user who wants to authenticate
 * @returns {string} The resulting header for basic auth to get the given user authenticated
 */
function makeBaseAuth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
}

/**
 * Get all feeds from Github for the user and select the public feed.
 */
function getFeedUrl() {
    console.log("get new feed url");
    try {
        // get all feeds for this user
        $.ajax({type:'GET', dataType:'json', url: 'https://api.github.com/feeds', timeout:5000, success:saveFeedUrl, async: false, beforeSend: function (xhr){ xhr.setRequestHeader('Authorization', makeBaseAuth(localStorage["username"], localStorage["password"]));}});
    } catch (e) {
        console.log("Error fetching feed list from Github. The server might be down or the api has changed. Will try it again the next time.");
    }
}

function saveFeedUrl(result) {
    console.log(result.current_user_url);
    localStorage["feedUrl"] = result.current_user_url;
}

/**
 * Get the public feed from Github and parse events
 */
function getFeed() {
    try {
        // call public feed for this user
        $.ajax({type:'GET', dataType:'json', url: localStorage["feedUrl"], timeout:5000, success:parsePublicFeed, error:recoverFromWrongPublicFeed, async: false});
    } catch (e) {
        console.log("Calling the feed resulted in error. Recovering in progress.");
    }

}

/**
 * Method checks all returned results from end to beginning (reverse), if more than one new event shows up we can show it
 * the user chronically correct.
 *
 * @param result The events in user feed provided by the Github API.
 */
function parsePublicFeed(result) {
    console.log(result);
    for (var i = result.length - 1; i >= 0; i--) {
        var entry = result[i];
        var createdAt = entry.created_at;
        var gravatarId = entry.actor_attributes.gravatar_id;

        console.log(entry);

        // create repository workflow
        if (entry.type == "CreateEvent" && isEventActive("CreateEvent") && entry.payload.ref_type == "repository") {
            if (localStorage["lastEntry"] < createdAt) {
                notify("New repository " + entry.repository.name + " created", entry.actor + " has created " + entry.repository.name + "! Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // star event workflow
        } else if (entry.type == "WatchEvent" && isEventActive("WatchEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                notify("Repository " + entry.repository.name + " starred", entry.actor + " has starred " + entry.repository.name + " in language " + entry.repository.language + "! Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // open source event workflow
        } else  if (entry.type == "PublicEvent" && isEventActive("PublicEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                notify("Repository " + entry.repository.name + " open sourced", entry.actor + " has open sourced " + entry.repository.name + "! Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // follow event workflow
        } else if (entry.type == "FollowEvent" && isEventActive("FollowEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                notify(entry.actor + " started following " + entry.payload.target.login, "Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        }
    }
}

/**
 * We want to cache the private url for the user, so we do not have to make two call every minute. When something went
 * wrong (maybe the url changes), we want to retrieve the new one.
 */
function recoverFromWrongPublicFeed() {
    console.log("get feed failed!");
    getFeedUrl();
}

/**
 * Function for checking, if a event is active
 * @param eventName The name of the event we want to check.
 * @returns {*}
 */
function isEventActive(eventName) {
    if (localStorage.getItem(eventName) == null || localStorage[eventName] == false) {
        return false;
    }

    return true;
}

/**
 * Send notification to user.
 *
 * @param title The title of the notification
 * @param text The text of the notification
 * @param link The link we want to send the user when he clicks the notification
 */
function notify(title, text, link, gravatarId) {
    var not = webkitNotifications.createNotification("http://www.gravatar.com/avatar/" + gravatarId, title, text);
    not.addEventListener("click", function () {
        window.open(link);
        not.close();
    });
    not.show();
}

/**
 * Method for polling. Gets the public feed and parses events.
 */
function run() {
    // initialize the localStorage for lastEntry
    if (localStorage["lastEntry"] == null) {
        localStorage["lastEntry"] = 0;
    }

    // just call the feedUrl, when nothing is set. If it expires, the next call will it recover -> cache pattern
    if (localStorage["feedUrl"] == null) {
        getFeedUrl();
    }

    // get feed events
    getFeed();
    window.setTimeout(run, 60000);
}

// initial run when extension is ready
run();

