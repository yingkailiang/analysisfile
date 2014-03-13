function transmogrify_node(node, method) {
    if (node.nodeType == 3) {
        var transmogrified = transmogrify($.trim(node.textContent), method);
        node.textContent = transmogrified;
    } else if (node.nodeType == 1) {
        if ($(node).children().length > 0) {
            $(node).contents().each(function() {
                transmogrify_node(this, method);
            });
        }
    }
}

$(document).ready(function() {
    var method = '';
    var port = chrome.extension.connect({name: "get_method"});
    port.onMessage.addListener(function(msg) {
        switch (msg.action) {
        case "get_method_resp":
            method = msg.method;
            $('body *').contents().each(function() {
                transmogrify_node(this, method);
            });
            $(document).bind('DOMNodeInserted', function(event) {
                transmogrify_node(event.target, method);
            });
            break;
        }
    });
    port.postMessage({action: "get_method"});
});
