/**
 * @name
 * Leafy Models
 *
 * @description
 * Models to interact with Leafy REST api
 *
 */

(function(root) {

  // Constants
  // var HOST = 'http://localhost:8005';
  var HOST = 'http://useleafy.com';
  var API_PREFIX = '/api/v1';

  // ------------------------------------------------------------------------

  /**
   * @name
   * Bookmark model/collection
   *
   * @description
   * Leafy bookmark behavior
   *
   */

  var Bookmark = Backbone.Model.extend({

  });

  var Bookmarks = Backbone.Collection.extend({
    model : Bookmark,
    initialize: function(opts) {
      opts || (opts = {})

      this.user  = opts.user;

    },
    url   : function() {
      var prefix = this.user ? _.result(this.user, 'url') : HOST + API_PREFIX;
      return prefix + '/bookmarks/'
    }
  });

  /**
   * @name
   * User model/collection
   *
   * @description
   * Leafy user behavior
   *
   */

  var User = Backbone.Model.extend({

    initialize: function() {
      this.bookmarks = new Bookmarks({
        user: this
      });
    },

    urlRoot  : HOST + API_PREFIX + '/users/',

    // Facade

    // Creates a new bookmark for this user
    addBookmark: function(bookmark) {
      var p = new $.Deferred();
      this.bookmarks.create(bookmark, {
        success: function(model, response, options) {
          p.resolve();
        },
        error: function(model, response, options) {
          p.reject(response.responseJSON);
        }
      });
      return p;
    },

    // Get all bookmarks of this user
    getBookmarks: function() {

    }

  });

  /**
   * @name
   * Leafy Session
   *
   * @description
   * Checks Leafy user session
   *
   */

  var Session = Backbone.Model.extend({
    url: HOST + '/session',

    ensure: function(cookie) {
      console.log('Making sure user is logged in');
      $.cookie('connect.sid', cookie);
      var p = new $.Deferred();
      var _this = this;
      this.fetch({
        xhrFields: {
            withCredentials: true
        },
        success: function(model, response, options) {
          if (response.current_user) {
            Leafy.user.set(response.current_user);
            _this.user = Leafy.user;
            delete response.current_user;
          }
          _this.set(response);
          p.resolve(_this.state());
        },
        error: function(model, response, options) {
          if (response.status === 401) {
            model.set({
              'authenticated': false
            });
            p.reject(_this.state());
          }
        }
      });
      return p;
    },
    state: function() {
      return this.toJSON();
    },
    isAuthenticated: function() {
      return this.get('authenticated') && !!this.user;
    },
    login: function() {

    }
  });


  // ------------------------------------------------------------------------

  // Public
  var Leafy = {
    user     : new User(),
    session  : new Session()
  };

  // Assign to root
  root.Leafy = Leafy;

})(window)
