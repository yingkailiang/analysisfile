# Tool for simply entering text
class window.TextArea extends window.Tool
    constructor: (@node, @save_state_handler, @remove_state_handler) ->
        @name = "textarea"
        @_bind()
        @node.autosize({append: "\n"})

    _bind: ->
        @submit_was_valid = false
        @node.on "keyup", =>
            # Only save if valid
            if @submit_is_valid()
                unless @submit_was_valid
                    window.track_event @name, 'start'
                @submit_was_valid = true
                @save_state_handler @name
            else
                if @submit_was_valid
                    window.track_event @name, 'delete'
                @submit_was_valid = false
                @remove_state_handler()

    unbind: ->
        if @submit_is_valid()
            window.track_event @name, 'store', @node.val().length
        @node.off "keyup"

    submit_is_valid: ->
        # Prevent more than 5000 characters
        return false unless 0 < @node.val().replace(/\s*/, "").length < 5000
        return true

    get_state_data: ->
        return @node.val()

    get_submit_data: ->
        window.track_event @name, 'finish', @node.val().length
        return @get_state_data()

    set_state_data: (data) ->
        window.track_event @name, 'continue', data.length
        @node.val data
        # For autosize plugin
        @node.trigger 'oninput'
        @submit_was_valid = true

    focus: ->
        @node.focus()
