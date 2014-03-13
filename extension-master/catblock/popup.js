KISSY.ready(function(S){
    KISSY.Event.on('.a','click', function(e){
        e.halt();
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendRequest(tab.id, {qs: "getImageInfo"}, function(response) {

            });
        });
    })

    KISSY.Event.on('.b','click', function(e){
        e.halt();
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendRequest(tab.id, {qs: "clearCache"}, function(response) {

            });
        });
    })
});