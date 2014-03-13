var backToIdleTimeout = 2000;
function setIdleIcon(){
    chrome.browserAction.setIcon({
        path : 'idle.png'
    });
}
chrome.browserAction.onClicked.addListener(function() {
    chrome.browserAction.setIcon({
        path : 'pending.png'
    });
    $.get('http://localhost:12000/build')
        .done(function(res){
            chrome.browserAction.setIcon({
                path : 'done.png'
            });
            chrome.tabs.reload();
            setTimeout(setIdleIcon, backToIdleTimeout);
            console.log('done', res);
        })
        .error(function(e){
            chrome.browserAction.setIcon({
                path : 'error.png'
            });
            setTimeout(setIdleIcon, backToIdleTimeout);
            console.log('not done', e);
        });
});