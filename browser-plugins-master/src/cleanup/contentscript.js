var regex = /My Polls/;

// Test the text of the body element against our regular expression.
if (regex.test(document.body.innerText)) {
    var node = document.body;

    var el = node.getElementsByClassName("logo_text")[0];
    //el.parentNode.removeChild(el);
    el.src = "http://www.tst.it/public/images/dial-a-survey.png";

    var el = node.getElementsByClassName("copyright")[0];
    el.parentNode.removeChild(el);

    var el = node.getElementsByTagName("small")[0];
    el.parentNode.removeChild(el);
    
    var css = document.createElement("link");
    css.href = "http://www.tst.it/public/stylesheets/poll.css"
    css.media = "all";
    css.rel = "stylesheet";
    css.type = "text/css";
    document.head.appendChild(css);

  // The regular expression produced a match, so notify the background page.
  chrome.extension.sendRequest({}, function(response) {});
} else {
  // No match was found.
}
