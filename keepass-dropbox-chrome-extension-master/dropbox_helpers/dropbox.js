
var DropboxClient = (function() {
  var authenticating = false;

  var showError = function(error) {
    switch (error.status) {
    case Dropbox.ApiError.INVALID_TOKEN:
      // If you're using dropbox.js, the only cause behind this error is that
      // the user token expired.
      // Get the user through the authentication flow again.
      console.error('Invalid token associated with Dropbox account');
      break;

    case Dropbox.ApiError.NOT_FOUND:
      // The file or folder you tried to access is not in the user's Dropbox.
      // Handling this error is specific to your application.
      console.error('Could not find file/folder');
      break;

    case Dropbox.ApiError.OVER_QUOTA:
      // The user is over their Dropbox quota.
      // Tell them their Dropbox is full. Refreshing the page won't help.
      console.error('Dropbox full');
      break;

    case Dropbox.ApiError.RATE_LIMITED:
      // Too many API requests. Tell the user to try again later.
      // Long-term, optimize your code to use fewer API calls.
      console.error('Dropbox has seen too much traffic');
      break;

    case Dropbox.ApiError.NETWORK_ERROR:
      // An error occurred at the XMLHttpRequest layer.
      // Most likely, the user's network connection is down.
      // API calls will not succeed until the user gets back online.
      console.error('Could not reach dropbox servers');
      break;

    case Dropbox.ApiError.INVALID_PARAM:
    case Dropbox.ApiError.OAUTH_ERROR:
    case Dropbox.ApiError.INVALID_METHOD:
    default:
      // Caused by a bug in dropbox.js, in your application, or in Dropbox.
      // Tell the user an error occurred, ask them to refresh the page.
      console.error('Internal error');
    }
  };

  var authenticate = function(client, success, options) {
    // OAuth authorization.    
    if (!client.isAuthenticated() && !authenticating) {
      authenticating = true;
      var _options = options || {interactive: true};
      client.authenticate(_options, function(error, client) {
        authenticating = false;
        if (error) {
          showError(error);
        } else {
          if (success) {
            success(client);
          }
        }
      });
    }
  };

  return {
    'authenticate': authenticate,
    'showError': showError,
    'KEY': "1zm3fzq9gbv01zz"
  }
})();
