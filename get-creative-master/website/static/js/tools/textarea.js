// Generated by CoffeeScript 1.4.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.TextArea = (function(_super) {

    __extends(TextArea, _super);

    function TextArea(node, save_state_handler, remove_state_handler) {
      this.node = node;
      this.save_state_handler = save_state_handler;
      this.remove_state_handler = remove_state_handler;
      this.name = "textarea";
      this._bind();
      this.node.autosize({
        append: "\n"
      });
    }

    TextArea.prototype._bind = function() {
      var _this = this;
      this.submit_was_valid = false;
      return this.node.on("keyup", function() {
        if (_this.submit_is_valid()) {
          if (!_this.submit_was_valid) {
            window.track_event(_this.name, 'start');
          }
          _this.submit_was_valid = true;
          return _this.save_state_handler(_this.name);
        } else {
          if (_this.submit_was_valid) {
            window.track_event(_this.name, 'delete');
          }
          _this.submit_was_valid = false;
          return _this.remove_state_handler();
        }
      });
    };

    TextArea.prototype.unbind = function() {
      if (this.submit_is_valid()) {
        window.track_event(this.name, 'store', this.node.val().length);
      }
      return this.node.off("keyup");
    };

    TextArea.prototype.submit_is_valid = function() {
      var _ref;
      if (!((0 < (_ref = this.node.val().replace(/\s*/, "").length) && _ref < 5000))) {
        return false;
      }
      return true;
    };

    TextArea.prototype.get_state_data = function() {
      return this.node.val();
    };

    TextArea.prototype.get_submit_data = function() {
      window.track_event(this.name, 'finish', this.node.val().length);
      return this.get_state_data();
    };

    TextArea.prototype.set_state_data = function(data) {
      window.track_event(this.name, 'continue', data.length);
      this.node.val(data);
      this.node.trigger('oninput');
      return this.submit_was_valid = true;
    };

    TextArea.prototype.focus = function() {
      return this.node.focus();
    };

    return TextArea;

  })(window.Tool);

}).call(this);
