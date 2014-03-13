# Based on Mr. Doob's Harmony

FG_COLOR = [50, 0, 0]
BG_COLOR = [245, 242, 240]
OPACITY = 0.075
THRESHOLD = 1000
OFFSET = 0.3
COMPOSITE = 'darker'

class window.Brush
    constructor: (@context) ->
        @context.lineWidth = 1
        @context.globalCompositeOperation = COMPOSITE
        @points = []
        @count = 0

    stroke_start: (mouse_x, mouse_y) ->
        @prev_mouse_x = mouse_x
        @prev_mouse_y = mouse_y

    stroke: (mouse_x, mouse_y) ->
        @points.push [mouse_x, mouse_y]
        @context.strokeStyle = "rgba(#{FG_COLOR[0]}, #{FG_COLOR[1]}, #{FG_COLOR[2]}, #{OPACITY})"
        @context.beginPath()
        @context.moveTo @prev_mouse_x, @prev_mouse_y
        @context.lineTo mouse_x, mouse_y
        @context.stroke()
        for i in [0...@points.length]
            dx = @points[i][0] - @points[@count][0]
            dy = @points[i][1] - @points[@count][1]
            d = dx*dx + dy*dy
            if (d < 4000 && Math.random() > d / 2000)
                if Math.random() > 0.05
                    @context.strokeStyle = "rgba(#{Math.floor(Math.random() * FG_COLOR[0])}, #{Math.floor(Math.random() * FG_COLOR[1])}, #{Math.floor(Math.random() * FG_COLOR[2])}, #{OPACITY})"
                else
                    @context.strokeStyle = "rgba(#{BG_COLOR[0]}, #{BG_COLOR[1]}, #{BG_COLOR[2]}, 0.2)"
                @context.beginPath()
                @context.moveTo @points[@count][0] + (dx * OFFSET), @points[@count][1] + (dy * OFFSET)
                @context.lineTo @points[i][0] - (dx * OFFSET), @points[i][1] - (dy * OFFSET)
                @context.stroke()
        @prev_mouse_x = mouse_x
        @prev_mouse_y = mouse_y
        @count += 1

class window.Harmony extends window.Tool
    constructor: (@parent_node, @save_state_handler) ->
        @name = "harmony"
        @canvas = @parent_node.find 'canvas'
        @context = @canvas[0].getContext '2d'
        @brush = new Brush @context
        @_clear()
        @_bind()

    _clear: ->
        @context.fillStyle = "rgb(#{BG_COLOR[0]}, #{BG_COLOR[1]}, #{BG_COLOR[2]})"
        @context.fillRect 0, 0, @canvas[0].width, @canvas[0].height

    _bind: ->
        offset = @canvas.offset()

        do_stroke = (e) =>
            return unless @mouse_is_down
            unless @ready
                @ready = true
                window.track_event @name, 'start'
                @started_time = new Date().getTime()
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            @brush.stroke x, y

        @canvas.on 'mouseenter', (e) =>
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            @brush.stroke_start x, y

        @canvas.on 'mousedown', (e) =>
            return unless e.button is 0
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            @brush.stroke_start x, y
            @mouse_is_down = true
            return false

        $(window).on 'mouseup.harmony', (e) =>
            return unless e.button is 0 and @mouse_is_down
            @save_state_handler @name
            @mouse_is_down = false

        @canvas.on 'mousemove', do_stroke

    unbind: ->
        if @ready
            now = new Date().getTime()
            seconds_elapsed = Math.round (now - @started_time)/1000
            window.track_event @name, 'store', seconds_elapsed
        @canvas.off "mouseenter mousedown mousemove"
        $(window).off "mouseup.harmony"

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
