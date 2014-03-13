fs = require 'fs'
http = require 'http'
connect = require 'connect'
sanitizer = require 'sanitizer'
config = require './config'
images = require './images'
users = require './users'

challenges = null

# Number of challenges to show at a time in sidebar
challenge_list_count = config.challenges_in_sidebar

module.exports.init = (c) ->
    challenges = c

_get_challenges_list = (req, callback) ->
    challenges.get_last_x_challenges 7, (results) ->
        # Mark challenges completed
        if results
            for i in [0...results.length]
                results[i]["is_completed"] = req.context.user and results[i]._id in req.context.user.completed_challenges
        req.context["challenges"] = results
        callback()

_get_challenge = (req, callback) ->
    page_number = req.params.page_number or 1
    _get_challenges_list req, ->
        # If there is no ID, just return the most recent
        finish = (current) ->
            req.context['current_challenge'] = current
            return callback() unless current
            current.get_responses page_number, (results) ->
                req.context['page_count'] = current.get_page_count()
                req.context['page_current'] = parseInt page_number, 10
                req.context['page_base_url'] = current.get_url req.context.is_admin
                req.context['responses'] = results
                return callback()
        if req.params.id
            challenges.get_challenge req.params.id, finish
        else if req.context.challenges
            finish req.context.challenges[0]
        else
            finish null

_save_image_data = (data, callback) ->
    data = data.replace /^data:image\/\png;base64,/, ""
    image = new Buffer data, "base64"
    images.thumbnail_and_save_data image, (err, images_obj) ->
        return callback err if err
        callback null, images_obj

_get_default_challenge = (user, callback) ->
    if user
        challenges.get_last_x_challenges challenge_list_count, (results) ->
            return callback null unless results
            for challenge in results
                unless challenge._id in user.completed_challenges
                    id = challenge._id 
                    break
            id = results[0]._id unless id
            callback id
    else
        challenges.get_last_x_challenges 1, (results) ->
            return callback null unless results
            callback results[0]._id

_login_user = (req, user, callback=->) ->
    # Check if the user is banned
    if user.is_banned
        return callback new Error "user banned"
    # If we're already logged in, unlog the other user
    if req.context.user and req.context.user._id isnt user._id
        req.context.user.save_session null
    req.context.user = user
    user.save_session req.session.id, callback

module.exports.common =
    collage_image_to_data_uri: (req, res, render) ->
        path_prefix = "/get-creative/collage_images"
        options =
            hostname    : "s3.amazonaws.com"
            path        : "#{path_prefix}/#{req.params.filename}"
        http.get(options, (response) ->
            image_prefix = "data:#{response.headers['content-type']};base64,"
            image_data = ""
            response.setEncoding 'binary'
            response.on 'data', (chunk) ->
                image_data += chunk
            response.on 'end', (end) ->
                image_buffer = new Buffer image_data.toString(), "binary"
                image_string = image_buffer.toString "base64"
                image_string = image_prefix + image_string
                render image_string
        ).on('error', (e) ->
            render()
        )

    simple_page: (req, res, render) ->
        _get_challenges_list req, render

    about_page: (req, res, render) ->
        req.context['tweet_message'] = config.tweet_message
        _get_challenges_list req, render
        
    get_challenge: (req, res, render) ->
        _get_challenge req, render

    more_challenges: (req, res, render) ->
        x = parseInt req.query.start, 10
        challenges.get_challenges_x_to_y x, x + challenge_list_count, (results) ->
            # Mark challenges completed
            for i in [0...results.length]
                results[i]["is_completed"] = req.context.user and results[i]._id in req.context.user.completed_challenges
            req.context['challenge_list'] = results
            render()

    like_response: (req, res, render) ->
        challenges.like_response req.body.response_id, req.context.user._id, (err) ->
            return render err if err
            req.context.user.like_response req.body.response_id, (err) ->
                render err

    post_reply: (req, res, render) ->
        add_reply = (err, images_obj) ->
            return render err if err
            # Sanitize UGC Text
            text = req.body.textarea or ""
            if text.length >= 5000
                return render new Error "Response is too long."
            if text.length
                text = sanitizer.escape text
            response = {
                text        : text
                author_id   : req.context.user._id
                image       : if images_obj then images_obj else {}
            }
            challenges.add_response_to_challenge req.body.id, response, (response) ->
                req.context.user.author_response response, ->
                    json_data =
                        challenge_id    : req.body.id
                    render null, json_data
        # Throw error if they are not logged in
        unless req.context.user
            return render new Error "Not logged in"
        if req.body.collager
            _save_image_data req.body.collager, add_reply
        else if req.body.harmony
            _save_image_data req.body.harmony, add_reply
        else if req.body.rectangles
            _save_image_data req.body.rectangles, add_reply
        else if req.body.webcam
            _save_image_data req.body.webcam, add_reply
        else
            add_reply()

module.exports.public_web =
    challenge: (req, res, render) ->
        challenges.get_challenge req.params.id, (result) ->
            return render() unless result
            req.context["challenge"] = result
            render()

module.exports.extension =
    open: (req, res, render) ->
        # This renders everytime we open the popup
        req.context['badge_count'] = req.query.badge_count
        render()

module.exports.api =
    new_json: (req, res, render) ->
        timestamp = req.query.timestamp or 0
        new_count = 0
        send_response = ->
            json_data =
                new_count   : new_count
                timestamp   : new Date().getTime()
            render json_data
        new_bool = timestamp <= challenges.most_recent_timestamp
        if new_bool
            challenges.get_last_x_challenges 4, (results) ->
                for challenge in results
                    new_count += 1 if timestamp <= challenge.timestamp
                send_response()
        else
            send_response()

    profile: (req, res, render) ->
        page_number = req.params.page_number or 1
        _get_challenges_list req, ->
            challenges.get_responses_for_user req.context.user._id, page_number, (responses) ->
                req.context['tweet_message'] = config.tweet_message
                req.context['page_count'] = req.context.user.get_page_count()
                req.context['page_current'] = parseInt page_number, 10
                req.context['page_base_url'] = "/profile"
                req.context['responses'] = responses
                req.context['liked_responses'] = responses
                render()

    login_page: (req, res, render) ->
        _get_challenges_list req, render

    login_passive: (req, res, render) ->
        users.get_user_passive req.session_id, req.body.guid, req.body.username, req.body.password_hash, (err, user) ->
            return render err unless user
            _login_user req, user, (err) ->
                return render err if err
                _get_default_challenge user, (id) ->
                    json_data =
                        error           : if err then err.message else null
                        challenge_id    : id
                        guid            : user._id
                    render null, json_data

    login_explicit: (req, res, render) ->
        users.get_user_explicit req.body.username, req.body.password, (err, user) ->
            return render err unless user

            # Merge the currently logged in account into this one
            old_user = req.context.user
            if old_user and !old_user.username
                user.add_account old_user

            _login_user req, user, (err) ->
                return render err if err
                json_data =
                    error           : if err then err.message else null
                    guid            : user._id
                    username        : user.username
                    password_hash   : user.password
                render null, json_data

    register_user: (req, res, render) ->
        users.register_user req.context.user, req.body.username, req.body.password, (err, user) ->
            return render err unless user
            _login_user req, user, (err) ->
                return render err if err
                json_data =
                    error           : if err then err.message else null
                    guid            : user._id
                    username        : user.username
                    password_hash   : user.password
                render null, json_data

    add_email_to_account: (req, res, render) ->
        users.add_email_to_account req.context.user, req.body.email, (err, user) ->
            return render err unless user
            json_data =
                error   : if err then err.message else null
                email   : user.email
            render null, json_data

    get_most_recent_incomplete_challenge: (req, res, render) ->
        # Given a list of IDs of completed challenges,
        # return the last challenge not completed
        # For now just out of the last 7 or return latest.
        completed_challenges = if req.body.completed_challenges then JSON.parse(req.body.completed_challenges) else []
        challenges.get_last_x_challenges config.challenges_in_sidebar, (results) ->
            if results
                for challenge in results
                    unless challenge._id in completed_challenges
                        id = challenge._id 
                        break
                id = results[0]._id unless id
            json_data =
                id : id
            render json_data

module.exports.admin = 
    get_user: (req, res, render) ->
        page_number = req.params.page_number or 1
        _get_challenges_list req, ->
            users.get_user req.params.user_id, (user) ->
                return render() unless user
                req.context["other_user"] = user
                challenges.get_responses_for_user user._id, page_number, (responses) ->
                    req.context['responses'] = responses
                    req.context['page_count'] = user.get_page_count()
                    req.context['page_current'] = parseInt page_number, 10
                    req.context['page_base_url'] = user.get_url req.context.is_admin
                    render()

    hopper: (req, res, render) ->
        _get_challenges_list req, ->
            challenges.get_challenge_hopper (hopper) ->
                req.context['challenge_hopper'] = hopper
                render()

    post_challenge: (req, res, render) ->
        add_challenge = (images_obj, collage_obj, colors) ->
            challenge =
                prompt  : req.body.prompt
                type    : req.body.type
            if collage_obj
                challenge['collage'] = collage_obj
            if images_obj
                challenge['image'] = images_obj
            if colors
                challenge['colors'] = colors

            challenges.add_challenge_to_hopper challenge, (success) ->
                if success
                    render()
                else
                    render new Error "Failed"

        if req.files.image and req.files.image.size
            images.thumbnail_and_save req.files.image.path, (err, images_obj) ->
                return render new Error "Failed: #{err.message}" if err
                add_challenge images_obj
        else if req.files.image_1 and req.files.image_1.size
            collage = {}
            max = 7
            done_count = 0
            real_max = 0
            check_if_done = ->
                done_count += 1
                if done_count is real_max
                    add_challenge null, collage
            for i in [1..max]
                img = req.files["image_" + i]
                real_max += 1 if img and img.size
            for i in [1..7]
                ((i) ->
                    return unless req.files["image_" + i].size
                    images.save_stamp_to_s3 req.files["image_" + i].path, (err, image_obj) ->
                        collage["image_" + i] = image_obj
                        check_if_done()
                )(i)
        else if req.body.color_1
            convert_color = (hex) ->
                result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec hex
                return "#{parseInt(result[1], 16)}, #{parseInt(result[2], 16)}, #{parseInt(result[3], 16)}"
            colors = []
            for i in [1..12]
                color = req.body["color_#{i}"]
                if color isnt "#000000"
                    color = convert_color color
                    colors.push color 
            add_challenge null, null, colors
        else
            add_challenge()

    rename_challenge: (req, res, render) ->
        challenges.rename_challenge req.body.id, req.body.prompt, (success) ->
            return render() if success
            render new Error "Failed to remove response"

    remove_challenge: (req, res, render) ->
        challenges.remove_challenge req.body.id, (success) ->
            return render() if success
            render new Error "Failed to remove challenge"

    remove_response: (req, res, render) ->
        challenges.remove_response req.body.id, (success) ->
            return render() if success
            render new Error "Failed to remove response"

    push_challenge_from_hopper: (req, res, render) ->
        challenges.add_challenge_from_hopper (success) ->
            return render() if success
            render new Error "Failed to push challenge from hopper"

    remove_challenge_from_hopper: (req, res, render) ->
        challenges.remove_challenge_from_hopper req.body.index, (success) ->
            return render() if success
            render new Error "Failed to remove challenge from hopper"

    ban_user: (req, res, render) ->
        users.ban_user req.body.user_id, render

    unban_user: (req, res, render) ->
        users.unban_user req.body.user_id, render

    move_challenge: (req, res, render) ->
        challenges.move_challenge_in_hopper req.body.index, req.body.target_index, (success) ->
            res.render success
