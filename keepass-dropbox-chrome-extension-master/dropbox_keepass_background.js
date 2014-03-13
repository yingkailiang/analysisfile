/**
 * Three steps really:
 * 1. oauth2 sign-in.
 * 2. Select KeyPassX file.
 * 3. Monitor web pages visiting for automatic auth.
 */

var client = new Dropbox.Client({
  key: DropboxClient.KEY
});
var manager_url = chrome.extension.getURL("keepass_helpers/keepass_manager.html");

// Make sure we can handle oauth2
client.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: "dropbox_helpers/chrome_oauth_receiver.html"}));
// Authenticate
// Cache credentials.
DropboxClient.authenticate(client, function () {}, {interactive: true});

// get database and password if exist.
var keepass_database = null;
if (localStorage.keepass_database_contents && localStorage.keepass_password) {
  var database_buf = kpdb.utils.str2ab(localStorage.keepass_database_contents);
  keepass_database = credentials.keepass(database_buf, localStorage.keepass_password);
}

function refreshDatabase() {
  client.readFile(localStorage.keepass_database, {arrayBuffer: true}, function(error, arrbuf_data, stat, range) {
    if (error) {
      DropboxClient.showError(error);
    } else {
      localStorage.keepass_database_contents = kpdb.utils.ab2str(arrbuf_data);
      keepass_database = credentials.keepass(arrbuf_data, localStorage.keepass_password);
    }
  });
}

function getCredentials(url, username) {
  if (keepass_database) {
    var response = keepass_database.getCredentials(url, username);
    if (response.length > 0) {
      return response[0];
    } else {
      refreshDatabase();
      return null;
    }
  } else{
    return null;
  }
}

var credentials_check_listener = function(port) {
  return function(info) {
    if (keepass_database) {
      port.postMessage(getCredentials(info.url, info.username));
    } else {
      focusOrCreateTab(manager_url);
    }
    port.disconnect();
  };
};

var dropbox_authenticator_listener = function(port) {
  return function(info) {
    var sender = port.sender;
    var tab_id = sender.tab.id;
    localStorage.keepass_database = info.database;
    localStorage.keepass_password = info.password;
    client.readFile(info.database, {arrayBuffer: true}, function(error, arrbuf_data, stat, range) {
      if (error) {
        DropboxClient.showError(error);  // Something went wrong.
        port.postMessage(null);
      } else {
        localStorage.keepass_database_contents = kpdb.utils.ab2str(arrbuf_data);

        // ArrayBuffer required
        keepass_database = credentials.keepass(arrbuf_data, info.password);
        chrome.tabs.remove(tab_id);

        port.postMessage(getCredentials(info.url, info.username));
      }
    });
  };
};

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name == "credentials check") {
    port.onMessage.addListener(credentials_check_listener(port));
  } else if (port.name == "authenticator") {
    port.onMessage.addListener(dropbox_authenticator_listener(port));
  } else if (port.name == "refresh database") {
    refreshDatabase();
  }
});
