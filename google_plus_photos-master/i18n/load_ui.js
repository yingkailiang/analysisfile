/**
 * @fileoverview Selects the main JS file based on the user language
 *     (i.e. Bidi).
 * @author kashida@google.com (Koji Ashida)
 */

(function() {
  var script = document.createElement('script');
  script.src = 'pulsar_ui_' + chrome.i18n.getMessage('@@bidi_dir') + '.js';
  document.body.appendChild(script);
})();
