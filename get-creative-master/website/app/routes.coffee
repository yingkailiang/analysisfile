c = require './controllers'

_error_message = (res, err) ->
    return res.json(
        error : if err then err.message else null
    )

_error_400 = (res, err) ->
    return res.send 400, {error : if err then err.message else null}

module.exports = (app) ->
    ########
    # Common
    ########
    app.get "/collage_image/:filename", (req, res) ->
        c.common.collage_image_to_data_uri req, res, (image_string) ->
            res.send image_string

    app.get "/api/more_challenges", (req, res) ->
        c.common.more_challenges req, res, ->
            res.render "common/challenge_list", req.context

    app.post "/api/like_response", (req, res) ->
        c.common.like_response req, res, (err, data) ->
            return _error_message res, err if err
            res.json()

    app.post "/api/reply", (req, res) ->
        c.common.post_reply req, res, (err, data) ->
            return _error_message res, err if err
            res.json data
            
    #####
    # Web
    #####
    app.get "/", (req, res) ->
        res.render "web/landing_page"

    app.get "/about", (req, res) ->
        c.common.about_page req, res, ->
            res.render "web/about"

    app.get "/id/:id", (req, res) ->
        c.public_web.challenge req, res, ->
            res.render "web/challenge", req.context

    ###############
    # Extension
    ###############
    app.get "/extension_base", (req, res) ->
        c.extension.open req, res, ->
            res.render "extension/base", req.context

    app.get "/local_extension_base", (req, res) ->
        c.extension.open req, res, ->
            res.render "extension/local_base", req.context

    ############
    # API Routes
    ############
    app.get "/api/about", (req, res) ->
        c.common.about_page req, res, ->
            res.render "api/about", req.context

    app.get "/api/id/:id", (req, res) ->
        c.common.get_challenge req, res, ->
            res.render "api/challenge", req.context

    app.get "/api/id/:id/:page_number", (req, res) ->
        c.common.get_challenge req, res, ->
            res.render "api/challenge", req.context

    app.get "/api/new.json", (req, res) ->
        c.api.new_json req, res, (data) ->
            res.json data

    app.get "/api/profile", (req, res) ->
        c.api.profile req, res, ->
            res.render "api/profile", req.context

    app.get "/api/profile/:page_number", (req, res) ->
        c.api.profile req, res, ->
            res.render "api/profile", req.context

    app.get "/api/login", (req, res) ->
        c.api.login_page req, res, ->
            res.render "api/login", req.context

    app.get "/api/terms", (req, res) ->
        c.common.simple_page req, res, ->
            res.render "api/terms", req.context

    app.get "/api/privacy", (req, res) ->
        c.common.simple_page req, res, ->
            res.render "api/privacy", req.context


    app.post "/api/login_passive", (req, res) ->
        c.api.login_passive req, res, (err, data) ->
            return _error_message res, err if err
            res.json data

    app.post "/api/login_explicit", (req, res) ->
        c.api.login_explicit req, res, (err, data) ->
            return _error_message res, err if err
            res.json data

    app.post "/api/register", (req, res) ->
        c.api.register_user req, res, (err, data) ->
            return _error_message res, err if err
            res.json data

    app.post "/api/add_email_to_account", (req, res) ->
        c.api.add_email_to_account req, res, (err, data) ->
            return _error_message res, err if err
            res.json data

    app.post "/api/latest_incomplete", (req, res) ->
        c.api.get_most_recent_incomplete_challenge req, res, (data) ->
            res.json data

    ###################################################
    # Admin
    # Should all be in /admin for middleware admin auth
    ###################################################
    app.get "/admin", (req, res) ->
        c.common.get_challenge req, res, ->
            res.render "admin/challenge", req.context

    app.get "/admin/id/:id", (req, res) ->
        c.common.get_challenge req, res, ->
            res.render "admin/challenge", req.context

    app.get "/admin/id/:id/:page_number", (req, res) ->
        c.common.get_challenge req, res, ->
            res.render "admin/challenge", req.context

    app.get "/admin/user/:user_id", (req, res) ->
        c.admin.get_user req, res, ->
            res.render "admin/user", req.context

    app.get "/admin/user/:user_id/:page_number", (req, res) ->
        c.admin.get_user req, res, ->
            res.render "admin/user", req.context

    app.get "/admin/new", (req, res) ->
        c.admin.hopper req, res, ->
            res.render "admin/new_challenge", req.context


    app.post "/admin/new", (req, res) ->
        c.admin.post_challenge req, res, (err) ->
            return _error_message res, err if err
            # Send back to the GET request
            res.redirect "/admin/new"

    app.post "/admin/api/rename", (req, res) ->
        c.admin.rename_challenge req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/remove_challenge", (req, res) ->
        c.admin.remove_challenge req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/remove_response", (req, res) ->
        c.admin.remove_response req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/force_post", (req, res) ->
        c.admin.push_challenge_from_hopper req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/remove_prompt", (req, res) ->
        c.admin.remove_challenge_from_hopper req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/ban_user", (req, res) ->
        c.admin.ban_user req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/unban_user", (req, res) ->
        c.admin.unban_user req, res, (err) ->
            return _error_400 res, err if err
            res.send()

    app.post "/admin/api/move_challenge", (req, res) ->
        c.admin.move_challenge req, res, (err, success_bool) ->
            return _error_400 res, err if err
            res.json(
                success : success_bool
            )
