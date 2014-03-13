wsCallbacks = {
  onopen: function(e) {
    console.log('Connection OPEN');
    addToQueue({cmd: 'START'});
  },

  onmessage: function(e) {
    console.log(e);
    var data = e.data;
    data = JSON.parse(data);
    console.log("url " + data + data.cmd);
    if (data.cmd == 'URL') {
      var url = data.url;
      chrome.tabs.create({url: url});
    }
  },

  onclose: function(e) {
    console.log('Connection CLOSED');
  },

  onerror: function(e) {
    console.log('Connection ERROR', e);
  }
  
};