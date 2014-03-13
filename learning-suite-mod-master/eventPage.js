Object.prototype.isEmpty = function() {
    for (var prop in this) if (this.hasOwnProperty(prop)) return false;
    return true;
};

var storage = chrome.storage.local;
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "data-link");
  port.onMessage.addListener(function(msg) {
    if (msg.type == "check") {
      storage.get(msg.data, function(item) {
        if (item.isEmpty()) {
          port.postMessage({flag: "n"});
        }
        else {
          var response = {};
          response['flag'] = "y";
          response['data'] = item[msg.data];
          port.postMessage(response);
        }
      });
    }
    else if (msg.type == "save") {
      var userName = msg.name;
      var userData = {}
      userData[userName] = msg.data;
      storage.set(userData);
    }
    else {
      port.postMessage({flag: "Neither"});
    }
  });
});
