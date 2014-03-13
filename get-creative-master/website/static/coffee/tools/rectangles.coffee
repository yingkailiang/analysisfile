class window.Rectangles extends window.Shapes
    constructor: ->
        @name = "rectangles"
        super arguments...

    _draw_shape_to_context: (context, x1, y1, x2, y2) ->
        context.fillStyle = "rgba(#{@color}, #{@opacity})"
        context.fillRect x1, y1, x2 - x1, y2 - y1
