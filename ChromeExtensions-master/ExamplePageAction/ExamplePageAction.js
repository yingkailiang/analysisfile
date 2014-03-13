function putPageActionForEachUrl(tabId, changeInfo, tab) {
    chrome.pageAction.show(tabId);
};

chrome.tabs.onUpdated.addListener(putPageActionForEachUrl);
