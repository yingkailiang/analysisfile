class window.Webcam extends window.Tool
    constructor: (@parent_node) ->
        @name = "webcam"
        @width = 320
        @height = 240
        @photo_ready = false
        @find_nodes()
        @image_data_pos = 0
        @start_webcam =>
            # window.webcam now available from jQuery plugin
            @bind()

    find_nodes: ->
        @nodes = 
            canvas          : @parent_node.find "canvas"
            flash_parent    : @parent_node.find ".flash"
            snapshot_button : @parent_node.find "button.snapshot"
            clear_button    : @parent_node.find "button.clear"
        @nodes.canvas.attr("width", @width)
        @nodes.canvas.attr("height", @height)
        @context = @nodes.canvas[0].getContext '2d'
        @image_data_array = @context.getImageData 0, 0, @width, @height
        @nodes.canvas.hide()

    bind: ->
        @nodes.snapshot_button.on "click", =>
            window.track_event @name, 'snap'
            window.webcam.capture()
            @toggle_buttons()
        @nodes.clear_button.on "click", =>
            window.track_event @name, 'clear'
            @nodes.canvas.hide()
            @photo_ready = false
            @toggle_buttons()

    toggle_buttons: ->
        @nodes.snapshot_button.toggle()
        @nodes.clear_button.toggle()

    unbind: ->
        @nodes.snapshot_button.off "click"
        @nodes.clear_button.off "click"

    save_data_from_flash: (data) ->
        # Plugin sends data as CSV
        col = data.split ";"
        for i in [0...320]
            tmp = parseInt col[i]
            @image_data_array.data[@image_data_pos + 0] = (tmp >> 16) & 0xFF
            @image_data_array.data[@image_data_pos + 1] = (tmp >> 8) & 0xFF
            @image_data_array.data[@image_data_pos + 2] = tmp & 0xFF
            @image_data_array.data[@image_data_pos + 3] = 0xFF
            @image_data_pos += 4
        if @image_data_pos >= 4 * 320 * 240
            @context.putImageData @image_data_array, 0, 0
            @image_data_pos = 0
            @nodes.canvas.show()
            @photo_ready = true

    start_webcam: (callback) ->
        @nodes.flash_parent.webcam(
            width       : 500
            height      : 375
            mode        : "callback"
            swffile     : "https://s3.amazonaws.com/get-creative/swf/jscam_canvas_only.swf"
            debug       : (type, string) ->
                #console.log type, string
            onLoad      : ->
                callback()
            onCapture   : ->
                window.webcam.save()
            onSave      : (data) =>
                @save_data_from_flash data
        )

    submit_is_valid: ->
        return @photo_ready

    get_submit_data: ->
        return unless @submit_is_valid()
        window.track_event @name, 'finish'
        return @nodes.canvas[0].toDataURL 'image/png'
