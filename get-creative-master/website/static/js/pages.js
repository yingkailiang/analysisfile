// Generated by CoffeeScript 1.4.0
(function() {
  var StoredChallengeResponse, email_validation_errors, password_validation_errors, username_validation_errors,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  username_validation_errors = ["No user with that user with that username", "No username supplied", "Username must be at least 4 characters", "Username can only contain letters, numbers, and underscore", "Sorry, that username is taken"];

  password_validation_errors = ["Incorrect password", "No password supplied", "Password must be at least 6 characters"];

  email_validation_errors = ["Not a valid email", "That email is already in use"];

  StoredChallengeResponse = (function() {

    function StoredChallengeResponse(tool_name, state) {
      this.tool_name = tool_name;
      this.state = state;
    }

    return StoredChallengeResponse;

  })();

  window.Page = (function() {

    function Page(page_load_handler) {
      var tool_name, _i, _len, _ref;
      this.page_load_handler = page_load_handler;
      this.tool_classes = ["TextArea", "Collager", "Harmony", "Webcam", "Rectangles"];
      this.tool_names = [];
      _ref = this.tool_classes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tool_name = _ref[_i];
        this.tool_names.push(tool_name.toLowerCase());
      }
    }

    Page.prototype.init = function() {
      this.error_handler = window.show_error;
      this.feedback_handler = window.show_form_feedback;
      this.find_nodes();
      this.setup_tools();
      this.bind();
      if (this.nodes.reply_button.length) {
        this.current_id = this.nodes.reply_button.data("id");
      }
      this.restore_challenge_response();
      if (this.nodes.challenges_list.length < 7) {
        this.nodes.load_more_challenges.parent().hide();
      }
      window.current_id = this.current_id;
      if (window.IS_LOCAL) {
        return $('.logo h1').css("color", "gold").text("LOCALHOST");
      }
    };

    Page.prototype.find_nodes = function() {
      var tool_name, _i, _len, _ref, _results;
      this.nodes = {
        reply_button: $('#js_reply_button'),
        more_challenges: $('#more_challenges'),
        load_more_challenges: $('#load_more_challenges'),
        like_buttons: $('.response .like'),
        single_line_inputs: $('input[type=text], input[type=password]'),
        challenges_list: $('ul.challenges li'),
        login_button: $('#js_login_button'),
        login_username: $('#js_login_username'),
        login_password: $('#js_login_password'),
        register_button: $('#js_register_button'),
        register_username: $('#js_register_username'),
        register_password: $('#js_register_password'),
        add_email: $('#js_add_email'),
        add_email_button: $('#js_add_email_button')
      };
      _ref = this.tool_names;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tool_name = _ref[_i];
        _results.push(this.nodes[tool_name] = $("#" + tool_name));
      }
      return _results;
    };

    Page.prototype.submit_is_valid = function() {
      var tool_name, _i, _len, _ref;
      _ref = this.tool_names;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tool_name = _ref[_i];
        if ((this.tools[tool_name] != null) && this.tools[tool_name].submit_is_valid()) {
          return true;
        }
      }
      return false;
    };

    Page.prototype.disable_submit = function() {
      clearInterval(this.check_submit_interval);
      return this.nodes.reply_button.attr("disabled", true);
    };

    Page.prototype.enable_submit = function() {
      var _this = this;
      return this.check_submit_interval = setInterval(function() {
        if (_this.submit_is_valid()) {
          return _this.nodes.reply_button.attr("disabled", false);
        } else {
          return _this.nodes.reply_button.attr("disabled", true);
        }
      }, 100);
    };

    Page.prototype.setup_tool = function(tool_name) {
      var index, remove_state_handler, save_state_handler,
        _this = this;
      index = this.tool_names.indexOf(tool_name);
      save_state_handler = function(tool_name) {
        return _this.save_tool_state(tool_name);
      };
      remove_state_handler = function(tool_name) {
        return _this.remove_tool_state(tool_name);
      };
      this.tools[tool_name] = new window[this.tool_classes[index]](this.nodes[tool_name], save_state_handler, remove_state_handler);
      return this.tools[tool_name].focus();
    };

    Page.prototype.setup_tools = function() {
      var tool_name, _i, _len, _ref, _results;
      this.tools = {};
      _ref = this.tool_names;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tool_name = _ref[_i];
        if (this.nodes[tool_name].length) {
          _results.push(this.setup_tool(tool_name));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Page.prototype.save_tool_state = function(tool_name, callback) {
      var save_object, state_data,
        _this = this;
      if (callback == null) {
        callback = function() {};
      }
      state_data = this.tools[tool_name].get_state_data();
      save_object = new StoredChallengeResponse(tool_name, state_data);
      return window.storage.set("response_" + this.current_id, save_object, function() {
        return window.storage.set("in_progress_id", _this.current_id, callback);
      }, true);
    };

    Page.prototype.remove_tool_state = function(callback) {
      if (callback == null) {
        callback = function() {};
      }
      return window.storage.remove_many(["response_" + this.current_id, "in_progress_id"], callback);
    };

    Page.prototype.restore_challenge_response = function() {
      var _this = this;
      if (this.current_id == null) {
        return;
      }
      return window.storage.get("response_" + this.current_id, function(save_object) {
        if (save_object == null) {
          return;
        }
        if (_this.tools[save_object.tool_name] != null) {
          return _this.tools[save_object.tool_name].set_state_data(save_object.state);
        }
      }, true);
    };

    Page.prototype.bind_load_more = function() {
      var loading_more_challenges, more_challenges_count, per,
        _this = this;
      per = 7;
      more_challenges_count = per;
      loading_more_challenges = false;
      return this.nodes.load_more_challenges.on("click", function() {
        var data;
        if (loading_more_challenges) {
          return false;
        }
        loading_more_challenges = true;
        data = {
          start: more_challenges_count
        };
        return $.ajax({
          url: "/api/more_challenges",
          data: data,
          type: "GET",
          success: function(html) {
            window.track_event('load_more_challenges', 'success', more_challenges_count);
            if (!html.length) {
              return _this.nodes.load_more_challenges.parent().remove();
            }
            loading_more_challenges = false;
            more_challenges_count += per;
            return _this.nodes.more_challenges.append(html);
          },
          error: function(xhr, status) {
            window.track_event('load_more_challenges', 'error', "" + xhr.status + " - " + status);
            return _this.nodes.load_more_challenges.parent().remove();
          }
        });
      });
    };

    Page.prototype.bind_like_buttons = function() {
      var self;
      self = this;
      return this.nodes.like_buttons.on("click", function() {
        var like_button, response_id,
          _this = this;
        like_button = $(this);
        if (like_button.hasClass("liked")) {
          return;
        }
        response_id = like_button.parents(".response").data("id");
        like_button.addClass("liked");
        window.animations.give_like(like_button);
        return $.ajax({
          url: "/api/like_response",
          type: "POST",
          data: {
            response_id: response_id
          },
          success: function(data) {
            if (data.error) {
              return window.track_event('like_response', 'error', response_id);
            } else {
              return window.track_event('like_response', 'success', response_id);
            }
          },
          error: function(xhr, status) {
            return window.track_event('like_response', 'error', "" + xhr.status + " - " + status);
          }
        });
      });
    };

    Page.prototype.login_explicit = function(username, password) {
      var _this = this;
      return $.ajax({
        url: "/api/login_explicit",
        type: "POST",
        data: {
          guid: this.guid,
          username: username,
          password: password
        },
        success: function(data) {
          var _ref, _ref1;
          if (data.error) {
            window.track_event('login_explicit', 'error');
            if (_ref = data.error, __indexOf.call(username_validation_errors, _ref) >= 0) {
              _this.feedback_handler(_this.nodes.login_button.parent(), data.error, _this.nodes.login_username);
            } else if (_ref1 = data.error, __indexOf.call(password_validation_errors, _ref1) >= 0) {
              _this.feedback_handler(_this.nodes.login_button.parent(), data.error, _this.nodes.login_password);
            } else {
              _this.error_handler(data.error);
            }
            return;
          } else {
            window.track_event('login_explicit', 'success');
          }
          window.storage.set_many({
            guid: data.guid,
            username: data.username,
            password_hash: data.password_hash
          });
          return _this.page_load_handler("/api/profile");
        },
        error: function(xhr, status) {
          window.track_event('login_explicit', 'error', "" + xhr.status + " - " + status);
          return _this.error_handler("Your request failed with a code " + xhr.status + ". Please try again in a bit.");
        }
      });
    };

    Page.prototype.register_user = function(username, password) {
      var _this = this;
      return $.ajax({
        url: "/api/register",
        type: "POST",
        data: {
          guid: this.guid,
          username: username,
          password: password
        },
        success: function(data) {
          var _ref, _ref1;
          if (data.error) {
            window.track_event('registration', 'error');
            if (_ref = data.error, __indexOf.call(username_validation_errors, _ref) >= 0) {
              _this.feedback_handler(_this.nodes.register_button.parent(), data.error, _this.nodes.register_username);
            } else if (_ref1 = data.error, __indexOf.call(password_validation_errors, _ref1) >= 0) {
              _this.feedback_handler(_this.nodes.register_button.parent(), data.error, _this.nodes.register_password);
            } else {
              _this.error_handler(data.error);
            }
            return;
          } else {
            window.track_event('registration', 'success');
          }
          window.storage.set_many({
            guid: data.guid,
            username: data.username,
            password_hash: data.password_hash
          });
          return _this.page_load_handler("/api/profile");
        },
        error: function(xhr, status) {
          window.track_event('registration', 'error', "" + xhr.status + " - " + status);
          return _this.error_handler("Your request failed with a code " + xhr.status + ". Please try again in a bit.");
        }
      });
    };

    Page.prototype.add_email_to_account = function(email) {
      var _this = this;
      return $.ajax({
        url: "/api/add_email_to_account",
        type: "POST",
        data: {
          email: email
        },
        success: function(data) {
          var _ref;
          if (data.error) {
            window.track_event('add_email_to_account', 'error');
            if (_ref = data.error, __indexOf.call(email_validation_errors, _ref) >= 0) {
              _this.feedback_handler(_this.nodes.add_email_button.parent(), data.error, _this.nodes.add_email);
            } else {
              _this.error_handler(data.error);
            }
          } else {
            window.track_event('add_email_to_account', 'success');
            return _this.page_load_handler("/api/profile");
          }
        },
        error: function(xhr, status) {
          window.track_event('add_email_to_account', 'error', "" + xhr.status + " - " + status);
          return _this.error_handler("Your request failed with a code " + xhr.status + ". Please try again in a bit.");
        }
      });
    };

    Page.prototype.bind_submit_reply = function() {
      var _this = this;
      return this.nodes.reply_button.on("click", function() {
        var data, tool_name, _i, _len, _ref;
        if (!_this.submit_is_valid()) {
          return false;
        }
        _this.disable_submit();
        data = {
          id: _this.current_id
        };
        _ref = _this.tool_names;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tool_name = _ref[_i];
          if (_this.tools[tool_name] != null) {
            data[tool_name] = _this.tools[tool_name].get_submit_data();
          }
        }
        return $.ajax({
          url: "/api/reply",
          type: "POST",
          data: data,
          success: function(data) {
            if (data.error) {
              window.track_event('submit_response', 'error', data.error + " ID: " + _this.current_id);
              _this.enable_submit();
              return _this.error_handler(data.error);
            } else {
              window.track_event('submit_response', 'success', _this.current_id);
              return _this.remove_tool_state(function() {
                if (window.IS_WEB) {
                  return document.location.reload();
                } else {
                  return _this.page_load_handler("/api/id/" + data.challenge_id);
                }
              });
            }
          },
          error: function(xhr, status) {
            window.track_event('submit_response', 'error', "" + xhr.status + " - " + status);
            _this.enable_submit();
            return _this.error_handler("Your submit failed with a code " + xhr.status + ". Please try again in a bit.");
          }
        });
      });
    };

    Page.prototype.bind = function() {
      var _this = this;
      this.bind_load_more();
      this.bind_like_buttons();
      this.bind_submit_reply();
      this.nodes.single_line_inputs.on("keyup", function() {
        var button, buttons, input;
        if (event.keyCode !== 13) {
          return;
        }
        input = $(this);
        buttons = input.siblings('button');
        if (buttons.length === 1) {
          button = buttons;
        } else {
          buttons = input.siblings('button.submit, input[type=submit]');
          button = $(buttons[0]);
        }
        if (button.length) {
          return button.trigger("click");
        }
      });
      this.nodes.login_button.on("click", function() {
        return _this.login_explicit(_this.nodes.login_username.val(), _this.nodes.login_password.val());
      });
      this.nodes.register_button.on("click", function() {
        return _this.register_user(_this.nodes.register_username.val(), _this.nodes.register_password.val());
      });
      this.nodes.add_email_button.on("click", function() {
        return _this.add_email_to_account(_this.nodes.add_email.val());
      });
      return this.enable_submit();
    };

    Page.prototype.unbind = function() {
      var tool, _, _ref;
      this.nodes.load_more_challenges.off("click");
      this.nodes.like_buttons.off("click");
      this.nodes.reply_button.off("click");
      this.nodes.single_line_inputs.off("keyup");
      this.nodes.login_button.off("click");
      this.nodes.register_button.off("click");
      this.nodes.add_email_button.off("click");
      _ref = this.tools;
      for (_ in _ref) {
        tool = _ref[_];
        tool.unbind();
      }
      return clearInterval(this.check_submit_interval);
    };

    return Page;

  })();

}).call(this);