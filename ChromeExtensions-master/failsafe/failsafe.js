function addParam(url, param, value) {
    // http://stackoverflow.com/a/14386004/236014
    var a = document.createElement('a');
    a.href = url;
    a.search += a.search.substring(0,1) == "?" ? "&" : "?";
    a.search += encodeURIComponent(param) + "=" + encodeURIComponent(value);
    return a.href;
}

chrome.tabs.getSelected(null, function(tab) {
  var tabUrl = tab.url;
  chrome.tabs.update(tab.id, {url: addParam(tabUrl, 'failsafe', 'true')});
});
