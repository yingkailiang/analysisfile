(function(window, grecipe, undefined) {

grecipe.loaded.then( function() {
  if (grecipe.settings.sendanalytics && navigator.appVersion.indexOf("Mac")==-1) {
      var _gaq = window._gaq = window._gaq || [];
      _gaq.push(['_setAccount', 'UA-18727131-1']);
      _gaq.push(['_trackPageview']);

      (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = 'https://ssl.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
  }
});

})(this, chrome.extension.getBackgroundPage().grecipe);
