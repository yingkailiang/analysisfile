/// <reference path="../../jquery-1.7.2.min.js" />
var sourl = getExtensionUrl('pages/buffer.html');
var notify = getExtensionUrl('pages/buffernotify.html');

function showBufferFrame(content) {
    var frameUrl = getBaseFrameUrl(content);
    if ($('#socialba_buffer').length > 0)
        $('#socialba_buffer').remove();
    var bufferframe = '<iframe scrolling="no" id="socialba_buffer" name="socialba_buffer" style="border: none; height: 100%; width: 100%; position: fixed !important; z-index: 99999999; top: 0px; left: 0px; display: block !important; max-width: 100% !important; max-height: 100% !important; padding: 0px !important;" src="' + frameUrl + '"></iframe>'
    $('body').append(bufferframe);
}

function showBufferFrame(content, model) {
    var frameUrl = getBaseFrameUrl(content) + "&model=" + model;
    if ($('#socialba_buffer').length > 0)
        $('#socialba_buffer').remove();
    var bufferframe = '<iframe scrolling="no" id="socialba_buffer" name="socialba_buffer" style="border: none; height: 100%; width: 100%; position: fixed !important; z-index: 99999999; top: 0px; left: 0px; display: block !important; max-width: 100% !important; max-height: 100% !important; padding: 0px !important;" src="' + frameUrl + '"></iframe>'
    $('body').append(bufferframe);
}

function getBaseFrameUrl(content) {
    var frameUrl = sourl + "?content=" + encodeURIComponent(content)
                 + "&ref=" + encodeURIComponent(document.location.href) + "&t=" + new Date().getTime();
    return frameUrl;
}

function hideBufferFrame() {
    var bufferframe = $('#socialba_buffer');
    bufferframe.fadeOut(388, function () { bufferframe.remove(); });
}

var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ?
                         'runtime' : 'extension';

chrome[runtimeOrExtension].onMessage.addListener(
  function (request, sender, sendResponse) {
      if (request.from == "socialba_buffer") {
          showBufferFrame(request.content, 'page');
      } else if (request.from == "socialba_buffer_notify") {
          var count = $('[tl=buffernotify]').length;
          if (count < 3) {
              var item = request.item;
              var frameUrl = notify + "?content=" + encodeURIComponent(item.tweet.message) + "&time=" + item.tweet.time;
              var notifyframe = '<iframe scrolling="no" tl="buffernotify" id="' + item.threadId + '" style="opacity:0;border: none; height: 100px; width: 250px; position: fixed !important; z-index: 99999999; bottom: ' + (30 + 110 * count) + 'px; right: -250px; display: block !important; max-width: 100% !important; max-height: 100% !important; padding: 0px !important;" src="' + frameUrl + '"></iframe>'
              $('body').append(notifyframe);
              $('#' + item.threadId).animate({ right: 0, opacity: 1 }, 388);
              setTimeout(function () {
                  $('#' + item.threadId).animate({ right: -250, opacity: 0 }, 388, function () {
                      $('#' + item.threadId).remove();
                  });
              }, 3 * 1000);
          }
      }
  });

window.addEventListener('message', receiveMessage, false);

function receiveMessage(evt) {
    if (evt.origin == sourl.replace('/pages/buffer.html', '')) {
        if (evt.data == "social_closebuffer") {
            hideBufferFrame();
        }
    }
}