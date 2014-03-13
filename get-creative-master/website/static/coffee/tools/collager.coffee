marquee_class = "marquee"
img_container_class = "img_container"
thumbnail_container_class = "thumbs"
faded_image_class = "image_preview"

class window.CollageHelper
    # Some math/geometry tools
    get_rotated_coordinates: (width, height, x, y, rotation) ->
        angle = rotation*Math.PI/180
        x_diff = x - width/2
        y_diff = y - height/2
        new_x = x_diff * Math.cos(angle) - y_diff * Math.sin(angle) + width/2
        new_y = x_diff * Math.sin(angle) + y_diff * Math.cos(angle) + height/2
        return [new_x, new_y]

    get_scaled_offset: (width, height, x, y, scale) ->
        x_diff = width * scale - width
        y_diff = height * scale - height
        x -= x_diff/2
        y -= y_diff/2
        return [x, y]

    get_scaling_factor: (width, height, x, y, scale, rotation) ->
        coords = @get_rotated_coordinates width, height, width + x, height + y, -rotation
        minus = @get_rotated_coordinates width, height, width, height, -rotation
        x = coords[0] - minus[0]
        y = coords[1] - minus[1]
        new_scale = (width*scale + x + y)/width
        return new_scale

    get_rotation: (width, height, x, y, x_start, y_start, start_rotation) ->
        x_center = width/2
        y_center = height/2
        deg = 180/Math.PI
        start_angle = Math.atan2(y_start - y_center, x_start - x_center) * deg
        angle = Math.atan2(y - y_center, x - x_center) * deg
        angle_diff = angle - start_angle
        return start_rotation + angle_diff

helper = new CollageHelper()

class window.CollagePiece
    constructor: (@node, @id, @collager) ->
        @rotation = 0
        @scale = 1
        @opacity = 1
        @z_index = parseInt @node.css("z-index"), 10
        @make_thumb()
        @is_selected = false
        @init_node()
        filename = @node.attr("src").split("/")[@node.attr("src").split("/").length - 1]
        @data_uri_image = new Image()
        @is_ready = false
        $.ajax(
            url     : "/collage_image/#{filename}"
            type    : "GET"
            success : (response) =>
                @data_uri_image.src = response
                @is_ready = true
            error   : (error) ->
                console.log "Error loading base64 image."
        )


    init_node: ->
        @width = @node.width()
        @height = @node.height()
        if @width is 0 or @height is 0
            return @node.load =>
                @init_node()
        @left = parseInt @node.css("left"), 10
        @top = parseInt @node.css("top"), 10
        @apply_state()

    apply_state: ->
        transform = "scale(#{@scale}) rotate(#{@rotation}deg)"
        @node.css(
            width   : @width
            height  : @height
            opacity : @opacity
            left    : @left
            top     : @top
            zIndex  : @z_index
            transform           : transform
            "-webkit-transform" : transform
        )

    attr: (name) ->
        return @node.attr name

    select: ->
        for other in @collager.images
            other.deselect()
        @thumb.select()
        @is_selected = true
        @collager.selection = @
        @collager.marquee_update()
        @collager.set_opacity_slider @opacity

    deselect: ->
        @thumb.deselect()
        @is_selected = false
        @collager.selection = null
        @collager.hide_marquee()
        @collager.disable_opacity_slider()

    toggle_selection: ->
        if @is_selected then @deselect() else @select()

    translating: (x, y) ->
        @left += x
        @top += y
        @node.css(
            left    : @left
            top     : @top
        )
        @collager.marquee_update()
        @update()

    scaling: (x, y) ->
        @scale = helper.get_scaling_factor @width, @height, x, y, @scale, @rotation
        # Constrain scale
        min_size = 50
        if @width * @scale < min_size or @height * @scale < min_size
            dim = if @width < @height then @width else @height
            @scale = min_size/dim
        @apply_state()
        @collager.marquee_update()
        @update()

    rotating: (x, y, page_x, page_y, start_x, start_y) ->
        unless @is_rotating
            @is_rotating = true
            @start_rotation = @rotation
        offset = @node.parent().offset()
        page_x -= @left + offset.left
        page_y -= @top + offset.top
        start_x -= @left + offset.left
        start_y -= @top + offset.top
        @rotation = helper.get_rotation @width, @height, page_x, page_y, start_x, start_y, @start_rotation
        @apply_state()
        @collager.marquee_update()
        @update()

    finish_transformation: (transform) ->
        if transform is "rotating"
            @is_rotating = false
            delete @start_rotation

    set_opacity: (value) ->
        @opacity = value
        @node.css "opacity", value
        @update()

    set_z_index: (index) ->
        @z_index = index
        @node.css "z-index", index
        @update()

    make_thumb: ->
        @thumb = new CollagePieceThumb @, @collager

    update: ->
        @collager.save_state_handler @collager.name

class window.CollagePieceThumb
    constructor: (@collage_piece, @collager) ->
        @relative_left = 0
        @is_dragging = false
        @render_and_append_thumb()

    render_and_append_thumb: ->
        html = "\
            <li>\
                <div class=\"image\" style=\"background-image:url(#{@collage_piece.attr('src')});\"></div>\
                <div class=\"handle\"></div>\
            </li>\
        "
        @node = $(html)
        @collager.nodes.thumbs.prepend @node
        @reset_left()
        @outer_width = @node.outerWidth()
        @bind_thumb()

    reset_left: ->
        @left = @node.position().left

    select: ->
        # Only called from @collage_piece
        @node.addClass "selected"

    deselect: ->
        # Only called from @collage_piece
        @node.removeClass "selected"

    swap_with: (thumb, is_swapping_right) ->
        if is_swapping_right
            thumb.node.insertBefore @clone
        else
            thumb.node.insertAfter @clone
            @relative_left += @outer_width
        @left = @clone.position().left
        thumb.reset_left()
        old_z = @collage_piece.z_index
        @collage_piece.set_z_index thumb.collage_piece.z_index
        thumb.collage_piece.set_z_index old_z

    start_drag: (start_x) ->
        @is_dragging = true
        @prev_x = @node.position().left
        @clone = @node.clone()
        @node_parent = @node.parent()
        @node_parent_padding = parseInt @node_parent.css("padding-left"), 10
        @clone.css "visibility", "hidden"
        @clone.insertAfter @node
        @node.addClass "dragging"
        @drag_x_diff = start_x - @node.offset().left + @node_parent.offset().left

    shift_pieces: (pieces, is_swapping_right) ->
        pieces.sort (a, b) ->
            a.z_index - b.z_index
        pieces.reverse() if is_swapping_right
        for piece in pieces
            if is_swapping_right
                piece.thumb.node.insertBefore @clone
                piece.set_z_index piece.z_index + 1
                @collage_piece.set_z_index @collage_piece.z_index - 1
                @collager.submit_ready = true
            else
                piece.thumb.node.insertAfter @clone
                piece.set_z_index piece.z_index - 1
                @collage_piece.set_z_index @collage_piece.z_index + 1
                @collager.submit_ready = true
            piece.thumb.reset_left()
        @left = @clone.position().left

    drag: (start_x, page_x) ->
        unless @is_dragging
            @start_drag start_x
        # Find out where this should be
        left = page_x - @drag_x_diff
        left = Math.max @node_parent_padding - 1, Math.min left, @node.parent().width() - @outer_width + 1
        @node.css "left", left
        to_shift = []
        for collage_piece in @collage_piece.collager.images
            continue if collage_piece is @collage_piece
            other_left = collage_piece.thumb.node.position().left
            if @prev_x <= other_left < left or left <= other_left < @prev_x
                to_shift.push collage_piece
        @shift_pieces to_shift, left > @left
        @prev_x = left
        return

    end_drag: ->
        # Snap node to
        @is_dragging = false
        @prev_x = 0
        @drag_x_diff = 0
        @node.removeClass "dragging"
        @relative_left = 0
        @node.css "left", "auto"
        @node.insertBefore @clone
        @clone.remove()

    bind_thumb: (node) ->
        @node.on 'mousedown.collage_thumb', (down_event) =>
            return unless down_event.button is 0
            down_event.preventDefault()
            start_x = down_event.pageX
            $(window).on 'mousemove.collage_thumb', (move_event) =>
                @drag start_x, move_event.pageX

            $(window).one 'mouseup.collage_thumb', (up_event) =>
                $(window).off 'mousemove.collage_thumb'
                if @is_dragging
                    @collage_piece.select()
                    @end_drag()
                else
                    @collage_piece.toggle_selection()

    unbind_thumb: ->
        @node.off ".collage_thumb"
        $(window).off ".collage_thumb"

class window.Collager extends window.Tool
    constructor: (@parent_node, @save_state_handler) ->
        @name = "collager"
        @canvas = @parent_node.find 'canvas'
        @context = @canvas[0].getContext '2d'
        @find_nodes()
        @init_images()
        @bind()

    find_nodes: ->
        @nodes =
            marquee     : @parent_node.find ".#{marquee_class}"
            rotate      : @parent_node.find ".rotate img"
            scale       : @parent_node.find ".scale img"
            opacity     : @parent_node.find "input.opacity"
            thumbs      : @parent_node.find ".#{thumbnail_container_class}"

    bind: ->
        is_dragging = false
        target_piece = null
        transform = null

        # Mousedown and drag
        $(window).on "mousedown.collager", (down_event) =>
            return unless down_event.button is 0
            for collage_piece in @images
                if down_event.target is collage_piece.node[0]
                    target_piece = collage_piece
                    transform = "translating"
                    break
            if down_event.target is @nodes.rotate[0]
                target_piece = @selection
                transform = "rotating"
            else if down_event.target is @nodes.scale[0]
                target_piece = @selection
                transform = "scaling"
            else if down_event.target is @nodes.marquee[0]
                target_piece = @selection
                transform = "translating"
            unless target_piece
                unless down_event.target is @nodes.opacity[0] or
                $(down_event.target).closest(".#{thumbnail_container_class}").length
                    @deselect()
                return
            down_event.preventDefault()
            start_x = prev_x = down_event.pageX
            start_y = prev_y = down_event.pageY
            $(window).on "mousemove.collager", (move_event) =>
                @start_collaging()
                move_event.preventDefault()
                is_dragging = true
                target_piece.select() unless target_piece.is_selected
                x_diff = move_event.pageX - prev_x
                y_diff = move_event.pageY - prev_y
                target_piece[transform](x_diff, y_diff, move_event.pageX, move_event.pageY, start_x, start_y)
                prev_x = move_event.pageX
                prev_y = move_event.pageY

        # Mouseup
        $(window).on "mouseup.collager", (up_event) =>
            return unless target_piece and up_event.button is 0
            $(window).off "mousemove.collager"
            unless is_dragging
                target_piece.toggle_selection()
            if is_dragging
                target_piece.finish_transformation transform
            is_dragging = false
            target_piece = null

        # Opacity binding
        @nodes.opacity.on "change", =>
            @start_collaging()
            @selection.set_opacity @nodes.opacity.val()

    start_collaging: ->
        return if @submit_ready
        window.track_event @name, 'start'
        @started_time = new Date().getTime()
        @submit_ready = true

    set_opacity_slider: (value) ->
        @nodes.opacity.attr "disabled", false
        @nodes.opacity.val value

    disable_opacity_slider: ->
        @nodes.opacity.attr "disabled", true

    hide_marquee: ->
        @nodes.marquee.css "display", "none"

    marquee_update: ->
        @nodes.marquee.children(".#{faded_image_class}").remove()
        scaled_coords = helper.get_scaled_offset @selection.width, @selection.height, @selection.left, @selection.top, @selection.scale
        rotate = "rotate(#{@selection.rotation}deg)"
        @nodes.marquee.css(
            display     : "block"
            width       : @selection.width * @selection.scale
            height      : @selection.height * @selection.scale
            left        : scaled_coords[0]
            top         : scaled_coords[1]
            transform   : rotate
            "-webkit-transform" : rotate
        )
        faded_image = $("<div class=\"#{faded_image_class}\"></div>")
        faded_image.css(
            background : "url(#{@selection.node.attr('src')}) 0 0 / 100% 100%"
        )
        @nodes.marquee.append faded_image

    init_images: ->
        @images = []
        @img_container = @parent_node.find ".#{img_container_class}"
        images = @img_container.children "img"
        @img_container.css(
            position    : "relative"
            width       : @canvas[0].width
            height      : @canvas[0].height
        )
        # Reverse the order
        images = $(images.toArray().reverse())
        images.each (index, ele) =>
            @make_collage_piece $(ele), index

    make_collage_piece: (image, index) ->
        image.css(
            display     : "block"
            position    : "absolute"
            left        : 0
            top         : 0
            zIndex      : index + 1
        )
        piece = new CollagePiece image, index, @
        @images.push piece

    deselect: ->
        @selection.deselect() if @selection

    sort_images: ->
        # Sort images by z-index before render
        images = []
        for i in [0...@images.length]
            image = @images[i]
            new_index = image.z_index - 1
            images[image.z_index - 1] = image
        @images = images

    render: ->
        @sort_images()
        @context.fillStyle = "#FFFFFF"
        @context.fillRect 0, 0, @canvas[0].width, @canvas[0].height
        for image in @images
            left = image.left - (image.width*(image.scale - 1)/2)
            top = image.top - (image.height*(image.scale - 1)/2)
            width = image.width * image.scale
            height = image.height * image.scale
            continue unless width or height
            @context.save()
            @context.translate left + width/2, top + height/2
            @context.rotate image.rotation * Math.PI/180
            @context.translate -width/2, -height/2
            @context.globalAlpha = image.opacity
            @context.drawImage image.data_uri_image, 0, 0, width, height
            @context.restore()

    ################
    # Public Methods
    ################
    unbind: ->
        if @submit_ready
            now = new Date().getTime()
            seconds_elapsed = Math.round (now - @started_time)/1000
            window.track_event @name, 'store', seconds_elapsed
        $(window).off ".collager"
        @nodes.opacity.off "change"
        for collage_piece in @images
            collage_piece.thumb.unbind_thumb()

    submit_is_valid: ->
        for image in @images
            return false unless image.is_ready
        return @submit_ready

    get_submit_data: ->
        now = new Date().getTime()
        seconds_elapsed = Math.round (now - @started_time)/1000
        window.track_event @name, 'finish', seconds_elapsed
        @render()
        return @canvas[0].toDataURL("image/png")

    get_state_data: ->
        state = {}
        for piece in @images
            state[piece.id] =
                width       : piece.width
                height      : piece.height
                left        : piece.left
                top         : piece.top
                opacity     : piece.opacity
                scale       : piece.scale
                rotation    : piece.rotation
                z_index     : piece.z_index
        return state

    set_state_data: (state) ->
        window.track_event @name, 'continue'
        for id, props of state
            id = parseInt id, 10
            for piece in @images
                continue unless piece.id is id
                for key, value of props
                    piece[key] = value
                piece.apply_state()
                break
        # Sort thumbnails by z-index
        sorted_array = []
        for piece in @images
            sorted_array.push piece
        sorted_array.sort (a, b) ->
            return a.z_index - b.z_index
        for piece in sorted_array
            parent = piece.thumb.node.parent()
            piece.thumb.node.prependTo parent
        @hide_marquee()
        @submit_ready = true
        @started_time = new Date().getTime()
