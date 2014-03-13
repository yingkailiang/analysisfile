(function() {

  function I18nAPI(extension) {
    this._extension = extension;
  }

  I18nAPI.prototype = {
    getMessage: function(messageName, substitutions) {
      try {
        // TODO: Use the right locale
        var info = this._extension.getLocaleMessage(messageName);
        if (info && info.message) {
          // TODO: substitutions
          return info.message.replace(/\$\$/g, '$');
        }
      }
      catch (e) {
        // Do nothing so empty string is returned.
      }
      return '';
    }
  };

  module.exports = I18nAPI;

}).call(this);
