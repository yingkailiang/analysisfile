// To get this script to be built with the tests, it must be included as
// <script src="jspb_parser.js"></script>. This messes up the tests as it sends
// the messaging into infinite loops because there are two frame broadcasting
// (and listening) to origin '*'. This conditional prevents that.
if (window.location.pathname.slice(-10) != '_test.html') {
  window.addEventListener('message', function(e) {
    var message = {'response': e.data.response};
    try {
      message['parsed'] = eval('(' + e.data.response + ')');
    } catch (e) {
      message['error'] = {'name': e.name, 'message': e.message};
    }
    e.source.postMessage(message, e.origin);
  });
}
