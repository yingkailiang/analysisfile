class window.GetCreative
    constructor: ->
        @content = $('#content')

    init: ->
        @login_passive (data) =>
            if data.error
                window.track_event 'login_passive', 'error', data.error
                # TODO: Special page for bans
                # and handle this better.
                if data.error is "user banned"
                    window.show_error "This account has been banned"
                else if data.error is "ip banned"
                    window.show_error "This IP address has been banned"
                else
                    window.show_error data.error
                    window.storage.remove "guid"
            else
                window.track_event 'login_passive', 'success'
                # Save GUID and go to default challenge
                window.storage.set "guid", data.guid, =>
                    unless window.IS_WEB
                        @open_default_challenge data.challenge_id
        @load_page()
        unless window.IS_WEB
            @delegate_links()

    load_page: ->
        ajax_loader = (url) =>
            @load_internal_url url
        @current_page = new window.Page ajax_loader
        @current_page.init()

    replace_content: (html) ->
        $(window).scrollTop 0
        @current_page.unbind()
        @content.empty()
        @content.append html
        @load_page()

    delegate_links: ->
        self = @
        $("body")
        .on("click", "a.js_link", ->
            href = $(this).attr "href"
            self.load_internal_url "/api#{href}"
            return false
        ).on("click", "a.js_external_link", ->
            href = $(this).attr "href"
            self.load_external_url "#{href}"
            return false
        )

    load_internal_url: (relative_url) ->
        $.ajax(
            url     : "#{relative_url}"
            type    : "GET"
            success : (html) =>
                window.track_pageview relative_url
                window.track_event 'load_url', 'success', relative_url
                @replace_content html
            error   : (xhr, status) =>
                window.track_event 'load_url', 'error', "#{xhr.status} - #{status}"
                window.show_error "Your request failed with a code #{xhr.status}. Please try again in a bit."
        )
        
    load_external_url: (url) ->
        window.track_event 'exit_extension', url
        if window.IS_EXTENSION and window.parent
            window.parent.postMessage url, "*"

    get_challenge: (id, is_in_progress=false) ->
        return @load_internal_url "/api/id/#{id}"

    open_default_challenge: (default_id) ->
        unless default_id
            return window.show_error "We couldn't find any challenges to show you."
        # If we had a badge, just go to the latest
        # Otherwise we can check for an in-progress challenge
        if window.BADGE_COUNT
            @get_challenge default_id
        else
            @get_in_progress_challenge_id (id) =>
                if id?
                    @get_challenge id, true
                else
                    @get_challenge default_id

    login_passive: (success) ->
        # Get GUID, username and password hash if we have them
        # We are "logging in" the user
        window.storage.get_many ["guid", "username", "password_hash"], (items) =>
            $.ajax(
                url         : "/api/login_passive"
                type        : "POST"
                dataType    : "json"
                data        :
                    guid            : items.guid
                    username        : items.username
                    password_hash   : items.password_hash
                success     : success
                error   : (xhr, status) =>
                    window.track_event 'login_passive', 'error', "#{xhr.status} - #{status}"
                    window.show_error "Your request failed. Please try again in a bit."
            )

    get_in_progress_challenge_id: (callback) ->
        # Find out if we've left something open we should go to
        window.storage.get "in_progress_id", (id) ->
            callback id

    remove_in_progress: ->
        window.storage.remove "in_progress_id"

