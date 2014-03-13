(function($) {
  function find_username_field(password_field) {
    if ($('input[name="email"],input[type="email"],input[name="username"],input[name="UserID"]').length == 0) {
      var inputs = $(password_field).parents('form').find('input');
      var username = null;
      inputs.each(function(index, obj) {
        if (obj.type == 'password' && index > 0) {
          username = $(inputs[index - 1]);
        }
      });
      if (username) {
        return username;
      }
    }
    return $('input[name="email"],input[type="email"],input[name="username"],input[name="UserID"]');
  }

  function check_credentials(eventObject) {
    var password_field = $('input[type="password"]');

    if (password_field.length > 0) {
      var port = chrome.runtime.connect({
        'name': 'credentials check'
      });

      port.onMessage.addListener(function(credentials) {
        if (credentials) {
          var username_field = find_username_field(password_field);
          password_field.val(credentials.password);
          if (username_field) {
            username_field.val(credentials.username);
          } else {
            console.debug('could not find username field.');
          }
        }
        port.disconnect();
      });

      port.postMessage({
        url: document.domain,
        username: $('input[name="email"],input[type="email"],input[name="username"]').val()
      });
    }
  }

  $(check_credentials);

})(jQuery);