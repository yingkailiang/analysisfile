document.addEventListener('DOMContentLoaded', function () {
    var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ?
        'runtime' : 'extension';
    document.querySelector('#disable').addEventListener('click', function () {
        setIf(false)
    }, false);
    document.querySelector('#enable').addEventListener('click', function () {
        setIf(true)
    }, false);

    function setIf(checkButton) {
        var whatButton = '';
        if (checkButton == true) whatButton = 'enable';
        else whatButton = 'disable';
        chrome[runtimeOrExtension].sendMessage({
            setIf: whatButton
        }, function (response) {
            makeIconAndButtons(response.answerIf);
        });
    }
    chrome[runtimeOrExtension].sendMessage({
        checkIf: 'checkStatus'
    }, function (response) {
        checkIfShowMishchi = response.answerIf;
        makeIconAndButtons(checkIfShowMishchi)
    });

    function makeIconAndButtons(resStatus) {
        if (resStatus == 'true') {
            document.querySelector('#statusRow').className = "statusRow";
            chrome.browserAction.setIcon({
                path: "icon.png"
            });
        } else {
            document.querySelector('#statusRow').className = "statusRow disable";
            chrome.browserAction.setIcon({
                path: "iconDisable.png"
            });
        }
    }
});