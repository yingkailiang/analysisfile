var disaOrEna = localStorage["status"];
var first_run = false;
if (!localStorage['ran_before']) {
  first_run = true;
  localStorage['ran_before'] = '1';
}
if (first_run) localStorage.setItem("status", true);
var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ?
    'runtime' : 'extension';
chrome[runtimeOrExtension].onMessage.addListener(
function (request, sender, sendResponse) {
    if (request.setIf) {
        if (request.setIf == 'enable') {
            localStorage.setItem("status", true);
        } else {
            localStorage.setItem("status", false);
        }
		disaOrEna = localStorage["status"];
		sendResponse({
            answerIf: disaOrEna
        });
    }
    if (request.checkIf) {
        disaOrEna = localStorage["status"];
        sendResponse({
            answerIf: disaOrEna
        });
    }
})