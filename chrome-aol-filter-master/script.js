var storage = chrome.storage.local;
var timeout = null;
var running = false;
var filters;
var rowStyle = "border-left: 5px solid #9933CC";
var titleStyle = "";

function handler() {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(listener, 500);
}

function listener() {    
    if ($("#feed-content").length > 0) { 
        running = true;
        $("#feed-content .article-list article").each(function(index) {
            var titleElement = $(this).find("p.title");
            var title = normalize(titleElement.text());
            for (var i = 0; i < filters.length; i++) {
                if (title.indexOf(filters[i]) >= 0) {
                    $(this).attr('style', rowStyle);
                    titleElement.attr('style', titleStyle);
                    break;
                }
            }
        });        
    }
    running = false;
}

storage.get({ "rowStyle":"", "titleStyle":"", "filter":"" } , function(items) {
    if (items.rowStyle) {
        rowStyle = items.rowStyle;
    }
    if (items.titleStyle) {
        titleStyle = items.titleStyle;
    }
    if (items.filter) {
        filters = items.filter.split('\n');
    }
});

document.addEventListener("DOMSubtreeModified", function() {
    if (!running) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(listener, 500);
    }
}, false);

