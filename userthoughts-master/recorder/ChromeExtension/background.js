var intervalId = null;
var queue = new Queue();
var STATE = 'off';
var TotalFramesCaptured = 0;
chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 100]});


function displayTime(){
  var min = 0;
  var sec = 0;

  displayTimeInterval = setInterval(function(){
    sec++;
    if(sec>59){
      min++;
      sec=0;
    }
    var sec_txt = sec.toString();
    if (sec<10) {
      sec_txt = '0'+sec.toString();
    }
    var lapseTime = min.toString()+':'+sec_txt;
    chrome.browserAction.setBadgeText({text: lapseTime});
  },1000);
}

function setIcon(icon){
  chrome.browserAction.setIcon({
    'path':'img/'+icon+'.png'
  });
}

function updateUploadProgress(){
  var progress = Math.round(queue.getLength()/TotalFramesCaptured*100).toString()+"%";
  chrome.browserAction.setBadgeText({text: progress});
}

function captureAndSendTab(){
  var opts = {
    format: window.config.IMG_FORMAT,
    quality: window.config.IMG_QUALITY
  };

  chrome.tabs.captureVisibleTab(null, opts, function(dataUrl) {
    addToQueue(convertDataURIToBlob(dataUrl, window.config.IMG_MIMETYPE));
    TotalFramesCaptured++;
  });
}

function endAfterTheBufferIsEmpty(){
    wsInterval = setInterval(
        function(){
            if (queue.getLength() === 0 && STATE == 'off') {
                clearInterval(wsInterval);
                clearInterval(sendInterval);
                ws = null;
                chrome.browserAction.setBadgeText({text: 'Start'});
                setIcon('start');
            }
        }, 250);
}

function sendFromQueue(){
  console.log("Sending from Queue");
  sendInterval = setInterval(function(){
    if(ws.bufferedAmount === 0 && queue.getLength()){
      ws.send(queue.dequeue());
      console.log("Sent another blob");
    }
    if (STATE == 'off') {
      updateUploadProgress();
    }

  },50);
}

function startRecording(){
  ws = WsSingleton.getInstance();
  setIcon('stop');
  console.log("Started Recording!");
  STATE = 'on';
  displayTime();
  intervalId = setInterval(function() {
                                        captureAndSendTab();}, 
                                        window.config.SEND_INTERVAL_MS);
  sendFromQueue();
}

function stopRecording(){
  clearInterval(intervalId);
  clearInterval(displayTimeInterval);
  console.log("Stopped Recording!");
  STATE = 'off';
  addToQueue({cmd: 'DONE'});
  endAfterTheBufferIsEmpty();
  intervalId = null;
}

chrome.browserAction.onClicked.addListener(function(tab) {
  if (!intervalId) {
    startRecording();
  } else {
    stopRecording();
  }
});
  


