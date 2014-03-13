$(document).ready(function() {
  $('#reset').submit(function() {
    var port = chrome.runtime.connect({
      'name': 'refresh database'
    });

    port.disconnect();

    return false;
  });
});