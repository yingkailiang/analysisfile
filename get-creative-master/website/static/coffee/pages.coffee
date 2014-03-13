# Handles all event binding for a page so
# we can do AJAX powered pages.

username_validation_errors = [
    "No user with that user with that username"
    "No username supplied"
    "Username must be at least 4 characters"
    "Username can only contain letters, numbers, and underscore"
    "Sorry, that username is taken"
]
password_validation_errors = [
    "Incorrect password"
    "No password supplied"
    "Password must be at least 6 characters"
]
email_validation_errors = [
    "Not a valid email"
    "That email is already in use"
]

class StoredChallengeResponse
    # This is what we store in local storage
    # for unfinished challenge responses.
    constructor: (@tool_name, @state) ->

class window.Page
    constructor: (@page_load_handler) ->
        @tool_classes = ["TextArea", "Collager", "Harmony", "Webcam", "Rectangles"]
        @tool_names = []
        for tool_name in @tool_classes
            @tool_names.push tool_name.toLowerCase()

    init: () ->
        @error_handler = window.show_error
        @feedback_handler = window.show_form_feedback
        @find_nodes()
        @setup_tools()
        @bind()
        # Get current_id
        if @nodes.reply_button.length
            @current_id = @nodes.reply_button.data "id"
        # Check for tool states
        @restore_challenge_response()
        # Check if we need load more challenges button
        if @nodes.challenges_list.length < 7
            @nodes.load_more_challenges.parent().hide()
        # Make available for admin
        window.current_id = @current_id

        # For my sanity
        if window.IS_LOCAL
            $('.logo h1').css("color", "gold").text "LOCALHOST"

    find_nodes: ->
        @nodes =
            reply_button            : $('#js_reply_button')
            more_challenges         : $('#more_challenges')
            load_more_challenges    : $('#load_more_challenges')
            like_buttons            : $('.response .like')
            single_line_inputs      : $('input[type=text], input[type=password]')
            challenges_list         : $('ul.challenges li')
            login_button            : $('#js_login_button')
            login_username          : $('#js_login_username')
            login_password          : $('#js_login_password')
            register_button         : $('#js_register_button')
            register_username       : $('#js_register_username')
            register_password       : $('#js_register_password')
            add_email               : $('#js_add_email')
            add_email_button        : $('#js_add_email_button')
        for tool_name in @tool_names
            @nodes[tool_name] = $("##{tool_name}")

    submit_is_valid: ->
        for tool_name in @tool_names
            return true if @tools[tool_name]? and @tools[tool_name].submit_is_valid()
        return false

    disable_submit: ->
        clearInterval @check_submit_interval
        @nodes.reply_button.attr "disabled", true
        # TODO: Tell tools to disable

    enable_submit: ->
        @check_submit_interval = setInterval =>
            if @submit_is_valid()
                @nodes.reply_button.attr "disabled", false
                # TODO: Tell tools to enable
            else
                @nodes.reply_button.attr "disabled", true
        , 100

    setup_tool: (tool_name) ->
        index = @tool_names.indexOf tool_name
        save_state_handler = (tool_name) =>
            @save_tool_state tool_name
        remove_state_handler = (tool_name) =>
            @remove_tool_state tool_name
        @tools[tool_name] = new window[@tool_classes[index]] @nodes[tool_name], save_state_handler, remove_state_handler
        # eg:
        # @tools['collager'] = new window.Collager @nodes.collager
        @tools[tool_name].focus()

    setup_tools: ->
        @tools = {}
        for tool_name in @tool_names
            # Only set up if the node is there
            if @nodes[tool_name].length
                @setup_tool tool_name

    save_tool_state: (tool_name, callback=->) ->
        state_data = @tools[tool_name].get_state_data()
        save_object = new StoredChallengeResponse tool_name, state_data
        window.storage.set "response_#{@current_id}", save_object, =>
            window.storage.set "in_progress_id", @current_id, callback
        , true

    remove_tool_state: (callback=->) ->
        window.storage.remove_many ["response_#{@current_id}", "in_progress_id"], callback

    restore_challenge_response: ->
        # Restore tool state if appropriate for this challenge
        return unless @current_id?
        window.storage.get "response_#{@current_id}", (save_object) =>
            return unless save_object?
            @tools[save_object.tool_name].set_state_data save_object.state if @tools[save_object.tool_name]?
        , true

    bind_load_more: ->
        per = 7
        more_challenges_count = per
        loading_more_challenges = false
        @nodes.load_more_challenges.on "click", =>
            return false if loading_more_challenges
            loading_more_challenges = true
            data = {start : more_challenges_count}
            $.ajax(
                url     : "/api/more_challenges"
                data    : data
                type    : "GET"
                success : (html) =>
                    window.track_event 'load_more_challenges', 'success', more_challenges_count
                    if !html.length
                        return @nodes.load_more_challenges.parent().remove()
                    loading_more_challenges = false
                    more_challenges_count += per
                    @nodes.more_challenges.append html
                error   : (xhr, status) =>
                    window.track_event 'load_more_challenges', 'error', "#{xhr.status} - #{status}"
                    return @nodes.load_more_challenges.parent().remove()
            )

    bind_like_buttons: ->
        self = @
        @nodes.like_buttons.on "click", ->
            like_button = $(this)
            return if like_button.hasClass "liked"
            response_id = like_button.parents(".response").data "id"
            like_button.addClass "liked"
            window.animations.give_like like_button
            $.ajax(
                url     : "/api/like_response"
                type    : "POST"
                data    :
                    response_id : response_id
                success : (data) ->
                    if data.error
                        window.track_event 'like_response', 'error', response_id
                    else
                        window.track_event 'like_response', 'success', response_id
                error   : (xhr, status) =>
                    window.track_event 'like_response', 'error', "#{xhr.status} - #{status}"
            )

    login_explicit: (username, password) ->
        $.ajax(
            url     : "/api/login_explicit"
            type    : "POST"
            data    :
                guid        : @guid
                username    : username
                password    : password
            success : (data) =>
                if data.error
                    window.track_event 'login_explicit', 'error'
                    if data.error in username_validation_errors
                        @feedback_handler @nodes.login_button.parent(), data.error, @nodes.login_username
                    else if data.error in password_validation_errors
                        @feedback_handler @nodes.login_button.parent(), data.error, @nodes.login_password
                    else
                        # Unknown error
                        @error_handler data.error
                    return
                else
                    window.track_event 'login_explicit', 'success'
                window.storage.set_many(
                    guid            : data.guid
                    username        : data.username
                    password_hash   : data.password_hash
                )
                @page_load_handler "/api/profile"
            error   : (xhr, status) =>
                window.track_event 'login_explicit', 'error', "#{xhr.status} - #{status}"
                @error_handler "Your request failed with a code #{xhr.status}. Please try again in a bit."
        )

    register_user: (username, password) ->
        $.ajax(
            url     : "/api/register"
            type    : "POST"
            data    :
                guid        : @guid
                username    : username
                password    : password
            success : (data) =>
                if data.error
                    window.track_event 'registration', 'error'
                    if data.error in username_validation_errors
                        @feedback_handler @nodes.register_button.parent(), data.error, @nodes.register_username
                    else if data.error in password_validation_errors
                        @feedback_handler @nodes.register_button.parent(), data.error, @nodes.register_password
                    else
                        # Unknown error
                        @error_handler data.error
                    return
                else
                    window.track_event 'registration', 'success'
                window.storage.set_many(
                    guid            : data.guid
                    username        : data.username
                    password_hash   : data.password_hash
                )
                @page_load_handler "/api/profile"
            error   : (xhr, status) =>
                window.track_event 'registration', 'error', "#{xhr.status} - #{status}"
                @error_handler "Your request failed with a code #{xhr.status}. Please try again in a bit."
        )

    add_email_to_account: (email) ->
        $.ajax(
            url     : "/api/add_email_to_account"
            type    : "POST"
            data    :
                email   : email
            success : (data) =>
                if data.error
                    window.track_event 'add_email_to_account', 'error'
                    if data.error in email_validation_errors
                        @feedback_handler @nodes.add_email_button.parent(), data.error, @nodes.add_email
                    else
                        # Unknown error
                        @error_handler data.error
                    return
                else
                    window.track_event 'add_email_to_account', 'success'
                    @page_load_handler "/api/profile"
            error   : (xhr, status) =>
                window.track_event 'add_email_to_account', 'error', "#{xhr.status} - #{status}"
                @error_handler "Your request failed with a code #{xhr.status}. Please try again in a bit."
        )

    bind_submit_reply: ->
        @nodes.reply_button.on "click", =>
            return false unless @submit_is_valid()
            @disable_submit()
            # Do submit
            data =
                id          : @current_id
            for tool_name in @tool_names
                if @tools[tool_name]?
                    data[tool_name] = @tools[tool_name].get_submit_data()
            $.ajax(
                url     : "/api/reply"
                type    : "POST"
                data    : data
                success : (data) =>
                    if data.error
                        window.track_event 'submit_response', 'error', data.error + " ID: " + @current_id
                        @enable_submit()
                        @error_handler data.error
                    else
                        window.track_event 'submit_response', 'success', @current_id
                        @remove_tool_state =>
                            if window.IS_WEB
                                document.location.reload()
                            else
                                @page_load_handler "/api/id/#{data.challenge_id}"
                error   : (xhr, status) =>
                    window.track_event 'submit_response', 'error', "#{xhr.status} - #{status}"
                    @enable_submit()
                    @error_handler "Your submit failed with a code #{xhr.status}. Please try again in a bit."
            )

    bind: ->
        # This is for binds which will be the same
        # between web and extension.
        @bind_load_more()
        @bind_like_buttons()
        @bind_submit_reply()

        # Hack so that ENTER on an input will trigger a nearby button
        @nodes.single_line_inputs.on "keyup", ->
            return unless event.keyCode is 13
            input = $(this)
            buttons = input.siblings 'button'
            if buttons.length is 1
                button = buttons
            else
                # If we have more than one button, narrow the search
                buttons = input.siblings 'button.submit, input[type=submit]'
                button = $(buttons[0])
            button.trigger "click" if button.length

        # Login
        @nodes.login_button.on "click", =>
            @login_explicit @nodes.login_username.val(), @nodes.login_password.val()

        # Register
        @nodes.register_button.on "click", =>
            @register_user @nodes.register_username.val(), @nodes.register_password.val()

        # Add email
        @nodes.add_email_button.on "click", =>
            @add_email_to_account @nodes.add_email.val()

        @enable_submit()

    unbind: ->
        @nodes.load_more_challenges.off "click"
        @nodes.like_buttons.off "click"
        @nodes.reply_button.off "click"
        @nodes.single_line_inputs.off "keyup"
        @nodes.login_button.off "click"
        @nodes.register_button.off "click"
        @nodes.add_email_button.off "click"
        # Also unbind any tools
        for _, tool of @tools
            tool.unbind()
        clearInterval @check_submit_interval


