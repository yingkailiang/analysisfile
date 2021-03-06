// Generated by CoffeeScript 1.4.0
(function() {
  var faded_image_class, helper, img_container_class, marquee_class, thumbnail_container_class,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  marquee_class = "marquee";

  img_container_class = "img_container";

  thumbnail_container_class = "thumbs";

  faded_image_class = "image_preview";

  window.CollageHelper = (function() {

    function CollageHelper() {}

    CollageHelper.prototype.get_rotated_coordinates = function(width, height, x, y, rotation) {
      var angle, new_x, new_y, x_diff, y_diff;
      angle = rotation * Math.PI / 180;
      x_diff = x - width / 2;
      y_diff = y - height / 2;
      new_x = x_diff * Math.cos(angle) - y_diff * Math.sin(angle) + width / 2;
      new_y = x_diff * Math.sin(angle) + y_diff * Math.cos(angle) + height / 2;
      return [new_x, new_y];
    };

    CollageHelper.prototype.get_scaled_offset = function(width, height, x, y, scale) {
      var x_diff, y_diff;
      x_diff = width * scale - width;
      y_diff = height * scale - height;
      x -= x_diff / 2;
      y -= y_diff / 2;
      return [x, y];
    };

    CollageHelper.prototype.get_scaling_factor = function(width, height, x, y, scale, rotation) {
      var coords, minus, new_scale;
      coords = this.get_rotated_coordinates(width, height, width + x, height + y, -rotation);
      minus = this.get_rotated_coordinates(width, height, width, height, -rotation);
      x = coords[0] - minus[0];
      y = coords[1] - minus[1];
      new_scale = (width * scale + x + y) / width;
      return new_scale;
    };

    CollageHelper.prototype.get_rotation = function(width, height, x, y, x_start, y_start, start_rotation) {
      var angle, angle_diff, deg, start_angle, x_center, y_center;
      x_center = width / 2;
      y_center = height / 2;
      deg = 180 / Math.PI;
      start_angle = Math.atan2(y_start - y_center, x_start - x_center) * deg;
      angle = Math.atan2(y - y_center, x - x_center) * deg;
      angle_diff = angle - start_angle;
      return start_rotation + angle_diff;
    };

    return CollageHelper;

  })();

  helper = new CollageHelper();

  window.CollagePiece = (function() {

    function CollagePiece(node, id, collager) {
      var filename,
        _this = this;
      this.node = node;
      this.id = id;
      this.collager = collager;
      this.rotation = 0;
      this.scale = 1;
      this.opacity = 1;
      this.z_index = parseInt(this.node.css("z-index"), 10);
      this.make_thumb();
      this.is_selected = false;
      this.init_node();
      filename = this.node.attr("src").split("/")[this.node.attr("src").split("/").length - 1];
      this.data_uri_image = new Image();
      this.is_ready = false;
      $.ajax({
        url: "/collage_image/" + filename,
        type: "GET",
        success: function(response) {
          _this.data_uri_image.src = response;
          return _this.is_ready = true;
        },
        error: function(error) {
          return console.log("Error loading base64 image.");
        }
      });
    }

    CollagePiece.prototype.init_node = function() {
      var _this = this;
      this.width = this.node.width();
      this.height = this.node.height();
      if (this.width === 0 || this.height === 0) {
        return this.node.load(function() {
          return _this.init_node();
        });
      }
      this.left = parseInt(this.node.css("left"), 10);
      this.top = parseInt(this.node.css("top"), 10);
      return this.apply_state();
    };

    CollagePiece.prototype.apply_state = function() {
      var transform;
      transform = "scale(" + this.scale + ") rotate(" + this.rotation + "deg)";
      return this.node.css({
        width: this.width,
        height: this.height,
        opacity: this.opacity,
        left: this.left,
        top: this.top,
        zIndex: this.z_index,
        transform: transform,
        "-webkit-transform": transform
      });
    };

    CollagePiece.prototype.attr = function(name) {
      return this.node.attr(name);
    };

    CollagePiece.prototype.select = function() {
      var other, _i, _len, _ref;
      _ref = this.collager.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        other = _ref[_i];
        other.deselect();
      }
      this.thumb.select();
      this.is_selected = true;
      this.collager.selection = this;
      this.collager.marquee_update();
      return this.collager.set_opacity_slider(this.opacity);
    };

    CollagePiece.prototype.deselect = function() {
      this.thumb.deselect();
      this.is_selected = false;
      this.collager.selection = null;
      this.collager.hide_marquee();
      return this.collager.disable_opacity_slider();
    };

    CollagePiece.prototype.toggle_selection = function() {
      if (this.is_selected) {
        return this.deselect();
      } else {
        return this.select();
      }
    };

    CollagePiece.prototype.translating = function(x, y) {
      this.left += x;
      this.top += y;
      this.node.css({
        left: this.left,
        top: this.top
      });
      this.collager.marquee_update();
      return this.update();
    };

    CollagePiece.prototype.scaling = function(x, y) {
      var dim, min_size;
      this.scale = helper.get_scaling_factor(this.width, this.height, x, y, this.scale, this.rotation);
      min_size = 50;
      if (this.width * this.scale < min_size || this.height * this.scale < min_size) {
        dim = this.width < this.height ? this.width : this.height;
        this.scale = min_size / dim;
      }
      this.apply_state();
      this.collager.marquee_update();
      return this.update();
    };

    CollagePiece.prototype.rotating = function(x, y, page_x, page_y, start_x, start_y) {
      var offset;
      if (!this.is_rotating) {
        this.is_rotating = true;
        this.start_rotation = this.rotation;
      }
      offset = this.node.parent().offset();
      page_x -= this.left + offset.left;
      page_y -= this.top + offset.top;
      start_x -= this.left + offset.left;
      start_y -= this.top + offset.top;
      this.rotation = helper.get_rotation(this.width, this.height, page_x, page_y, start_x, start_y, this.start_rotation);
      this.apply_state();
      this.collager.marquee_update();
      return this.update();
    };

    CollagePiece.prototype.finish_transformation = function(transform) {
      if (transform === "rotating") {
        this.is_rotating = false;
        return delete this.start_rotation;
      }
    };

    CollagePiece.prototype.set_opacity = function(value) {
      this.opacity = value;
      this.node.css("opacity", value);
      return this.update();
    };

    CollagePiece.prototype.set_z_index = function(index) {
      this.z_index = index;
      this.node.css("z-index", index);
      return this.update();
    };

    CollagePiece.prototype.make_thumb = function() {
      return this.thumb = new CollagePieceThumb(this, this.collager);
    };

    CollagePiece.prototype.update = function() {
      return this.collager.save_state_handler(this.collager.name);
    };

    return CollagePiece;

  })();

  window.CollagePieceThumb = (function() {

    function CollagePieceThumb(collage_piece, collager) {
      this.collage_piece = collage_piece;
      this.collager = collager;
      this.relative_left = 0;
      this.is_dragging = false;
      this.render_and_append_thumb();
    }

    CollagePieceThumb.prototype.render_and_append_thumb = function() {
      var html;
      html = "            <li>                <div class=\"image\" style=\"background-image:url(" + (this.collage_piece.attr('src')) + ");\"></div>                <div class=\"handle\"></div>            </li>        ";
      this.node = $(html);
      this.collager.nodes.thumbs.prepend(this.node);
      this.reset_left();
      this.outer_width = this.node.outerWidth();
      return this.bind_thumb();
    };

    CollagePieceThumb.prototype.reset_left = function() {
      return this.left = this.node.position().left;
    };

    CollagePieceThumb.prototype.select = function() {
      return this.node.addClass("selected");
    };

    CollagePieceThumb.prototype.deselect = function() {
      return this.node.removeClass("selected");
    };

    CollagePieceThumb.prototype.swap_with = function(thumb, is_swapping_right) {
      var old_z;
      if (is_swapping_right) {
        thumb.node.insertBefore(this.clone);
      } else {
        thumb.node.insertAfter(this.clone);
        this.relative_left += this.outer_width;
      }
      this.left = this.clone.position().left;
      thumb.reset_left();
      old_z = this.collage_piece.z_index;
      this.collage_piece.set_z_index(thumb.collage_piece.z_index);
      return thumb.collage_piece.set_z_index(old_z);
    };

    CollagePieceThumb.prototype.start_drag = function(start_x) {
      this.is_dragging = true;
      this.prev_x = this.node.position().left;
      this.clone = this.node.clone();
      this.node_parent = this.node.parent();
      this.node_parent_padding = parseInt(this.node_parent.css("padding-left"), 10);
      this.clone.css("visibility", "hidden");
      this.clone.insertAfter(this.node);
      this.node.addClass("dragging");
      return this.drag_x_diff = start_x - this.node.offset().left + this.node_parent.offset().left;
    };

    CollagePieceThumb.prototype.shift_pieces = function(pieces, is_swapping_right) {
      var piece, _i, _len;
      pieces.sort(function(a, b) {
        return a.z_index - b.z_index;
      });
      if (is_swapping_right) {
        pieces.reverse();
      }
      for (_i = 0, _len = pieces.length; _i < _len; _i++) {
        piece = pieces[_i];
        if (is_swapping_right) {
          piece.thumb.node.insertBefore(this.clone);
          piece.set_z_index(piece.z_index + 1);
          this.collage_piece.set_z_index(this.collage_piece.z_index - 1);
          this.collager.submit_ready = true;
        } else {
          piece.thumb.node.insertAfter(this.clone);
          piece.set_z_index(piece.z_index - 1);
          this.collage_piece.set_z_index(this.collage_piece.z_index + 1);
          this.collager.submit_ready = true;
        }
        piece.thumb.reset_left();
      }
      return this.left = this.clone.position().left;
    };

    CollagePieceThumb.prototype.drag = function(start_x, page_x) {
      var collage_piece, left, other_left, to_shift, _i, _len, _ref;
      if (!this.is_dragging) {
        this.start_drag(start_x);
      }
      left = page_x - this.drag_x_diff;
      left = Math.max(this.node_parent_padding - 1, Math.min(left, this.node.parent().width() - this.outer_width + 1));
      this.node.css("left", left);
      to_shift = [];
      _ref = this.collage_piece.collager.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collage_piece = _ref[_i];
        if (collage_piece === this.collage_piece) {
          continue;
        }
        other_left = collage_piece.thumb.node.position().left;
        if ((this.prev_x <= other_left && other_left < left) || (left <= other_left && other_left < this.prev_x)) {
          to_shift.push(collage_piece);
        }
      }
      this.shift_pieces(to_shift, left > this.left);
      this.prev_x = left;
    };

    CollagePieceThumb.prototype.end_drag = function() {
      this.is_dragging = false;
      this.prev_x = 0;
      this.drag_x_diff = 0;
      this.node.removeClass("dragging");
      this.relative_left = 0;
      this.node.css("left", "auto");
      this.node.insertBefore(this.clone);
      return this.clone.remove();
    };

    CollagePieceThumb.prototype.bind_thumb = function(node) {
      var _this = this;
      return this.node.on('mousedown.collage_thumb', function(down_event) {
        var start_x;
        if (down_event.button !== 0) {
          return;
        }
        down_event.preventDefault();
        start_x = down_event.pageX;
        $(window).on('mousemove.collage_thumb', function(move_event) {
          return _this.drag(start_x, move_event.pageX);
        });
        return $(window).one('mouseup.collage_thumb', function(up_event) {
          $(window).off('mousemove.collage_thumb');
          if (_this.is_dragging) {
            _this.collage_piece.select();
            return _this.end_drag();
          } else {
            return _this.collage_piece.toggle_selection();
          }
        });
      });
    };

    CollagePieceThumb.prototype.unbind_thumb = function() {
      this.node.off(".collage_thumb");
      return $(window).off(".collage_thumb");
    };

    return CollagePieceThumb;

  })();

  window.Collager = (function(_super) {

    __extends(Collager, _super);

    function Collager(parent_node, save_state_handler) {
      this.parent_node = parent_node;
      this.save_state_handler = save_state_handler;
      this.name = "collager";
      this.canvas = this.parent_node.find('canvas');
      this.context = this.canvas[0].getContext('2d');
      this.find_nodes();
      this.init_images();
      this.bind();
    }

    Collager.prototype.find_nodes = function() {
      return this.nodes = {
        marquee: this.parent_node.find("." + marquee_class),
        rotate: this.parent_node.find(".rotate img"),
        scale: this.parent_node.find(".scale img"),
        opacity: this.parent_node.find("input.opacity"),
        thumbs: this.parent_node.find("." + thumbnail_container_class)
      };
    };

    Collager.prototype.bind = function() {
      var is_dragging, target_piece, transform,
        _this = this;
      is_dragging = false;
      target_piece = null;
      transform = null;
      $(window).on("mousedown.collager", function(down_event) {
        var collage_piece, prev_x, prev_y, start_x, start_y, _i, _len, _ref;
        if (down_event.button !== 0) {
          return;
        }
        _ref = _this.images;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          collage_piece = _ref[_i];
          if (down_event.target === collage_piece.node[0]) {
            target_piece = collage_piece;
            transform = "translating";
            break;
          }
        }
        if (down_event.target === _this.nodes.rotate[0]) {
          target_piece = _this.selection;
          transform = "rotating";
        } else if (down_event.target === _this.nodes.scale[0]) {
          target_piece = _this.selection;
          transform = "scaling";
        } else if (down_event.target === _this.nodes.marquee[0]) {
          target_piece = _this.selection;
          transform = "translating";
        }
        if (!target_piece) {
          if (!(down_event.target === _this.nodes.opacity[0] || $(down_event.target).closest("." + thumbnail_container_class).length)) {
            _this.deselect();
          }
          return;
        }
        down_event.preventDefault();
        start_x = prev_x = down_event.pageX;
        start_y = prev_y = down_event.pageY;
        return $(window).on("mousemove.collager", function(move_event) {
          var x_diff, y_diff;
          _this.start_collaging();
          move_event.preventDefault();
          is_dragging = true;
          if (!target_piece.is_selected) {
            target_piece.select();
          }
          x_diff = move_event.pageX - prev_x;
          y_diff = move_event.pageY - prev_y;
          target_piece[transform](x_diff, y_diff, move_event.pageX, move_event.pageY, start_x, start_y);
          prev_x = move_event.pageX;
          return prev_y = move_event.pageY;
        });
      });
      $(window).on("mouseup.collager", function(up_event) {
        if (!(target_piece && up_event.button === 0)) {
          return;
        }
        $(window).off("mousemove.collager");
        if (!is_dragging) {
          target_piece.toggle_selection();
        }
        if (is_dragging) {
          target_piece.finish_transformation(transform);
        }
        is_dragging = false;
        return target_piece = null;
      });
      return this.nodes.opacity.on("change", function() {
        _this.start_collaging();
        return _this.selection.set_opacity(_this.nodes.opacity.val());
      });
    };

    Collager.prototype.start_collaging = function() {
      if (this.submit_ready) {
        return;
      }
      window.track_event(this.name, 'start');
      this.started_time = new Date().getTime();
      return this.submit_ready = true;
    };

    Collager.prototype.set_opacity_slider = function(value) {
      this.nodes.opacity.attr("disabled", false);
      return this.nodes.opacity.val(value);
    };

    Collager.prototype.disable_opacity_slider = function() {
      return this.nodes.opacity.attr("disabled", true);
    };

    Collager.prototype.hide_marquee = function() {
      return this.nodes.marquee.css("display", "none");
    };

    Collager.prototype.marquee_update = function() {
      var faded_image, rotate, scaled_coords;
      this.nodes.marquee.children("." + faded_image_class).remove();
      scaled_coords = helper.get_scaled_offset(this.selection.width, this.selection.height, this.selection.left, this.selection.top, this.selection.scale);
      rotate = "rotate(" + this.selection.rotation + "deg)";
      this.nodes.marquee.css({
        display: "block",
        width: this.selection.width * this.selection.scale,
        height: this.selection.height * this.selection.scale,
        left: scaled_coords[0],
        top: scaled_coords[1],
        transform: rotate,
        "-webkit-transform": rotate
      });
      faded_image = $("<div class=\"" + faded_image_class + "\"></div>");
      faded_image.css({
        background: "url(" + (this.selection.node.attr('src')) + ") 0 0 / 100% 100%"
      });
      return this.nodes.marquee.append(faded_image);
    };

    Collager.prototype.init_images = function() {
      var images,
        _this = this;
      this.images = [];
      this.img_container = this.parent_node.find("." + img_container_class);
      images = this.img_container.children("img");
      this.img_container.css({
        position: "relative",
        width: this.canvas[0].width,
        height: this.canvas[0].height
      });
      images = $(images.toArray().reverse());
      return images.each(function(index, ele) {
        return _this.make_collage_piece($(ele), index);
      });
    };

    Collager.prototype.make_collage_piece = function(image, index) {
      var piece;
      image.css({
        display: "block",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: index + 1
      });
      piece = new CollagePiece(image, index, this);
      return this.images.push(piece);
    };

    Collager.prototype.deselect = function() {
      if (this.selection) {
        return this.selection.deselect();
      }
    };

    Collager.prototype.sort_images = function() {
      var i, image, images, new_index, _i, _ref;
      images = [];
      for (i = _i = 0, _ref = this.images.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        image = this.images[i];
        new_index = image.z_index - 1;
        images[image.z_index - 1] = image;
      }
      return this.images = images;
    };

    Collager.prototype.render = function() {
      var height, image, left, top, width, _i, _len, _ref, _results;
      this.sort_images();
      this.context.fillStyle = "#FFFFFF";
      this.context.fillRect(0, 0, this.canvas[0].width, this.canvas[0].height);
      _ref = this.images;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        left = image.left - (image.width * (image.scale - 1) / 2);
        top = image.top - (image.height * (image.scale - 1) / 2);
        width = image.width * image.scale;
        height = image.height * image.scale;
        if (!(width || height)) {
          continue;
        }
        this.context.save();
        this.context.translate(left + width / 2, top + height / 2);
        this.context.rotate(image.rotation * Math.PI / 180);
        this.context.translate(-width / 2, -height / 2);
        this.context.globalAlpha = image.opacity;
        this.context.drawImage(image.data_uri_image, 0, 0, width, height);
        _results.push(this.context.restore());
      }
      return _results;
    };

    Collager.prototype.unbind = function() {
      var collage_piece, now, seconds_elapsed, _i, _len, _ref, _results;
      if (this.submit_ready) {
        now = new Date().getTime();
        seconds_elapsed = Math.round((now - this.started_time) / 1000);
        window.track_event(this.name, 'store', seconds_elapsed);
      }
      $(window).off(".collager");
      this.nodes.opacity.off("change");
      _ref = this.images;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collage_piece = _ref[_i];
        _results.push(collage_piece.thumb.unbind_thumb());
      }
      return _results;
    };

    Collager.prototype.submit_is_valid = function() {
      var image, _i, _len, _ref;
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        if (!image.is_ready) {
          return false;
        }
      }
      return this.submit_ready;
    };

    Collager.prototype.get_submit_data = function() {
      var now, seconds_elapsed;
      now = new Date().getTime();
      seconds_elapsed = Math.round((now - this.started_time) / 1000);
      window.track_event(this.name, 'finish', seconds_elapsed);
      this.render();
      return this.canvas[0].toDataURL("image/png");
    };

    Collager.prototype.get_state_data = function() {
      var piece, state, _i, _len, _ref;
      state = {};
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        piece = _ref[_i];
        state[piece.id] = {
          width: piece.width,
          height: piece.height,
          left: piece.left,
          top: piece.top,
          opacity: piece.opacity,
          scale: piece.scale,
          rotation: piece.rotation,
          z_index: piece.z_index
        };
      }
      return state;
    };

    Collager.prototype.set_state_data = function(state) {
      var id, key, parent, piece, props, sorted_array, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      window.track_event(this.name, 'continue');
      for (id in state) {
        props = state[id];
        id = parseInt(id, 10);
        _ref = this.images;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          piece = _ref[_i];
          if (piece.id !== id) {
            continue;
          }
          for (key in props) {
            value = props[key];
            piece[key] = value;
          }
          piece.apply_state();
          break;
        }
      }
      sorted_array = [];
      _ref1 = this.images;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        piece = _ref1[_j];
        sorted_array.push(piece);
      }
      sorted_array.sort(function(a, b) {
        return a.z_index - b.z_index;
      });
      for (_k = 0, _len2 = sorted_array.length; _k < _len2; _k++) {
        piece = sorted_array[_k];
        parent = piece.thumb.node.parent();
        piece.thumb.node.prependTo(parent);
      }
      this.hide_marquee();
      this.submit_ready = true;
      return this.started_time = new Date().getTime();
    };

    return Collager;

  })(window.Tool);

}).call(this);
