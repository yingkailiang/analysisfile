# Tools for giving user feedback

window.show_form_feedback = (parent_node, message, highlight_nodes, disable_submit=true) ->
    ###########################################################
    # Disable submit, show an error next to submit button,
    # highlight invalid inputs, remove invalid class on keydown
    ###########################################################

    # Clear any previous validation checks to be safe
    inputs = parent_node.find('input[type=text], input[type=password]')
    inputs.removeClass "invalid"
    inputs.off ".validation_check"

    message_node = parent_node.find 'span.form_feedback'
    message_node.text message
    message_node.slideDown 100
    invalid_count = highlight_nodes.length
    if invalid_count
        highlight_nodes.each (_, node) ->
            node = $(node)
            node.addClass "invalid"
            node.one "keydown.validation_check", ->
                $(this).removeClass "invalid"
                invalid_count -= 1
                if invalid_count is 0 and disable_submit
                    # Reenable submit once all invalid fields
                    # have at least been modified.
                    submit_button.attr "disabled", false
                    message_node.slideUp 100, ->
                        $(this).text ""
    if disable_submit and invalid_count
        submit_button = parent_node.find 'button.submit'
        submit_button.attr "disabled", true

window.show_error = (error_message) ->
    window.track_event 'error', 'shown_error_message', error_message
    modal = $('#modal')
    modal_overlay = $('#modal_overlay')
    message_p = modal.find "p"
    message_p.html """
        #{error_message}
        <br><br>
        If this problem persists. Please contact
        <a href="mailto:support@get-creative.us" class="js_external_link">support@get-creative.us</a>.
    """
    body = $('body')
    body.addClass "modal_is_active"
    modal_width = modal.outerWidth()
    modal_height = modal.outerHeight()
    window_width = $(window).width()
    window_height = $(window).height()
    left = (window_width - modal_width)/2
    top_start = 0
    top_wait = (window_height - modal_height)/2


    # And animate
    modal.css(
        left    : left
        top     : top_start + "px"
        opacity : 0
    ).show()
    modal.animate(
        top     : top_wait + "px"
        opacity : 1
    ,
        duration    : 500
        easing      : "linear"
        complete    : ->
            # Listeners for dismiss
            modal.find(".close_modal").on "click.modal", close_modal
            modal_overlay.one "click.modal", close_modal
    )

    close_modal = ->
        window_height = $(window).height()
        top_end = window_height - modal_height
        modal.animate(
            top     : top_end
            opacity : 0
        ,
            duration    : 300
            easing      : "linear"
            complete    : ->
                body.removeClass "modal_is_active"
                modal.hide()
                message_p.text ""
                modal.off ".modal"
                modal_overlay.off ".modal"
        )
    return
