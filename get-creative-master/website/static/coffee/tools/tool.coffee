# Default tool structure
class window.Tool
    submit_is_valid: ->
        return true

    get_state_data: ->
        return null

    set_state_data: ->

    get_submit_data: ->
        # Unless we override, state and submit are the same
        return @get_state_data()

    focus: ->

    unbind: ->
