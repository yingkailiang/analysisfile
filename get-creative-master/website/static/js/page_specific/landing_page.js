// Generated by CoffeeScript 1.4.0
(function() {

  $(function() {
    return $('a.install_link').on("click", function() {
      var href;
      if (navigator.platform.indexOf("Win") > -1) {
        href = $('link[rel="chrome-webstore-item"]').attr("href");
        console.log("href", href);
        return document.location.href = href;
      }
      return chrome.webstore.install(void 0, void 0, function(reason) {
        return window.show_error("The extension was not installed. Reason: " + reason);
      });
    });
  });

}).call(this);
