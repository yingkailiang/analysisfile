window.GitHubApi = function(options, callback) {
  if (!callback)
    callback = console.log.bind(console);

  if (typeof options === 'string')
    options = { url: options };

  options.method = options.method || 'GET';

  chrome.storage.local.get('ghOAuthToken', function(items) {
    if (chrome.runtime.lastError)
      return callback(chrome.runtime.lastError);

    if (!items.ghOAuthToken)
      return callback(new Error('OAuth token is missing'));

    var xhr = window.xhr = new XMLHttpRequest;
    xhr.open(options.method, 'https://api.github.com' + options.url);
    xhr.setRequestHeader('Accept', options.accept || 'application/vnd.github.VERSION.html+json');
    xhr.setRequestHeader('Authorization', 'token ' + items.ghOAuthToken);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        try {
          var result = JSON.parse(xhr.responseText);
        } catch(err) {
          callback(err);
        }
        if (xhr.status >= 200 && xhr.status < 300)
          return callback(null, result, xhr.getAllResponseHeaders());

        return callback(result.message, xhr.getAllResponseHeaders());
      }
    };
    xhr.send(options.data);
  });
};
