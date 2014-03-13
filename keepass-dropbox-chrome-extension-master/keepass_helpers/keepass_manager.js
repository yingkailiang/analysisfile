$(document).ready(function() {
  $('form').submit(function() {
    chrome.storage.local.set({'database': $('input[name="database"]').val()}, function() {});
    var port = chrome.runtime.connect({'name': 'authenticator'});
    port.onMessage.addListener(function() {
      // One way street.
      port.disconnect();
    });
    port.postMessage({
      database: $('input[name="database"]').val(),
      password: $('input[name="password"]').val()
    });
    return false;
  });
  chrome.storage.local.get(function(items) {
    $('input[name="database"]').val(items.database);
  });
});