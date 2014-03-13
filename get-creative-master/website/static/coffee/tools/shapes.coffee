BG_COLOR = [255, 255, 255]

class window.Shapes extends window.Tool
    constructor: (@parent_node, @save_state_handler) ->
        @opacity = 1
        @_find_nodes()
        @_init_canvas()
        @_bind()
        # Select default color
        $(@color_list_nodes[0]).trigger "click"

    _find_nodes: ->
        @preview_canvas = @parent_node.find 'canvas.preview'
        @preview_context = @preview_canvas[0].getContext '2d'
        @canvas = @parent_node.find 'canvas.final'
        @context = @canvas[0].getContext '2d'
        @color_list_nodes = @parent_node.find "ul.color_list li"
        @opacity_node = @parent_node.find "input.opacity"

    _init_canvas: ->
        @context.fillStyle = "rgb(#{BG_COLOR[0]}, #{BG_COLOR[1]}, #{BG_COLOR[2]})"
        @context.fillRect 0, 0, @canvas[0].width, @canvas[0].height

    _clear_preview_canvas: ->
        @preview_context.clearRect 0, 0, @preview_canvas[0].width, @preview_canvas[0].height

    _draw_shape_to_context: (context, x1, y1, x2, y2) ->
        return

    _preview_shape: (x1, y1, x2, y2) ->
        @_clear_preview_canvas()
        @_draw_shape_to_context @preview_context, arguments...

    _commit_shape: (x1, y1, x2, y2) ->
        @_clear_preview_canvas()
        @_draw_shape_to_context @context, arguments...
        @save_state_handler @name

    _bind: ->
        self = @

        # Bind color list clicks
        @color_list_nodes.on 'click', (list_click) ->
            li = $(this)
            self.color_list_nodes.removeClass "active"
            li.addClass "active"
            color = li.data "color"
            self.color = color
        # Bind opacity slider
        @opacity_node.on "change", =>
            @opacity = @opacity_node.val()

        # Bind Canvas clicks
        offset = @canvas.offset()

        @preview_canvas.on 'mousedown', (e) =>
            return unless e.button is 0
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            @start_x = x
            @start_y = y
            @mouse_is_down = true
            return false

        $(window).on 'mousemove', (e) =>
            return unless @mouse_is_down
            unless @ready
                @ready = true
                window.track_event @name, 'start'
                @started_time = new Date().getTime()
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            @_preview_shape @start_x, @start_y, x, y

        $(window).on "mouseup.#{@name}", (e) =>
            return unless e.button is 0 and @mouse_is_down
            @mouse_is_down = false
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            @_commit_shape @start_x, @start_y, x, y

    unbind: ->
        if @ready
            now = new Date().getTime()
            seconds_elapsed = Math.round (now - @started_time)/1000
            window.track_event @name, 'store', seconds_elapsed
        @preview_canvas.off "mouseenter mousedown mousemove"
        $(window).off "mouseup.#{@name}"

    submit_is_valid: ->
        return true if @ready

    get_state_data: ->
        return @canvas[0].toDataURL "image/png"

    get_submit_data: ->
        now = new Date().getTime()
        seconds_elapsed = Math.round (now - @started_time)/1000
        window.track_event @name, 'finish', seconds_elapsed
        return @get_state_data()

    set_state_data: (data) ->
        img = new Image()
        img.src = data
        setTimeout =>
            @context.drawImage img, 0, 0
            @ready = true
            window.track_event @name, 'continue'
        , 100
