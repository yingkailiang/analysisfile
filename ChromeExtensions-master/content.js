$("embed").each(function(i) {
    if ($(this).height() > 400) {
        chrome.extension.sendRequest({
	    url: $(this).get(0).src,
	    width: $(this).width(),
	    height: $(this).height()
	});
    }
});
