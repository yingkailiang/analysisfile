

// local vars
var Leafy   = window.Leafy;
var session = Leafy.session;
var user    = Leafy.user;
var state   = {};

// Grab cookie
function grab_cookie() {
  var p = new $.Deferred();
  chrome.cookies.get({
    // url: 'http://localhost',
    url: 'http://useleafy.com',
    name: 'connect.sid'
  }, function(cookie) {
    if (cookie) {
      p.resolve(cookie.value);
    } else {
      p.reject();
    }
  })
  return p;
}

// Ensure session
function ensure_session(cookie) {
  console.log('Checking session')
  return session.ensure(cookie);
}

// Prompts for login
function no_session() {
  console.log('No session: Prompt for login');
  prompt_login();
}

// Grab bookmark info
function grab_bookmark(session) {

  console.log('Grabbing bookmark');

  if (!state.current_tab) {
    throw new Error('Current tab must be present here');
  };

  var tab = state.current_tab;
  var p   = new $.Deferred();

  var url   = state.trigger === 'link' ? state.linkUrl : tab.url;
  var title = state.trigger === 'link' ? state.selectionText : tab.title;

  p.resolve({
    url   : url,
    title : title
  });

  return p;
}

// Save bookmark
function save_bookmark(bookmark) {
  console.log('Saving bookmark');
  // Add bookmark for current user
  return user.addBookmark(bookmark);
}

// Failed to save bookmark
function failed_to_save_bookmark(e) {
  if (!e) {
    return;
  }
  if ("authenticated" in e && !e.authenticated) {
    return;
  }
  if (!e.errors) {
    return;
  }
  switch (e.errors.message) {
    case "User bookmark already exists.":
      notify_error("This bookmark already exists");
      break;
    default:
      notify_error("This seems to be some error. Please try again later");
      break;
  }
}

// Notify success with some visuals
function notify_success() {
  console.log('Notifying user bookmark is saved');
  var p = new $.Deferred();
  chrome.tabs.executeScript(null, {file:"src/js/vendor/jquery.min.js"}, function() {

    chrome.tabs.insertCSS(null, {file:"src/css/leafy.css"}, function() {
    });

    chrome.tabs.executeScript(null, {file:"src/js/saved-to-leafy.js"}, function() {
      p.resolve();
    });

  });
  return p;
}

// Notify error with some visuals
function notify_error(e) {

  console.log('Notifying user of error')

  var p = new $.Deferred();
  chrome.tabs.executeScript(null, {file:"src/js/vendor/jquery.min.js"}, function() {

    chrome.tabs.insertCSS(null, {file:"src/css/leafy.css"});

    chrome.tabs.executeScript(null, {file:"src/js/error.js"}, function() {

      chrome.tabs.executeScript({
        code: 'window._error("' + e + '");setTimeout(function() {delete window._error;}, 0);'
      });

      p.resolve();

    });

  });
  return p;

}

// Done
function finish() {
  if (state.trigger === 'page' || state.trigger === 'browserAction') {
    chrome.tabs.remove(state.current_tab.id);
  }
  state.proceeding    = false;
  state.current_tab   = null;
  state.trigger       = null;
  state.linkUrl       = null;
  state.selectionText = null;
  console.log('Finished!');
}


// Utilities

function prompt_login() {
  console.log('Prompt log in')
  chrome.tabs.executeScript({
    code: 'var child = window.open("http://useleafy.com/login", "leafy_sign_in", "height=600,width=600,top=500,left=500");window.addEventListener("message", function(event) {console.log(event.origin);console.log(event.data);if (event.origin === "http://useleafy.com" && event.data === "#/home") {chrome.runtime.sendMessage({authenticated: true}); clearInterval(timer); child.close();} else {detect();}}, false);function detect() {window.open("", "leafy_sign_in");child.postMessage("location_hash", "http://useleafy.com")};var timer = setInterval(function() {detect()}, 10)'
  });

  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Logged in!
    if (request.authenticated) {
      // debugger;
      // if (!!state.proceeding) {
      //   return;
      // }
      // state.proceeding = true;
      proceed();
    } else {
      console.log('User not authenticated');
      debugger;
    }
  });

}

// Processes
function proceed() {
  grab_cookie()
  .then(ensure_session)
  .fail(no_session)
  .then(grab_bookmark)
  .then(save_bookmark)
  .then(notify_success, failed_to_save_bookmark)
  .then(finish);
}

// Set up context menu tree at install time.
function contextMenuOnClick(info, tab) {

  // Track tab
  state.current_tab = tab;
  state.trigger     = !!info.linkUrl ? 'link' : 'page';

  if (state.trigger === 'link') {
    state.linkUrl       = info.linkUrl;
    state.selectionText = info.selectionText;
  }
  console.log(state);

  // Begin
  proceed();

}

chrome.contextMenus.onClicked.addListener(contextMenuOnClick);
chrome.runtime.onInstalled.addListener(function() {
  // Create one test item for each context type.
  var contexts = ["page", "link"];
  for (var i = 0; i < contexts.length; i++) {
    var id = chrome.contextMenus.create({
      "title"    : "Save to Leafy",
      "contexts" : [contexts[i]],
      "id"       : "context:" + contexts[i]
    });
  }
});


// Main (onclick browser icon)
chrome
.browserAction
.onClicked
.addListener(function(tab) {

  // Track trigger
  state.trigger = 'browserAction';

  // Track tab
  state.current_tab = tab;

  // Begin
  proceed();

});
